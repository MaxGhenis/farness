"""Calibration tracking and analysis."""

from dataclasses import dataclass
from typing import Optional

from farness.framework import Decision, Forecast


@dataclass
class ForecastScore:
    """Score for a single forecast."""

    decision_id: str
    kpi_name: str
    option_name: str
    predicted: float
    actual: float
    ci_low: float
    ci_high: float
    confidence_level: float

    @property
    def error(self) -> float:
        """Absolute error."""
        return abs(self.predicted - self.actual)

    @property
    def relative_error(self) -> Optional[float]:
        """Relative error (if actual != 0)."""
        if self.actual == 0:
            return None
        return self.error / abs(self.actual)

    @property
    def in_interval(self) -> bool:
        """Was the actual value in the confidence interval?"""
        return self.ci_low <= self.actual <= self.ci_high


class CalibrationTracker:
    """Track and analyze forecast calibration."""

    def __init__(self, decisions: list[Decision]):
        self.decisions = [d for d in decisions if d.scored_at is not None]
        self.scores = self._compute_scores()

    def _compute_scores(self) -> list[ForecastScore]:
        """Extract all scorable forecasts from decisions."""
        scores = []

        for decision in self.decisions:
            if not decision.chosen_option or not decision.actual_outcomes:
                continue

            # Find the chosen option
            chosen = None
            for opt in decision.options:
                if opt.name == decision.chosen_option:
                    chosen = opt
                    break

            if not chosen:
                continue

            # Score each KPI forecast
            for kpi in decision.kpis:
                if kpi.name not in decision.actual_outcomes:
                    continue
                if kpi.name not in chosen.forecasts:
                    continue

                forecast = chosen.forecasts[kpi.name]
                actual = decision.actual_outcomes[kpi.name]

                scores.append(ForecastScore(
                    decision_id=decision.id,
                    kpi_name=kpi.name,
                    option_name=chosen.name,
                    predicted=forecast.point_estimate,
                    actual=actual,
                    ci_low=forecast.confidence_interval[0],
                    ci_high=forecast.confidence_interval[1],
                    confidence_level=forecast.confidence_level,
                ))

        return scores

    @property
    def coverage(self) -> Optional[float]:
        """What fraction of actuals fell within confidence intervals?"""
        if not self.scores:
            return None
        return sum(1 for s in self.scores if s.in_interval) / len(self.scores)

    @property
    def expected_coverage(self) -> Optional[float]:
        """What coverage should we expect given stated confidence levels?"""
        if not self.scores:
            return None
        return sum(s.confidence_level for s in self.scores) / len(self.scores)

    @property
    def calibration_error(self) -> Optional[float]:
        """Difference between actual and expected coverage (negative = overconfident)."""
        if self.coverage is None or self.expected_coverage is None:
            return None
        return self.coverage - self.expected_coverage

    @property
    def mean_absolute_error(self) -> Optional[float]:
        """Mean absolute error across all forecasts."""
        if not self.scores:
            return None
        return sum(s.error for s in self.scores) / len(self.scores)

    @property
    def mean_relative_error(self) -> Optional[float]:
        """Mean relative error (excluding cases where actual = 0)."""
        valid = [s for s in self.scores if s.relative_error is not None]
        if not valid:
            return None
        return sum(s.relative_error for s in valid) / len(valid)

    def brier_score(self, threshold: Optional[float] = None) -> Optional[float]:
        """
        Brier score for probability forecasts.

        If threshold is provided, converts point estimates to binary outcomes
        (did the actual exceed the threshold?).
        """
        if not self.scores or threshold is None:
            return None

        # Convert to probability-like scores
        # This is a simplified version - ideally we'd have explicit probabilities
        brier_sum = 0.0
        count = 0

        for score in self.scores:
            # Estimate "probability" from how close prediction was to threshold
            # relative to CI width
            ci_width = score.ci_high - score.ci_low
            if ci_width == 0:
                continue

            # Simplified: use point estimate as probability if it's between 0-1
            if 0 <= score.predicted <= 1:
                predicted_prob = score.predicted
                actual_outcome = 1.0 if score.actual >= threshold else 0.0
                brier_sum += (predicted_prob - actual_outcome) ** 2
                count += 1

        return brier_sum / count if count > 0 else None

    def summary(self) -> dict:
        """Return a summary of calibration metrics."""
        return {
            "n_decisions": len(self.decisions),
            "n_forecasts": len(self.scores),
            "coverage": self.coverage,
            "expected_coverage": self.expected_coverage,
            "calibration_error": self.calibration_error,
            "mean_absolute_error": self.mean_absolute_error,
            "mean_relative_error": self.mean_relative_error,
            "interpretation": self._interpret(),
        }

    def _interpret(self) -> str:
        """Human-readable interpretation of calibration."""
        if not self.scores:
            return "No scored forecasts yet."

        cal_err = self.calibration_error
        if cal_err is None:
            return "Insufficient data for calibration analysis."

        if abs(cal_err) < 0.05:
            return "Well-calibrated: actual coverage matches stated confidence."
        elif cal_err < -0.1:
            return f"Overconfident: only {self.coverage:.0%} of actuals in CIs (expected {self.expected_coverage:.0%})."
        elif cal_err < 0:
            return f"Slightly overconfident: {self.coverage:.0%} coverage vs {self.expected_coverage:.0%} expected."
        elif cal_err > 0.1:
            return f"Underconfident: {self.coverage:.0%} of actuals in CIs (expected {self.expected_coverage:.0%})."
        else:
            return f"Slightly underconfident: {self.coverage:.0%} coverage vs {self.expected_coverage:.0%} expected."
