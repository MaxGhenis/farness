---
name: farness
description: Use when the user wants advice or a decision recommendation rather than direct implementation, especially for prompts like "should I", "should we", "which is better", "is it worth it", or "what would you do" about architecture, product, hiring, strategy, or career choices. Prefer the local farness MCP server when available and structure the answer around KPI, option expansion, reference class, disconfirming evidence, numeric forecasts, and a review date.
---

# Farness

Use this skill to turn vague decisions into forecastable choices.

Prefer the local `farness` MCP server when it is connected.

## Workflow

1. If the decision is not stored yet, call `create_decision`.
2. Use the `analyze_decision` or `review_decision` MCP prompts for the canonical structure.
3. Make the analysis explicit:
   - KPI definition
   - KPI resolution metadata
   - option expansion
   - reference class / base rate
   - mechanism or decomposition
   - disconfirming evidence
   - numeric forecasts with 80% confidence intervals
   - review date
4. Persist the result with `save_analysis`.
   - `kpis` must be a list of objects shaped like:
     `{"name": "...", "description": "...", "unit": "%|$|days|...", "target": 80, "weight": 1.0, "outcome_type": "binary|count|continuous|percent|currency|score", "resolution_date": "2026-06-30", "resolution_rule": "...", "data_source": "..."}`
   - `options` must be a list of objects shaped like:
     `{"name": "...", "description": "...", "forecasts": [{"kpi_name": "...", "point_estimate": 75, "ci_low": 60, "ci_high": 86, "confidence_level": 0.8, "reasoning": "...", "assumptions": ["..."], "base_rate": 68, "base_rate_source": "...", "inside_view_adjustment": "..."}]}`
   - Do not pass KPI or option names as bare strings.
5. If outcomes are known, call `score_decision`.

## Working Rules

- Do not give a vague recommendation before the KPIs and forecasts are explicit.
- Prefer KPIs that can actually resolve later; avoid labels like `fit` or `quality` unless the resolution rule makes them numeric and scoreable.
- Keep the option set broader than the user's initial framing.
- Treat disconfirming evidence as first-class, not cleanup.
- Use the MCP server for persistence instead of leaving the analysis only in chat.

## Setup

If the `farness` MCP server is not connected, add it with:

```bash
farness setup claude
```
