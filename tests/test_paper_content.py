"""Tests for paper content — TDD red-green cycle for paper revisions."""

import re
from functools import lru_cache
from pathlib import Path

PAPER = Path(__file__).parent.parent / "paper" / "index.qmd"
QUARTO_YML = Path(__file__).parent.parent / "paper" / "_quarto.yml"


@lru_cache(maxsize=1)
def _read_paper() -> str:
    return PAPER.read_text()


@lru_cache(maxsize=1)
def _read_quarto_yml() -> str:
    return QUARTO_YML.read_text()


# --- Task #7: Convergence reframe ---


def test_convergence_reframe_present():
    """Paper should reframe convergence as 'starts closer' or 'both conditions converge'."""
    text = _read_paper()
    assert re.search(
        r"both conditions converge|starts closer", text, re.IGNORECASE
    ), "Missing convergence reframe language"


# --- Task #8: Introduce farness properly ---


def test_introduce_farness_language():
    """Paper should say 'I introduce farness' not 'I evaluate a specific framework called'."""
    text = _read_paper()
    assert "I introduce farness" in text, "Missing 'I introduce farness'"
    assert (
        "I evaluate a specific framework called" not in text
    ), "Old framework intro language still present"


def test_farness_ai_footnote():
    """Paper should have a footnote referencing farness.ai."""
    text = _read_paper()
    assert "farness.ai" in text, "Missing farness.ai footnote"


# --- Task #9: Concrete example ---


def test_concrete_example_section():
    """Paper should contain a worked example using sunk_cost_project data."""
    text = _read_paper()
    assert re.search(
        r"sunk_cost_project|Worked example", text, re.IGNORECASE
    ), "Missing concrete worked example section"


# --- Task #10: Sycophancy data ---


def test_sycophancy_gpt_numbers():
    """Paper should report GPT sycophancy numbers: 466.7 naive, 108.3 farness."""
    text = _read_paper()
    assert "466.7" in text, "Missing GPT naive sycophancy mean (466.7)"
    assert "108.3" in text, "Missing GPT farness sycophancy mean (108.3)"


# --- Task #11: Technical fixes ---


def test_no_pre_registered():
    """Paper should not say 'pre-registered' — should say 'analysis code was committed'."""
    text = _read_paper()
    assert (
        "pre-registered" not in text and "pre-register" not in text
    ), "Paper still contains 'pre-registered' language"


def test_cot_caveat():
    """Paper should mention implicit chain-of-thought / implicit reasoning caveat."""
    text = _read_paper()
    assert re.search(
        r"implicit chain-of-thought|implicit reasoning", text, re.IGNORECASE
    ), "Missing CoT caveat about implicit reasoning"


# --- Referee review fixes ---


def test_conflict_of_interest_disclosed():
    """Paper should disclose author's conflict of interest."""
    text = _read_paper()
    assert re.search(
        r"[Dd]isclosure|conflict of interest", text
    ), "Missing conflict of interest disclosure"


def test_no_defensible_language():
    """Paper should not use evaluative 'defensible' for framework estimates."""
    text = _read_paper()
    assert (
        "more defensible" not in text
    ), "Evaluative 'more defensible' language still present"


def test_prompt_probe_confound_in_discussion():
    """Discussion should address prompt-probe alignment confound."""
    text = _read_paper()
    assert re.search(
        r"prompt-probe alignment", text
    ), "Missing prompt-probe alignment discussion in body"


def test_preregistration_deviation_disclosed():
    """Paper should disclose preregistration-execution mismatch."""
    text = _read_paper()
    assert re.search(
        r"original analysis plan|substantive redesign|original.*plan.*specified", text, re.IGNORECASE
    ), "Missing preregistration deviation disclosure"


# --- Task #13: CSL config ---


def test_csl_config():
    """Quarto config should specify CSL citation style."""
    text = _read_quarto_yml()
    assert "csl:" in text, "Missing CSL config in _quarto.yml"
