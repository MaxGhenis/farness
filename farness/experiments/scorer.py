"""Rubric-based scoring for experiment responses."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

from farness.experiments.cases import TestCase


@dataclass
class ResponseScore:
    """Scores for a single response."""

    case_id: str
    condition: str  # "naive" or "farness"
    run_number: int

    # Primary metrics
    correct_recommendation: Optional[bool]  # Requires judgment
    cites_base_rate: bool
    bias_count: int
    biases_found: list[str]

    # Secondary metrics
    has_confidence_interval: bool
    has_accountability: bool
    quantifies_tradeoffs: bool

    # Raw data
    response_text: str

    def to_dict(self) -> dict:
        """Convert to dictionary for storage."""
        return {
            "case_id": self.case_id,
            "condition": self.condition,
            "run_number": self.run_number,
            "correct_recommendation": self.correct_recommendation,
            "cites_base_rate": self.cites_base_rate,
            "bias_count": self.bias_count,
            "biases_found": self.biases_found,
            "has_confidence_interval": self.has_confidence_interval,
            "has_accountability": self.has_accountability,
            "quantifies_tradeoffs": self.quantifies_tradeoffs,
            "response_text": self.response_text,
        }


class ResponseScorer:
    """Score responses against the rubric."""

    # Patterns for detecting confidence intervals
    CI_PATTERNS = [
        r"\d+\s*[-–—]\s*\d+",  # 80-90, 80–90
        r"\d+%?\s*to\s*\d+%?",  # 80% to 90%
        r"±\s*\d+",  # ±10
        r"\(\s*\d+\s*,\s*\d+\s*\)",  # (80, 90)
        r"\[\s*\d+\s*,\s*\d+\s*\]",  # [80, 90]
        r"confidence interval",
        r"\d+%\s+CI",  # 80% CI
        r"between\s+\d+\s+and\s+\d+",  # between 80 and 90
    ]

    # Patterns for accountability mechanisms
    ACCOUNTABILITY_PATTERNS = [
        r"review\s+(date|in|after|at)",
        r"follow[- ]?up",
        r"following\s+up",
        r"check\s+(back|in|again)",
        r"measure\s+(after|in|at|results)",
        r"track\s+(the|this|whether)",
        r"score\s+(against|this|the)",
        r"revisit\s+(in|after|this)",
        r"\d+\s+(months?|weeks?|days?)\s+(from|after|later|to)",
        r"accountability",
        r"calibrat",
    ]

    # Patterns for quantified tradeoffs
    TRADEOFF_PATTERNS = [
        r"expected\s+value",
        r"\d+%?\s+(vs\.?|versus|compared to)\s+\d+%?",
        r"option\s+[AB12]\s*[=:]\s*\d+",
        r"probability\s+of\s+\d+%",
        r"weighted\s+(average|sum|score)",
        r"score[sd]?\s+(of\s+)?\d+",
        r"NPV|ROI|IRR",
        r"\$[\d,]+\s+(vs\.?|versus|compared to)\s+\$[\d,]+",
    ]

    def __init__(self, case: TestCase):
        self.case = case
        self._compile_patterns()

    def _compile_patterns(self):
        """Compile regex patterns for efficiency."""
        self.ci_regex = re.compile(
            "|".join(self.CI_PATTERNS), re.IGNORECASE
        )
        self.accountability_regex = re.compile(
            "|".join(self.ACCOUNTABILITY_PATTERNS), re.IGNORECASE
        )
        self.tradeoff_regex = re.compile(
            "|".join(self.TRADEOFF_PATTERNS), re.IGNORECASE
        )

    def score(
        self,
        response_text: str,
        condition: str,
        run_number: int,
        correct_recommendation: Optional[bool] = None,
    ) -> ResponseScore:
        """Score a response against the rubric.

        Args:
            response_text: The LLM's response
            condition: "naive" or "farness"
            run_number: Which run this is (1, 2, 3)
            correct_recommendation: Manual judgment of correctness (optional)

        Returns:
            ResponseScore with all metrics
        """
        text_lower = response_text.lower()

        # Check for base rate citations
        cites_base_rate = self._check_base_rates(text_lower)

        # Find mentioned biases
        biases_found = self._find_biases(text_lower)

        # Check for confidence intervals
        has_ci = bool(self.ci_regex.search(response_text))

        # Check for accountability mechanisms
        has_accountability = bool(self.accountability_regex.search(response_text))

        # Check for quantified tradeoffs
        quantifies_tradeoffs = bool(self.tradeoff_regex.search(response_text))

        return ResponseScore(
            case_id=self.case.id,
            condition=condition,
            run_number=run_number,
            correct_recommendation=correct_recommendation,
            cites_base_rate=cites_base_rate,
            bias_count=len(biases_found),
            biases_found=biases_found,
            has_confidence_interval=has_ci,
            has_accountability=has_accountability,
            quantifies_tradeoffs=quantifies_tradeoffs,
            response_text=response_text,
        )

    def _check_base_rates(self, text_lower: str) -> bool:
        """Check if response cites any relevant base rates."""
        for base_rate in self.case.relevant_base_rates:
            # Extract key terms from base rate
            # Look for numbers and key phrases
            numbers = re.findall(r"\d+(?:\.\d+)?", base_rate)
            for num in numbers:
                if num in text_lower:
                    return True

            # Check for key phrases (first few words)
            key_terms = base_rate.lower().split()[:3]
            if all(term in text_lower for term in key_terms if len(term) > 3):
                return True

        # Also check for general base rate language
        base_rate_indicators = [
            "base rate",
            "research shows",
            "studies show",
            "meta-analysis",
            "on average",
            "typically",
            "% of",
            "percent of",
            "reference class",
            "outside view",
        ]
        return any(indicator in text_lower for indicator in base_rate_indicators)

    def _find_biases(self, text_lower: str) -> list[str]:
        """Find which biases from the ground truth list are mentioned."""
        found = []
        for bias in self.case.key_biases:
            # Normalize bias name
            bias_normalized = bias.lower().replace("-", " ").replace("_", " ")
            # Check various forms
            if bias_normalized in text_lower:
                found.append(bias)
            # Also check for partial matches (e.g., "sunk cost" in "sunk cost fallacy")
            elif any(
                part in text_lower
                for part in bias_normalized.split()
                if len(part) > 4
            ):
                found.append(bias)
        return found


def aggregate_scores(scores: list[ResponseScore]) -> dict:
    """Aggregate scores across runs for summary statistics."""
    if not scores:
        return {}

    naive_scores = [s for s in scores if s.condition == "naive"]
    farness_scores = [s for s in scores if s.condition == "farness"]

    def calc_stats(score_list: list[ResponseScore]) -> dict:
        n = len(score_list)
        if n == 0:
            return {}

        # Count non-None correct recommendations
        correct_known = [s for s in score_list if s.correct_recommendation is not None]

        return {
            "n": n,
            "correct_rate": (
                sum(s.correct_recommendation for s in correct_known) / len(correct_known)
                if correct_known
                else None
            ),
            "base_rate_citation_rate": sum(s.cites_base_rate for s in score_list) / n,
            "mean_bias_count": sum(s.bias_count for s in score_list) / n,
            "ci_rate": sum(s.has_confidence_interval for s in score_list) / n,
            "accountability_rate": sum(s.has_accountability for s in score_list) / n,
            "tradeoff_rate": sum(s.quantifies_tradeoffs for s in score_list) / n,
        }

    return {
        "naive": calc_stats(naive_scores),
        "farness": calc_stats(farness_scores),
        "by_case": _aggregate_by_case(scores),
    }


def _aggregate_by_case(scores: list[ResponseScore]) -> dict:
    """Aggregate scores by case."""
    cases = {}
    for score in scores:
        if score.case_id not in cases:
            cases[score.case_id] = {"naive": [], "farness": []}
        cases[score.case_id][score.condition].append(score)

    result = {}
    for case_id, condition_scores in cases.items():
        result[case_id] = {
            "naive": _summarize_condition(condition_scores["naive"]),
            "farness": _summarize_condition(condition_scores["farness"]),
        }
    return result


def _summarize_condition(scores: list[ResponseScore]) -> dict:
    """Summarize scores for one condition."""
    if not scores:
        return {}
    n = len(scores)
    return {
        "n": n,
        "base_rate_rate": sum(s.cites_base_rate for s in scores) / n,
        "mean_biases": sum(s.bias_count for s in scores) / n,
        "ci_rate": sum(s.has_confidence_interval for s in scores) / n,
    }
