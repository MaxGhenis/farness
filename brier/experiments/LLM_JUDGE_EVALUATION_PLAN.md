# LLM-Judge Evaluation Plan for Brier Decision Usefulness

**Date:** 2026-04-06  
**Status:** Proposed follow-up study

## Why this study exists

The current `stability-under-probing` work measures whether a prompt front-loads considerations that later probes ask about. That is a real process measure, but it is not the same as the practical question that motivates `brier`:

> does forcing a model to go from qualitative vibes to explicit numeric forecasts produce more useful decision analyses?

This study is meant to evaluate that narrower and more operational claim.

## What this study can and cannot show

This design can support claims like:

- held-out LLM judges find `brier` outputs more decision-useful than naive outputs
- forcing explicit forecasts improves the decision artifact even when real-world outcomes are unresolved
- some or all of the `brier` effect comes from quantified forecasting rather than from formatting alone

This design cannot by itself support claims like:

- humans make better final decisions with `brier`
- `brier` improves real-world outcomes
- `brier` forecasts are more accurate on unresolved decisions

## Research question

Do `brier` analyses look more decision-useful than naive or partially structured alternatives when judged by held-out LLMs that do not know which prompt produced which output?

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
4. `brier`

This decomposition is intentional:

- `format_control` isolates whether legible structure alone helps
- `forecast_only` isolates whether forcing explicit numbers does most of the work
- `brier` tests the full framework

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

### `brier`

```text
You are a decision analyst using the brier framework.

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
- redact explicit mentions of `brier` in the body if they appear
- randomize left/right order in pairwise comparisons

### Decision memo representation

The primary representation is a fixed-length neutral memo:

```text
Recommended option:
{chosen option}

Main alternative:
{most relevant live alternative}

Decisive rationale:
{2-4 sentence rationale}

Key caveat:
{main caveat or "Not clearly stated"}

Revisit trigger:
{main trigger for changing the decision or "Not clearly stated"}

Quantitative support:
{up to 1-2 decisive quantitative claims if supported}
```

This is the main safeguard against rewarding `brier` by construction. The memo keeps the recommendation, rationale, caveat, and quantitative mechanism visible, but removes the framework-shaped checklist.

### Canonical normalized representation

Create a normalized representation for framework-aligned diagnostics:

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

This is no longer the primary endpoint. It is useful as a manipulation check: does a condition actually produce explicit KPIs, forecasts, outside-view references, disconfirming evidence, and review plans?

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

Run **three judge tasks** on each pairwise comparison.

### Task 1: pairwise decision-usefulness judgment

For `decision_memo` and `raw`, use a neutral usefulness rubric. For `normalized`, use the older aligned rubric as a diagnostic.

Neutral judge prompt:

```text
You are evaluating two decision writeups for usefulness to a careful human decision-maker.

Your job is not to guess which one came from a better prompt. Your job is to decide which analysis would better help a user make the decision.

Do not reward verbosity, polish, headings, or visible process steps by themselves.
Prefer the writeup that gives clearer action guidance, more discriminative reasoning between live alternatives, more useful caveat/uncertainty handling, and stronger quantitative support when that support meaningfully helps the recommendation.

## Decision scenario
{scenario}

## Analysis A
{analysis_a}

## Analysis B
{analysis_b}

Score each analysis from 1-5 on:
1. Action guidance
2. Comparative reasoning
3. Uncertainty handling
4. Quantitative support
5. Overall decision usefulness

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

### Task 3: critique survival

Critique survival stress-tests whether a recommendation is less undermined by held-out concerns that are not tied to the `brier` checklist.

Judge prompt:

```text
You are stress-testing two decision writeups using held-out critique lenses.

Your job is to decide which recommendation is less undermined after applying critiques that are NOT tied to any particular decision framework.

Use these critique lenses:
- implementation fragility
- incentive or stakeholder response
- opportunity cost
- reversibility and switching cost
- hidden dependencies
- tail risk or timing risk

Do not reward visible process, headings, checklist completeness, or verbosity by themselves.
Prefer the writeup whose recommendation would require less revision after these critiques.

Return JSON only:
{
  "most_damaging_critique_a": "<=35 words>",
  "most_damaging_critique_b": "<=35 words>",
  "less_undermined_analysis": "A" | "B" | "tie",
  "confidence": <0-100>,
  "rationale": "<<=120 words>"
}
```

## Primary comparisons

Primary pairwise comparisons:

1. `brier` vs `naive`
2. `brier` vs `forecast_only`
3. `forecast_only` vs `naive`
4. `format_control` vs `naive`

The critical comparison is **`brier` vs `forecast_only`**.

That is the cleanest test of your current intuition:

> is the main gain simply forcing explicit numeric forecasts, or does the full `brier` checklist add something beyond quantified forecasting?

## Primary endpoint

Primary endpoint:

- **pairwise win rate for `brier` vs `forecast_only` on the `decision_memo` representation**

Reason:

- it is the most mechanism-relevant comparison
- it controls for checklist-compliance bias better than normalized artifacts
- it directly tests whether the full checklist adds value beyond forcing numbers
- it preserves numeric forecasts when they actually improve the recommendation

## Secondary endpoints

- `brier` vs `naive` win rate on `decision_memo`
- raw blinded pairwise win rates for all primary comparisons
- critique-survival win rates under held-out critique lenses
- normalized aligned-rubric win rates as a manipulation check
- rubric subscore differences
- omission-comparison win rates
- judge confidence
- agreement across judge families
- interaction by decision domain

## Analysis plan

### Unit of analysis

The base observational unit is:

- `case × generator_model × run × pairwise_comparison × judge_model × representation × judge_task`

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

### Critique-survival analysis

Track:

- rate at which each condition is less undermined by held-out critique lenses
- whether critique survival agrees with `decision_memo` usefulness
- the most common damaging critique categories by condition

Critique survival is the robustness endpoint. It should not be treated as a direct outcome-quality measure, but it is stronger than a free-form omission task because it asks whether the recommendation would need to change under held-out concerns.

## Interpretation logic

### If `brier` beats `forecast_only` on `decision_memo` and critique survival

Interpretation:

- the full framework likely improves recommendation quality beyond forcing numbers alone
- the strongest supported mechanism is that the extra checklist improves robustness to held-out concerns

### If `forecast_only` captures most of the gain over `naive`

Interpretation:

- the main mechanism is likely the move from vibes to explicit quantified forecasts
- the extra checklist components may be secondary

### If `format_control` also performs well

Interpretation:

- some of the gain comes from output organization and comparability, not just better reasoning content

### If `brier` wins only on raw or normalized judging

Interpretation:

- judges may mainly prefer visible structure, polish, or framework-shaped artifacts
- this is weak evidence for recommendation-quality improvement

### If `brier` wins on full artifacts but not `decision_memo`

Interpretation:

- the product surface may be more useful or auditable, but the final recommendation is not clearly better
- this supports a decision-artifact claim more than a recommendation-quality claim

### If omission rates remain high under `brier`

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
- 3 representations (`decision_memo`, `raw`, `normalized`)

This yields:

- 864 generated analyses
- 864 primary pairwise judgment items before multiplying by judge family, representation, and judge task

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
