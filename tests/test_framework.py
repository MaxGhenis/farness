"""Tests for the core framework."""

import pytest
from datetime import datetime

from farness.framework import Decision, KPI, Option, Forecast


class TestKPI:
    def test_basic_kpi(self):
        kpi = KPI(name="revenue", description="Annual revenue in USD", unit="$")
        assert kpi.name == "revenue"
        assert kpi.weight == 1.0

    def test_kpi_with_target(self):
        kpi = KPI(
            name="satisfaction",
            description="Customer satisfaction score",
            target=8.0,
            weight=2.0,
        )
        assert kpi.target == 8.0
        assert kpi.weight == 2.0


class TestForecast:
    def test_basic_forecast(self):
        f = Forecast(
            point_estimate=100,
            confidence_interval=(80, 120),
            confidence_level=0.8,
        )
        assert f.point_estimate == 100
        assert f.confidence_interval == (80, 120)

    def test_forecast_with_decomposition(self):
        f = Forecast(
            point_estimate=1000,
            confidence_interval=(800, 1200),
            components={
                "users": 100,
                "revenue_per_user": 10,
            },
        )
        assert f.components["users"] == 100

    def test_forecast_with_base_rate(self):
        f = Forecast(
            point_estimate=0.3,
            confidence_interval=(0.1, 0.5),
            base_rate=0.2,
            base_rate_source="Industry average",
            inside_view_adjustment="Better team, +10%",
        )
        assert f.base_rate == 0.2


class TestOption:
    def test_expected_value_single_kpi(self):
        kpis = [KPI(name="revenue", description="Revenue")]
        option = Option(
            name="Launch",
            description="Launch the product",
            forecasts={
                "revenue": Forecast(point_estimate=1000, confidence_interval=(800, 1200)),
            },
        )
        assert option.expected_value(kpis) == 1000

    def test_expected_value_weighted_kpis(self):
        kpis = [
            KPI(name="revenue", description="Revenue", weight=2.0),
            KPI(name="satisfaction", description="Satisfaction", weight=1.0),
        ]
        option = Option(
            name="Launch",
            description="Launch the product",
            forecasts={
                "revenue": Forecast(point_estimate=100, confidence_interval=(80, 120)),
                "satisfaction": Forecast(point_estimate=50, confidence_interval=(40, 60)),
            },
        )
        # (100 * 2 + 50 * 1) / (2 + 1) = 250 / 3 = 83.33
        assert abs(option.expected_value(kpis) - 83.33) < 0.01

    def test_expected_value_missing_forecast(self):
        kpis = [
            KPI(name="revenue", description="Revenue"),
            KPI(name="satisfaction", description="Satisfaction"),
        ]
        option = Option(
            name="Launch",
            description="Launch the product",
            forecasts={
                "revenue": Forecast(point_estimate=100, confidence_interval=(80, 120)),
                # satisfaction forecast missing
            },
        )
        # Only counts revenue
        assert option.expected_value(kpis) == 100


class TestDecision:
    def test_best_option(self):
        decision = Decision(
            question="Which product to launch?",
            kpis=[KPI(name="revenue", description="Revenue")],
            options=[
                Option(
                    name="Product A",
                    description="Conservative option",
                    forecasts={
                        "revenue": Forecast(point_estimate=100, confidence_interval=(80, 120)),
                    },
                ),
                Option(
                    name="Product B",
                    description="Risky option",
                    forecasts={
                        "revenue": Forecast(point_estimate=150, confidence_interval=(50, 250)),
                    },
                ),
            ],
        )
        best = decision.best_option()
        assert best.name == "Product B"

    def test_sensitivity_analysis(self):
        decision = Decision(
            question="Which job to take?",
            kpis=[
                KPI(name="salary", description="Annual salary"),
                KPI(name="growth", description="Career growth potential"),
            ],
            options=[
                Option(
                    name="Startup",
                    description="Early stage startup",
                    forecasts={
                        "salary": Forecast(point_estimate=80, confidence_interval=(60, 100)),
                        "growth": Forecast(point_estimate=9, confidence_interval=(7, 10)),
                    },
                ),
                Option(
                    name="BigCo",
                    description="Established company",
                    forecasts={
                        "salary": Forecast(point_estimate=120, confidence_interval=(110, 130)),
                        "growth": Forecast(point_estimate=5, confidence_interval=(4, 6)),
                    },
                ),
            ],
        )
        sensitivity = decision.sensitivity_analysis()
        assert sensitivity["salary"] == "BigCo"
        assert sensitivity["growth"] == "Startup"

    def test_serialization_roundtrip(self):
        original = Decision(
            question="Test decision",
            context="Some context",
            kpis=[
                KPI(name="kpi1", description="First KPI", unit="$", target=100, weight=2.0),
            ],
            options=[
                Option(
                    name="Option A",
                    description="First option",
                    forecasts={
                        "kpi1": Forecast(
                            point_estimate=50,
                            confidence_interval=(40, 60),
                            confidence_level=0.9,
                            reasoning="Because reasons",
                            assumptions=["Assumption 1", "Assumption 2"],
                            base_rate=45,
                            base_rate_source="Historical data",
                        ),
                    },
                ),
            ],
            chosen_option="Option A",
            actual_outcomes={"kpi1": 55},
            reflections="It went well",
        )
        original.decided_at = datetime.now()
        original.scored_at = datetime.now()

        # Serialize and deserialize
        data = original.to_dict()
        restored = Decision.from_dict(data)

        assert restored.id == original.id
        assert restored.question == original.question
        assert restored.context == original.context
        assert len(restored.kpis) == 1
        assert restored.kpis[0].name == "kpi1"
        assert restored.kpis[0].weight == 2.0
        assert len(restored.options) == 1
        assert restored.options[0].name == "Option A"
        assert restored.options[0].forecasts["kpi1"].point_estimate == 50
        assert restored.chosen_option == "Option A"
        assert restored.actual_outcomes["kpi1"] == 55
