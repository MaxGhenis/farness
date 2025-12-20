"""Statistical analysis for the experiment."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Optional

from farness.experiments.scorer import ResponseScore, aggregate_scores


@dataclass
class StatisticalTest:
    """Result of a statistical test."""

    metric: str
    naive_value: float
    farness_value: float
    difference: float
    p_value: Optional[float]
    significant: bool
    test_name: str


def proportion_z_test(n1: int, p1: float, n2: int, p2: float) -> float:
    """Two-proportion z-test.

    Returns p-value for two-tailed test.
    """
    import math

    # Pooled proportion
    p_pool = (n1 * p1 + n2 * p2) / (n1 + n2)

    if p_pool == 0 or p_pool == 1:
        return 1.0  # Can't compute, no variance

    # Standard error
    se = math.sqrt(p_pool * (1 - p_pool) * (1 / n1 + 1 / n2))

    if se == 0:
        return 1.0

    # Z statistic
    z = (p1 - p2) / se

    # Two-tailed p-value (using normal approximation)
    # For simplicity, use a lookup table for common z values
    # In production, use scipy.stats.norm.sf
    abs_z = abs(z)
    if abs_z > 3.29:
        return 0.001
    elif abs_z > 2.58:
        return 0.01
    elif abs_z > 1.96:
        return 0.05
    elif abs_z > 1.64:
        return 0.10
    else:
        return 0.20  # Approximate


def mann_whitney_u(sample1: list[float], sample2: list[float]) -> float:
    """Simplified Mann-Whitney U test.

    Returns approximate p-value.
    """
    import math

    n1, n2 = len(sample1), len(sample2)
    if n1 == 0 or n2 == 0:
        return 1.0

    # Combine and rank
    combined = [(x, 0) for x in sample1] + [(x, 1) for x in sample2]
    combined.sort(key=lambda t: t[0])

    # Assign ranks (handling ties by averaging)
    ranks = []
    i = 0
    while i < len(combined):
        j = i
        while j < len(combined) and combined[j][0] == combined[i][0]:
            j += 1
        avg_rank = (i + 1 + j) / 2
        for k in range(i, j):
            ranks.append((avg_rank, combined[k][1]))
        i = j

    # Sum ranks for each group
    r1 = sum(r for r, group in ranks if group == 0)

    # U statistic
    u1 = r1 - n1 * (n1 + 1) / 2

    # Normal approximation
    mu = n1 * n2 / 2
    sigma = math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12)

    if sigma == 0:
        return 1.0

    z = (u1 - mu) / sigma
    abs_z = abs(z)

    # Approximate p-value
    if abs_z > 3.29:
        return 0.001
    elif abs_z > 2.58:
        return 0.01
    elif abs_z > 1.96:
        return 0.05
    elif abs_z > 1.64:
        return 0.10
    else:
        return 0.20


def analyze_experiment(
    scores: list[ResponseScore],
    alpha: float = 0.05,
    bonferroni_correct: bool = True,
) -> dict:
    """Analyze experiment results.

    Args:
        scores: All scored responses
        alpha: Significance level
        bonferroni_correct: Apply Bonferroni correction for secondary hypotheses

    Returns:
        Analysis results dict
    """
    naive = [s for s in scores if s.condition == "naive"]
    farness = [s for s in scores if s.condition == "farness"]

    n_naive, n_farness = len(naive), len(farness)

    if n_naive == 0 or n_farness == 0:
        return {"error": "Need both conditions to analyze"}

    tests = []

    # H1: Correct recommendation (if we have labels)
    naive_correct = [s for s in naive if s.correct_recommendation is not None]
    farness_correct = [s for s in farness if s.correct_recommendation is not None]
    if naive_correct and farness_correct:
        p1 = sum(s.correct_recommendation for s in naive_correct) / len(naive_correct)
        p2 = sum(s.correct_recommendation for s in farness_correct) / len(farness_correct)
        p_val = proportion_z_test(len(naive_correct), p1, len(farness_correct), p2)
        tests.append(StatisticalTest(
            metric="correct_recommendation",
            naive_value=p1,
            farness_value=p2,
            difference=p2 - p1,
            p_value=p_val,
            significant=p_val < alpha,
            test_name="z-test (proportions)",
        ))

    # H2: Base rate citation
    p1 = sum(s.cites_base_rate for s in naive) / n_naive
    p2 = sum(s.cites_base_rate for s in farness) / n_farness
    p_val = proportion_z_test(n_naive, p1, n_farness, p2)
    secondary_alpha = alpha / 5 if bonferroni_correct else alpha
    tests.append(StatisticalTest(
        metric="cites_base_rate",
        naive_value=p1,
        farness_value=p2,
        difference=p2 - p1,
        p_value=p_val,
        significant=p_val < secondary_alpha,
        test_name="z-test (proportions)",
    ))

    # H3: Bias count (Mann-Whitney)
    bias_naive = [s.bias_count for s in naive]
    bias_farness = [s.bias_count for s in farness]
    p_val = mann_whitney_u(bias_naive, bias_farness)
    tests.append(StatisticalTest(
        metric="bias_count",
        naive_value=sum(bias_naive) / n_naive,
        farness_value=sum(bias_farness) / n_farness,
        difference=sum(bias_farness) / n_farness - sum(bias_naive) / n_naive,
        p_value=p_val,
        significant=p_val < secondary_alpha,
        test_name="Mann-Whitney U",
    ))

    # H4: Confidence intervals
    p1 = sum(s.has_confidence_interval for s in naive) / n_naive
    p2 = sum(s.has_confidence_interval for s in farness) / n_farness
    p_val = proportion_z_test(n_naive, p1, n_farness, p2)
    tests.append(StatisticalTest(
        metric="has_confidence_interval",
        naive_value=p1,
        farness_value=p2,
        difference=p2 - p1,
        p_value=p_val,
        significant=p_val < secondary_alpha,
        test_name="z-test (proportions)",
    ))

    # H5: Accountability
    p1 = sum(s.has_accountability for s in naive) / n_naive
    p2 = sum(s.has_accountability for s in farness) / n_farness
    p_val = proportion_z_test(n_naive, p1, n_farness, p2)
    tests.append(StatisticalTest(
        metric="has_accountability",
        naive_value=p1,
        farness_value=p2,
        difference=p2 - p1,
        p_value=p_val,
        significant=p_val < secondary_alpha,
        test_name="z-test (proportions)",
    ))

    # H6: Quantified tradeoffs
    p1 = sum(s.quantifies_tradeoffs for s in naive) / n_naive
    p2 = sum(s.quantifies_tradeoffs for s in farness) / n_farness
    p_val = proportion_z_test(n_naive, p1, n_farness, p2)
    tests.append(StatisticalTest(
        metric="quantifies_tradeoffs",
        naive_value=p1,
        farness_value=p2,
        difference=p2 - p1,
        p_value=p_val,
        significant=p_val < secondary_alpha,
        test_name="z-test (proportions)",
    ))

    return {
        "n_naive": n_naive,
        "n_farness": n_farness,
        "alpha": alpha,
        "bonferroni_corrected": bonferroni_correct,
        "tests": [
            {
                "metric": t.metric,
                "naive": round(t.naive_value, 3),
                "farness": round(t.farness_value, 3),
                "difference": round(t.difference, 3),
                "p_value": round(t.p_value, 4) if t.p_value else None,
                "significant": t.significant,
                "test": t.test_name,
            }
            for t in tests
        ],
        "summary": _generate_summary(tests),
    }


def _generate_summary(tests: list[StatisticalTest]) -> str:
    """Generate human-readable summary."""
    sig_tests = [t for t in tests if t.significant and t.difference > 0]

    if not sig_tests:
        return "No significant differences found favoring the farness framework."

    lines = ["Significant improvements with farness framework:"]
    for t in sig_tests:
        pct_diff = t.difference * 100
        lines.append(
            f"  - {t.metric}: +{pct_diff:.1f} percentage points "
            f"({t.naive_value*100:.0f}% -> {t.farness_value*100:.0f}%, p={t.p_value:.3f})"
        )

    return "\n".join(lines)


def print_results_table(analysis: dict) -> None:
    """Print a formatted results table."""
    print("\n" + "=" * 70)
    print("FARNESS FRAMEWORK EXPERIMENT RESULTS")
    print("=" * 70)
    print(f"N (naive): {analysis['n_naive']}, N (farness): {analysis['n_farness']}")
    print(f"Alpha: {analysis['alpha']}, Bonferroni: {analysis['bonferroni_corrected']}")
    print("-" * 70)
    print(f"{'Metric':<25} {'Naive':>8} {'Farness':>8} {'Diff':>8} {'p-value':>10} {'Sig':>5}")
    print("-" * 70)

    for t in analysis["tests"]:
        sig_marker = "*" if t["significant"] else ""
        p_str = f"{t['p_value']:.4f}" if t["p_value"] else "N/A"
        print(
            f"{t['metric']:<25} {t['naive']:>8.1%} {t['farness']:>8.1%} "
            f"{t['difference']:>+8.1%} {p_str:>10} {sig_marker:>5}"
        )

    print("-" * 70)
    print(analysis["summary"])
    print("=" * 70)


def load_scores(scores_file: Path) -> list[ResponseScore]:
    """Load scores from JSON file."""
    with open(scores_file) as f:
        data = json.load(f)

    return [
        ResponseScore(
            case_id=d["case_id"],
            condition=d["condition"],
            run_number=d["run_number"],
            correct_recommendation=d.get("correct_recommendation"),
            cites_base_rate=d["cites_base_rate"],
            bias_count=d["bias_count"],
            biases_found=d["biases_found"],
            has_confidence_interval=d["has_confidence_interval"],
            has_accountability=d["has_accountability"],
            quantifies_tradeoffs=d["quantifies_tradeoffs"],
            response_text=d["response_text"],
        )
        for d in data
    ]


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python -m farness.experiments.analyze <scores.json>")
        sys.exit(1)

    scores_file = Path(sys.argv[1])
    scores = load_scores(scores_file)
    analysis = analyze_experiment(scores)
    print_results_table(analysis)

    # Save analysis
    output = scores_file.parent / "analysis.json"
    with open(output, "w") as f:
        json.dump(analysis, f, indent=2)
    print(f"\nSaved analysis to {output}")
