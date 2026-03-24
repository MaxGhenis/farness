---
name: farness
description: Use when the user wants advice or a decision analysis rather than pure implementation, especially for prompts like "should I", "should we", "which is better", "is it worth it", or "what would you do" about architecture, product, hiring, strategy, or career choices. Reframe the decision as explicit KPIs, expanded options, reference classes, disconfirming evidence, numeric forecasts, and a review date. Do not use for straightforward debugging, factual explanation, or routine coding tasks.
---

# Farness

Use this skill to turn vague decisions into forecastable choices.

Prefer the `farness` MCP server when available. It gives you persistent tools, resources, and prompts for the workflow.

## Trigger Conditions

Use this skill when the user is asking for advice or a decision recommendation, especially in forms like:

- "Should I..." / "Should we..."
- "Which is better..."
- "Is it worth..."
- "What would you do..."
- "Do you recommend..."

Strong fits:

- architecture tradeoffs
- build vs buy
- refactor vs defer
- hiring or org choices
- startup, product, or strategy decisions
- career choices

Do not use it for:

- debugging questions
- pure knowledge/explanation requests
- direct implementation tasks with no decision component

## Workflow

1. If there is no stored decision yet, call `create_decision`.
2. Use `farness://framework` if you need the canonical sequence.
3. Structure the analysis around:
   - KPI definition
   - option expansion
   - reference class / outside view
   - mechanism or decomposition
   - disconfirming evidence
   - numeric forecasts with 80% confidence intervals
   - review date
4. Persist the result with `save_analysis`.
5. If the user is revisiting the decision, use `get_decision` and `review_decision`.
6. If outcomes are now known, call `score_decision` to update calibration.

## Working Rules

- Do not give a vague recommendation before the KPIs and forecasts are explicit.
- Keep the option set broader than the user's first framing.
- Treat disconfirming evidence as first-class, not a footnote.
- Prefer one or two decisive KPIs over a long laundry list.
- Use the MCP tools for persistence; do not leave the analysis only in chat if the user intends to track it.

## Fallback

If the `farness` MCP server is not connected, tell the user to add it with:

```bash
farness setup codex
```

Then continue with the same workflow once the server is available.
