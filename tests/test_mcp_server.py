"""Tests for the farness MCP server helpers."""

from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace

from farness.framework import Decision
from farness.mcp_server import _parse_datetime, save_decision_analysis, score_decision_outcomes
from farness.storage import DecisionStore


def _forecast(**overrides):
    base = {
        "kpi_name": "security_incidents",
        "point_estimate": 1.0,
        "ci_low": 0.0,
        "ci_high": 2.0,
        "confidence_level": 0.8,
        "reasoning": "Outside view plus team context.",
        "assumptions": ["team remains stable"],
        "components": {"baseline": 2.0},
        "base_rate": 2.0,
        "base_rate_source": "internal history",
        "inside_view_adjustment": "recent hardening work",
    }
    base.update(overrides)
    return SimpleNamespace(**base)


def _option(**overrides):
    base = {
        "name": "rewrite",
        "description": "Rewrite the auth layer now.",
        "forecasts": [_forecast()],
    }
    base.update(overrides)
    return SimpleNamespace(**base)


def _kpi(**overrides):
    base = {
        "name": "security_incidents",
        "description": "Critical auth incidents over the next 90 days.",
        "unit": "count",
        "target": 0.0,
        "weight": 1.0,
    }
    base.update(overrides)
    return SimpleNamespace(**base)


def test_parse_datetime_accepts_date_only():
    parsed = _parse_datetime("2026-03-24")
    assert parsed is not None
    assert parsed.isoformat() == "2026-03-24T00:00:00"


def test_save_decision_analysis_persists_structured_analysis():
    with TemporaryDirectory() as tmpdir:
        store_path = Path(tmpdir) / "decisions.jsonl"
        store = DecisionStore(store_path)
        decision = Decision(question="Should we rewrite the auth layer?")
        store.save(decision)

        payload = save_decision_analysis(
            decision_id=decision.id,
            kpis=[_kpi()],
            options=[
                _option(),
                _option(
                    name="stabilize",
                    description="Stabilize the current implementation first.",
                    forecasts=[_forecast(point_estimate=2.5, ci_low=1.0, ci_high=4.0)],
                ),
            ],
            chosen_option="rewrite",
            review_date="2026-06-15",
            reflections="CTO preference is a risk factor, not a KPI.",
            context="3 incidents this quarter; team strongest in Node.",
            store_path=str(store_path),
        )

        saved = store.get(decision.id)
        assert saved is not None
        assert saved.context == "3 incidents this quarter; team strongest in Node."
        assert saved.chosen_option == "rewrite"
        assert saved.review_date is not None
        assert saved.review_date.isoformat() == "2026-06-15T00:00:00"
        assert len(saved.kpis) == 1
        assert len(saved.options) == 2
        assert saved.options[0].forecasts["security_incidents"].base_rate == 2.0
        assert payload["chosen_option"] == "rewrite"


def test_score_decision_outcomes_updates_calibration():
    with TemporaryDirectory() as tmpdir:
        store_path = Path(tmpdir) / "decisions.jsonl"
        store = DecisionStore(store_path)
        decision = Decision(question="Should we rewrite the auth layer?")
        store.save(decision)

        save_decision_analysis(
            decision_id=decision.id,
            kpis=[_kpi()],
            options=[_option()],
            chosen_option="rewrite",
            review_date="2026-06-15",
            store_path=str(store_path),
        )

        result = score_decision_outcomes(
            decision_id=decision.id,
            actual_outcomes={"security_incidents": 1.0},
            reflections="One incident came from an unrelated dependency.",
            store_path=str(store_path),
        )

        scored = store.get(decision.id)
        assert scored is not None
        assert scored.actual_outcomes == {"security_incidents": 1.0}
        assert scored.scored_at is not None
        assert result["calibration"]["n_decisions"] == 1
        assert result["calibration"]["n_forecasts"] == 1


def test_save_decision_analysis_rejects_unknown_choice():
    with TemporaryDirectory() as tmpdir:
        store_path = Path(tmpdir) / "decisions.jsonl"
        store = DecisionStore(store_path)
        decision = Decision(question="Should we rewrite the auth layer?")
        store.save(decision)

        try:
            save_decision_analysis(
                decision_id=decision.id,
                kpis=[_kpi()],
                options=[_option(name="rewrite")],
                chosen_option="defer",
                store_path=str(store_path),
            )
        except ValueError as exc:
            assert "Chosen option" in str(exc)
        else:  # pragma: no cover
            raise AssertionError("Expected ValueError for unknown chosen option")
