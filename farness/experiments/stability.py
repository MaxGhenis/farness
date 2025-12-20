"""Stability-under-probing methodology for evaluating decision frameworks."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional

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
        """Relative change as fraction of initial estimate."""
        if self.initial_estimate == 0:
            return float('inf') if self.final_estimate != 0 else 0
        return self.update_magnitude / abs(self.initial_estimate)

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


def extract_estimate(text: str, unit: str) -> Optional[float]:
    """Extract numeric estimate from response text."""
    # Look for patterns like "4 weeks", "15%", "$500K"
    patterns = [
        rf"(\d+\.?\d*)\s*{unit}",  # "4 weeks"
        rf"{unit}\s*(\d+\.?\d*)",  # "weeks: 4"
        r"(?:estimate|prediction|forecast)[:\s]+(\d+\.?\d*)",  # "estimate: 4"
        r"(?:point estimate)[:\s]+(\d+\.?\d*)",  # "point estimate: 4"
        r"\*\*(\d+\.?\d*)\*\*",  # "**4**" (markdown bold)
        r"^(\d+\.?\d*)$",  # Just a number
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            return float(match.group(1))

    # Fallback: find any standalone number
    numbers = re.findall(r'\b(\d+\.?\d*)\b', text)
    if numbers:
        return float(numbers[0])

    return None


def extract_ci(text: str) -> tuple[Optional[float], Optional[float]]:
    """Extract confidence interval from response text."""
    patterns = [
        r"(\d+\.?\d*)%?\s*[-–—]\s*(\d+\.?\d*)%?",  # "2.5-7" or "15%-35%"
        r"(\d+\.?\d*)%?\s+to\s+(\d+\.?\d*)%?",  # "2.5 to 7" or "15% to 35%"
        r"between\s+(\d+\.?\d*)%?\s+(?:and|to)\s+(\d+\.?\d*)%?",  # "between 3 to 8"
        r"CI[:\s]+(\d+\.?\d*)\s*[-–—,]\s*(\d+\.?\d*)",  # "CI: 2.5-7"
        r"(?:80%|80 percent)\s*(?:CI|confidence)[:\s]+(\d+\.?\d*)\s*[-–—,to]+\s*(\d+\.?\d*)",
        r"\[(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\]",  # "[2.5, 7]"
        r"\((\d+\.?\d*)\s*,\s*(\d+\.?\d*)\)",  # "(2.5, 7)"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            low, high = float(match.group(1)), float(match.group(2))
            if low < high:
                return low, high
            return high, low  # Swap if reversed

    return None, None


def generate_naive_prompt(case: QuantitativeCase) -> str:
    """Generate naive (non-framework) prompt."""
    return f"""You are a helpful assistant. Answer directly and concisely.

{case.scenario}

Question: {case.estimate_question} Give a single number."""


def generate_farness_prompt(case: QuantitativeCase) -> str:
    """Generate farness framework prompt."""
    return f"""You are a decision analyst using the "farness" framework. This requires:
1. Cite base rates from research (outside view)
2. Make numeric forecasts with confidence intervals
3. Identify cognitive biases in the framing

{case.scenario}

Question: {case.estimate_question} Give a point estimate and 80% confidence interval."""


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

Given this new information, what's your revised estimate ({case.estimate_unit})? Also provide an 80% confidence interval."""
    else:
        return f"""You previously estimated {initial_estimate} {case.estimate_unit}{ci_text} for this scenario.

Follow-up information:

{probes_text}

Given this new information, what's your revised estimate and 80% CI?"""


@dataclass
class StabilityExperiment:
    """Run a full stability-under-probing experiment."""

    cases: list[QuantitativeCase] = field(default_factory=lambda: STABILITY_CASES.copy())
    results: list[StabilityResult] = field(default_factory=list)

    def analyze(self) -> dict:
        """Analyze experiment results."""
        if not self.results:
            return {"error": "No results to analyze"}

        naive = [r for r in self.results if r.condition == "naive"]
        farness = [r for r in self.results if r.condition == "farness"]

        def avg(lst, attr):
            vals = [getattr(r, attr) for r in lst if getattr(r, attr) is not None]
            return sum(vals) / len(vals) if vals else None

        def rate(lst, predicate):
            if not lst:
                return None
            return sum(1 for r in lst if predicate(r)) / len(lst)

        return {
            "n_naive": len(naive),
            "n_farness": len(farness),
            "naive": {
                "mean_update_magnitude": avg(naive, "update_magnitude"),
                "mean_relative_update": avg(naive, "relative_update"),
                "initial_ci_rate": rate(naive, lambda r: r.had_initial_ci),
                "correct_direction_rate": self._correct_direction_rate(naive),
            },
            "farness": {
                "mean_update_magnitude": avg(farness, "update_magnitude"),
                "mean_relative_update": avg(farness, "relative_update"),
                "initial_ci_rate": rate(farness, lambda r: r.had_initial_ci),
                "correct_direction_rate": self._correct_direction_rate(farness),
            },
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
        """Measure whether naive(probed) converges toward farness(initial)."""
        convergence_data = []

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

                    if initial_gap > 0:
                        convergence_ratio = 1 - (final_gap / initial_gap)
                        convergence_data.append({
                            "case_id": case.id,
                            "initial_gap": initial_gap,
                            "final_gap": final_gap,
                            "convergence_ratio": convergence_ratio,
                        })

        if not convergence_data:
            return {}

        avg_convergence = sum(d["convergence_ratio"] for d in convergence_data) / len(convergence_data)

        return {
            "mean_convergence_ratio": avg_convergence,
            "interpretation": (
                "Naive responses converged toward farness initial estimates"
                if avg_convergence > 0.3 else
                "Limited convergence observed"
            ),
            "details": convergence_data,
        }

    def summary_table(self) -> str:
        """Generate a markdown summary table."""
        analysis = self.analyze()

        lines = [
            "## Stability-Under-Probing Results",
            "",
            "| Metric | Naive | Farness |",
            "|--------|-------|---------|",
        ]

        naive = analysis.get("naive", {})
        farness = analysis.get("farness", {})

        def fmt(v):
            if v is None:
                return "N/A"
            if isinstance(v, float):
                if v < 1:
                    return f"{v:.0%}"
                return f"{v:.2f}"
            return str(v)

        lines.append(f"| Mean update magnitude | {fmt(naive.get('mean_update_magnitude'))} | {fmt(farness.get('mean_update_magnitude'))} |")
        lines.append(f"| Mean relative update | {fmt(naive.get('mean_relative_update'))} | {fmt(farness.get('mean_relative_update'))} |")
        lines.append(f"| Initial CI rate | {fmt(naive.get('initial_ci_rate'))} | {fmt(farness.get('initial_ci_rate'))} |")
        lines.append(f"| Correct direction rate | {fmt(naive.get('correct_direction_rate'))} | {fmt(farness.get('correct_direction_rate'))} |")

        convergence = analysis.get("convergence", {})
        if convergence:
            lines.append("")
            lines.append(f"**Convergence ratio**: {fmt(convergence.get('mean_convergence_ratio'))}")
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
