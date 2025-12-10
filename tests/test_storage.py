"""Tests for decision storage."""

import pytest
import tempfile
from pathlib import Path
from datetime import datetime, timedelta

from farness.framework import Decision, KPI, Option, Forecast
from farness.storage import DecisionStore


@pytest.fixture
def temp_store():
    """Create a temporary decision store."""
    with tempfile.TemporaryDirectory() as tmpdir:
        path = Path(tmpdir) / "decisions.jsonl"
        yield DecisionStore(path)


@pytest.fixture
def sample_decision():
    """Create a sample decision for testing."""
    return Decision(
        question="Test decision",
        kpis=[KPI(name="value", description="Value metric")],
        options=[
            Option(
                name="Option A",
                description="First option",
                forecasts={
                    "value": Forecast(point_estimate=100, confidence_interval=(80, 120)),
                },
            ),
        ],
    )


class TestDecisionStore:
    def test_save_and_get(self, temp_store, sample_decision):
        temp_store.save(sample_decision)
        retrieved = temp_store.get(sample_decision.id)

        assert retrieved is not None
        assert retrieved.id == sample_decision.id
        assert retrieved.question == sample_decision.question

    def test_list_all(self, temp_store, sample_decision):
        temp_store.save(sample_decision)

        decision2 = Decision(question="Second decision")
        temp_store.save(decision2)

        all_decisions = temp_store.list_all()
        assert len(all_decisions) == 2

    def test_list_unscored(self, temp_store):
        # Unscored with chosen option
        d1 = Decision(question="Decision 1")
        d1.chosen_option = "Option A"
        temp_store.save(d1)

        # Scored
        d2 = Decision(question="Decision 2")
        d2.chosen_option = "Option B"
        d2.scored_at = datetime.now()
        temp_store.save(d2)

        # No chosen option (still open)
        d3 = Decision(question="Decision 3")
        temp_store.save(d3)

        unscored = temp_store.list_unscored()
        assert len(unscored) == 1
        assert unscored[0].id == d1.id

    def test_list_pending_review(self, temp_store):
        # Past review date, unscored
        d1 = Decision(question="Decision 1")
        d1.chosen_option = "Option A"
        d1.review_date = datetime.now() - timedelta(days=1)
        temp_store.save(d1)

        # Future review date
        d2 = Decision(question="Decision 2")
        d2.chosen_option = "Option B"
        d2.review_date = datetime.now() + timedelta(days=30)
        temp_store.save(d2)

        # Past review date but already scored
        d3 = Decision(question="Decision 3")
        d3.chosen_option = "Option C"
        d3.review_date = datetime.now() - timedelta(days=7)
        d3.scored_at = datetime.now()
        temp_store.save(d3)

        pending = temp_store.list_pending_review()
        assert len(pending) == 1
        assert pending[0].id == d1.id

    def test_update(self, temp_store, sample_decision):
        temp_store.save(sample_decision)

        # Update it
        sample_decision.chosen_option = "Option A"
        sample_decision.reflections = "Updated reflections"
        temp_store.update(sample_decision)

        # Retrieve and check
        retrieved = temp_store.get(sample_decision.id)
        assert retrieved.chosen_option == "Option A"
        assert retrieved.reflections == "Updated reflections"

    def test_get_nonexistent(self, temp_store):
        result = temp_store.get("nonexistent-id")
        assert result is None

    def test_empty_store(self, temp_store):
        assert temp_store.list_all() == []
        assert temp_store.list_unscored() == []
        assert temp_store.list_pending_review() == []
