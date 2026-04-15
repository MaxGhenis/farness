"""Tests for decision-usefulness experiment utilities."""

import json

from farness.experiments import decision_usefulness as du


def test_seed_cases_are_well_formed():
    """Seed decision-usefulness cases should all be populated."""
    cases = du.get_decision_usefulness_cases()
    assert len(cases) >= 10
    for case in cases:
        assert case.id
        assert case.name
        assert case.domain
        assert case.scenario


def test_prompt_generation_covers_forecast_only_and_farness():
    """Prompts should reflect the intended mechanism split."""
    case = du.get_decision_usefulness_case("auth_rewrite")
    assert case is not None

    forecast_only = du.generate_decision_usefulness_prompt(case, "forecast_only")
    assert "80% confidence intervals" in forecast_only
    assert "Do not explicitly cite cognitive biases" in forecast_only

    farness = du.generate_decision_usefulness_prompt(case, "farness")
    assert "outside-view base rates" in farness
    assert "review date" in farness

    format_control = du.generate_decision_usefulness_prompt(case, "format_control")
    assert "Goal" in format_control
    assert "Recommendation" in format_control


def test_normalize_decision_analysis_extracts_sections():
    """Normalization should preserve the key decision-analysis sections."""
    response = """
KPIs:
- Launch on time
- P(incident-free migration)

Options:
- Rewrite now
- Patch incrementally

Forecasts:
- Rewrite now: 55% on-time launch (80% CI: 35-72%)
- Patch incrementally: 72% on-time launch (80% CI: 60-83%)

Base rates:
- Similar rewrites often slip by a quarter

Disconfirming evidence:
- Patchwork may entrench complexity

Recommendation:
Patch incrementally now, then re-evaluate in Q3.

Review date:
2026-09-30 after the next incident review.
"""
    sections, normalized = du.normalize_decision_analysis(
        response_text=response,
        scenario="Should we rewrite auth?",
    )

    assert "Launch on time" in sections["kpis"]
    assert "Rewrite now" in sections["options"]
    assert "55% on-time launch" in sections["forecast_summary"]
    assert "Similar rewrites" in sections["outside_view"]
    assert "Patchwork may entrench complexity" in sections["disconfirming_evidence"]
    assert "Patch incrementally now" in sections["recommendation"]
    assert "2026-09-30" in sections["review_plan"]
    assert "Decision question:" in normalized
    assert "Outside-view evidence:" in normalized

    memo = du.build_decision_memo(response_text=response, normalized_sections=sections)
    assert "Recommended option:" in memo
    assert "Patch incrementally now" in memo
    assert "Main alternative:" in memo
    assert "Quantitative support:" in memo


def test_normalize_decision_analysis_defaults_missing_fields():
    """Missing sections should be marked explicitly."""
    sections, normalized = du.normalize_decision_analysis(
        response_text="I recommend waiting for more information.",
        scenario="Should we launch now?",
    )
    assert sections["kpis"] == "Not provided"
    assert sections["forecast_summary"] == "Not provided"
    assert sections["outside_view"] == "Not provided"
    assert "Not provided" in normalized


def test_ensure_artifact_representations_backfills_decision_memo():
    """Older saved artifacts should gain the memo representation on load."""
    artifact = du.DecisionUsefulnessArtifact(
        case_id="auth_rewrite",
        condition="naive",
        model="gpt-5.4",
        run_number=1,
        prompt="p",
        response_text="Recommendation: Wait.\n\nBecause the timing is uncertain.",
        timestamp="2026-04-10T10:00:00",
        duration_seconds=1.0,
        normalized_sections={},
        normalized_representation="",
    )
    patched = du._ensure_artifact_representations(artifact, "Should we launch?")
    assert patched.normalized_representation
    assert patched.decision_memo_representation
    assert "Recommended option:" in patched.decision_memo_representation


def test_judge_pairwise_decision_usefulness_maps_winner(monkeypatch):
    """Pairwise judging should map winner labels back to conditions."""
    case = du.get_decision_usefulness_case("auth_rewrite")
    assert case is not None

    artifact_a = du.DecisionUsefulnessArtifact(
        case_id=case.id,
        condition="farness",
        model="gpt-5.4",
        run_number=1,
        prompt="p1",
        response_text="Recommendation: Patch incrementally.",
        timestamp="2026-04-06T10:00:00",
        duration_seconds=1.0,
        normalized_sections={},
        normalized_representation="Recommendation:\nPatch incrementally.",
    )
    artifact_b = du.DecisionUsefulnessArtifact(
        case_id=case.id,
        condition="naive",
        model="gpt-5.4",
        run_number=1,
        prompt="p2",
        response_text="Recommendation: Rewrite now.",
        timestamp="2026-04-06T10:00:01",
        duration_seconds=1.2,
        normalized_sections={},
        normalized_representation="Recommendation:\nRewrite now.",
    )

    def fake_call_llm(prompt, model, temperature, max_tokens):
        return (
            """{
  "scores_a": {
    "kpi_clarity": 5,
    "option_completeness": 4,
    "forecast_specificity": 5,
    "outside_view": 4,
    "disconfirming_evidence": 4,
    "recommendation_traceability": 5
  },
  "scores_b": {
    "kpi_clarity": 2,
    "option_completeness": 2,
    "forecast_specificity": 1,
    "outside_view": 1,
    "disconfirming_evidence": 1,
    "recommendation_traceability": 2
  },
  "overall_winner": "A",
  "confidence": 81,
  "rationale": "A is more auditable."
}""",
            0.3,
        )

    monkeypatch.setattr(du, "call_llm", fake_call_llm)
    result = du.judge_pairwise_decision_usefulness(
        case=case,
        artifact_a=artifact_a,
        artifact_b=artifact_b,
        representation="normalized",
    )

    assert result.winner_condition in {"farness", "naive"}
    assert result.winner_condition == result.left_condition
    assert result.confidence == 81
    assert result.scores_a["kpi_clarity"] == 5


def test_judge_pairwise_decision_usefulness_uses_neutral_prompt_for_decision_memo(monkeypatch):
    """Decision-memo judging should use the neutral writeup prompt."""
    case = du.get_decision_usefulness_case("auth_rewrite")
    assert case is not None

    artifact_a = du.DecisionUsefulnessArtifact(
        case_id=case.id,
        condition="forecast_only",
        model="gpt-5.4",
        run_number=1,
        prompt="p1",
        response_text="Recommendation: Patch incrementally.",
        timestamp="2026-04-06T10:00:00",
        duration_seconds=1.0,
        normalized_sections={"recommendation": "Patch incrementally.", "options": "Rewrite now\nPatch incrementally", "forecast_summary": "Patch incrementally: 72%", "disconfirming_evidence": "May entrench complexity", "review_plan": "Reassess after next incident"},
        normalized_representation="Recommendation:\nPatch incrementally.",
        decision_memo_representation="Recommended option:\nPatch incrementally.",
    )
    artifact_b = du.DecisionUsefulnessArtifact(
        case_id=case.id,
        condition="naive",
        model="gpt-5.4",
        run_number=1,
        prompt="p2",
        response_text="Recommendation: Rewrite now.",
        timestamp="2026-04-06T10:00:01",
        duration_seconds=1.2,
        normalized_sections={"recommendation": "Rewrite now."},
        normalized_representation="Recommendation:\nRewrite now.",
        decision_memo_representation="Recommended option:\nRewrite now.",
    )

    prompts = []

    def fake_call_llm(prompt, model, temperature, max_tokens):
        prompts.append(prompt)
        return (
            """{
  "scores_a": {
    "action_guidance": 5,
    "comparative_reasoning": 4,
    "uncertainty_handling": 4,
    "quantitative_support": 5,
    "overall_usefulness": 5
  },
  "scores_b": {
    "action_guidance": 2,
    "comparative_reasoning": 2,
    "uncertainty_handling": 2,
    "quantitative_support": 1,
    "overall_usefulness": 2
  },
  "overall_winner": "A",
  "confidence": 76,
  "rationale": "A is more decision-useful."
}""",
            0.2,
        )

    monkeypatch.setattr(du, "call_llm", fake_call_llm)
    result = du.judge_pairwise_decision_usefulness(
        case=case,
        artifact_a=artifact_a,
        artifact_b=artifact_b,
        representation="decision_memo",
    )

    assert prompts
    assert "## Writeup A" in prompts[0]
    assert "Action guidance" in prompts[0]
    assert result.confidence == 76
    assert result.scores_a["action_guidance"] == 5


def test_judge_pairwise_critique_survival_maps_less_undermined(monkeypatch):
    """Critique-survival judging should use held-out critique lenses."""
    case = du.get_decision_usefulness_case("auth_rewrite")
    assert case is not None

    artifact_a = du.DecisionUsefulnessArtifact(
        case_id=case.id,
        condition="farness",
        model="gpt-5.4",
        run_number=1,
        prompt="p1",
        response_text="Recommendation: Patch incrementally.",
        timestamp="2026-04-06T10:00:00",
        duration_seconds=1.0,
        normalized_sections={},
        normalized_representation="Recommendation:\nPatch incrementally.",
        decision_memo_representation="Recommended option:\nPatch incrementally.",
    )
    artifact_b = du.DecisionUsefulnessArtifact(
        case_id=case.id,
        condition="forecast_only",
        model="gpt-5.4",
        run_number=1,
        prompt="p2",
        response_text="Recommendation: Rewrite now.",
        timestamp="2026-04-06T10:00:01",
        duration_seconds=1.2,
        normalized_sections={},
        normalized_representation="Recommendation:\nRewrite now.",
        decision_memo_representation="Recommended option:\nRewrite now.",
    )

    prompts = []

    def fake_call_llm(prompt, model, temperature, max_tokens):
        prompts.append(prompt)
        return (
            """{
  "most_damaging_critique_a": "Execution could still drift without owner accountability.",
  "most_damaging_critique_b": "Rewrite creates timing and implementation fragility.",
  "less_undermined_analysis": "A",
  "confidence": 84,
  "rationale": "A survives opportunity-cost and fragility critiques better."
}""",
            0.2,
        )

    monkeypatch.setattr(du, "call_llm", fake_call_llm)
    result = du.judge_pairwise_critique_survival(
        case=case,
        artifact_a=artifact_a,
        artifact_b=artifact_b,
        representation="decision_memo",
    )

    assert prompts
    assert "implementation fragility" in prompts[0]
    assert "opportunity cost" in prompts[0]
    assert result.less_undermined_condition in {"farness", "forecast_only"}
    assert result.confidence == 84
    assert "fragility" in result.most_damaging_critique_b


def test_summarize_decision_usefulness_judging_counts_wins():
    """Summary should group wins by comparison and representation."""
    utility_results = [
        du.PairwiseUtilityJudgeResult(
            case_id="auth_rewrite",
            source_model="gpt-5.4",
            judge_model="claude-opus-4-6",
            run_number=1,
            comparison="farness_vs_forecast_only",
            representation="normalized",
            condition_a="farness",
            condition_b="forecast_only",
            left_condition="farness",
            right_condition="forecast_only",
            winner_condition="farness",
            confidence=80,
            rationale="",
            scores_a={},
            scores_b={},
        ),
        du.PairwiseUtilityJudgeResult(
            case_id="auth_rewrite",
            source_model="gpt-5.4",
            judge_model="claude-opus-4-6",
            run_number=2,
            comparison="farness_vs_forecast_only",
            representation="normalized",
            condition_a="farness",
            condition_b="forecast_only",
            left_condition="farness",
            right_condition="forecast_only",
            winner_condition="forecast_only",
            confidence=70,
            rationale="",
            scores_a={},
            scores_b={},
        ),
    ]
    omission_results = [
        du.PairwiseOmissionJudgeResult(
            case_id="auth_rewrite",
            source_model="gpt-5.4",
            judge_model="claude-opus-4-6",
            run_number=1,
            comparison="farness_vs_forecast_only",
            representation="normalized",
            condition_a="farness",
            condition_b="forecast_only",
            left_condition="farness",
            right_condition="forecast_only",
            more_serious_omission_condition="forecast_only",
            confidence=65,
            rationale="",
            largest_missing_consideration_a="none",
            largest_missing_consideration_b="review plan",
        ),
    ]
    critique_results = [
        du.PairwiseCritiqueSurvivalJudgeResult(
            case_id="auth_rewrite",
            source_model="gpt-5.4",
            judge_model="claude-opus-4-6",
            run_number=1,
            comparison="farness_vs_forecast_only",
            representation="normalized",
            condition_a="farness",
            condition_b="forecast_only",
            left_condition="farness",
            right_condition="forecast_only",
            less_undermined_condition="farness",
            confidence=75,
            rationale="",
            most_damaging_critique_a="timing",
            most_damaging_critique_b="fragility",
        ),
    ]

    summary = du.summarize_decision_usefulness_judging(
        utility_results,
        omission_results,
        critique_results,
    )
    assert summary["utility"]["normalized"]["farness_vs_forecast_only"]["wins"]["farness"] == 1
    assert summary["utility"]["normalized"]["farness_vs_forecast_only"]["wins"]["forecast_only"] == 1
    assert (
        summary["omission"]["normalized"]["farness_vs_forecast_only"]["flagged_more_serious"]["forecast_only"]
        == 1
    )
    assert (
        summary["critique_survival"]["normalized"]["farness_vs_forecast_only"]["less_undermined"]["farness"]
        == 1
    )


def test_run_decision_usefulness_judging_can_select_critique_only(tmp_path, monkeypatch):
    """Judging should support backfilling critique-survival without rerunning other tasks."""
    case = du.get_decision_usefulness_case("auth_rewrite")
    assert case is not None

    for condition, recommendation in (
        ("farness", "Patch incrementally."),
        ("naive", "Rewrite now."),
    ):
        artifact = du.DecisionUsefulnessArtifact(
            case_id=case.id,
            condition=condition,
            model="gpt-5.4",
            run_number=1,
            prompt="p",
            response_text=f"Recommendation: {recommendation}",
            timestamp="2026-04-06T10:00:00",
            duration_seconds=1.0,
            normalized_sections={"recommendation": recommendation},
            normalized_representation=f"Recommendation:\n{recommendation}",
            decision_memo_representation=f"Recommended option:\n{recommendation}",
        )
        with open(tmp_path / f"{case.id}_{condition}_run1.json", "w") as fh:
            json.dump(artifact.to_dict(), fh)

    calls = []

    def fake_call_llm(prompt, model, temperature, max_tokens):
        calls.append(prompt)
        return (
            """{
  "most_damaging_critique_a": "Execution fragility.",
  "most_damaging_critique_b": "Opportunity cost.",
  "less_undermined_analysis": "A",
  "confidence": 70,
  "rationale": "A survives better."
}""",
            0.1,
        )

    monkeypatch.setattr(du, "call_llm", fake_call_llm)
    utility_results, omission_results, critique_results = du.run_decision_usefulness_judging(
        output_dir=tmp_path,
        cases=[case],
        comparisons=[("farness", "naive")],
        representations=["decision_memo"],
        judge_tasks=["critique_survival"],
        verbose=False,
    )

    assert not utility_results
    assert not omission_results
    assert len(critique_results) == 1
    assert len(calls) == 1
    assert list(tmp_path.glob("judge_critique_*.json"))
    assert not list(tmp_path.glob("judge_utility_*.json"))
    assert not list(tmp_path.glob("judge_omission_*.json"))
