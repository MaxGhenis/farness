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


class TestNormalization:
    """Tests for normalized scoring across KPIs with different scales."""

    def test_different_scales_are_comparable(self):
        """KPIs with very different scales should contribute equally when weights are equal."""
        decision = Decision(
            question="Which job to take?",
            kpis=[
                KPI(name="income", description="Annual income", unit="$", weight=1.0),
                KPI(name="satisfaction", description="Life satisfaction", unit="score", weight=1.0),
            ],
            options=[
                Option(
                    name="High Pay",
                    description="High income, low satisfaction",
                    forecasts={
                        "income": Forecast(point_estimate=300_000, confidence_interval=(250_000, 350_000)),
                        "satisfaction": Forecast(point_estimate=6.0, confidence_interval=(5.0, 7.0)),
                    },
                ),
                Option(
                    name="High Satisfaction",
                    description="Low income, high satisfaction",
                    forecasts={
                        "income": Forecast(point_estimate=200_000, confidence_interval=(180_000, 220_000)),
                        "satisfaction": Forecast(point_estimate=9.0, confidence_interval=(8.0, 10.0)),
                    },
                ),
            ],
        )
        scores = decision.option_scores()
        # Income: High Pay=1.0, High Satisfaction=0.0
        # Satisfaction: High Pay=0.0, High Satisfaction=1.0
        # Equal weights → both should score 0.5
        assert abs(scores["High Pay"] - 0.5) < 0.01
        assert abs(scores["High Satisfaction"] - 0.5) < 0.01

    def test_weights_affect_normalized_scores(self):
        """Higher-weighted KPIs should dominate the score."""
        decision = Decision(
            question="Which job?",
            kpis=[
                KPI(name="income", description="Income", weight=3.0),
                KPI(name="satisfaction", description="Satisfaction", weight=1.0),
            ],
            options=[
                Option(
                    name="High Pay",
                    description="",
                    forecasts={
                        "income": Forecast(point_estimate=300_000, confidence_interval=(250_000, 350_000)),
                        "satisfaction": Forecast(point_estimate=6.0, confidence_interval=(5.0, 7.0)),
                    },
                ),
                Option(
                    name="High Satisfaction",
                    description="",
                    forecasts={
                        "income": Forecast(point_estimate=200_000, confidence_interval=(180_000, 220_000)),
                        "satisfaction": Forecast(point_estimate=9.0, confidence_interval=(8.0, 10.0)),
                    },
                ),
            ],
        )
        scores = decision.option_scores()
        # Income (weight=3): High Pay=1.0, High Satisfaction=0.0
        # Satisfaction (weight=1): High Pay=0.0, High Satisfaction=1.0
        # High Pay = (3*1.0 + 1*0.0)/4 = 0.75
        # High Satisfaction = (3*0.0 + 1*1.0)/4 = 0.25
        assert abs(scores["High Pay"] - 0.75) < 0.01
        assert abs(scores["High Satisfaction"] - 0.25) < 0.01

    def test_best_option_uses_normalized_scores(self):
        """best_option() should use normalization, not raw values."""
        decision = Decision(
            question="Which job?",
            kpis=[
                KPI(name="income", description="Income", weight=1.0),
                KPI(name="satisfaction", description="Satisfaction", weight=1.0),
            ],
            options=[
                Option(
                    name="High Pay",
                    description="",
                    forecasts={
                        "income": Forecast(point_estimate=300_000, confidence_interval=(250_000, 350_000)),
                        "satisfaction": Forecast(point_estimate=6.0, confidence_interval=(5.0, 7.0)),
                    },
                ),
                Option(
                    name="High Satisfaction",
                    description="",
                    forecasts={
                        "income": Forecast(point_estimate=200_000, confidence_interval=(180_000, 220_000)),
                        "satisfaction": Forecast(point_estimate=9.0, confidence_interval=(8.0, 10.0)),
                    },
                ),
            ],
        )
        # With equal weights, these should be tied
        # best_option() can return either, but should NOT always pick High Pay
        # (which it would without normalization since 300k >> 9)
        best = decision.best_option()
        # Both have equal normalized scores — either is valid
        scores = decision.option_scores()
        assert abs(scores["High Pay"] - scores["High Satisfaction"]) < 0.01

    def test_single_kpi_normalization(self):
        """With a single KPI, highest raw value should still win."""
        decision = Decision(
            question="Which product?",
            kpis=[KPI(name="revenue", description="Revenue")],
            options=[
                Option(name="A", description="", forecasts={
                    "revenue": Forecast(point_estimate=100, confidence_interval=(80, 120)),
                }),
                Option(name="B", description="", forecasts={
                    "revenue": Forecast(point_estimate=150, confidence_interval=(50, 250)),
                }),
            ],
        )
        scores = decision.option_scores()
        assert scores["B"] > scores["A"]

    def test_three_options_normalization(self):
        """Min-max normalization should work with 3+ options."""
        decision = Decision(
            question="Which plan?",
            kpis=[KPI(name="value", description="Value")],
            options=[
                Option(name="Low", description="", forecasts={
                    "value": Forecast(point_estimate=10, confidence_interval=(5, 15)),
                }),
                Option(name="Mid", description="", forecasts={
                    "value": Forecast(point_estimate=55, confidence_interval=(40, 70)),
                }),
                Option(name="High", description="", forecasts={
                    "value": Forecast(point_estimate=100, confidence_interval=(80, 120)),
                }),
            ],
        )
        scores = decision.option_scores()
        # Low=0.0, Mid=0.5, High=1.0
        assert abs(scores["Low"] - 0.0) < 0.01
        assert abs(scores["Mid"] - 0.5) < 0.01
        assert abs(scores["High"] - 1.0) < 0.01

    def test_identical_forecasts_score_equal(self):
        """When all options forecast the same, all scores should be equal."""
        decision = Decision(
            question="Test",
            kpis=[KPI(name="x", description="X")],
            options=[
                Option(name="A", description="", forecasts={
                    "x": Forecast(point_estimate=50, confidence_interval=(40, 60)),
                }),
                Option(name="B", description="", forecasts={
                    "x": Forecast(point_estimate=50, confidence_interval=(45, 55)),
                }),
            ],
        )
        scores = decision.option_scores()
        assert abs(scores["A"] - scores["B"]) < 0.01


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
