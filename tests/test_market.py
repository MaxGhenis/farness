import json
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

from brier.cli import main
from brier.framework import Decision, Forecast, KPI, Option
from brier.market import (
    MarketSource,
    draft_binary_policy_market,
    draft_markets_for_decision,
)
from brier.storage import DecisionStore


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
            "brier",
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


def test_forecast_draft_cli_alias_outputs_json(capsys):
    with patch(
        "sys.argv",
        [
            "brier",
            "forecast-draft",
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

    with patch("brier.cli.DecisionStore", return_value=store):
        with patch(
            "sys.argv",
            [
                "brier",
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


def test_waymo_example_uses_aggregate_safety_outcomes():
    example_path = Path(__file__).resolve().parents[1] / "examples" / "waymo_dc_market_pack.json"
    pack = json.loads(example_path.read_text())
    questions = [market["question"] for market in pack["markets"]]

    assert not any("Waymo vehicle be involved" in question for question in questions)
    assert all(len(question) <= 120 for question in questions)
    assert pack["external_gate_market"]["url"].endswith("/waymo-serves-the-general-public-in")
    assert pack["external_gate_market"]["embed_id"] == "2805EAudc2"
    assert pack["external_gate_market"]["embed_label"] == "/Bayesian/waymo-serves-the-general-public-in"

    safety_markets = [
        market
        for market in pack["markets"]
        if "traffic fatalities" in market["question"]
        or "serious traffic-crash injuries" in market["question"]
    ]

    assert len(safety_markets) == 4
    assert len(pack["markets"]) == 4
    assert all(market["outcome_type"] == "PSEUDO_NUMERIC" for market in safety_markets)
    assert all("Resolve N/A" in market["resolution_rule"] for market in safety_markets)
    assert all(
        "Waymo serves the general public in Washington, D.C. before 2027?"
        in market["description_markdown"]
        for market in safety_markets
    )
    assert all("## Trigger market" in market["description_markdown"] for market in safety_markets)
    assert all(
        "\n\n@/Bayesian/waymo-serves-the-general-public-in\n\n"
        in market["description_markdown"]
        for market in safety_markets
    )
    assert all("Drafted by brier" not in market["description_markdown"] for market in safety_markets)
