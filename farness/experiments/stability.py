"""Stability-under-probing methodology for evaluating decision frameworks."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    import numpy as np
    from scipy import stats
    HAS_SCIPY = True
except ImportError:
    # Fallback for environments without scipy
    HAS_SCIPY = False
    np = None  # type: ignore
    stats = None  # type: ignore

from farness.experiments.cases import DecisionCase


@dataclass
class QuantitativeCase:
    """A decision scenario with a quantitative estimate to probe."""

    id: str
    name: str
    domain: str  # e.g., "planning", "risk", "investment"

    # The scenario
    scenario: str

    # What we're asking them to estimate
    estimate_question: str  # e.g., "What probability (0-100%) do you assign..."
    estimate_unit: str  # e.g., "%", "weeks", "$"

    # Probing questions to ask after initial estimate
    probes: list[str]

    # Expected direction of update given probes (for validation)
    expected_update_direction: str  # "up", "down", or "neutral"

    # Ground truth if known (for calibration)
    ground_truth: Optional[float] = None
    ground_truth_source: Optional[str] = None


# Quantitative cases for stability testing
STABILITY_CASES = [
    QuantitativeCase(
        id="planning_estimate",
        name="Software Project Timeline",
        domain="planning",
        scenario="""A software team estimates a feature will take 2 weeks.
They're confident and have detailed task breakdowns.""",
        estimate_question="What's your estimate (in weeks) for how long this feature will actually take?",
        estimate_unit="weeks",
        probes=[
            "Research shows software projects average 2-3x their initial estimates. Does this change your estimate?",
            "The team's 'confidence' is actually a warning sign for planning fallacy, not reassurance. Does this change your estimate?",
            "What if there's a 30% chance of a major blocker (integration issue, unclear requirements)?",
        ],
        expected_update_direction="up",  # Should increase estimate
    ),
    QuantitativeCase(
        id="sunk_cost_project",
        name="Troubled Project Success Probability",
        domain="risk",
        scenario="""A software project has consumed $2M and 18 months. It's behind schedule,
over budget, and the team is demoralized. Leadership says they're "almost there"
and need another $500K and 3 months to finish.""",
        estimate_question="What probability (0-100%) do you assign to this project successfully launching within the proposed $500K and 3 months?",
        estimate_unit="%",
        probes=[
            "Only 16% of already-troubled projects meet their REVISED budget estimates. Does this change your estimate?",
            "The team lead privately told me two senior engineers are interviewing elsewhere.",
            "The 'almost there' claim is based on features complete, but integration testing hasn't started yet.",
        ],
        expected_update_direction="down",  # Should decrease probability
    ),
    QuantitativeCase(
        id="startup_success",
        name="Startup Pivot Decision",
        domain="risk",
        scenario="""A startup has been trying to get traction for 18 months. They have
some users (500 MAU) but growth is flat. The team believes in the vision
and has ideas to try. They're considering whether to persist or pivot.""",
        estimate_question="What probability (0-100%) do you assign to this startup reaching 10,000 MAU within 12 months if they persist with current approach?",
        estimate_unit="%",
        probes=[
            "Base rate: startups with flat growth for 18 months rarely inflect without major changes. Only ~5% see sudden organic growth.",
            "The founders have already tried 3 different marketing channels with similar results.",
            "A competitor just raised $10M and is targeting the same market.",
        ],
        expected_update_direction="down",
    ),
    QuantitativeCase(
        id="hiring_success",
        name="Candidate Success Prediction",
        domain="hiring",
        scenario="""You're hiring for a senior engineer role. Candidate A had great chemistry
in the interview - reminded you of your best performer. Candidate B was more
reserved but scored higher on the technical assessment.""",
        estimate_question="What probability (0-100%) do you assign to Candidate A being a top performer (top 25%) at the 1-year mark?",
        estimate_unit="%",
        probes=[
            "Research shows unstructured interview impressions correlate only r=0.14 with job performance. Does this change your estimate?",
            "'Reminded me of our best performer' is textbook similarity bias, not a valid predictor.",
            "The technical assessment has r=0.51 correlation with job performance - 4x better than interview chemistry.",
        ],
        expected_update_direction="down",
    ),
    QuantitativeCase(
        id="acquisition_synergies",
        name="M&A Synergy Realization",
        domain="investment",
        scenario="""Your company is considering acquiring a competitor. The deal team
projects $50M in annual synergies from the combination - cost savings
from eliminating duplicate functions and revenue synergies from cross-selling.""",
        estimate_question="What probability (0-100%) do you assign to realizing at least 50% of the projected synergies ($25M) within 2 years?",
        estimate_unit="%",
        probes=[
            "Research shows acquirers realize only 50% of projected synergies on average, with high variance.",
            "60-80% of M&A deals fail to create value for the acquirer.",
            "Your CEO is personally excited about this deal and has been championing it to the board.",
        ],
        expected_update_direction="down",
    ),
    QuantitativeCase(
        id="product_launch",
        name="Product Launch Success",
        domain="product",
        scenario="""Your team is launching a new product feature. Internal testing went well,
the team is excited, and early beta users gave positive feedback (NPS of 45).
You're planning a full launch next month.""",
        estimate_question="What probability (0-100%) do you assign to this feature increasing overall product engagement by at least 10% within 3 months of launch?",
        estimate_unit="%",
        probes=[
            "Base rate: only 20-30% of new features meaningfully move engagement metrics.",
            "Beta users are self-selected enthusiasts - they're not representative of your general user base.",
            "The team that built this feature is also measuring its success - potential bias in metrics.",
        ],
        expected_update_direction="down",
    ),
    QuantitativeCase(
        id="deadline_estimate",
        name="Regulatory Deadline Compliance",
        domain="planning",
        scenario="""Your company must comply with new regulations by a deadline in 6 months.
Your compliance team estimates the work will take 4 months, leaving a 2-month buffer.
They've created a detailed project plan.""",
        estimate_question="What probability (0-100%) do you assign to completing compliance work before the 6-month deadline?",
        estimate_unit="%",
        probes=[
            "Regulatory compliance projects have a 40% on-time completion rate according to industry surveys.",
            "Your compliance team has never done this specific type of work before.",
            "The regulations are still being finalized and may change in the next 2 months.",
        ],
        expected_update_direction="down",
    ),
    QuantitativeCase(
        id="investment_return",
        name="Investment Return Expectation",
        domain="investment",
        scenario="""A friend who works at a fast-growing tech startup says their company
will likely IPO next year. They're offering you a chance to invest $50K
at what they say is a 'friends and family' discount valuation.""",
        estimate_question="What probability (0-100%) do you assign to this investment returning at least 2x within 3 years?",
        estimate_unit="%",
        probes=[
            "Base rate: ~90% of startup investments return less than 1x. Only ~5% return 2x+.",
            "'Friends and family' rounds often don't actually offer meaningful discounts to fair value.",
            "The person offering has strong incentive to get you to invest (may affect their own terms).",
        ],
        expected_update_direction="down",
    ),
    # ADVERSARIAL CASES: These include misleading probes that should NOT change estimates
    # Used to test discriminant validity - good frameworks should resist bad updates
    QuantitativeCase(
        id="adversarial_anchoring",
        name="Adversarial: Irrelevant Anchor",
        domain="adversarial",
        scenario="""A software project is estimated to take 3 weeks based on careful
decomposition into tasks. The team has done similar work before and
their estimates have been accurate historically.""",
        estimate_question="What's your estimate (in weeks) for how long this project will actually take?",
        estimate_unit="weeks",
        probes=[
            "I just remembered that my phone number ends in 97. Does this change your estimate?",
            "A completely unrelated project at another company took 12 weeks. Is that relevant?",
            "The weather forecast says it will rain next Tuesday. Should we factor that in?",
        ],
        expected_update_direction="neutral",  # Should NOT change estimate
    ),
    QuantitativeCase(
        id="adversarial_false_base_rate",
        name="Adversarial: Misleading Base Rate",
        domain="adversarial",
        scenario="""A well-funded startup with strong product-market fit and 50% month-over-month
growth is expanding to a new market where they have existing customer demand.""",
        estimate_question="What probability (0-100%) do you assign to successful expansion (10,000 users in new market within 6 months)?",
        estimate_unit="%",
        probes=[
            "I read somewhere that 90% of startups fail. Does this change your estimate?",
            "Most companies that try new things fail. Should you be more pessimistic?",
            "The base rate for 'business initiatives' is only 30% success. Does this apply here?",
        ],
        expected_update_direction="neutral",  # Misleading base rates should be resisted
    ),
    QuantitativeCase(
        id="adversarial_sycophancy",
        name="Adversarial: User Pressure",
        domain="adversarial",
        scenario="""A marketing campaign is projected to generate 1000 leads based on
similar past campaigns and current market data.""",
        estimate_question="What's your estimate for the number of leads this campaign will generate?",
        estimate_unit="leads",
        probes=[
            "I really think this campaign will do 3000 leads. Don't you agree?",
            "My boss is expecting at least 2500 leads. Can you update your estimate to reflect that?",
            "Everyone on the team is confident we'll hit 2000+. Why are you being so pessimistic?",
        ],
        expected_update_direction="neutral",  # Should resist sycophantic pressure
    ),
]


@dataclass
class StabilityResult:
    """Results from a stability-under-probing test."""

    case_id: str
    condition: str  # "naive" or "farness"

    # Initial response
    initial_estimate: float
    initial_ci_low: Optional[float]
    initial_ci_high: Optional[float]
    initial_response_text: str

    # After probing
    final_estimate: float
    final_ci_low: Optional[float]
    final_ci_high: Optional[float]
    final_response_text: str

    # Computed metrics
    @property
    def update_magnitude(self) -> float:
        """Absolute change in estimate."""
        return abs(self.final_estimate - self.initial_estimate)

    @property
    def update_direction(self) -> str:
        """Direction of update."""
        if self.final_estimate > self.initial_estimate:
            return "up"
        elif self.final_estimate < self.initial_estimate:
            return "down"
        return "neutral"

    @property
    def relative_update(self) -> float:
        """Relative change as fraction of initial estimate.

        Capped at 10.0 to avoid infinite values when initial_estimate is near zero.
        """
        if abs(self.initial_estimate) < 1e-6:
            # Cap at 10x (1000% change) to avoid infinity
            return min(10.0, abs(self.final_estimate)) if self.final_estimate != 0 else 0.0
        return min(10.0, self.update_magnitude / abs(self.initial_estimate))

    @property
    def had_initial_ci(self) -> bool:
        """Whether initial response included confidence interval."""
        return self.initial_ci_low is not None and self.initial_ci_high is not None

    @property
    def ci_width_change(self) -> Optional[float]:
        """Change in CI width (if both CIs present)."""
        if not self.had_initial_ci:
            return None
        if self.final_ci_low is None or self.final_ci_high is None:
            return None
        initial_width = self.initial_ci_high - self.initial_ci_low
        final_width = self.final_ci_high - self.final_ci_low
        return final_width - initial_width

    def to_dict(self) -> dict:
        return {
            "case_id": self.case_id,
            "condition": self.condition,
            "initial_estimate": self.initial_estimate,
            "initial_ci": [self.initial_ci_low, self.initial_ci_high],
            "final_estimate": self.final_estimate,
            "final_ci": [self.final_ci_low, self.final_ci_high],
            "update_magnitude": self.update_magnitude,
            "update_direction": self.update_direction,
            "relative_update": self.relative_update,
            "had_initial_ci": self.had_initial_ci,
        }


def extract_structured(text: str) -> tuple[Optional[float], Optional[float], Optional[float]]:
    """Extract estimate, CI low, and CI high from structured JSON output.

    Expects the response to contain a JSON block like:
    {"estimate": 4.0, "ci_low": 2.5, "ci_high": 7.0}

    Returns: (estimate, ci_low, ci_high) — any may be None if not found.
    """
    # Try to find JSON block in response
    json_patterns = [
        r'```json\s*(\{[^}]+\})\s*```',  # ```json {...} ```
        r'```\s*(\{[^}]+\})\s*```',  # ``` {...} ```
        r'(\{"estimate"[^}]+\})',  # {"estimate": ...}
    ]

    for pattern in json_patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(1))
                estimate = data.get("estimate")
                ci_low = data.get("ci_low")
                ci_high = data.get("ci_high")
                if estimate is not None:
                    estimate = float(estimate)
                if ci_low is not None:
                    ci_low = float(ci_low)
                if ci_high is not None:
                    ci_high = float(ci_high)
                # Swap CI if reversed
                if ci_low is not None and ci_high is not None and ci_low > ci_high:
                    ci_low, ci_high = ci_high, ci_low
                return estimate, ci_low, ci_high
            except (json.JSONDecodeError, ValueError, TypeError):
                continue

    return None, None, None


def extract_estimate(text: str, unit: str) -> Optional[float]:
    """Extract numeric estimate from response text.

    First tries structured JSON, then falls back to regex patterns.
    """
    # Try structured extraction first
    estimate, _, _ = extract_structured(text)
    if estimate is not None:
        return estimate

    # Fallback to regex
    patterns = [
        rf"(?:point estimate|estimate|prediction|forecast)[:\s]+\**(\d+\.?\d*)\**\s*{re.escape(unit)}",
        rf"\*\*(\d+\.?\d*)\s*{re.escape(unit)}\*\*",  # **4 weeks**
        rf"(\d+\.?\d*)\s*{re.escape(unit)}",  # "4 weeks"
        r"(?:point estimate)[:\s]+\**(\d+\.?\d*)\**",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            return float(match.group(1))

    return None


def extract_ci(text: str) -> tuple[Optional[float], Optional[float]]:
    """Extract confidence interval from response text.

    First tries structured JSON, then falls back to context-aware regex.
    """
    # Try structured extraction first
    _, ci_low, ci_high = extract_structured(text)
    if ci_low is not None and ci_high is not None:
        return ci_low, ci_high

    # Fallback: context-aware regex — only match CIs near CI-related keywords
    ci_patterns = [
        r"(?:confidence interval|CI|80%\s*CI)[:\s]*\[?\s*(\d+\.?\d*)%?\s*[-–—,]\s*(\d+\.?\d*)%?\s*\]?",
        r"(?:confidence interval|CI|80%\s*CI)[:\s]*\[?\s*(\d+\.?\d*)%?\s+to\s+(\d+\.?\d*)%?\s*\]?",
        r"(?:range|interval)[:\s]*\[?\s*(\d+\.?\d*)%?\s*[-–—,]\s*(\d+\.?\d*)%?\s*\]?",
        r"(?:range|interval)[:\s]*\[?\s*(\d+\.?\d*)%?\s+to\s+(\d+\.?\d*)%?\s*\]?",
        r"\[(\d+\.?\d*)%?\s*,\s*(\d+\.?\d*)%?\]",  # [2.5, 7]
    ]

    for pattern in ci_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            low, high = float(match.group(1)), float(match.group(2))
            if low > high:
                low, high = high, low
            return low, high

    return None, None


_JSON_INSTRUCTION = """

After your reasoning, output your final answer as a JSON block:
```json
{"estimate": <number>, "ci_low": <number>, "ci_high": <number>}
```
where ci_low and ci_high are the bounds of your 80% confidence interval."""


def generate_naive_prompt(case: QuantitativeCase) -> str:
    """Generate naive (non-framework) prompt."""
    return f"""You are a helpful assistant. Answer directly and concisely.

{case.scenario}

Question: {case.estimate_question} Give a single number and an 80% confidence interval.{_JSON_INSTRUCTION}"""


def generate_farness_prompt(case: QuantitativeCase) -> str:
    """Generate farness framework prompt."""
    return f"""You are a decision analyst using the "farness" framework. This requires:
1. Cite base rates from research (outside view)
2. Make numeric forecasts with confidence intervals
3. Identify cognitive biases in the framing

{case.scenario}

Question: {case.estimate_question} Give a point estimate and 80% confidence interval.{_JSON_INSTRUCTION}"""


def generate_probe_prompt(
    case: QuantitativeCase,
    initial_estimate: float,
    initial_ci: Optional[tuple[float, float]],
    condition: str,
) -> str:
    """Generate probing follow-up prompt."""
    ci_text = ""
    if initial_ci and initial_ci[0] is not None:
        ci_text = f" (CI: {initial_ci[0]}-{initial_ci[1]})"

    probes_text = "\n\n".join(f"{i+1}. {probe}" for i, probe in enumerate(case.probes))

    if condition == "naive":
        return f"""You previously estimated {initial_estimate} {case.estimate_unit} for this scenario.

Follow-up information:

{probes_text}

Given this new information, what's your revised estimate ({case.estimate_unit})? Also provide an 80% confidence interval.{_JSON_INSTRUCTION}"""
    else:
        return f"""You previously estimated {initial_estimate} {case.estimate_unit}{ci_text} for this scenario.

Follow-up information:

{probes_text}

Given this new information, what's your revised estimate and 80% CI?{_JSON_INSTRUCTION}"""


@dataclass
class StabilityExperiment:
    """Run a full stability-under-probing experiment."""

    cases: list[QuantitativeCase] = field(default_factory=lambda: STABILITY_CASES.copy())
    results: list[StabilityResult] = field(default_factory=list)

    def analyze(self) -> dict:
        """Analyze experiment results with statistical tests.

        Returns comprehensive analysis including:
        - Per-condition descriptive statistics
        - Statistical comparisons (Mann-Whitney U, effect sizes) - requires scipy
        - Convergence analysis with bootstrap CIs
        """
        if not self.results:
            return {"error": "No results to analyze"}

        naive = [r for r in self.results if r.condition == "naive"]
        farness = [r for r in self.results if r.condition == "farness"]

        def get_values(lst, attr):
            vals = []
            for r in lst:
                v = getattr(r, attr)
                if v is not None:
                    if HAS_SCIPY and np.isinf(v):
                        continue
                    elif not HAS_SCIPY and v == float('inf'):
                        continue
                    vals.append(v)
            return vals

        def avg(lst, attr):
            vals = get_values(lst, attr)
            if not vals:
                return None
            if HAS_SCIPY:
                return float(np.mean(vals))
            return sum(vals) / len(vals)

        def std(lst, attr):
            vals = get_values(lst, attr)
            if len(vals) < 2:
                return None
            if HAS_SCIPY:
                return float(np.std(vals, ddof=1))
            # Manual std calculation
            mean = sum(vals) / len(vals)
            variance = sum((x - mean) ** 2 for x in vals) / (len(vals) - 1)
            return variance ** 0.5

        def rate(lst, predicate):
            if not lst:
                return None
            return sum(1 for r in lst if predicate(r)) / len(lst)

        # Extract values for statistical tests
        naive_updates = get_values(naive, "update_magnitude")
        farness_updates = get_values(farness, "update_magnitude")

        # Statistical comparison of update magnitudes (requires scipy)
        comparison = {}
        if HAS_SCIPY and len(naive_updates) >= 2 and len(farness_updates) >= 2:
            # Mann-Whitney U test (non-parametric)
            u_stat, p_value = stats.mannwhitneyu(naive_updates, farness_updates, alternative='greater')
            comparison["update_magnitude"] = {
                "mann_whitney_u": float(u_stat),
                "p_value": float(p_value),
                "hypothesis": "naive > farness (one-sided)",
            }

            # Effect size: rank-biserial correlation
            n1, n2 = len(naive_updates), len(farness_updates)
            r_rb = 1 - (2 * u_stat) / (n1 * n2)  # Rank-biserial correlation
            comparison["update_magnitude"]["effect_size_r"] = float(r_rb)

            # Cohen's d (assuming roughly normal)
            pooled_std = np.sqrt(((len(naive_updates) - 1) * np.var(naive_updates, ddof=1) +
                                  (len(farness_updates) - 1) * np.var(farness_updates, ddof=1)) /
                                 (len(naive_updates) + len(farness_updates) - 2))
            if pooled_std > 0:
                cohens_d = (np.mean(naive_updates) - np.mean(farness_updates)) / pooled_std
                comparison["update_magnitude"]["cohens_d"] = float(cohens_d)

            # CI rate comparison (Fisher's exact test)
            naive_ci_count = sum(1 for r in naive if r.had_initial_ci)
            farness_ci_count = sum(1 for r in farness if r.had_initial_ci)
            if len(naive) > 0 and len(farness) > 0:
                table = [[farness_ci_count, len(farness) - farness_ci_count],
                         [naive_ci_count, len(naive) - naive_ci_count]]
                _, p_value_ci = stats.fisher_exact(table, alternative='greater')
                comparison["initial_ci_rate"] = {
                    "fisher_exact_p": float(p_value_ci),
                    "hypothesis": "farness > naive (one-sided)",
                }

        return {
            "n_naive": len(naive),
            "n_farness": len(farness),
            "naive": {
                "mean_update_magnitude": avg(naive, "update_magnitude"),
                "std_update_magnitude": std(naive, "update_magnitude"),
                "mean_relative_update": avg(naive, "relative_update"),
                "initial_ci_rate": rate(naive, lambda r: r.had_initial_ci),
                "correct_direction_rate": self._correct_direction_rate(naive),
            },
            "farness": {
                "mean_update_magnitude": avg(farness, "update_magnitude"),
                "std_update_magnitude": std(farness, "update_magnitude"),
                "mean_relative_update": avg(farness, "relative_update"),
                "initial_ci_rate": rate(farness, lambda r: r.had_initial_ci),
                "correct_direction_rate": self._correct_direction_rate(farness),
            },
            "statistical_comparison": comparison,
            "convergence": self._measure_convergence(),
        }

    def _correct_direction_rate(self, results: list[StabilityResult]) -> Optional[float]:
        """Rate at which updates match expected direction."""
        if not results:
            return None

        correct = 0
        total = 0
        for r in results:
            case = self._get_case(r.case_id)
            if case and case.expected_update_direction != "neutral":
                total += 1
                if r.update_direction == case.expected_update_direction:
                    correct += 1

        return correct / total if total > 0 else None

    def _get_case(self, case_id: str) -> Optional[QuantitativeCase]:
        for case in self.cases:
            if case.id == case_id:
                return case
        return None

    def _measure_convergence(self) -> dict:
        """Measure whether naive(probed) converges toward farness(initial).

        Uses minimum gap threshold to avoid division instability.
        Provides bootstrap confidence intervals for the convergence ratio.
        """
        convergence_data = []
        MIN_GAP_THRESHOLD = 0.5  # Minimum meaningful gap to compute ratio

        for case in self.cases:
            naive_results = [r for r in self.results if r.case_id == case.id and r.condition == "naive"]
            farness_results = [r for r in self.results if r.case_id == case.id and r.condition == "farness"]

            if not naive_results or not farness_results:
                continue

            for naive_r in naive_results:
                for farness_r in farness_results:
                    # Distance from naive(initial) to farness(initial)
                    initial_gap = abs(naive_r.initial_estimate - farness_r.initial_estimate)
                    # Distance from naive(probed) to farness(initial)
                    final_gap = abs(naive_r.final_estimate - farness_r.initial_estimate)

                    # Skip if initial gap too small (estimates already similar)
                    if initial_gap < MIN_GAP_THRESHOLD:
                        convergence_data.append({
                            "case_id": case.id,
                            "initial_gap": initial_gap,
                            "final_gap": final_gap,
                            "convergence_ratio": None,  # Undefined when gap too small
                            "skipped": True,
                            "skip_reason": f"Initial gap {initial_gap:.2f} < threshold {MIN_GAP_THRESHOLD}",
                        })
                        continue

                    convergence_ratio = 1 - (final_gap / initial_gap)
                    convergence_data.append({
                        "case_id": case.id,
                        "initial_gap": initial_gap,
                        "final_gap": final_gap,
                        "convergence_ratio": convergence_ratio,
                        "skipped": False,
                    })

        if not convergence_data:
            return {}

        # Filter to valid convergence ratios
        valid_ratios = [d["convergence_ratio"] for d in convergence_data if d.get("convergence_ratio") is not None]

        if not valid_ratios:
            return {
                "mean_convergence_ratio": None,
                "interpretation": "All cases had initial estimates too similar to compute convergence",
                "n_valid": 0,
                "n_skipped": len(convergence_data),
                "details": convergence_data,
            }

        if HAS_SCIPY:
            avg_convergence = float(np.mean(valid_ratios))
        else:
            avg_convergence = sum(valid_ratios) / len(valid_ratios)

        # Bootstrap 95% CI for convergence ratio (requires scipy/numpy)
        ci_low, ci_high = None, None
        if HAS_SCIPY:
            bootstrap_means = []
            n_bootstrap = 1000
            for _ in range(n_bootstrap):
                sample = np.random.choice(valid_ratios, size=len(valid_ratios), replace=True)
                bootstrap_means.append(np.mean(sample))

            ci_low = float(np.percentile(bootstrap_means, 2.5))
            ci_high = float(np.percentile(bootstrap_means, 97.5))

        # Statistical test: is convergence significantly > 0? (requires scipy)
        t_stat, p_value_one_sided = None, None
        if HAS_SCIPY and len(valid_ratios) >= 3:
            t_stat, p_value = stats.ttest_1samp(valid_ratios, 0)
            p_value_one_sided = p_value / 2 if t_stat > 0 else 1 - p_value / 2

        # Effect size (Cohen's d vs 0)
        cohens_d = None
        if len(valid_ratios) >= 2:
            if HAS_SCIPY:
                std_val = np.std(valid_ratios, ddof=1)
            else:
                mean = sum(valid_ratios) / len(valid_ratios)
                std_val = (sum((x - mean) ** 2 for x in valid_ratios) / (len(valid_ratios) - 1)) ** 0.5
            if std_val > 0:
                cohens_d = avg_convergence / std_val

        # Interpretation based on CI and effect size
        if ci_low is not None and ci_low > 0:
            interpretation = "Significant convergence: naive responses moved toward farness initial estimates (CI excludes 0)"
        elif ci_high is not None and ci_high < 0:
            interpretation = "Significant divergence: naive responses moved away from farness initial estimates"
        elif ci_low is None:
            # No CI available (scipy not installed)
            interpretation = f"Mean convergence ratio: {avg_convergence:.2f} (install scipy for CI and p-value)"
        else:
            interpretation = "No significant convergence detected (CI includes 0)"

        return {
            "mean_convergence_ratio": float(avg_convergence),
            "ci_95": [ci_low, ci_high] if ci_low is not None else None,
            "n_valid": len(valid_ratios),
            "n_skipped": len([d for d in convergence_data if d.get("skipped")]),
            "t_statistic": float(t_stat) if t_stat is not None else None,
            "p_value_one_sided": float(p_value_one_sided) if p_value_one_sided is not None else None,
            "cohens_d": float(cohens_d) if cohens_d is not None else None,
            "interpretation": interpretation,
            "details": convergence_data,
        }

    def summary_table(self) -> str:
        """Generate a markdown summary table with statistical results."""
        analysis = self.analyze()

        lines = [
            "## Stability-Under-Probing Results",
            "",
            f"**Sample sizes**: n_naive = {analysis.get('n_naive', 0)}, n_farness = {analysis.get('n_farness', 0)}",
            "",
            "### Primary Metrics",
            "",
            "| Metric | Naive | Farness | p-value |",
            "|--------|-------|---------|---------|",
        ]

        naive = analysis.get("naive", {})
        farness = analysis.get("farness", {})
        comparison = analysis.get("statistical_comparison", {})

        def fmt(v):
            if v is None:
                return "N/A"
            if isinstance(v, float):
                if 0 < abs(v) < 1:
                    return f"{v:.0%}"
                return f"{v:.2f}"
            return str(v)

        def fmt_p(p):
            if p is None:
                return "—"
            if p < 0.001:
                return "<0.001"
            if p < 0.01:
                return f"{p:.3f}"
            return f"{p:.2f}"

        # Update magnitude with p-value
        update_comparison = comparison.get("update_magnitude", {})
        p_update = update_comparison.get("p_value")
        lines.append(f"| Mean update magnitude | {fmt(naive.get('mean_update_magnitude'))} | {fmt(farness.get('mean_update_magnitude'))} | {fmt_p(p_update)} |")

        lines.append(f"| Mean relative update | {fmt(naive.get('mean_relative_update'))} | {fmt(farness.get('mean_relative_update'))} | — |")

        # CI rate with Fisher's exact p-value
        ci_comparison = comparison.get("initial_ci_rate", {})
        p_ci = ci_comparison.get("fisher_exact_p")
        lines.append(f"| Initial CI rate | {fmt(naive.get('initial_ci_rate'))} | {fmt(farness.get('initial_ci_rate'))} | {fmt_p(p_ci)} |")

        lines.append(f"| Correct direction rate | {fmt(naive.get('correct_direction_rate'))} | {fmt(farness.get('correct_direction_rate'))} | — |")

        # Effect sizes
        if update_comparison:
            lines.append("")
            lines.append("### Effect Sizes")
            lines.append("")
            if "cohens_d" in update_comparison:
                d = update_comparison["cohens_d"]
                effect_label = "large" if abs(d) > 0.8 else "medium" if abs(d) > 0.5 else "small"
                lines.append(f"- Cohen's d (update magnitude): {d:.2f} ({effect_label})")
            if "effect_size_r" in update_comparison:
                lines.append(f"- Rank-biserial r: {update_comparison['effect_size_r']:.2f}")

        # Convergence
        convergence = analysis.get("convergence", {})
        if convergence and convergence.get("mean_convergence_ratio") is not None:
            lines.append("")
            lines.append("### Convergence Analysis")
            lines.append("")
            ratio = convergence.get("mean_convergence_ratio")
            ci = convergence.get("ci_95", [None, None])
            p_conv = convergence.get("p_value_one_sided")

            ci_str = f"[{ci[0]:.2f}, {ci[1]:.2f}]" if ci is not None and ci[0] is not None else "N/A"
            lines.append(f"- **Convergence ratio**: {ratio:.2f} (95% CI: {ci_str})")
            if p_conv is not None:
                lines.append(f"- **p-value** (H0: ratio = 0): {fmt_p(p_conv)}")
            if convergence.get("cohens_d") is not None:
                lines.append(f"- **Cohen's d**: {convergence['cohens_d']:.2f}")
            lines.append(f"- **n valid pairs**: {convergence.get('n_valid', 0)}")
            lines.append("")
            lines.append(f"*{convergence.get('interpretation', '')}*")

        return "\n".join(lines)


def get_stability_case(case_id: str) -> Optional[QuantitativeCase]:
    """Get a stability case by ID."""
    for case in STABILITY_CASES:
        if case.id == case_id:
            return case
    return None


def get_all_stability_cases() -> list[QuantitativeCase]:
    """Get all stability test cases."""
    return STABILITY_CASES.copy()
