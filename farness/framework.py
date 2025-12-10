"""Core decision framework components."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import uuid4


@dataclass
class KPI:
    """A measurable outcome that matters for a decision."""

    name: str
    description: str
    unit: Optional[str] = None  # e.g., "$", "%", "days"
    target: Optional[float] = None  # What counts as success?
    weight: float = 1.0  # Relative importance (for multi-KPI decisions)


@dataclass
class Forecast:
    """A prediction about a KPI under a specific option."""

    point_estimate: float
    confidence_interval: tuple[float, float]  # (low, high)
    confidence_level: float = 0.8  # e.g., 0.8 for 80% CI
    reasoning: str = ""
    assumptions: list[str] = field(default_factory=list)

    # Decomposition (Fermi-style)
    components: dict[str, float] = field(default_factory=dict)

    # Outside/inside view
    base_rate: Optional[float] = None
    base_rate_source: Optional[str] = None
    inside_view_adjustment: Optional[str] = None


@dataclass
class Option:
    """An action that could be taken."""

    name: str
    description: str
    forecasts: dict[str, Forecast] = field(default_factory=dict)  # KPI name -> Forecast

    def expected_value(self, kpis: list[KPI]) -> float:
        """Weighted expected value across KPIs."""
        total_weight = sum(k.weight for k in kpis if k.name in self.forecasts)
        if total_weight == 0:
            return 0.0
        return sum(
            k.weight * self.forecasts[k.name].point_estimate
            for k in kpis
            if k.name in self.forecasts
        ) / total_weight


@dataclass
class Decision:
    """A decision to be analyzed."""

    id: str = field(default_factory=lambda: str(uuid4()))
    question: str = ""
    context: str = ""

    kpis: list[KPI] = field(default_factory=list)
    options: list[Option] = field(default_factory=list)

    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    decided_at: Optional[datetime] = None
    chosen_option: Optional[str] = None

    # For scoring later
    review_date: Optional[datetime] = None
    actual_outcomes: dict[str, float] = field(default_factory=dict)  # KPI name -> actual
    scored_at: Optional[datetime] = None
    reflections: str = ""

    def best_option(self) -> Optional[Option]:
        """Return the option with highest expected value."""
        if not self.options:
            return None
        return max(self.options, key=lambda o: o.expected_value(self.kpis))

    def sensitivity_analysis(self) -> dict[str, str]:
        """Show which option wins under different KPI weightings."""
        results = {}
        for kpi in self.kpis:
            # What if this KPI had 100% weight?
            best = max(
                self.options,
                key=lambda o: o.forecasts.get(kpi.name, Forecast(0, (0, 0))).point_estimate
            )
            results[kpi.name] = best.name
        return results

    def to_dict(self) -> dict:
        """Serialize for storage."""
        return {
            "id": self.id,
            "question": self.question,
            "context": self.context,
            "kpis": [
                {"name": k.name, "description": k.description, "unit": k.unit,
                 "target": k.target, "weight": k.weight}
                for k in self.kpis
            ],
            "options": [
                {
                    "name": o.name,
                    "description": o.description,
                    "forecasts": {
                        kpi_name: {
                            "point_estimate": f.point_estimate,
                            "confidence_interval": list(f.confidence_interval),
                            "confidence_level": f.confidence_level,
                            "reasoning": f.reasoning,
                            "assumptions": f.assumptions,
                            "components": f.components,
                            "base_rate": f.base_rate,
                            "base_rate_source": f.base_rate_source,
                            "inside_view_adjustment": f.inside_view_adjustment,
                        }
                        for kpi_name, f in o.forecasts.items()
                    }
                }
                for o in self.options
            ],
            "created_at": self.created_at.isoformat(),
            "decided_at": self.decided_at.isoformat() if self.decided_at else None,
            "chosen_option": self.chosen_option,
            "review_date": self.review_date.isoformat() if self.review_date else None,
            "actual_outcomes": self.actual_outcomes,
            "scored_at": self.scored_at.isoformat() if self.scored_at else None,
            "reflections": self.reflections,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Decision":
        """Deserialize from storage."""
        decision = cls(
            id=data["id"],
            question=data["question"],
            context=data.get("context", ""),
            created_at=datetime.fromisoformat(data["created_at"]),
            chosen_option=data.get("chosen_option"),
            actual_outcomes=data.get("actual_outcomes", {}),
            reflections=data.get("reflections", ""),
        )

        if data.get("decided_at"):
            decision.decided_at = datetime.fromisoformat(data["decided_at"])
        if data.get("review_date"):
            decision.review_date = datetime.fromisoformat(data["review_date"])
        if data.get("scored_at"):
            decision.scored_at = datetime.fromisoformat(data["scored_at"])

        decision.kpis = [
            KPI(
                name=k["name"],
                description=k["description"],
                unit=k.get("unit"),
                target=k.get("target"),
                weight=k.get("weight", 1.0),
            )
            for k in data.get("kpis", [])
        ]

        decision.options = [
            Option(
                name=o["name"],
                description=o["description"],
                forecasts={
                    kpi_name: Forecast(
                        point_estimate=f["point_estimate"],
                        confidence_interval=tuple(f["confidence_interval"]),
                        confidence_level=f.get("confidence_level", 0.8),
                        reasoning=f.get("reasoning", ""),
                        assumptions=f.get("assumptions", []),
                        components=f.get("components", {}),
                        base_rate=f.get("base_rate"),
                        base_rate_source=f.get("base_rate_source"),
                        inside_view_adjustment=f.get("inside_view_adjustment"),
                    )
                    for kpi_name, f in o.get("forecasts", {}).items()
                }
            )
            for o in data.get("options", [])
        ]

        return decision
