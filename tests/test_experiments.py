"""Tests for the experiments module."""

import pytest

from farness.experiments.cases import DecisionCase, get_all_cases, get_case
from farness.experiments.scorer import ResponseScorer, ResponseScore
from farness.experiments.runner import generate_prompt


class TestCases:
    """Tests for test case definitions."""

    def test_all_cases_have_required_fields(self):
        """All cases should have required fields populated."""
        for case in get_all_cases():
            assert case.id, f"Case missing id"
            assert case.name, f"Case {case.id} missing name"
            assert case.scenario, f"Case {case.id} missing scenario"
            assert case.correct_recommendation, f"Case {case.id} missing correct_recommendation"
            assert case.research_basis, f"Case {case.id} missing research_basis"

    def test_get_case_by_id(self):
        """Should retrieve case by ID."""
        case = get_case("hiring_chemistry")
        assert case is not None
        assert case.name == "Hiring: Chemistry vs Test Scores"

    def test_get_case_invalid_id(self):
        """Should return None for invalid ID."""
        assert get_case("nonexistent") is None

    def test_cases_have_biases(self):
        """Most cases should have at least one bias defined."""
        cases_with_biases = [c for c in get_all_cases() if c.key_biases]
        assert len(cases_with_biases) >= 8, "Most cases should have biases"

    def test_cases_have_base_rates(self):
        """Most cases should have base rates defined."""
        cases_with_rates = [c for c in get_all_cases() if c.relevant_base_rates]
        assert len(cases_with_rates) >= 8, "Most cases should have base rates"


class TestScorer:
    """Tests for the response scorer."""

    @pytest.fixture
    def hiring_case(self) -> DecisionCase:
        """Get the hiring case for testing."""
        return get_case("hiring_chemistry")

    @pytest.fixture
    def scorer(self, hiring_case) -> ResponseScorer:
        """Create a scorer for the hiring case."""
        return ResponseScorer(hiring_case)

    def test_detects_confidence_interval_dash(self, scorer):
        """Should detect CI with dash format."""
        response = "I estimate 80-90% success rate."
        score = scorer.score(response, "farness", 1)
        assert score.has_confidence_interval

    def test_detects_confidence_interval_to(self, scorer):
        """Should detect CI with 'to' format."""
        response = "Success probability: 70% to 85%."
        score = scorer.score(response, "farness", 1)
        assert score.has_confidence_interval

    def test_detects_confidence_interval_explicit(self, scorer):
        """Should detect explicit CI language."""
        response = "With an 80% confidence interval, I predict..."
        score = scorer.score(response, "farness", 1)
        assert score.has_confidence_interval

    def test_no_ci_in_simple_response(self, scorer):
        """Should not detect CI in simple response."""
        response = "I recommend option A because it seems better."
        score = scorer.score(response, "farness", 1)
        assert not score.has_confidence_interval

    def test_detects_accountability(self, scorer):
        """Should detect accountability mechanisms."""
        response = "Set a review date for 6 months from now to check outcomes."
        score = scorer.score(response, "farness", 1)
        assert score.has_accountability

    def test_detects_accountability_follow_up(self, scorer):
        """Should detect follow-up language."""
        response = "I recommend following up in 3 months to measure results."
        score = scorer.score(response, "farness", 1)
        assert score.has_accountability

    def test_no_accountability_in_simple_response(self, scorer):
        """Should not detect accountability in simple response."""
        response = "Go with option B, it's clearly better."
        score = scorer.score(response, "farness", 1)
        assert not score.has_accountability

    def test_detects_base_rate_explicit(self, scorer):
        """Should detect explicit base rate language."""
        response = "Research shows that structured interviews are better."
        score = scorer.score(response, "farness", 1)
        assert score.cites_base_rate

    def test_detects_base_rate_statistics(self, scorer):
        """Should detect statistical base rates."""
        response = "Studies show unstructured interviews have r=0.38 validity."
        score = scorer.score(response, "farness", 1)
        assert score.cites_base_rate

    def test_no_base_rate_in_opinion(self, scorer):
        """Should not detect base rate in pure opinion."""
        response = "I think chemistry is important in hiring."
        score = scorer.score(response, "farness", 1)
        assert not score.cites_base_rate

    def test_detects_similarity_bias(self, scorer):
        """Should detect similarity bias."""
        response = "Watch out for similarity bias - you might favor people like yourself."
        score = scorer.score(response, "farness", 1)
        assert "similarity bias" in score.biases_found

    def test_detects_multiple_biases(self, scorer):
        """Should detect multiple biases."""
        response = "This shows similarity bias and halo effect."
        score = scorer.score(response, "farness", 1)
        assert len(score.biases_found) >= 2

    def test_bias_count_matches_list(self, scorer):
        """Bias count should match length of biases_found."""
        response = "Watch for similarity bias and affinity bias."
        score = scorer.score(response, "farness", 1)
        assert score.bias_count == len(score.biases_found)

    def test_detects_quantified_tradeoffs(self, scorer):
        """Should detect quantified tradeoffs."""
        response = "Expected value of A is 7.2 vs B at 6.8."
        score = scorer.score(response, "farness", 1)
        assert score.quantifies_tradeoffs

    def test_detects_percentage_comparison(self, scorer):
        """Should detect percentage comparisons."""
        response = "Option A has 75% vs 60% success rate."
        score = scorer.score(response, "farness", 1)
        assert score.quantifies_tradeoffs

    def test_score_has_all_fields(self, scorer):
        """Score should have all required fields."""
        response = "Test response"
        score = scorer.score(response, "farness", 1)

        assert score.case_id == "hiring_chemistry"
        assert score.condition == "farness"
        assert score.run_number == 1
        assert isinstance(score.cites_base_rate, bool)
        assert isinstance(score.bias_count, int)
        assert isinstance(score.biases_found, list)
        assert isinstance(score.has_confidence_interval, bool)
        assert isinstance(score.has_accountability, bool)
        assert isinstance(score.quantifies_tradeoffs, bool)
        assert score.response_text == response


class TestPromptGeneration:
    """Tests for prompt generation."""

    @pytest.fixture
    def case(self) -> DecisionCase:
        return get_case("hiring_chemistry")

    def test_naive_prompt_is_simple(self, case):
        """Naive prompt should be simple and direct."""
        prompt = generate_prompt(case, "naive")
        assert "helpful assistant" in prompt.lower()
        assert "framework" not in prompt.lower()
        assert case.scenario.strip()[:50] in prompt

    def test_farness_prompt_has_framework(self, case):
        """Farness prompt should include framework instructions."""
        prompt = generate_prompt(case, "farness")
        assert "farness" in prompt.lower()
        assert "KPI" in prompt or "kpi" in prompt.lower()
        assert "confidence interval" in prompt.lower()
        assert "base rate" in prompt.lower()
        assert "bias" in prompt.lower()

    def test_both_prompts_contain_scenario(self, case):
        """Both prompts should contain the scenario."""
        naive = generate_prompt(case, "naive")
        farness = generate_prompt(case, "farness")

        # Check first 50 chars of scenario appear
        scenario_start = case.scenario.strip()[:50]
        assert scenario_start in naive
        assert scenario_start in farness


class TestResponseScoreDict:
    """Tests for score serialization."""

    def test_to_dict_roundtrip(self):
        """Should serialize and contain all fields."""
        score = ResponseScore(
            case_id="test",
            condition="farness",
            run_number=1,
            correct_recommendation=True,
            cites_base_rate=True,
            bias_count=2,
            biases_found=["similarity bias", "halo effect"],
            has_confidence_interval=True,
            has_accountability=True,
            quantifies_tradeoffs=True,
            response_text="Test response",
        )

        d = score.to_dict()
        assert d["case_id"] == "test"
        assert d["condition"] == "farness"
        assert d["correct_recommendation"] is True
        assert d["bias_count"] == 2
        assert "similarity bias" in d["biases_found"]
