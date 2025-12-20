"""Tests for the stability-under-probing methodology."""

import pytest

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
    STABILITY_CASES,
)


class TestQuantitativeCases:
    """Tests for case definitions."""

    def test_all_cases_have_required_fields(self):
        """All cases should have required fields."""
        for case in STABILITY_CASES:
            assert case.id, f"Case missing id"
            assert case.name, f"Case {case.id} missing name"
            assert case.scenario, f"Case {case.id} missing scenario"
            assert case.estimate_question, f"Case {case.id} missing estimate_question"
            assert case.estimate_unit, f"Case {case.id} missing estimate_unit"
            assert len(case.probes) >= 2, f"Case {case.id} needs at least 2 probes"
            assert case.expected_update_direction in ["up", "down", "neutral"]

    def test_get_case_by_id(self):
        """Should retrieve case by ID."""
        case = get_stability_case("planning_estimate")
        assert case is not None
        assert case.name == "Software Project Timeline"

    def test_get_all_cases(self):
        """Should return all cases."""
        cases = get_all_stability_cases()
        assert len(cases) >= 5


class TestEstimateExtraction:
    """Tests for extracting estimates from response text."""

    def test_extract_number_with_unit(self):
        """Should extract number followed by unit."""
        assert extract_estimate("I estimate 4 weeks", "weeks") == 4
        assert extract_estimate("About 15%", "%") == 15

    def test_extract_point_estimate_label(self):
        """Should extract labeled point estimates."""
        assert extract_estimate("Point estimate: 3.5", "weeks") == 3.5
        assert extract_estimate("My estimate is 25", "%") == 25

    def test_extract_bold_number(self):
        """Should extract markdown bold numbers."""
        assert extract_estimate("The answer is **4** weeks", "weeks") == 4
        assert extract_estimate("Probability: **15%**", "%") == 15

    def test_extract_fallback_to_first_number(self):
        """Should fall back to first number found."""
        assert extract_estimate("Given the factors, 6 seems reasonable", "weeks") == 6

    def test_extract_decimal(self):
        """Should handle decimal numbers."""
        assert extract_estimate("Approximately 3.5 weeks", "weeks") == 3.5
        assert extract_estimate("12.5%", "%") == 12.5


class TestCIExtraction:
    """Tests for extracting confidence intervals."""

    def test_extract_dash_format(self):
        """Should extract CI with dash."""
        assert extract_ci("80% CI: 2.5-7") == (2.5, 7)
        assert extract_ci("Range: 10-25%") == (10, 25)

    def test_extract_to_format(self):
        """Should extract CI with 'to'."""
        assert extract_ci("between 3 to 8 weeks") == (3, 8)
        assert extract_ci("15% to 35%") == (15, 35)

    def test_extract_bracket_format(self):
        """Should extract CI with brackets."""
        assert extract_ci("[2, 6]") == (2, 6)
        assert extract_ci("(5, 15)") == (5, 15)

    def test_no_ci_returns_none(self):
        """Should return None when no CI found."""
        assert extract_ci("Just a point estimate of 5") == (None, None)

    def test_swaps_if_reversed(self):
        """Should swap if low > high."""
        assert extract_ci("7-2") == (2, 7)


class TestPromptGeneration:
    """Tests for prompt generation."""

    @pytest.fixture
    def case(self) -> QuantitativeCase:
        return get_stability_case("planning_estimate")

    def test_naive_prompt_is_simple(self, case):
        """Naive prompt should be direct."""
        prompt = generate_naive_prompt(case)
        assert "helpful assistant" in prompt.lower()
        assert "framework" not in prompt.lower()
        assert case.estimate_question in prompt

    def test_farness_prompt_has_framework(self, case):
        """Farness prompt should include framework."""
        prompt = generate_farness_prompt(case)
        assert "farness" in prompt.lower()
        assert "base rate" in prompt.lower()
        assert "confidence interval" in prompt.lower()

    def test_probe_prompt_includes_initial_estimate(self, case):
        """Probe prompt should reference initial estimate."""
        prompt = generate_probe_prompt(case, 4.0, None, "naive")
        assert "4" in prompt
        assert case.probes[0] in prompt or case.probes[0][:50] in prompt


class TestStabilityResult:
    """Tests for StabilityResult metrics."""

    @pytest.fixture
    def result_with_update(self) -> StabilityResult:
        return StabilityResult(
            case_id="test",
            condition="naive",
            initial_estimate=10.0,
            initial_ci_low=None,
            initial_ci_high=None,
            initial_response_text="Initial response",
            final_estimate=15.0,
            final_ci_low=12.0,
            final_ci_high=20.0,
            final_response_text="Final response",
        )

    @pytest.fixture
    def result_with_ci(self) -> StabilityResult:
        return StabilityResult(
            case_id="test",
            condition="farness",
            initial_estimate=10.0,
            initial_ci_low=5.0,
            initial_ci_high=15.0,
            initial_response_text="Initial response",
            final_estimate=8.0,
            final_ci_low=4.0,
            final_ci_high=14.0,
            final_response_text="Final response",
        )

    def test_update_magnitude(self, result_with_update):
        """Should calculate absolute update magnitude."""
        assert result_with_update.update_magnitude == 5.0

    def test_update_direction_up(self, result_with_update):
        """Should detect upward update."""
        assert result_with_update.update_direction == "up"

    def test_update_direction_down(self, result_with_ci):
        """Should detect downward update."""
        assert result_with_ci.update_direction == "down"

    def test_relative_update(self, result_with_update):
        """Should calculate relative update."""
        assert result_with_update.relative_update == 0.5  # 5/10

    def test_had_initial_ci(self, result_with_update, result_with_ci):
        """Should detect presence of initial CI."""
        assert not result_with_update.had_initial_ci
        assert result_with_ci.had_initial_ci

    def test_ci_width_change(self, result_with_ci):
        """Should calculate CI width change."""
        # Initial width: 15-5 = 10
        # Final width: 14-4 = 10
        assert result_with_ci.ci_width_change == 0.0

    def test_to_dict(self, result_with_update):
        """Should serialize to dict."""
        d = result_with_update.to_dict()
        assert d["case_id"] == "test"
        assert d["condition"] == "naive"
        assert d["initial_estimate"] == 10.0
        assert d["update_magnitude"] == 5.0


class TestStabilityExperiment:
    """Tests for experiment analysis."""

    @pytest.fixture
    def experiment(self) -> StabilityExperiment:
        """Create experiment with mock results."""
        exp = StabilityExperiment()

        # Add naive result: large update
        exp.results.append(StabilityResult(
            case_id="planning_estimate",
            condition="naive",
            initial_estimate=4.0,
            initial_ci_low=None,
            initial_ci_high=None,
            initial_response_text="",
            final_estimate=6.0,
            final_ci_low=4.0,
            final_ci_high=8.0,
            final_response_text="",
        ))

        # Add farness result: smaller update
        exp.results.append(StabilityResult(
            case_id="planning_estimate",
            condition="farness",
            initial_estimate=5.0,
            initial_ci_low=3.0,
            initial_ci_high=7.0,
            initial_response_text="",
            final_estimate=5.5,
            final_ci_low=3.5,
            final_ci_high=8.0,
            final_response_text="",
        ))

        return exp

    def test_analyze_returns_metrics(self, experiment):
        """Should return analysis metrics."""
        analysis = experiment.analyze()
        assert "n_naive" in analysis
        assert "n_farness" in analysis
        assert "naive" in analysis
        assert "farness" in analysis

    def test_naive_has_larger_update(self, experiment):
        """Naive should have larger update in our mock data."""
        analysis = experiment.analyze()
        naive_update = analysis["naive"]["mean_update_magnitude"]
        farness_update = analysis["farness"]["mean_update_magnitude"]
        assert naive_update > farness_update

    def test_farness_has_higher_ci_rate(self, experiment):
        """Farness should have higher initial CI rate."""
        analysis = experiment.analyze()
        assert analysis["farness"]["initial_ci_rate"] == 1.0
        assert analysis["naive"]["initial_ci_rate"] == 0.0

    def test_convergence_measured(self, experiment):
        """Should measure convergence."""
        analysis = experiment.analyze()
        assert "convergence" in analysis
        # Naive went from 4→6, farness initial was 5
        # Initial gap: |4-5| = 1, Final gap: |6-5| = 1
        # Convergence ratio: 1 - 1/1 = 0

    def test_summary_table_generated(self, experiment):
        """Should generate markdown table."""
        table = experiment.summary_table()
        assert "Stability-Under-Probing Results" in table
        assert "Naive" in table
        assert "Farness" in table
