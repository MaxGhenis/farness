# LLM-Judge Evaluation Plan for Farness Decision Usefulness

**Date:** 2026-04-06  
**Status:** Proposed follow-up study

## Why this study exists

The current `stability-under-probing` work measures whether a prompt front-loads considerations that later probes ask about. That is a real process measure, but it is not the same as the practical question that motivates `farness`:

> does forcing a model to go from qualitative vibes to explicit numeric forecasts produce more useful decision analyses?

This study is meant to evaluate that narrower and more operational claim.

## What this study can and cannot show

This design can support claims like:

- held-out LLM judges find `farness` outputs more decision-useful than naive outputs
- forcing explicit forecasts improves the decision artifact even when real-world outcomes are unresolved
- some or all of the `farness` effect comes from quantified forecasting rather than from formatting alone

This design cannot by itself support claims like:

- humans make better final decisions with `farness`
- `farness` improves real-world outcomes
- `farness` forecasts are more accurate on unresolved decisions

## Research question

Do `farness` analyses look more decision-useful than naive or partially structured alternatives when judged by held-out LLMs that do not know which prompt produced which output?

## Core design

### Decision cases

Use **36 real decision prompts** across product, engineering, policy, hiring, operations, and strategy.

- Freeze the test set before looking at any judged outcomes.
- Keep a separate **12-case development set** for prompt debugging and parser tuning.
- The 36-case test set should contain decisions that are realistic but not obviously trivia-like or fully resolvable factual questions.

### Generator models

Primary generators:

- `claude-opus-4-6`
- `gpt-5.4`

Use temperature `1.0` and **3 runs per case-condition-model cell** to capture stochasticity without making the study too expensive.

### Prompt conditions

Primary conditions:

1. `naive`
2. `format_control`
3. `forecast_only`
4. `farness`

This decomposition is intentional:

- `format_control` isolates whether legible structure alone helps
- `forecast_only` isolates whether forcing explicit numbers does most of the work
- `farness` tests the full framework

`CoT` is omitted from the primary design. It is already weak in the current paper and does not isolate the mechanism you care about here.

## Exact generator prompts

### `naive`

```text
You are a helpful assistant.

A user needs help with this decision:

"{scenario}"

Give your recommendation and reasoning. Be concise but complete.
```

### `format_control`

```text
You are a decision analyst.

A user needs help with this decision:

"{scenario}"

Respond using exactly these headings:
- Goal
- Options
- Key considerations
- Recommendation

You may be qualitative. Do not introduce numeric forecasts unless they are obviously necessary for the scenario.
```

### `forecast_only`

```text
You are a decision analyst.

A user needs help with this decision:

"{scenario}"

Do the following:
1. Define 1-2 explicit KPIs that would determine whether the decision succeeded.
2. Expand the option set beyond the user's first framing if needed.
3. For each option, give numeric point estimates and 80% confidence intervals for each KPI.
4. State the recommendation implied by those forecasts.
5. Briefly state the main assumptions behind the forecast.

Do not explicitly cite cognitive biases, base rates, disconfirming evidence, or review dates unless they are strictly necessary to support the forecast.
```

### `farness`

```text
You are a decision analyst using the farness framework.

A user needs help with this decision:

"{scenario}"

Use this workflow:
1. Define 1-2 explicit KPIs, including units and how they would resolve later.
2. Expand the option set beyond the user's initial framing if appropriate.
3. For each option, give numeric point estimates and 80% confidence intervals for each KPI.
4. Cite outside-view base rates or reference classes before relying on inside-view adjustments.
5. Surface the strongest disconfirming evidence and failure modes.
6. Explain the main mechanism behind the forecast differences.
7. Recommend the option implied by the forecasts.
8. Give a review date and what would be checked later.

Do not stop at qualitative vibes; make explicit numeric forecasts.
```

## Blinding and representation

### Raw blinded representation

Before judging:

- remove condition labels
- remove model names
- redact explicit mentions of `farness` in the body if they appear
- randomize left/right order in pairwise comparisons

### Canonical normalized representation

Create a second, normalized representation for each analysis:

```text
Decision question:
{scenario}

KPIs:
{parsed list or "Not provided"}

Options considered:
{parsed list or "Not provided"}

Forecast summary:
{parsed KPI-by-option forecast content or "Not provided"}

Outside-view evidence:
{parsed content or "Not provided"}

Disconfirming evidence:
{parsed content or "Not provided"}

Recommendation:
{parsed content or "Not provided"}

Review plan:
{parsed content or "Not provided"}
```

This matters because raw judging can over-reward polish, verbosity, or headings. If `farness` wins on both raw and normalized representations, the result is much stronger. If it wins only on raw form, the likely explanation is presentation/style rather than content.

## Judge models

Use at least **two held-out judge families**.

Minimum judge setup:

- responses generated by OpenAI models are judged by Anthropic
- responses generated by Anthropic models are judged by OpenAI

Preferred setup:

- the same cross-family judging as above
- plus a third family later if integration is added

Run judges at temperature `0.0`.

## Judge tasks

Run **two judge tasks** on each pairwise comparison.

### Task 1: pairwise decision-usefulness judgment

Judge prompt:

```text
You are evaluating two decision analyses for usefulness to a careful human decision-maker.

Your job is not to guess which one came from a better prompt. Your job is to decide which analysis would better help a user make the decision.

Do not reward verbosity, polish, or formatting alone. Prefer analyses that make the decision easier to audit, compare, and revisit later.

## Decision scenario
{scenario}

## Analysis A
{analysis_a}

## Analysis B
{analysis_b}

Score each analysis from 1-5 on:
1. KPI clarity and resolvability
2. Option-set completeness
3. Forecast specificity and comparability
4. Outside-view grounding
5. Disconfirming evidence / failure-mode coverage
6. Recommendation traceability

Then choose the overall winner.

Return JSON only:
{
  "scores_a": {
    "kpi_clarity": <1-5>,
    "option_completeness": <1-5>,
    "forecast_specificity": <1-5>,
    "outside_view": <1-5>,
    "disconfirming_evidence": <1-5>,
    "recommendation_traceability": <1-5>
  },
  "scores_b": {
    "kpi_clarity": <1-5>,
    "option_completeness": <1-5>,
    "forecast_specificity": <1-5>,
    "outside_view": <1-5>,
    "disconfirming_evidence": <1-5>,
    "recommendation_traceability": <1-5>
  },
  "overall_winner": "A" | "B" | "tie",
  "confidence": <0-100>,
  "rationale": "<<=120 words>"
}
```

### Task 2: omission extraction

Judge prompt:

```text
You are evaluating two decision analyses for the most important thing each one failed to consider.

## Decision scenario
{scenario}

## Analysis A
{analysis_a}

## Analysis B
{analysis_b}

Return JSON only:
{
  "largest_missing_consideration_a": "<one concise omission or 'none'>",
  "largest_missing_consideration_b": "<one concise omission or 'none'>",
  "which_analysis_has_more_serious_omission": "A" | "B" | "tie",
  "confidence": <0-100>,
  "rationale": "<<=100 words>"
}
```

## Primary comparisons

Primary pairwise comparisons:

1. `farness` vs `naive`
2. `farness` vs `forecast_only`
3. `forecast_only` vs `naive`
4. `format_control` vs `naive`

The critical comparison is **`farness` vs `forecast_only`**.

That is the cleanest test of your current intuition:

> is the main gain simply forcing explicit numeric forecasts, or does the full `farness` checklist add something beyond quantified forecasting?

## Primary endpoint

Primary endpoint:

- **pairwise win rate for `farness` vs `forecast_only` on the normalized representation**

Reason:

- it is the most mechanism-relevant comparison
- it best controls for stylistic formatting effects
- it directly tests whether the full checklist adds value beyond forcing numbers

## Secondary endpoints

- `farness` vs `naive` win rate on normalized representation
- raw blinded pairwise win rates for all primary comparisons
- rubric subscore differences
- omission-comparison win rates
- judge confidence
- agreement across judge families
- interaction by decision domain

## Analysis plan

### Unit of analysis

The base observational unit is:

- `case × generator_model × run × pairwise_comparison × judge_model × representation`

### Main analysis

For each pairwise comparison:

- estimate win rate with **cluster bootstrap confidence intervals**
- cluster at minimum by `case`
- report results separately by generator model and pooled across generator models

Preferred pooled model:

- hierarchical logistic regression with random intercepts for `case`, `generator_model`, and `judge_model`

Outcome:

- `1` if left condition wins
- `0` if right condition wins
- treat ties separately in the primary descriptive table
- for regression, either exclude ties or split them as `0.5` in a sensitivity analysis

### Rubric analysis

For rubric subscores:

- compute per-dimension mean difference
- report bootstrap intervals
- highlight which dimensions drive any overall preference

### Omission analysis

Track:

- rate at which each condition is flagged as having the more serious omission
- the most common omission categories

Suggested omission categories:

- missing KPI
- missing option
- missing outside view
- missing downside/failure mode
- missing implementation constraint
- recommendation not supported by forecasts
- false precision / unjustified numbers

## Interpretation logic

### If `farness` beats `naive` and `forecast_only` on both raw and normalized judging

Interpretation:

- the full framework likely improves the decision artifact beyond formatting and beyond forcing numbers alone

### If `forecast_only` captures most of the gain over `naive`

Interpretation:

- the main mechanism is likely the move from vibes to explicit quantified forecasts
- the extra checklist components may be secondary

### If `format_control` also performs well

Interpretation:

- some of the gain comes from output organization and comparability, not just better reasoning content

### If `farness` wins only on raw judging but not normalized judging

Interpretation:

- judges may mainly prefer style, polish, or explicit formatting
- this is weak evidence for content-level improvement

### If omission rates remain high under `farness`

Interpretation:

- the framework may improve structure without adequately broadening the search over considerations

## Exclusion rules

Exclude only:

- API failures
- outputs that are empty or clearly malformed
- parser failures for the normalized representation, but keep those outputs in the raw-analysis arm

Document all exclusions.

## Recommended sample size

Recommended first full run:

- 36 test cases
- 2 generator models
- 4 prompt conditions
- 3 runs each
- 2 judge families
- 2 representations (`raw`, `normalized`)

This yields:

- 864 generated analyses
- 864 primary pairwise judgment items before multiplying by judge family and representation

That is large enough to estimate stable win rates while still being operationally feasible.

## What to preregister

Before collecting judged test-set outcomes, freeze:

- case list
- exact generator prompts
- exact judge prompts
- representations used
- primary endpoint
- tie handling
- exclusion criteria

## Practical recommendation

Run this as the next study, and keep `stability-under-probing` as a separate process-validity measure.

The resulting measurement stack would be:

1. `stability-under-probing` for probe-aligned robustness
2. held-out LLM judging for decision-artifact usefulness
3. later, outcome-linked scoring on resolvable subforecasts

That is a much better match to the actual product claim than asking a single metric to do all the work.
