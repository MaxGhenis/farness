"""Test cases with research-backed correct answers."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class DecisionCase:
    """A decision scenario with known correct answer from research."""

    id: str
    name: str
    scenario: str  # The decision problem
    correct_recommendation: str  # What research says is right
    research_basis: str  # Citation/explanation
    key_biases: list[str] = field(default_factory=list)  # Biases that lead people astray
    relevant_base_rates: list[str] = field(default_factory=list)  # Stats that should be cited


# Alias for backwards compatibility
TestCase = DecisionCase


# Test cases with well-established research answers
CASES = [
    TestCase(
        id="hiring_chemistry",
        name="Hiring: Chemistry vs Test Scores",
        scenario="""I'm a hiring manager. I really liked candidate A in our conversation -
great chemistry, they reminded me of our best performer. Candidate B was more reserved
but had slightly better test scores. Who should I hire?""",
        correct_recommendation="Candidate B (test scores)",
        research_basis="Schmidt & Hunter meta-analysis: structured assessments (r=0.51) beat unstructured interviews (r=0.38). 'Chemistry' and 'reminds me of top performer' are similarity bias, not predictive.",
        key_biases=["similarity bias", "halo effect", "affinity bias"],
        relevant_base_rates=[
            "unstructured interview validity r=0.38",
            "cognitive test validity r=0.51",
            "structured interview validity r=0.51",
        ],
    ),
    TestCase(
        id="sunk_cost",
        name="Sunk Cost: Continue Failing Project",
        scenario="""We've invested $2M and 18 months into a software project. It's behind
schedule, over budget, and the team is demoralized. But we're 'almost there' - maybe
another $500K and 3 months. Should we continue or cut our losses?""",
        correct_recommendation="Cut losses / kill the project",
        research_basis="Sunk cost fallacy is well-documented. Past investments are irrelevant to future decisions. The $2M is gone regardless. Only compare: $500K + 3 months vs. alternatives. 'Almost there' is planning fallacy.",
        key_biases=["sunk cost fallacy", "planning fallacy", "escalation of commitment"],
        relevant_base_rates=[
            "90% of software projects exceed budget",
            "projects 'almost done' typically need 2x estimated remaining time",
            "killing failing projects earlier correlates with better portfolio returns",
        ],
    ),
    TestCase(
        id="planning_software",
        name="Planning Fallacy: Software Estimate",
        scenario="""My team estimates this feature will take 2 weeks. They're confident
and have detailed task breakdowns. Should I trust their estimate for planning purposes?""",
        correct_recommendation="No - add significant buffer (50-100%) or use reference class",
        research_basis="Kahneman/Tversky planning fallacy: people systematically underestimate. Flyvbjerg reference class forecasting: use base rates from similar past projects, not inside-view optimism.",
        key_biases=["planning fallacy", "optimism bias", "inside view"],
        relevant_base_rates=[
            "software projects average 2.5x initial estimates",
            "only 30% of projects complete on time",
            "detailed breakdowns don't reduce optimism bias",
        ],
    ),
    TestCase(
        id="mna_acquisition",
        name="M&A: Should We Acquire Competitor",
        scenario="""A competitor is available for acquisition. Our CEO is excited -
'strategic fit', 'synergies', market consolidation. The price is fair based on their
financials. Should we acquire them?""",
        correct_recommendation="Probably no - default skepticism toward M&A",
        research_basis="M&A research shows acquirers typically destroy value. Synergies are overestimated, integration costs underestimated. Winner's curse. CEO overconfidence.",
        key_biases=["overconfidence", "winner's curse", "synergy overestimation"],
        relevant_base_rates=[
            "60-80% of M&A deals fail to create value",
            "acquirer stock typically drops on announcement",
            "synergies realized average 50% of projections",
        ],
    ),
    TestCase(
        id="expert_vs_algorithm",
        name="Expert Judgment vs Simple Algorithm",
        scenario="""We can either have our experienced analysts make predictions, or use
a simple statistical model based on historical data. The analysts have domain expertise
and can account for nuance. Which should we trust?""",
        correct_recommendation="Algorithm / statistical model",
        research_basis="Meehl (1954) and decades of follow-up: simple algorithms beat expert judgment in most domains. Experts add noise, overweight recent/salient info, inconsistent.",
        key_biases=["expert overconfidence", "availability bias", "inconsistency"],
        relevant_base_rates=[
            "algorithms beat experts in 45/48 studies (Grove & Meehl)",
            "expert predictions correlate r=0.1-0.2 with outcomes in many domains",
            "simple linear models match or beat complex expert judgment",
        ],
    ),
    TestCase(
        id="base_rate_neglect",
        name="Base Rate: Rare Disease Diagnosis",
        scenario="""A patient tests positive for a rare disease. The test is 95% accurate
(95% sensitivity, 95% specificity). The disease affects 1 in 1000 people.
How worried should they be?""",
        correct_recommendation="Not very worried - still only ~2% chance of having disease",
        research_basis="Base rate neglect (Kahneman/Tversky). With 1/1000 base rate and 95% test: P(disease|positive) = 0.95*0.001 / (0.95*0.001 + 0.05*0.999) ≈ 1.9%",
        key_biases=["base rate neglect", "representativeness heuristic"],
        relevant_base_rates=[
            "disease base rate: 0.1%",
            "false positive rate: 5%",
            "positive predictive value depends heavily on prevalence",
        ],
    ),
    TestCase(
        id="startup_pivot",
        name="Startup: Persist vs Pivot",
        scenario="""Our startup has been trying to get traction for 18 months. We have
some users but growth is flat. The team believes in the vision and has ideas to try.
Should we persist or pivot?""",
        correct_recommendation="Lean toward pivot - flat growth after 18 months is a strong signal",
        research_basis="Mullins/Komisar research on pivots. Startups that pivot 1-2 times raise more and are more successful. Flat growth for 18 months is statistically unlikely to suddenly inflect.",
        key_biases=["sunk cost", "confirmation bias", "optimism bias", "commitment escalation"],
        relevant_base_rates=[
            "startups that pivot 1-2x raise 2.5x more money",
            "most successful startups pivoted at least once",
            "flat growth rarely inflects without major change",
        ],
    ),
    TestCase(
        id="anchoring_negotiation",
        name="Negotiation: First Offer Anchoring",
        scenario="""I'm negotiating salary. The recruiter asked what I'm looking for first.
I'm not sure if I should give a number or wait for them to make an offer. What should I do?""",
        correct_recommendation="Make the first offer (anchor high)",
        research_basis="Anchoring effect is robust in negotiations. First offer strongly influences final outcome. The anchor-and-adjust heuristic means counterparty adjusts insufficiently from your number.",
        key_biases=["anchoring", "fear of rejection", "information asymmetry overestimation"],
        relevant_base_rates=[
            "first offers explain 50%+ of final settlement variance",
            "higher anchors lead to higher final prices",
            "anchoring effect persists even when anchor is known to be arbitrary",
        ],
    ),
    TestCase(
        id="hot_hand",
        name="Hot Hand: Basketball Player Streak",
        scenario="""Our basketball player has made his last 5 shots. He's 'hot'. Should we
keep feeding him the ball, or stick to our normal offense?""",
        correct_recommendation="Stick to normal offense - 'hot hand' is mostly illusory",
        research_basis="Gilovich/Tversky hot hand fallacy research. Short streaks are expected from random variation. No reliable evidence of predictive 'hotness' beyond base rate shooting percentage.",
        key_biases=["hot hand fallacy", "clustering illusion", "recency bias"],
        relevant_base_rates=[
            "5-shot streak probability ~3% even for random 50% shooter",
            "shot-to-shot correlation is near zero in most studies",
            "players shoot same % after makes vs misses",
        ],
    ),
    TestCase(
        id="diversification",
        name="Investment: Concentrated vs Diversified",
        scenario="""I have $100K to invest. My friend works at a tech startup that's growing
fast and says it's a sure thing. Should I put most of my money there, or diversify
across index funds?""",
        correct_recommendation="Diversify - don't concentrate on single stock",
        research_basis="Modern portfolio theory, efficient markets hypothesis. Concentration increases variance without increasing expected return. Inside information is often wrong. Single stock risk is unrewarded.",
        key_biases=["overconfidence", "availability bias", "illusion of control"],
        relevant_base_rates=[
            "most individual stocks underperform index",
            "insider tips are wrong more often than right",
            "diversification is 'only free lunch' in investing",
        ],
    ),
]


def get_case(case_id: str) -> Optional[TestCase]:
    """Get a test case by ID."""
    for case in CASES:
        if case.id == case_id:
            return case
    return None


def get_all_cases() -> list[TestCase]:
    """Get all test cases."""
    return CASES.copy()
