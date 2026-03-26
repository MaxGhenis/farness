"""MCP server for farness."""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Literal

from farness import CalibrationTracker, DecisionStore
from farness.framework import Decision, Forecast, KPI, Option


def _resolve_store_path(store_path: str | None = None) -> Path | None:
    """Resolve the configured store path, falling back to environment."""
    candidate = store_path or os.environ.get("FARNESS_STORE_PATH")
    return Path(candidate).expanduser() if candidate else None


def _get_store(store_path: str | None = None) -> DecisionStore:
    """Return the configured decision store."""
    resolved = _resolve_store_path(store_path)
    return DecisionStore(resolved) if resolved else DecisionStore()


def _parse_datetime(value: str | None) -> datetime | None:
    """Parse either an ISO date or datetime string."""
    if not value:
        return None
    try:
        if len(value) == 10:
            return datetime.fromisoformat(f"{value}T00:00:00")
        return datetime.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(
            f"Invalid datetime '{value}'. Use ISO 8601 like 2026-03-24 or 2026-03-24T15:30:00."
        ) from exc


def _decision_summary(decision: Decision) -> dict[str, Any]:
    """Compact decision summary for lists."""
    pending_review = False
    if decision.review_date and decision.scored_at is None:
        pending_review = decision.review_date <= datetime.now()
    return {
        "id": decision.id,
        "question": decision.question,
        "context": decision.context,
        "created_at": decision.created_at.isoformat(),
        "chosen_option": decision.chosen_option,
        "review_date": decision.review_date.isoformat() if decision.review_date else None,
        "scored_at": decision.scored_at.isoformat() if decision.scored_at else None,
        "pending_review": pending_review,
        "kpi_count": len(decision.kpis),
        "resolvable_kpi_count": sum(1 for kpi in decision.kpis if kpi.is_explicitly_resolvable()),
        "option_count": len(decision.options),
    }


def _decision_payload(decision: Decision) -> dict[str, Any]:
    """Rich decision payload for tool and resource responses."""
    payload = decision.to_dict()
    payload["pending_review"] = bool(
        decision.review_date
        and decision.scored_at is None
        and decision.review_date <= datetime.now()
    )
    return payload


def _decision_markdown(decision: Decision) -> str:
    """Human-readable markdown view of a decision."""
    lines = [
        f"# {decision.question}",
        "",
        f"- ID: `{decision.id}`",
        f"- Created: `{decision.created_at.isoformat()}`",
    ]
    if decision.context:
        lines.extend(["", "## Context", "", decision.context])
    if decision.kpis:
        lines.extend(["", "## KPIs", ""])
        for kpi in decision.kpis:
            target = f", target {kpi.target}" if kpi.target is not None else ""
            unit = f" ({kpi.unit})" if kpi.unit else ""
            lines.append(
                f"- **{kpi.name}**{unit}: {kpi.description} [weight {kpi.weight}{target}]"
            )
            if kpi.outcome_type:
                lines.append(f"  - outcome type: {kpi.outcome_type}")
            if kpi.resolution_date:
                lines.append(f"  - resolution date: {kpi.resolution_date.isoformat()}")
            if kpi.resolution_rule:
                lines.append(f"  - resolution rule: {kpi.resolution_rule}")
            if kpi.data_source:
                lines.append(f"  - data source: {kpi.data_source}")
    if decision.options:
        lines.extend(["", "## Options", ""])
        for option in decision.options:
            lines.append(f"### {option.name}")
            lines.append(option.description or "")
            lines.append("")
            for kpi_name, forecast in option.forecasts.items():
                lo, hi = forecast.confidence_interval
                lines.append(
                    f"- {kpi_name}: {forecast.point_estimate} [{lo}, {hi}] @ {forecast.confidence_level:.0%}"
                )
                if forecast.reasoning:
                    lines.append(f"  - reasoning: {forecast.reasoning}")
                if forecast.base_rate is not None:
                    lines.append(f"  - base rate: {forecast.base_rate}")
            lines.append("")
    if decision.chosen_option:
        lines.extend(["## Chosen option", "", decision.chosen_option, ""])
    if decision.review_date:
        lines.extend(["## Review date", "", decision.review_date.isoformat(), ""])
    if decision.actual_outcomes:
        lines.extend(["## Actual outcomes", ""])
        for name, value in decision.actual_outcomes.items():
            lines.append(f"- {name}: {value}")
        lines.append("")
    if decision.reflections:
        lines.extend(["## Reflections", "", decision.reflections, ""])
    return "\n".join(lines).strip() + "\n"


def _calibration_payload(store: DecisionStore) -> dict[str, Any]:
    """Return calibration summary."""
    tracker = CalibrationTracker(store.list_all())
    return tracker.summary()


def _build_kpis(kpis: list[Any]) -> list[KPI]:
    """Convert structured KPI inputs into framework objects."""
    built: list[KPI] = []
    for kpi in kpis:
        if isinstance(kpi, str):
            try:
                kpi = json.loads(kpi)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid KPI JSON: {kpi}") from exc
        elif hasattr(kpi, "model_dump"):
            kpi = kpi.model_dump()
        elif hasattr(kpi, "__dict__") and not isinstance(kpi, dict):
            kpi = vars(kpi)

        if not isinstance(kpi, dict):
            raise ValueError(f"Unsupported KPI input: {type(kpi).__name__}")

        built.append(
            KPI(
                name=kpi["name"],
                description=kpi["description"],
                unit=kpi.get("unit"),
                target=kpi.get("target"),
                weight=kpi.get("weight", 1.0),
                outcome_type=kpi.get("outcome_type"),
                resolution_date=_parse_datetime(kpi.get("resolution_date")),
                resolution_rule=kpi.get("resolution_rule"),
                data_source=kpi.get("data_source"),
            )
        )
    return built


def _build_options(options: list[Any]) -> list[Option]:
    """Convert structured option inputs into framework objects."""
    built: list[Option] = []
    for option in options:
        if isinstance(option, str):
            try:
                option = json.loads(option)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid option JSON: {option}") from exc
        elif hasattr(option, "model_dump"):
            option = option.model_dump()
        elif hasattr(option, "__dict__") and not isinstance(option, dict):
            option = vars(option)

        if not isinstance(option, dict):
            raise ValueError(f"Unsupported option input: {type(option).__name__}")

        forecasts = {}
        for forecast in option.get("forecasts", []):
            if isinstance(forecast, str):
                try:
                    forecast = json.loads(forecast)
                except json.JSONDecodeError as exc:
                    raise ValueError(f"Invalid forecast JSON: {forecast}") from exc
            elif hasattr(forecast, "model_dump"):
                forecast = forecast.model_dump()
            elif hasattr(forecast, "__dict__") and not isinstance(forecast, dict):
                forecast = vars(forecast)

            if not isinstance(forecast, dict):
                raise ValueError(f"Unsupported forecast input: {type(forecast).__name__}")

            forecasts[forecast["kpi_name"]] = Forecast(
                point_estimate=forecast["point_estimate"],
                confidence_interval=(forecast["ci_low"], forecast["ci_high"]),
                confidence_level=forecast.get("confidence_level", 0.8),
                reasoning=forecast.get("reasoning", ""),
                assumptions=list(forecast.get("assumptions", [])),
                components=dict(forecast.get("components", {})),
                base_rate=forecast.get("base_rate"),
                base_rate_source=forecast.get("base_rate_source"),
                inside_view_adjustment=forecast.get("inside_view_adjustment"),
            )
        built.append(
            Option(
                name=option["name"],
                description=option.get("description", ""),
                forecasts=forecasts,
            )
        )
    return built


def save_decision_analysis(
    decision_id: str,
    kpis: list[Any],
    options: list[Any],
    chosen_option: str | None = None,
    review_date: str | None = None,
    reflections: str = "",
    context: str | None = None,
    store_path: str | None = None,
) -> dict[str, Any]:
    """Persist a structured farness analysis onto an existing decision."""
    store = _get_store(store_path)
    decision = store.get(decision_id)
    if not decision:
        raise ValueError(f"No decision found with ID or prefix '{decision_id}'.")

    decision.kpis = _build_kpis(kpis)
    decision.options = _build_options(options)

    if chosen_option is not None:
        option_names = {option.name for option in decision.options}
        if chosen_option and chosen_option not in option_names:
            raise ValueError(
                f"Chosen option '{chosen_option}' is not present in the supplied options."
            )
        decision.chosen_option = chosen_option or None
        decision.decided_at = datetime.now() if chosen_option else None

    parsed_review_date = _parse_datetime(review_date)
    if review_date is not None:
        decision.review_date = parsed_review_date
    if reflections:
        decision.reflections = reflections
    if context is not None:
        decision.context = context

    store.update(decision)
    return _decision_payload(decision)


def score_decision_outcomes(
    decision_id: str,
    actual_outcomes: dict[str, float],
    reflections: str = "",
    store_path: str | None = None,
) -> dict[str, Any]:
    """Persist scored outcomes for a decision."""
    store = _get_store(store_path)
    decision = store.get(decision_id)
    if not decision:
        raise ValueError(f"No decision found with ID or prefix '{decision_id}'.")
    if not decision.chosen_option:
        raise ValueError("Decision has no chosen_option. Save the analysis first.")

    decision.actual_outcomes = actual_outcomes
    decision.scored_at = datetime.now()
    if reflections:
        decision.reflections = reflections
    store.update(decision)

    return {
        "decision": _decision_payload(decision),
        "calibration": _calibration_payload(store),
    }


def build_server(store_path: str | None = None):
    """Create the configured FastMCP server instance."""
    try:
        from mcp.server.fastmcp import FastMCP
        from pydantic import BaseModel, Field
    except ImportError as exc:  # pragma: no cover - exercised by installation, not tests
        raise RuntimeError(
            "MCP support is not installed. Install the repo with MCP extras, "
            "for example `python -m pip install -e '/path/to/farness[mcp]'`."
        ) from exc

    resolved_store_path = _resolve_store_path(store_path)

    class KPIInput(BaseModel):
        name: str = Field(description="Short KPI name, e.g. security_incidents")
        description: str = Field(description="What the KPI measures")
        unit: str | None = Field(default=None, description="Optional unit like %, $, or days")
        target: float | None = Field(default=None, description="Optional success target")
        weight: float = Field(default=1.0, description="Relative importance weight")
        outcome_type: (
            Literal["binary", "count", "continuous", "percent", "currency", "score"] | None
        ) = Field(
            default=None,
            description="Numeric outcome shape used later for scoring and calibration",
        )
        resolution_date: str | None = Field(
            default=None,
            description="When this KPI should resolve, as ISO date or datetime",
        )
        resolution_rule: str | None = Field(
            default=None,
            description="Concrete rule for how the realized KPI value will be determined",
        )
        data_source: str | None = Field(
            default=None,
            description="System, report, or dataset that will supply the realized value",
        )

    class ForecastInput(BaseModel):
        kpi_name: str = Field(description="Name of the KPI this forecast belongs to")
        point_estimate: float = Field(description="Central forecast value")
        ci_low: float = Field(description="Low bound of the confidence interval")
        ci_high: float = Field(description="High bound of the confidence interval")
        confidence_level: float = Field(
            default=0.8, description="Confidence level, e.g. 0.8 for 80%"
        )
        reasoning: str = Field(default="", description="Short rationale for the forecast")
        assumptions: list[str] = Field(default_factory=list)
        components: dict[str, float] = Field(default_factory=dict)
        base_rate: float | None = Field(default=None)
        base_rate_source: str | None = Field(default=None)
        inside_view_adjustment: str | None = Field(default=None)

    class OptionInput(BaseModel):
        name: str = Field(description="Option name")
        description: str = Field(default="", description="What the option means")
        forecasts: list[ForecastInput] = Field(
            description="Forecasts for each KPI under this option"
        )

    server = FastMCP(
        "farness",
        instructions=(
            "Use farness to structure decisions as KPIs, options, forecasts, "
            "reference classes, disconfirming evidence, review dates, and resolvable KPI metadata. "
            "In the first answer, show the forecast summary and explain how it drives the recommendation."
        ),
    )

    def _store() -> DecisionStore:
        return _get_store(str(resolved_store_path) if resolved_store_path else None)

    @server.tool(
        title="Create decision",
        description="Create an empty decision record to analyze with the farness workflow.",
        structured_output=True,
    )
    def create_decision(question: str, context: str = "") -> dict[str, Any]:
        """Create a new decision record."""
        store = _store()
        decision = Decision(question=question, context=context)
        store.save(decision)
        return _decision_payload(decision)

    @server.tool(
        title="List decisions",
        description="List stored decisions with lightweight status fields.",
        structured_output=True,
    )
    def list_decisions(
        status: Literal["all", "pending", "unscored", "scored"] = "all",
    ) -> list[dict[str, Any]]:
        """List decisions by status."""
        store = _store()
        if status == "pending":
            decisions = store.list_pending_review()
        elif status == "unscored":
            decisions = store.list_unscored()
        elif status == "scored":
            decisions = store.list_scored()
        else:
            decisions = store.list_all()
        return [_decision_summary(decision) for decision in decisions]

    @server.tool(
        title="Get decision",
        description="Fetch a full decision record by exact ID or unique prefix.",
        structured_output=True,
    )
    def get_decision(decision_id: str) -> dict[str, Any]:
        """Return a full decision payload."""
        decision = _store().get(decision_id)
        if not decision:
            raise ValueError(f"No decision found with ID or prefix '{decision_id}'.")
        return _decision_payload(decision)

    @server.tool(
        title="Save decision analysis",
        description=(
            "Persist KPIs, options, forecasts, chosen option, and review date for a decision. "
            "Pass `kpis` as structured objects with name/description/unit/target/weight plus "
            "outcome_type/resolution_date/resolution_rule/data_source, "
            "and `options` as structured objects with name/description plus forecast objects."
        ),
        structured_output=True,
    )
    def save_analysis(
        decision_id: str,
        kpis: list[KPIInput | str],
        options: list[OptionInput | str],
        chosen_option: str | None = None,
        review_date: str | None = None,
        reflections: str = "",
        context: str | None = None,
    ) -> dict[str, Any]:
        """Save a structured decision analysis."""
        return save_decision_analysis(
            decision_id=decision_id,
            kpis=kpis,
            options=options,
            chosen_option=chosen_option,
            review_date=review_date,
            reflections=reflections,
            context=context,
            store_path=str(resolved_store_path) if resolved_store_path else None,
        )

    @server.tool(
        title="Score decision outcomes",
        description="Record actual KPI outcomes for a chosen option and update calibration stats.",
        structured_output=True,
    )
    def score_decision(
        decision_id: str,
        actual_outcomes: dict[str, float],
        reflections: str = "",
    ) -> dict[str, Any]:
        """Score a decision with realized KPI outcomes."""
        return score_decision_outcomes(
            decision_id=decision_id,
            actual_outcomes=actual_outcomes,
            reflections=reflections,
            store_path=str(resolved_store_path) if resolved_store_path else None,
        )

    @server.tool(
        title="Get calibration summary",
        description="Return the current calibration summary across scored decisions.",
        structured_output=True,
    )
    def get_calibration_summary() -> dict[str, Any]:
        """Return summary calibration metrics."""
        return _calibration_payload(_store())

    @server.resource(
        "farness://framework",
        title="Farness framework",
        description="The canonical seven-step farness workflow.",
        mime_type="text/markdown",
    )
    def framework_resource() -> str:
        """Static overview of the framework."""
        return (
            "# Farness\n\n"
            "1. Define one or two KPIs that are later scoreable: include outcome type, "
            "resolution rule, resolution date, and data source.\n"
            "2. Expand the option set beyond the choices already mentioned.\n"
            "3. Anchor on a relevant reference class or base rate before the inside view.\n"
            "4. Show the main mechanism or decomposition that drives the forecast.\n"
            "5. List the strongest disconfirming evidence, failure modes, or decision traps.\n"
            "6. Give point estimates with 80% confidence intervals for each option on each KPI, "
            "and show them in a compact summary table.\n"
            "7. Recommend a review date, then explain which forecast differences drove the prioritization.\n"
        )

    @server.resource(
        "decision://all",
        title="All decisions",
        description="All stored decision summaries.",
        mime_type="application/json",
    )
    def all_decisions_resource() -> str:
        """Read all decision summaries."""
        return json.dumps(list_decisions("all"), indent=2)

    @server.resource(
        "decision://pending",
        title="Pending decisions",
        description="Decisions that are past review date and not yet scored.",
        mime_type="application/json",
    )
    def pending_decisions_resource() -> str:
        """Read pending review decisions."""
        return json.dumps(list_decisions("pending"), indent=2)

    @server.resource(
        "decision://{decision_id}",
        title="Decision by ID",
        description="Full decision payload and derived scores for a specific decision.",
        mime_type="application/json",
    )
    def decision_resource(decision_id: str) -> str:
        """Read a full decision payload."""
        return json.dumps(get_decision(decision_id), indent=2)

    @server.resource(
        "calibration://summary",
        title="Calibration summary",
        description="Current calibration summary across all scored decisions.",
        mime_type="application/json",
    )
    def calibration_resource() -> str:
        """Read calibration summary."""
        return json.dumps(get_calibration_summary(), indent=2)

    @server.prompt(
        title="Analyze decision",
        description="Prompt template for producing a full farness analysis for a stored decision.",
    )
    def analyze_decision(decision_id: str) -> str:
        """Generate a prompt to analyze a stored decision."""
        decision = get_decision(decision_id)
        return (
            "Use the farness workflow for this stored decision.\n\n"
            f"Decision record:\n{json.dumps(decision, indent=2)}\n\n"
            "Produce:\n"
            "1. explicit KPIs with outcome type, resolution rule, resolution date, and data source\n"
            "2. expanded options\n"
            "3. reference class / base rate\n"
            "4. mechanism or decomposition\n"
            "5. strongest disconfirming evidence\n"
            "6. numeric forecasts with 80% confidence intervals for each option on each KPI\n"
            "7. a compact forecast summary table or bullet matrix in the first answer\n"
            "8. a proposed review date\n\n"
            "Before you finish, explicitly state how the forecast differences drove the recommendation "
            "or prioritization.\n\n"
            "After analysis, call `save_analysis` to persist the structured result. "
            "Pass `kpis` as objects with `name`, `description`, optional `unit`/`target`, "
            "`outcome_type`, `resolution_date`, `resolution_rule`, `data_source`, "
            "and `weight`. Pass `options` as objects with `name`, `description`, and "
            "`forecasts`, where each forecast includes `kpi_name`, `point_estimate`, "
            "`ci_low`, `ci_high`, and optional rationale fields."
        )

    @server.prompt(
        title="Review decision",
        description="Prompt template for reviewing a stored decision that is due or being revisited.",
    )
    def review_decision(decision_id: str) -> str:
        """Generate a prompt to review a stored decision."""
        decision = get_decision(decision_id)
        return (
            "Review this farness decision.\n\n"
            f"Decision record:\n{json.dumps(decision, indent=2)}\n\n"
            "Check whether:\n"
            "- the chosen option still makes sense,\n"
            "- the KPIs are still the right ones,\n"
            "- each KPI still has a clear resolution rule and data source,\n"
            "- any review date should move,\n"
            "- new disconfirming evidence should materially change the forecast.\n\n"
            "In the first answer, show the updated forecast summary and explain how it changes "
            "the prioritization, if at all.\n\n"
            "If the structure or forecast changes, call `save_analysis` with the revised "
            "structured state: KPI objects plus option objects containing forecast objects."
        )

    @server.prompt(
        title="Score decision",
        description="Prompt template for gathering actual outcomes so the decision can be scored.",
    )
    def score_decision_prompt(decision_id: str) -> str:
        """Generate a prompt to score a decision."""
        decision = get_decision(decision_id)
        return (
            "Score this decision with realized outcomes.\n\n"
            f"Decision record:\n{json.dumps(decision, indent=2)}\n\n"
            "Extract the actual KPI outcomes that occurred for the chosen option, then call "
            "`score_decision` with a numeric `actual_outcomes` mapping and optional reflections."
        )

    return server


def main() -> None:
    """Run the farness MCP server."""
    parser = argparse.ArgumentParser(prog="farness-mcp", description="Run the farness MCP server.")
    parser.add_argument(
        "--store",
        default=None,
        help="Optional path to the farness JSONL store. Defaults to $FARNESS_STORE_PATH or ~/.farness/decisions.jsonl.",
    )
    parser.add_argument(
        "--transport",
        default="stdio",
        choices=["stdio", "sse", "streamable-http"],
        help="MCP transport to run. stdio is the default for editor/agent integrations.",
    )
    args = parser.parse_args()
    build_server(store_path=args.store).run(transport=args.transport)


if __name__ == "__main__":
    main()
