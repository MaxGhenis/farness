"""Tests for the reframing experiment module."""

import pytest
from farness.experiments.reframing import (
    ReframingCase,
    ReframingResult,
    REFRAMING_CASES,
    score_reframing,
    analyze_reframing,
    summary_table,
)


class TestReframingCases:
    """Test that reframing cases are well-formed."""

    def test_all_cases_have_required_fields(self):
        for case in REFRAMING_CASES:
            assert case.id, f"Case missing id"
            assert case.name, f"Case {case.id} missing name"
            assert case.scenario, f"Case {case.id} missing scenario"
            assert len(case.surface_kpis) >= 2, f"Case {case.id} needs at least 2 surface KPIs"
            assert len(case.deeper_reframes) >= 2, f"Case {case.id} needs at least 2 deeper reframes"
            assert len(case.reframe_indicators) >= 5, f"Case {case.id} needs at least 5 reframe indicators"

    def test_case_ids_are_unique(self):
        ids = [c.id for c in REFRAMING_CASES]
        assert len(ids) == len(set(ids))

    def test_at_least_5_cases(self):
        assert len(REFRAMING_CASES) >= 5


class TestScoreReframing:
    """Test the reframing scoring function."""

    @pytest.fixture
    def grad_school_case(self):
        return next(c for c in REFRAMING_CASES if c.id == "grad_school")

    def test_detects_reframe_indicators(self, grad_school_case):
        response = "Before we look at ROI, what do you actually want from your career? Are you running away from your current job?"
        count, matches, _, _ = score_reframing(response, grad_school_case)
        assert count > 0
        assert len(matches) > 0

    def test_no_reframe_in_pure_financial(self, grad_school_case):
        response = "The MBA costs $160K total. Average MBA grad salary is $150K. Your current salary is $130K. The ROI is positive after 8 years."
        count, matches, _, _ = score_reframing(response, grad_school_case)
        assert count == 0

    def test_detects_framing_challenge(self, grad_school_case):
        response = "Let me step back — the real question isn't about the MBA's ROI. It's about what career you actually want."
        _, _, _, challenged = score_reframing(response, grad_school_case)
        assert challenged is True

    def test_no_challenge_in_direct_answer(self, grad_school_case):
        response = "Based on the financial analysis, the MBA has a positive expected return."
        _, _, _, challenged = score_reframing(response, grad_school_case)
        assert challenged is False

    def test_detects_across_cases(self):
        """Each case's indicators should detect reframes in relevant text."""
        for case in REFRAMING_CASES:
            # Build a response using a few of the case's own indicators
            fake_response = f"I think we need to consider {case.reframe_indicators[0]} and also {case.reframe_indicators[1]}."
            count, _, _, _ = score_reframing(fake_response, case)
            assert count >= 1, f"Case {case.id}: indicators not detected in response containing them"


class TestAnalyzeReframing:
    """Test the analysis function."""

    def _make_result(self, case_id, condition, reframe_count, challenged, new_kpis=False):
        return ReframingResult(
            case_id=case_id,
            condition=condition,
            run_number=1,
            response_text="test",
            timestamp="2026-01-01",
            duration_seconds=1.0,
            reframe_count=reframe_count,
            reframe_matches=["test"] * reframe_count,
            introduced_new_kpis=new_kpis,
            challenged_framing=challenged,
        )

    def test_empty_results(self):
        analysis = analyze_reframing([])
        assert analysis["naive"] == {}
        assert analysis["farness"] == {}

    def test_naive_more_reframing(self):
        results = [
            self._make_result("case1", "naive", 5, True),
            self._make_result("case2", "naive", 3, True),
            self._make_result("case1", "farness", 1, False),
            self._make_result("case2", "farness", 0, False),
        ]
        analysis = analyze_reframing(results)
        assert analysis["naive"]["mean_reframe_count"] > analysis["farness"]["mean_reframe_count"]
        assert analysis["naive"]["challenged_framing_rate"] > analysis["farness"]["challenged_framing_rate"]

    def test_equal_reframing(self):
        results = [
            self._make_result("case1", "naive", 2, True),
            self._make_result("case1", "farness", 2, True),
        ]
        analysis = analyze_reframing(results)
        assert analysis["naive"]["mean_reframe_count"] == analysis["farness"]["mean_reframe_count"]

    def test_per_case_breakdown(self):
        results = [
            self._make_result("case1", "naive", 3, True),
            self._make_result("case1", "farness", 1, False),
            self._make_result("case2", "naive", 5, True),
            self._make_result("case2", "farness", 2, False),
        ]
        analysis = analyze_reframing(results)
        assert "case1" in analysis["by_case"]
        assert "case2" in analysis["by_case"]


class TestSummaryTable:
    """Test markdown table generation."""

    def _make_result(self, case_id, condition, reframe_count, challenged):
        return ReframingResult(
            case_id=case_id,
            condition=condition,
            run_number=1,
            response_text="test",
            timestamp="2026-01-01",
            duration_seconds=1.0,
            reframe_count=reframe_count,
            reframe_matches=[],
            introduced_new_kpis=False,
            challenged_framing=challenged,
        )

    def test_produces_markdown(self):
        results = [
            self._make_result("case1", "naive", 3, True),
            self._make_result("case1", "farness", 1, False),
        ]
        table = summary_table(results)
        assert "## Reframing experiment results" in table
        assert "| Metric" in table

    def test_handles_empty(self):
        table = summary_table([])
        assert "Reframing experiment results" in table
