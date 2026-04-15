import json
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

from farness.cli import main
from farness.framework import Decision, Forecast, KPI, Option
from farness.market import (
    MarketSource,
    draft_binary_policy_market,
    draft_markets_for_decision,
)
from farness.storage import DecisionStore


def test_binary_policy_market_draft_has_manifold_payload():
    draft = draft_binary_policy_market(
        "Will Waymo be legally permitted to offer fully driverless paid robotaxi rides in DC by Dec. 31, 2026?",
        context="Waymo has announced DC plans, but DC law and permits are gating items.",
        initial_probability=52,
        resolution_date=datetime(2026, 12, 31),
        resolution_rule="Resolve YES if DC law, regulation, or an official permit allows the service.",
        sources=[
            MarketSource(
                title="Waymo DC announcement",
                url="https://waymo.com/blog/2025/03/next-stop-for-waymo-one-washingtondc/",
            )
        ],
        tags=["waymo", "dc"],
    )

    payload = draft.to_manifold_payload()
    assert payload["outcomeType"] == "BINARY"
    assert payload["initialProb"] == 52
    assert payload["visibility"] == "unlisted"
    assert "descriptionMarkdown" in payload
    assert "Waymo DC announcement" in payload["descriptionMarkdown"]


def test_draft_markets_for_decision_creates_option_kpi_markets():
    decision = Decision(
        question="Should DC permit Waymo?",
        kpis=[
            KPI(
                name="permission_by_2026",
                description="Whether Waymo is legally permitted by the end of 2026.",
                unit="%",
                outcome_type="percent",
                resolution_date=datetime(2026, 12, 31),
                resolution_rule="Resolve YES if official DC permission exists by 2026-12-31.",
            )
        ],
        options=[
            Option(
                name="Pass AV framework",
                description="Pass a driverless AV permitting framework.",
                forecasts={
                    "permission_by_2026": Forecast(
                        point_estimate=65,
                        confidence_interval=(45, 80),
                        reasoning="Legislation would remove the main legal blocker.",
                    )
                },
            )
        ],
    )

    drafts = draft_markets_for_decision(decision, tags=["dc-policy"])

    assert len(drafts) == 1
    draft = drafts[0]
    assert "Pass AV framework" in draft.question
    assert draft.initial_probability == 65
    assert "Resolve N/A if `Pass AV framework`" in draft.resolution_rule
    assert draft.to_manifold_payload()["initialProb"] == 65


def test_market_draft_cli_for_standalone_question_outputs_json(capsys):
    with patch(
        "sys.argv",
        [
            "farness",
            "market-draft",
            "Will Waymo be legally permitted to offer driverless paid robotaxi rides in DC by 2026-12-31?",
            "--initial-prob",
            "52",
            "--resolution-date",
            "2026-12-31",
        ],
    ):
        main()

    pack = json.loads(capsys.readouterr().out)
    assert pack["warning"].startswith("Draft only")
    assert pack["markets"][0]["manifold_payload"]["initialProb"] == 52


def test_market_draft_cli_for_decision_writes_file(tmp_path, capsys):
    store_path = tmp_path / "decisions.jsonl"
    store = DecisionStore(store_path)
    decision = Decision(
        question="Should we launch a pilot?",
        kpis=[
            KPI(
                name="pilot_success",
                description="Whether the pilot succeeds.",
                outcome_type="binary",
                resolution_date=datetime(2026, 9, 30),
                resolution_rule="Resolve YES if the pilot reaches the success threshold.",
            )
        ],
        options=[
            Option(
                name="Launch now",
                description="Launch immediately.",
                forecasts={
                    "pilot_success": Forecast(
                        point_estimate=55,
                        confidence_interval=(40, 70),
                    )
                },
            )
        ],
    )
    store.save(decision)
    output_path = tmp_path / "drafts.json"

    with patch("farness.cli.DecisionStore", return_value=store):
        with patch(
            "sys.argv",
            [
                "farness",
                "market-draft",
                decision.id[:8],
                "--output",
                str(output_path),
            ],
        ):
            main()

    assert str(output_path) in capsys.readouterr().out
    pack = json.loads(Path(output_path).read_text())
    assert pack["source"] == f"decision:{decision.id}"
    assert pack["markets"][0]["initial_probability"] == 55
