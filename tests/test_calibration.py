"""Tests for calibration tracking."""

import pytest
from datetime import datetime

from farness.framework import Decision, KPI, Option, Forecast
from farness.calibration import CalibrationTracker, ForecastScore


class TestForecastScore:
    def test_error_calculation(self):
        score = ForecastScore(
            decision_id="test",
            kpi_name="revenue",
            option_name="A",
            predicted=100,
            actual=110,
            ci_low=80,
            ci_high=120,
            confidence_level=0.8,
        )
        assert score.error == 10

    def test_relative_error(self):
        score = ForecastScore(
            decision_id="test",
            kpi_name="revenue",
            option_name="A",
            predicted=100,
            actual=110,
            ci_low=80,
            ci_high=120,
            confidence_level=0.8,
        )
        assert abs(score.relative_error - 0.0909) < 0.001

    def test_relative_error_zero_actual(self):
        score = ForecastScore(
            decision_id="test",
            kpi_name="revenue",
            option_name="A",
            predicted=100,
            actual=0,
            ci_low=80,
            ci_high=120,
            confidence_level=0.8,
        )
        assert score.relative_error is None

    def test_in_interval_true(self):
        score = ForecastScore(
            decision_id="test",
            kpi_name="revenue",
            option_name="A",
            predicted=100,
            actual=110,
            ci_low=80,
            ci_high=120,
            confidence_level=0.8,
        )
        assert score.in_interval is True

    def test_in_interval_false(self):
        score = ForecastScore(
            decision_id="test",
            kpi_name="revenue",
            option_name="A",
            predicted=100,
            actual=150,
            ci_low=80,
            ci_high=120,
            confidence_level=0.8,
        )
        assert score.in_interval is False


class TestCalibrationTracker:
    @pytest.fixture
    def scored_decisions(self):
        """Create a set of scored decisions for testing."""
        decisions = []

        # Decision 1: Actual within CI
        d1 = Decision(
            question="Decision 1",
            kpis=[KPI(name="revenue", description="Revenue")],
            options=[
                Option(
                    name="Option A",
                    description="Chosen",
                    forecasts={
                        "revenue": Forecast(
                            point_estimate=100,
                            confidence_interval=(80, 120),
                            confidence_level=0.8,
                        ),
                    },
                ),
            ],
        )
        d1.chosen_option = "Option A"
        d1.actual_outcomes = {"revenue": 110}  # Within CI
        d1.scored_at = datetime.now()
        decisions.append(d1)

        # Decision 2: Actual outside CI
        d2 = Decision(
            question="Decision 2",
            kpis=[KPI(name="growth", description="Growth")],
            options=[
                Option(
                    name="Option B",
                    description="Chosen",
                    forecasts={
                        "growth": Forecast(
                            point_estimate=50,
                            confidence_interval=(40, 60),
                            confidence_level=0.8,
                        ),
                    },
                ),
            ],
        )
        d2.chosen_option = "Option B"
        d2.actual_outcomes = {"growth": 75}  # Outside CI
        d2.scored_at = datetime.now()
        decisions.append(d2)

        return decisions

    def test_coverage(self, scored_decisions):
        tracker = CalibrationTracker(scored_decisions)
        # 1 out of 2 in interval
        assert tracker.coverage == 0.5

    def test_expected_coverage(self, scored_decisions):
        tracker = CalibrationTracker(scored_decisions)
        # Both had 80% confidence
        assert tracker.expected_coverage == 0.8

    def test_calibration_error(self, scored_decisions):
        tracker = CalibrationTracker(scored_decisions)
        # 50% actual - 80% expected = -30% (overconfident)
        assert abs(tracker.calibration_error - (-0.3)) < 0.001

    def test_mean_absolute_error(self, scored_decisions):
        tracker = CalibrationTracker(scored_decisions)
        # |100-110| = 10, |50-75| = 25, mean = 17.5
        assert tracker.mean_absolute_error == 17.5

    def test_empty_tracker(self):
        tracker = CalibrationTracker([])
        assert tracker.coverage is None
        assert tracker.calibration_error is None
        assert tracker.mean_absolute_error is None

    def test_unscored_decisions_ignored(self):
        unscored = Decision(question="Unscored")
        unscored.chosen_option = "A"
        # No scored_at

        tracker = CalibrationTracker([unscored])
        assert len(tracker.scores) == 0

    def test_summary(self, scored_decisions):
        tracker = CalibrationTracker(scored_decisions)
        summary = tracker.summary()

        assert summary["n_decisions"] == 2
        assert summary["n_forecasts"] == 2
        assert summary["coverage"] == 0.5
        assert summary["expected_coverage"] == 0.8
        assert "overconfident" in summary["interpretation"].lower()

    def test_interpretation_well_calibrated(self):
        # Create a decision where actual is in CI
        d = Decision(
            question="Test",
            kpis=[KPI(name="x", description="X")],
            options=[
                Option(
                    name="A",
                    description="A",
                    forecasts={
                        "x": Forecast(
                            point_estimate=100,
                            confidence_interval=(90, 110),
                            confidence_level=0.8,
                        ),
                    },
                ),
            ],
        )
        d.chosen_option = "A"
        d.actual_outcomes = {"x": 105}
        d.scored_at = datetime.now()

        tracker = CalibrationTracker([d])
        # 100% coverage vs 80% expected
        assert "underconfident" in tracker._interpret().lower()
