"""Reframing experiment: does the farness framework reduce problem reframing?

Tests whether structured forecasting constrains or preserves an advisor's
ability to challenge the decision framing itself — suggesting different KPIs,
redefining the problem, or surfacing that the "real question" is something else.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional

from farness.experiments.llm import call_llm

try:
    import numpy as np
    from scipy import stats

    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    np = None  # type: ignore
    stats = None  # type: ignore


@dataclass
class ReframingCase:
    """A decision where a good advisor should reframe the problem."""

    id: str
    name: str
    scenario: str

    # The obvious KPIs implied by the question
    surface_kpis: list[str]

    # The "real" KPIs or reframes a good advisor should surface
    deeper_reframes: list[str]

    # Keywords that indicate reframing (beyond the surface question)
    reframe_indicators: list[str]


REFRAMING_CASES = [
    ReframingCase(
        id="grad_school",
        name="Should I go to grad school?",
        scenario="""I'm a software engineer with 3 years of experience making $130K.
I got into a good MBA program. The tuition is $80K/year for 2 years. Should I go?""",
        surface_kpis=["salary increase", "tuition cost", "ROI", "earnings"],
        deeper_reframes=[
            "What career do you actually want? MBA solves a networking/credential problem, not a skills problem",
            "Are you running toward the MBA or away from your current job?",
            "Have you considered that many tech careers don't value MBAs?",
            "What specific role do you want post-MBA that you can't get now?",
        ],
        reframe_indicators=[
            "wrong question", "real question", "actually want",
            "running away", "running toward", "why do you want",
            "what are you trying to", "underlying goal", "root cause",
            "before we forecast", "step back", "bigger picture",
            "career you want", "not just about", "deeper issue",
            "identity", "what kind of", "who do you want to be",
        ],
    ),
    ReframingCase(
        id="feature_build",
        name="Should we build this feature?",
        scenario="""Our users have been asking for a mobile app. We're a B2B SaaS company
with 200 customers. Our web app works on mobile browsers but isn't optimized.
Building a native app would take 4 months and $200K. Should we build it?""",
        surface_kpis=["development cost", "user retention", "revenue impact", "timeline"],
        deeper_reframes=[
            "Are users actually churning because of mobile, or is this a nice-to-have?",
            "Could you solve this with a responsive web redesign instead?",
            "Is mobile usage high enough in your B2B segment to justify this?",
            "What's the opportunity cost — what else could you build with that $200K?",
        ],
        reframe_indicators=[
            "opportunity cost", "alternative", "responsive",
            "PWA", "progressive web", "actually churning",
            "nice to have", "must have", "what else could",
            "wrong problem", "real problem", "root cause",
            "prioriti", "instead of", "before building",
            "validate", "test first", "prototype",
        ],
    ),
    ReframingCase(
        id="move_cities",
        name="Should I move to SF or stay in Austin?",
        scenario="""I'm a senior engineer. I got an offer in SF for $250K (vs $180K now in Austin).
Cost of living is way higher in SF though. My partner works remotely so they're flexible.
Should I take the SF offer?""",
        surface_kpis=["salary", "cost of living", "savings rate", "career growth"],
        deeper_reframes=[
            "What does your partner actually want? 'Flexible' doesn't mean 'enthusiastic'",
            "Is this about the money or about something else (excitement, status, career stage)?",
            "Could you negotiate remote-first and get a middle ground?",
            "What community and lifestyle factors matter beyond finances?",
        ],
        reframe_indicators=[
            "partner", "relationship", "community", "lifestyle",
            "remote", "negotiate", "hybrid", "what do you value",
            "beyond money", "beyond salary", "not just financial",
            "happiness", "fulfillment", "well-being", "quality of life",
            "social", "friends", "network", "belong",
            "identity", "stage of life", "what matters most",
        ],
    ),
    ReframingCase(
        id="hire_senior",
        name="Should we hire a VP of Engineering?",
        scenario="""We're a 15-person startup that just raised Series A. Engineering is our
bottleneck — we can't ship fast enough. Our CTO is overwhelmed. Should we hire
a VP of Engineering to manage the team so the CTO can focus on architecture?""",
        surface_kpis=["hiring timeline", "salary cost", "shipping velocity", "team productivity"],
        deeper_reframes=[
            "Is the bottleneck actually management, or is it technical debt/process?",
            "Does your CTO actually want to give up management, or will they resist?",
            "At 15 people, do you need a VP or would a strong tech lead suffice?",
            "Could better processes (sprint planning, CI/CD) solve this without a hire?",
        ],
        reframe_indicators=[
            "technical debt", "process", "bottleneck",
            "CTO wants", "CTO willing", "org design",
            "too early", "premature", "team size",
            "tech lead instead", "senior IC", "alternative",
            "root cause", "real problem", "underlying",
            "sprint", "CI/CD", "tooling", "automation",
        ],
    ),
    ReframingCase(
        id="raise_funding",
        name="Should we raise a Series B?",
        scenario="""We're growing 15% month-over-month with $500K MRR. We have 12 months of
runway. VCs are interested and we could probably raise $20M at a $200M valuation.
Should we raise now or wait until we're bigger for a better valuation?""",
        surface_kpis=["valuation", "dilution", "runway", "growth rate"],
        deeper_reframes=[
            "Do you actually need the money, or are you raising because you can?",
            "What would you do with $20M that you can't do with your current runway?",
            "Is 15% MoM sustainable, or are you about to hit a growth ceiling?",
            "Have you considered profitability as an alternative to fundraising?",
        ],
        reframe_indicators=[
            "need the money", "use of funds", "what would you do with",
            "profitable", "profitability", "bootstrap", "self-fund",
            "growth ceiling", "sustainable", "plateau",
            "default alive", "burn rate", "unit economics",
            "why raise", "don't need to", "optionality",
        ],
    ),
    ReframingCase(
        id="quit_job",
        name="Should I quit to start a startup?",
        scenario="""I'm a product manager at Google making $350K. I have a startup idea
I'm passionate about — a developer tools company. I have $200K saved. My spouse
works and we have a 2-year-old. Should I quit to go full-time on this?""",
        surface_kpis=["financial runway", "startup success probability", "income loss", "market size"],
        deeper_reframes=[
            "Can you validate the idea before quitting? Nights/weekends MVP?",
            "What does your spouse actually think? Have you had the real conversation?",
            "Is this about the startup or about being unhappy at Google?",
            "What would make you regret NOT doing this in 10 years?",
        ],
        reframe_indicators=[
            "spouse", "family", "partner", "validate first",
            "side project", "nights and weekends", "before quitting",
            "regret", "unhappy", "fulfillment", "calling",
            "risk tolerance", "worst case", "reversible",
            "identity", "founder identity", "who you want to be",
            "why now", "timing", "could you wait",
        ],
    ),
]


NAIVE_PROMPT = """You are a helpful advisor. Help me think through this decision:

{scenario}

What should I do? Give me your honest recommendation with reasoning."""

FARNESS_PROMPT = """You are a decision analyst using the "farness" framework. Apply this process:

1. Define 2-3 explicit, measurable KPIs for this decision
2. Identify the options (including ones not mentioned)
3. For each option x KPI, give a point estimate and 80% confidence interval
4. Cite relevant base rates (outside view)
5. Identify cognitive biases in the framing
6. Give a recommendation based on expected value

Decision:
{scenario}"""


@dataclass
class ReframingResult:
    """Result from a single reframing trial."""

    case_id: str
    condition: str  # "naive" or "farness"
    run_number: int
    response_text: str
    timestamp: str
    duration_seconds: float

    # Computed
    reframe_count: int = 0
    reframe_matches: list[str] = field(default_factory=list)
    introduced_new_kpis: bool = False
    challenged_framing: bool = False

    def to_dict(self) -> dict:
        return {
            "case_id": self.case_id,
            "condition": self.condition,
            "run_number": self.run_number,
            "reframe_count": self.reframe_count,
            "reframe_matches": self.reframe_matches,
            "introduced_new_kpis": self.introduced_new_kpis,
            "challenged_framing": self.challenged_framing,
            "response_text": self.response_text,
            "timestamp": self.timestamp,
            "duration_seconds": self.duration_seconds,
        }


def score_reframing(response: str, case: ReframingCase) -> tuple[int, list[str], bool, bool]:
    """Score a response for reframing indicators.

    Returns: (reframe_count, matched_indicators, introduced_new_kpis, challenged_framing)
    """
    text_lower = response.lower()
    matched = []

    for indicator in case.reframe_indicators:
        if indicator.lower() in text_lower:
            matched.append(indicator)

    # Check if response introduced KPIs beyond the surface ones
    surface_kpi_words = set()
    for kpi in case.surface_kpis:
        surface_kpi_words.update(kpi.lower().split())

    # Look for novel KPI-like language
    kpi_patterns = [
        r"(?:KPI|metric|measure|optimize for|success means|define success as)\s*[:\-]?\s*(.+)",
        r"what (?:really |actually )?matters (?:here )?is\s+(.+)",
    ]
    new_kpi = False
    for pattern in kpi_patterns:
        match = re.search(pattern, text_lower)
        if match:
            kpi_text = match.group(1)
            # Check if it's about something NOT in surface KPIs
            if not any(word in kpi_text for word in surface_kpi_words if len(word) > 3):
                new_kpi = True
                break

    # Check if response explicitly challenges the framing
    challenge_patterns = [
        r"(?:the )?(?:real|actual|underlying|deeper) (?:question|issue|problem)",
        r"(?:before|first).{0,30}(?:consider|ask|think about)",
        r"step back",
        r"wrong (?:question|frame|way to think)",
        r"reframe",
        r"(?:might|should) (?:instead|also) (?:ask|consider|think)",
        r"not (?:really|actually|just) about",
    ]
    challenged = any(
        re.search(p, text_lower) for p in challenge_patterns
    )

    return len(matched), matched, new_kpi, challenged


def run_single_trial(
    case: ReframingCase,
    condition: str,
    run_number: int,
    timeout: int = 120,
) -> ReframingResult:
    """Run a single reframing trial using the Anthropic API."""
    template = NAIVE_PROMPT if condition == "naive" else FARNESS_PROMPT
    prompt = template.format(scenario=case.scenario.strip())

    timestamp = datetime.now().isoformat()
    response, duration = call_llm(prompt, timeout=float(timeout))

    reframe_count, reframe_matches, new_kpis, challenged = score_reframing(response, case)

    return ReframingResult(
        case_id=case.id,
        condition=condition,
        run_number=run_number,
        response_text=response,
        timestamp=timestamp,
        duration_seconds=duration,
        reframe_count=reframe_count,
        reframe_matches=reframe_matches,
        introduced_new_kpis=new_kpis,
        challenged_framing=challenged,
    )


def run_reframing_experiment(
    cases: list[ReframingCase] | None = None,
    runs_per_condition: int = 3,
    output_dir: Path | None = None,
    verbose: bool = True,
    start_run: int = 1,
) -> list[ReframingResult]:
    """Run the full reframing experiment."""
    if cases is None:
        cases = REFRAMING_CASES

    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    results = []
    total = len(cases) * 2 * runs_per_condition
    i = 0

    for case in cases:
        for condition in ["naive", "farness"]:
            for run_num in range(start_run, start_run + runs_per_condition):
                i += 1
                if verbose:
                    print(f"[{i}/{total}] {case.id} - {condition} - run {run_num}")

                result = run_single_trial(case, condition, run_num)
                results.append(result)

                if verbose:
                    print(f"  reframe_count={result.reframe_count} challenged={result.challenged_framing} ({result.duration_seconds:.1f}s)")

                if output_dir:
                    result_file = output_dir / f"reframe_{case.id}_{condition}_{run_num}.json"
                    with open(result_file, "w") as f:
                        json.dump(result.to_dict(), f, indent=2)

    return results


def analyze_reframing(results: list[ReframingResult]) -> dict:
    """Analyze reframing experiment results."""
    naive = [r for r in results if r.condition == "naive" and not r.response_text.startswith("ERROR")]
    farness = [r for r in results if r.condition == "farness" and not r.response_text.startswith("ERROR")]

    def stats_for(group: list[ReframingResult]) -> dict:
        if not group:
            return {}
        n = len(group)
        return {
            "n": n,
            "mean_reframe_count": sum(r.reframe_count for r in group) / n,
            "challenged_framing_rate": sum(r.challenged_framing for r in group) / n,
            "introduced_new_kpis_rate": sum(r.introduced_new_kpis for r in group) / n,
            "mean_reframe_indicators": sum(r.reframe_count for r in group) / n,
        }

    analysis = {
        "naive": stats_for(naive),
        "farness": stats_for(farness),
    }

    # Statistical comparison
    if HAS_SCIPY and len(naive) >= 2 and len(farness) >= 2:
        naive_counts = [r.reframe_count for r in naive]
        farness_counts = [r.reframe_count for r in farness]

        # Mann-Whitney U: is naive reframing > farness reframing?
        u_stat, p_value = stats.mannwhitneyu(naive_counts, farness_counts, alternative='greater')
        n1, n2 = len(naive_counts), len(farness_counts)
        r_rb = 1 - (2 * u_stat) / (n1 * n2)

        analysis["statistical_comparison"] = {
            "reframe_count": {
                "mann_whitney_u": float(u_stat),
                "p_value": float(p_value),
                "effect_size_r": float(r_rb),
                "hypothesis": "naive > farness (one-sided): framework reduces reframing",
            }
        }

        # Challenge rate: Fisher's exact test
        naive_challenged = sum(r.challenged_framing for r in naive)
        farness_challenged = sum(r.challenged_framing for r in farness)
        table = [
            [naive_challenged, len(naive) - naive_challenged],
            [farness_challenged, len(farness) - farness_challenged],
        ]
        _, p_challenge = stats.fisher_exact(table, alternative='greater')
        analysis["statistical_comparison"]["challenged_framing"] = {
            "fisher_exact_p": float(p_challenge),
            "hypothesis": "naive > farness: framework reduces explicit framing challenges",
        }

    # Per-case breakdown
    case_ids = sorted(set(r.case_id for r in results))
    by_case = {}
    for cid in case_ids:
        case_naive = [r for r in naive if r.case_id == cid]
        case_farness = [r for r in farness if r.case_id == cid]
        by_case[cid] = {
            "naive": stats_for(case_naive),
            "farness": stats_for(case_farness),
        }
    analysis["by_case"] = by_case

    return analysis


def summary_table(results: list[ReframingResult]) -> str:
    """Generate markdown summary table."""
    analysis = analyze_reframing(results)

    lines = [
        "## Reframing experiment results",
        "",
    ]

    naive = analysis.get("naive", {})
    farness = analysis.get("farness", {})

    lines.extend([
        f"**Sample sizes**: n_naive = {naive.get('n', 0)}, n_farness = {farness.get('n', 0)}",
        "",
        "### Reframing metrics",
        "",
        "| Metric | Naive | Farness | Direction |",
        "|--------|-------|---------|-----------|",
    ])

    def fmt(v):
        if v is None:
            return "N/A"
        if isinstance(v, float):
            if 0 <= v <= 1:
                return f"{v:.0%}"
            return f"{v:.2f}"
        return str(v)

    lines.append(
        f"| Mean reframe indicators | {fmt(naive.get('mean_reframe_count'))} | {fmt(farness.get('mean_reframe_count'))} | "
        f"{'naive > farness' if (naive.get('mean_reframe_count', 0) or 0) > (farness.get('mean_reframe_count', 0) or 0) else 'farness >= naive'} |"
    )
    lines.append(
        f"| Challenged framing rate | {fmt(naive.get('challenged_framing_rate'))} | {fmt(farness.get('challenged_framing_rate'))} | "
        f"{'naive > farness' if (naive.get('challenged_framing_rate', 0) or 0) > (farness.get('challenged_framing_rate', 0) or 0) else 'farness >= naive'} |"
    )
    lines.append(
        f"| Introduced new KPIs rate | {fmt(naive.get('introduced_new_kpis_rate'))} | {fmt(farness.get('introduced_new_kpis_rate'))} | "
        f"{'naive > farness' if (naive.get('introduced_new_kpis_rate', 0) or 0) > (farness.get('introduced_new_kpis_rate', 0) or 0) else 'farness >= naive'} |"
    )

    # Statistical results
    comparison = analysis.get("statistical_comparison", {})
    if comparison:
        lines.extend(["", "### Statistical tests", ""])
        rc = comparison.get("reframe_count", {})
        if rc:
            p = rc.get("p_value")
            r = rc.get("effect_size_r")
            lines.append(f"- Reframe count: U = {rc.get('mann_whitney_u', 'N/A')}, p = {p:.3f}, r = {r:.2f}")
        cf = comparison.get("challenged_framing", {})
        if cf:
            lines.append(f"- Challenged framing: Fisher's exact p = {cf.get('fisher_exact_p', 'N/A'):.3f}")

    # Per-case
    lines.extend(["", "### Per-case breakdown", ""])
    for cid, data in analysis.get("by_case", {}).items():
        n_reframe = data.get("naive", {}).get("mean_reframe_count", 0) or 0
        f_reframe = data.get("farness", {}).get("mean_reframe_count", 0) or 0
        lines.append(f"- **{cid}**: naive={n_reframe:.1f} vs farness={f_reframe:.1f} reframe indicators")

    return "\n".join(lines)
