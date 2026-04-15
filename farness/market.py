"""Market-draft helpers for turning farness forecasts into forecast markets."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Literal, Optional

from farness.framework import Decision, Forecast, KPI

MarketOutcomeType = Literal["BINARY", "PSEUDO_NUMERIC"]
MarketVisibility = Literal["public", "unlisted"]


@dataclass
class MarketSource:
    """A source cited in a market description."""

    title: str
    url: str

    def to_dict(self) -> dict[str, str]:
        return {"title": self.title, "url": self.url}


@dataclass
class SourceForecast:
    """The forecast used to seed a draft market."""

    point_estimate: float
    ci_low: Optional[float] = None
    ci_high: Optional[float] = None
    confidence_level: float = 0.8
    rationale: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "point_estimate": self.point_estimate,
            "ci_low": self.ci_low,
            "ci_high": self.ci_high,
            "confidence_level": self.confidence_level,
            "rationale": self.rationale,
        }


@dataclass
class MarketDraft:
    """Provider-neutral market draft with a Manifold payload view."""

    question: str
    outcome_type: MarketOutcomeType
    description_markdown: str
    close_date: datetime
    visibility: MarketVisibility = "unlisted"
    initial_probability: Optional[int] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    initial_value: Optional[float] = None
    is_log_scale: bool = False
    tags: list[str] = field(default_factory=list)
    resolution_date: Optional[datetime] = None
    resolution_rule: str = ""
    sources: list[MarketSource] = field(default_factory=list)
    source_forecast: Optional[SourceForecast] = None
    notes: list[str] = field(default_factory=list)

    def to_manifold_payload(self) -> dict[str, Any]:
        """Return the payload shape expected by Manifold's market-create API."""
        payload: dict[str, Any] = {
            "outcomeType": self.outcome_type,
            "question": self.question,
            "descriptionMarkdown": self.description_markdown,
            "closeTime": int(self.close_date.timestamp() * 1000),
            "visibility": self.visibility,
        }
        if self.outcome_type == "BINARY":
            payload["initialProb"] = _clamp_probability(self.initial_probability or 50)
        elif self.outcome_type == "PSEUDO_NUMERIC":
            if self.min_value is None or self.max_value is None or self.initial_value is None:
                raise ValueError("Numeric market drafts require min, max, and initial value")
            payload.update(
                {
                    "min": self.min_value,
                    "max": self.max_value,
                    "initialValue": self.initial_value,
                    "isLogScale": self.is_log_scale,
                }
            )
        else:
            raise ValueError(f"Unsupported outcome type: {self.outcome_type}")
        return payload

    def to_dict(self) -> dict[str, Any]:
        """Serialize the draft, including a ready-to-review Manifold payload."""
        return {
            "question": self.question,
            "outcome_type": self.outcome_type,
            "description_markdown": self.description_markdown,
            "close_date": self.close_date.date().isoformat(),
            "visibility": self.visibility,
            "initial_probability": self.initial_probability,
            "min_value": self.min_value,
            "max_value": self.max_value,
            "initial_value": self.initial_value,
            "is_log_scale": self.is_log_scale,
            "tags": self.tags,
            "resolution_date": (
                self.resolution_date.date().isoformat() if self.resolution_date else None
            ),
            "resolution_rule": self.resolution_rule,
            "sources": [source.to_dict() for source in self.sources],
            "source_forecast": (
                self.source_forecast.to_dict() if self.source_forecast else None
            ),
            "notes": self.notes,
            "manifold_payload": self.to_manifold_payload(),
        }


def market_pack_to_dict(
    drafts: list[MarketDraft],
    *,
    title: str,
    source: str,
) -> dict[str, Any]:
    """Build a serializable market-draft pack."""
    return {
        "title": title,
        "source": source,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "provider": "manifold",
        "warning": "Draft only. No market has been created and no bet has been placed.",
        "markets": [draft.to_dict() for draft in drafts],
    }


def write_market_pack(
    drafts: list[MarketDraft],
    output_path: Path,
    *,
    title: str,
    source: str,
) -> None:
    """Write a market-draft pack to JSON."""
    pack = market_pack_to_dict(drafts, title=title, source=source)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as fh:
        json.dump(pack, fh, indent=2)
        fh.write("\n")


def draft_binary_policy_market(
    question: str,
    *,
    context: str = "",
    initial_probability: Optional[int] = None,
    close_date: Optional[datetime] = None,
    resolution_date: Optional[datetime] = None,
    resolution_rule: str = "",
    visibility: MarketVisibility = "unlisted",
    sources: Optional[list[MarketSource]] = None,
    tags: Optional[list[str]] = None,
    rationale: str = "",
) -> MarketDraft:
    """Draft a single binary policy market from a forecastable question."""
    resolution_date = resolution_date or datetime.now() + timedelta(days=180)
    close_date = close_date or resolution_date
    sources = sources or []
    tags = tags or []
    initial_probability = _clamp_probability(initial_probability or 50)

    description = _description_markdown(
        context=context,
        resolution_rule=resolution_rule,
        resolution_date=resolution_date,
        sources=sources,
        forecast=SourceForecast(
            point_estimate=initial_probability,
            rationale=rationale,
        ),
    )

    return MarketDraft(
        question=_ensure_question_mark(question.strip()),
        outcome_type="BINARY",
        description_markdown=description,
        close_date=close_date,
        visibility=visibility,
        initial_probability=initial_probability,
        tags=tags,
        resolution_date=resolution_date,
        resolution_rule=resolution_rule,
        sources=sources,
        source_forecast=SourceForecast(
            point_estimate=initial_probability,
            rationale=rationale,
        ),
        notes=[
            "Review Manifold wording before posting.",
            "Initial probability is a seed forecast, not a market consensus.",
        ],
    )


def draft_markets_for_decision(
    decision: Decision,
    *,
    visibility: MarketVisibility = "unlisted",
    tags: Optional[list[str]] = None,
) -> list[MarketDraft]:
    """Draft one conditional market per option/KPI forecast in a decision."""
    tags = tags or []
    drafts: list[MarketDraft] = []
    for option in decision.options:
        for kpi in decision.kpis:
            forecast = option.forecasts.get(kpi.name)
            if forecast is None:
                continue
            drafts.append(
                draft_market_for_option_kpi(
                    decision=decision,
                    option_name=option.name,
                    kpi=kpi,
                    forecast=forecast,
                    visibility=visibility,
                    tags=tags,
                )
            )
    return drafts


def draft_market_for_option_kpi(
    decision: Decision,
    option_name: str,
    kpi: KPI,
    forecast: Forecast,
    *,
    visibility: MarketVisibility = "unlisted",
    tags: Optional[list[str]] = None,
) -> MarketDraft:
    """Draft a Manifold-compatible market for one option/KPI forecast."""
    tags = tags or []
    resolution_date = kpi.resolution_date or decision.review_date or datetime.now() + timedelta(days=180)
    close_date = resolution_date
    resolution_rule = kpi.resolution_rule or (
        "Resolve according to the data source named in the market description."
    )
    context = (
        f"Original farness decision: {decision.question}\n\n"
        f"Condition: if `{option_name}` is chosen or implemented.\n\n"
        f"KPI: {kpi.name} - {kpi.description}"
    )
    if kpi.data_source:
        context += f"\n\nData source: {kpi.data_source}"

    if _is_binary_kpi(kpi, forecast):
        point = _clamp_probability(round(forecast.point_estimate))
        question = (
            f"If {option_name}, will `{kpi.name}` resolve positively by "
            f"{resolution_date.date().isoformat()}?"
        )
        return MarketDraft(
            question=question,
            outcome_type="BINARY",
            description_markdown=_description_markdown(
                context=context,
                resolution_rule=resolution_rule,
                resolution_date=resolution_date,
                forecast=_source_forecast_from_forecast(forecast),
            ),
            close_date=close_date,
            visibility=visibility,
            initial_probability=point,
            tags=tags,
            resolution_date=resolution_date,
            resolution_rule=resolution_rule,
            source_forecast=_source_forecast_from_forecast(forecast),
            notes=["Drafted from a stored farness forecast."],
        )

    low, high = forecast.confidence_interval
    min_value, max_value = _numeric_market_bounds(low, high, forecast.point_estimate)
    question = (
        f"If {option_name}, what will `{kpi.name}` be on "
        f"{resolution_date.date().isoformat()}?"
    )
    return MarketDraft(
        question=question,
        outcome_type="PSEUDO_NUMERIC",
        description_markdown=_description_markdown(
            context=context,
            resolution_rule=resolution_rule,
            resolution_date=resolution_date,
            forecast=_source_forecast_from_forecast(forecast),
        ),
        close_date=close_date,
        visibility=visibility,
        min_value=min_value,
        max_value=max_value,
        initial_value=forecast.point_estimate,
        tags=tags,
        resolution_date=resolution_date,
        resolution_rule=resolution_rule,
        source_forecast=_source_forecast_from_forecast(forecast),
        notes=["Drafted from a stored farness forecast."],
    )


def _description_markdown(
    *,
    context: str,
    resolution_rule: str,
    resolution_date: datetime,
    sources: Optional[list[MarketSource]] = None,
    forecast: Optional[SourceForecast] = None,
) -> str:
    """Build a readable Manifold market description."""
    parts = [
        "## Context",
        context.strip() or "No additional context provided.",
        "",
        "## Resolution",
        resolution_rule.strip() or "Resolve based on the clearest official source available at resolution time.",
        "",
        f"Resolution date target: {resolution_date.date().isoformat()}",
    ]
    if sources:
        parts.extend(["", "## Sources"])
        parts.extend(f"- [{source.title}]({source.url})" for source in sources)
    if forecast:
        parts.extend(
            [
                "",
                "## Seed forecast",
                f"- Point estimate: {forecast.point_estimate:g}",
            ]
        )
        if forecast.ci_low is not None and forecast.ci_high is not None:
            parts.append(
                f"- {forecast.confidence_level:.0%} interval: "
                f"{forecast.ci_low:g} to {forecast.ci_high:g}"
            )
        if forecast.rationale:
            parts.append(f"- Rationale: {forecast.rationale.strip()}")
    parts.extend(
        [
            "",
            "_Drafted by farness. Review wording and resolution criteria before posting._",
        ]
    )
    return "\n".join(parts).strip()


def _source_forecast_from_forecast(forecast: Forecast) -> SourceForecast:
    """Convert a farness forecast to a market-source forecast."""
    ci_low, ci_high = forecast.confidence_interval
    return SourceForecast(
        point_estimate=forecast.point_estimate,
        ci_low=ci_low,
        ci_high=ci_high,
        confidence_level=forecast.confidence_level,
        rationale=forecast.reasoning,
    )


def _is_binary_kpi(kpi: KPI, forecast: Forecast) -> bool:
    """Return whether a KPI should map to a binary Manifold market."""
    if kpi.outcome_type == "binary":
        return True
    if kpi.outcome_type == "percent" and 0 <= forecast.point_estimate <= 100:
        return True
    if kpi.unit == "%" and 0 <= forecast.point_estimate <= 100:
        return True
    return False


def _numeric_market_bounds(low: float, high: float, point: float) -> tuple[float, float]:
    """Choose simple numeric market bounds from a forecast interval."""
    spread = max(high - low, abs(point) * 0.25, 1)
    min_value = min(low, point) - spread * 0.5
    max_value = max(high, point) + spread * 0.5
    if min_value >= max_value:
        max_value = min_value + 1
    return round(min_value, 4), round(max_value, 4)


def _clamp_probability(value: int | float) -> int:
    """Clamp a probability to Manifold's binary-market initialProb range."""
    return int(max(1, min(99, round(value))))


def _ensure_question_mark(question: str) -> str:
    """Ensure a market headline reads as a question."""
    if question.endswith("?"):
        return question
    return f"{question}?"


def slugify_market_filename(text: str) -> str:
    """Return a filesystem-safe slug for market draft packs."""
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return slug or "market-draft"

