# Decision-usefulness evaluation status

Last updated: 2026-04-15

## Why this exists

The original stability-under-probing paper showed that `farness` front-loads framework-aligned considerations, but the held-out probe validation weakened the broad "better reasoning" claim. The current follow-up asks a different question:

> Does forcing an LLM from qualitative vibes into explicit forecasts and tradeoffs produce more useful recommendations?

The main methodological risk is rewarding `farness` by construction. The current design therefore separates final recommendation quality from framework-compliance diagnostics.

## Current evaluation design

Generator conditions:

- `naive`: ordinary helpful recommendation.
- `format_control`: structured qualitative headings, no required forecasts.
- `forecast_only`: explicit KPIs, numeric forecasts, intervals, assumptions, and recommendation.
- `farness`: full framework with KPIs, option expansion, forecasts, outside view, disconfirming evidence, mechanism, recommendation, and review date.

Representations:

- `decision_memo`: primary. Neutral fixed-envelope memo with recommendation, main alternative, rationale, caveat, revisit trigger, and up to two quantitative claims.
- `raw`: secondary. Full artifact, blinded and with framework names redacted.
- `normalized`: tertiary diagnostic. Framework-shaped slots for KPIs, options, forecasts, outside view, disconfirming evidence, recommendation, and review plan.

Judge tasks:

- `utility`: pairwise decision-usefulness judgment.
- `omission`: largest missing consideration and which omission is more serious.
- `critique_survival`: held-out critique lenses such as implementation fragility, incentives, opportunity cost, reversibility, hidden dependencies, and tail/timing risk.

Primary endpoint:

- Pairwise win rate for `farness` vs `forecast_only` on `decision_memo` utility.

Key secondary endpoint:

- `decision_memo` critique survival, especially `farness` vs `forecast_only`.

Diagnostic endpoint:

- `normalized` aligned-rubric results, used only as a framework-compliance/manipulation check.

## Pilot artifacts

Experiment outputs are intentionally untracked.

Existing pilot output trees:

- `experiments/decision_usefulness/pilot/`
- `experiments/decision_usefulness/pilot_memo_primary/`
- `experiments/decision_usefulness/pilot_critique_survival/`

Relevant summaries:

- `experiments/decision_usefulness/pilot_memo_primary/gpt-5.4/judge_summary.json`
- `experiments/decision_usefulness/pilot_memo_primary/claude-opus-4-6/judge_summary.json`
- `experiments/decision_usefulness/pilot_critique_survival/gpt-5.4/judge_summary.json`
- `experiments/decision_usefulness/pilot_critique_survival/claude-opus-4-6/judge_summary.json`

## Pilot readout

The old aligned/normalized pilot was too favorable to structured outputs:

- `format_control` and `forecast_only` beat `naive` almost everywhere under `raw` and `normalized`.
- That is consistent with the judge rewarding visible structure and framework-shaped slots.
- Treat the old pilot as a manipulation check, not as recommendation-quality evidence.

The memo-primary rerun was much less one-sided:

- Claude-generated outputs, GPT judge:
  - `farness` vs `forecast_only`: `forecast_only` won `6-4`.
  - `farness` vs `naive`: `farness` won `6-4`.
  - `forecast_only` vs `naive`: `5-5`.
  - `format_control` vs `naive`: `naive` won `6-4`.
- GPT-5.4-generated outputs, Claude judge:
  - `farness` vs `forecast_only`: `farness` won `7-2-1`, but with low mean confidence.
  - `farness` vs `naive`: `farness` won `6-4`.
  - `forecast_only` vs `naive`: `naive` won `7-3`.
  - `format_control` vs `naive`: `naive` won `6-4`.

Critique-survival backfill on `decision_memo` only:

- GPT-5.4-generated outputs, Claude judge:
  - `farness` vs `forecast_only`: `farness` was less undermined `8-1-1`.
  - `farness` vs `naive`: `naive` was less undermined `7-3`.
- Claude-generated outputs, GPT judge:
  - `farness` vs `forecast_only`: `farness` was less undermined `6-4`.
  - `farness` vs `naive`: tied `5-5`.

Current interpretation:

- The cleaner `decision_memo` endpoint sharply weakens the broad "structure helps" story.
- There is weak-to-mixed evidence that `farness` improves concise final recommendations over `naive`.
- There is more consistent pilot evidence that `farness` is more robust than `forecast_only` under held-out critique lenses.
- The full framework may add robustness beyond explicit forecasts, but the pilot does not show broad dominance over naive recommendations.
- `normalized` results should not be used as primary evidence for recommendation quality.

## Current code state

Recent local commits relevant to this evaluation:

- `c4d400b` `Add decision usefulness experiment runner`
- `9cfd4f7` `Add decision usefulness pilot runner`
- `f9b7356` `Add neutral decision memo judging`
- `a9b7a10` `Add critique survival judge task`
- `ea09044` `Allow selecting decision usefulness judge tasks`

Useful commands:

```bash
./.venv/bin/python -m farness.experiments decision-usefulness --list
./.venv/bin/python -m farness.experiments decision-usefulness --output-dir experiments/decision_usefulness/pilot_memo_primary/gpt-5.4 --judge-only --representations decision_memo raw normalized
./.venv/bin/python -m farness.experiments decision-usefulness --output-dir experiments/decision_usefulness/pilot_critique_survival/gpt-5.4 --judge-only --representations decision_memo --judge-tasks critique_survival
```

## Recommended next step

Do not run a full study yet. First improve the pilot protocol in two ways:

- Add a scenario-level held-out critique bank so critique-survival is less dependent on the judge inventing critiques on the fly.
- Expand from the 5-case pilot to a 40-60 case pilot before committing to a 150-200 case main study.

If the next pilot repeats the current pattern, the clean claim is:

> `farness` does not obviously dominate naive recommendations in concise memo form, but it may add robustness beyond forecast-only prompting when recommendations are tested against held-out critiques.

