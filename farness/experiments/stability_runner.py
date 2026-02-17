"""Runner for stability-under-probing experiments.

Implements randomization and blinding as described in methodology:
- Condition order is randomized per case
- Extraction functions operate on anonymized responses (blinding)
- Random seed is logged for reproducibility
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

from farness.experiments.llm import call_llm
from farness.experiments.stability import (
    QuantitativeCase,
    StabilityResult,
    StabilityExperiment,
    extract_estimate,
    extract_ci,
    generate_naive_prompt,
    generate_farness_prompt,
    generate_probe_prompt,
    get_all_stability_cases,
    get_stability_case,
)


def run_prompt(prompt: str, timeout: int = 180) -> str:
    """Run a prompt through the Anthropic API."""
    response, _ = call_llm(prompt, timeout=float(timeout))
    return response


def run_single_stability_test(
    case: QuantitativeCase,
    condition: str,
    verbose: bool = True,
) -> StabilityResult:
    """Run a single stability test (initial + probing).

    Args:
        case: The quantitative case to test
        condition: "naive" or "farness"
        verbose: Print progress

    Returns:
        StabilityResult with initial and final estimates
    """
    if verbose:
        print(f"  [{condition}] Running initial prompt...")

    # Phase 1: Initial prompt
    if condition == "naive":
        initial_prompt = generate_naive_prompt(case)
    else:
        initial_prompt = generate_farness_prompt(case)

    initial_response = run_prompt(initial_prompt)

    if initial_response.startswith("ERROR:"):
        raise RuntimeError(f"Initial prompt failed: {initial_response}")

    # Extract initial estimate
    initial_estimate = extract_estimate(initial_response, case.estimate_unit)
    initial_ci_low, initial_ci_high = extract_ci(initial_response)

    if initial_estimate is None:
        # Try harder to find a number
        import re
        numbers = re.findall(r'\b(\d+\.?\d*)\b', initial_response)
        if numbers:
            initial_estimate = float(numbers[0])
        else:
            raise ValueError(f"Could not extract initial estimate from response: {initial_response[:200]}")

    if verbose:
        ci_str = f" (CI: {initial_ci_low}-{initial_ci_high})" if initial_ci_low else ""
        print(f"    Initial: {initial_estimate}{case.estimate_unit}{ci_str}")

    # Phase 2: Probing
    if verbose:
        print(f"  [{condition}] Running probing prompt...")

    probe_prompt = generate_probe_prompt(
        case,
        initial_estimate,
        (initial_ci_low, initial_ci_high) if initial_ci_low else None,
        condition,
    )

    final_response = run_prompt(probe_prompt)

    if final_response.startswith("ERROR:"):
        raise RuntimeError(f"Probe prompt failed: {final_response}")

    # Extract final estimate
    final_estimate = extract_estimate(final_response, case.estimate_unit)
    final_ci_low, final_ci_high = extract_ci(final_response)

    if final_estimate is None:
        import re
        numbers = re.findall(r'\b(\d+\.?\d*)\b', final_response)
        if numbers:
            final_estimate = float(numbers[0])
        else:
            raise ValueError(f"Could not extract final estimate from response: {final_response[:200]}")

    if verbose:
        ci_str = f" (CI: {final_ci_low}-{final_ci_high})" if final_ci_low else ""
        print(f"    Final: {final_estimate}{case.estimate_unit}{ci_str}")
        print(f"    Update: {final_estimate - initial_estimate:+.2f}{case.estimate_unit}")

    return StabilityResult(
        case_id=case.id,
        condition=condition,
        initial_estimate=initial_estimate,
        initial_ci_low=initial_ci_low,
        initial_ci_high=initial_ci_high,
        initial_response_text=initial_response,
        final_estimate=final_estimate,
        final_ci_low=final_ci_low,
        final_ci_high=final_ci_high,
        final_response_text=final_response,
    )


def run_stability_experiment(
    cases: Optional[list[QuantitativeCase]] = None,
    runs_per_condition: int = 1,
    output_dir: Optional[Path] = None,
    verbose: bool = True,
    random_seed: Optional[int] = None,
    randomize_order: bool = True,
) -> StabilityExperiment:
    """Run the full stability experiment with randomization.

    Args:
        cases: Cases to test (default: all)
        runs_per_condition: How many times to run each case per condition
        output_dir: Where to save results
        verbose: Print progress
        random_seed: Seed for reproducibility (default: timestamp-based)
        randomize_order: Whether to randomize condition order per case

    Returns:
        StabilityExperiment with all results
    """
    if cases is None:
        cases = get_all_stability_cases()

    # Set random seed for reproducibility
    if random_seed is None:
        random_seed = int(datetime.now().timestamp() * 1000) % (2**31)
    random.seed(random_seed)

    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    experiment = StabilityExperiment(cases=cases)

    # Metadata for reproducibility
    metadata = {
        "random_seed": random_seed,
        "randomize_order": randomize_order,
        "runs_per_condition": runs_per_condition,
        "n_cases": len(cases),
        "case_ids": [c.id for c in cases],
        "started_at": datetime.now().isoformat(),
        "condition_orders": {},  # Log which order was used per case
    }

    total_tests = len(cases) * 2 * runs_per_condition  # 2 conditions
    test_num = 0

    for case in cases:
        if verbose:
            print(f"\n{'='*60}")
            print(f"Case: {case.name}")
            print(f"{'='*60}")

        for run in range(runs_per_condition):
            # Randomize condition order per case/run
            conditions = ["naive", "farness"]
            if randomize_order:
                random.shuffle(conditions)

            # Log the order used
            run_key = f"{case.id}_run{run+1}"
            metadata["condition_orders"][run_key] = conditions.copy()

            for condition in conditions:
                test_num += 1
                if verbose:
                    print(f"\n[{test_num}/{total_tests}] {case.id} - {condition} - run {run+1}")

                try:
                    result = run_single_stability_test(case, condition, verbose)
                    experiment.results.append(result)

                    # Save incrementally
                    if output_dir:
                        result_file = output_dir / f"{case.id}_{condition}_run{run+1}.json"
                        with open(result_file, "w") as f:
                            json.dump(result.to_dict(), f, indent=2)

                except Exception as e:
                    print(f"    ERROR: {e}")
                    continue

    metadata["completed_at"] = datetime.now().isoformat()
    metadata["n_results"] = len(experiment.results)

    # Save summary and metadata
    if output_dir:
        # Save metadata for reproducibility
        metadata_file = output_dir / "experiment_metadata.json"
        with open(metadata_file, "w") as f:
            json.dump(metadata, f, indent=2)

        summary_file = output_dir / "summary.json"
        analysis = experiment.analyze()
        analysis["metadata"] = metadata
        with open(summary_file, "w") as f:
            json.dump(analysis, f, indent=2)

        table_file = output_dir / "results_table.md"
        with open(table_file, "w") as f:
            f.write(f"# Stability Experiment Results\n\n")
            f.write(f"**Random seed**: {random_seed}\n")
            f.write(f"**Runs per condition**: {runs_per_condition}\n\n")
            f.write(experiment.summary_table())

    if verbose:
        print(f"\n[Experiment metadata]")
        print(f"  Random seed: {random_seed}")
        print(f"  Randomize order: {randomize_order}")

    return experiment


def print_experiment_summary(experiment: StabilityExperiment) -> None:
    """Print a formatted summary of experiment results."""
    print("\n" + "=" * 70)
    print("STABILITY-UNDER-PROBING EXPERIMENT RESULTS")
    print("=" * 70)

    analysis = experiment.analyze()

    print(f"\nSample sizes: Naive={analysis.get('n_naive', 0)}, Farness={analysis.get('n_farness', 0)}")

    print("\n" + "-" * 70)
    print("PRIMARY METRICS")
    print("-" * 70)

    naive = analysis.get("naive", {})
    farness = analysis.get("farness", {})

    def fmt(v, pct=False):
        if v is None:
            return "N/A"
        if pct:
            return f"{v:.0%}"
        return f"{v:.2f}"

    print(f"{'Metric':<35} {'Naive':>15} {'Farness':>15}")
    print("-" * 70)
    print(f"{'Mean update magnitude':<35} {fmt(naive.get('mean_update_magnitude')):>15} {fmt(farness.get('mean_update_magnitude')):>15}")
    print(f"{'Mean relative update':<35} {fmt(naive.get('mean_relative_update'), True):>15} {fmt(farness.get('mean_relative_update'), True):>15}")
    print(f"{'Initial CI rate':<35} {fmt(naive.get('initial_ci_rate'), True):>15} {fmt(farness.get('initial_ci_rate'), True):>15}")
    print(f"{'Correct direction rate':<35} {fmt(naive.get('correct_direction_rate'), True):>15} {fmt(farness.get('correct_direction_rate'), True):>15}")

    convergence = analysis.get("convergence", {})
    if convergence:
        print("\n" + "-" * 70)
        print("CONVERGENCE ANALYSIS")
        print("-" * 70)
        print(f"Mean convergence ratio: {fmt(convergence.get('mean_convergence_ratio'), True)}")
        print(f"Interpretation: {convergence.get('interpretation', 'N/A')}")

    print("\n" + "=" * 70)

    # Per-case breakdown
    print("\nPER-CASE BREAKDOWN:")
    print("-" * 70)
    print(f"{'Case':<25} {'Naive Δ':>12} {'Farness Δ':>12} {'Direction':>12}")
    print("-" * 70)

    for result in experiment.results:
        if result.condition == "naive":
            naive_update = result.final_estimate - result.initial_estimate
            # Find matching farness result
            farness_results = [r for r in experiment.results
                              if r.case_id == result.case_id and r.condition == "farness"]
            if farness_results:
                farness_update = farness_results[0].final_estimate - farness_results[0].initial_estimate
                print(f"{result.case_id:<25} {naive_update:>+12.2f} {farness_update:>+12.2f} {result.update_direction:>12}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run stability-under-probing experiment")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("experiments/stability_results"),
        help="Output directory",
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=1,
        help="Runs per condition",
    )
    parser.add_argument(
        "--case",
        type=str,
        help="Run specific case only",
    )
    parser.add_argument(
        "--list-cases",
        action="store_true",
        help="List available cases",
    )
    parser.add_argument(
        "--seed",
        type=int,
        help="Random seed for reproducibility",
    )
    parser.add_argument(
        "--no-randomize",
        action="store_true",
        help="Don't randomize condition order",
    )

    args = parser.parse_args()

    if args.list_cases:
        print("Available stability test cases:\n")
        for case in get_all_stability_cases():
            print(f"  {case.id}")
            print(f"    {case.name} ({case.domain})")
            print(f"    Estimate: {case.estimate_unit}")
            print(f"    Expected update: {case.expected_update_direction}")
            print()
        exit(0)

    if args.case:
        case = get_stability_case(args.case)
        if not case:
            print(f"Case not found: {args.case}")
            exit(1)
        cases = [case]
    else:
        cases = get_all_stability_cases()

    print(f"Running stability experiment with {len(cases)} cases, {args.runs} runs per condition")
    if args.seed:
        print(f"Using random seed: {args.seed}")

    experiment = run_stability_experiment(
        cases=cases,
        runs_per_condition=args.runs,
        output_dir=args.output_dir,
        verbose=True,
        random_seed=args.seed,
        randomize_order=not args.no_randomize,
    )

    print_experiment_summary(experiment)
    print(f"\nResults saved to {args.output_dir}")
