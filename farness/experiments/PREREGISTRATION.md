# Preregistration: Farness Framework Effectiveness Experiment

**Date:** 2024-12-19
**Authors:** Max Ghenis
**Status:** Pre-data collection

## Research Question

Does prompting an LLM with a structured decision framework ("farness") improve the quality of recommendations on well-studied decision problems, compared to naive prompting?

## Hypotheses

### Primary Hypotheses

**H1:** Farness-framed prompts will produce higher correct recommendation rates than naive prompts.
- *Operationalization:* Binary match to research-backed answer
- *Expected direction:* Farness > Naive
- *Minimum detectable effect:* 20 percentage points (e.g., 70% vs 50%)

**H2:** Farness-framed prompts will cite base rates more frequently.
- *Operationalization:* Binary - does response mention any relevant base rate statistic?
- *Expected direction:* Farness > Naive

**H3:** Farness-framed prompts will identify more cognitive biases.
- *Operationalization:* Count of biases named that match ground truth list
- *Expected direction:* Farness > Naive

### Secondary Hypotheses

**H4:** Farness-framed prompts will include confidence intervals or uncertainty quantification.
- *Operationalization:* Binary - contains numeric ranges or probability estimates

**H5:** Farness-framed prompts will produce more actionable accountability mechanisms.
- *Operationalization:* Binary - suggests review date, tracking, or feedback loop

**H6:** Farness-framed prompts will be more resistant to framing effects in the scenario.
- *Operationalization:* Qualitative - does response identify misleading framing?

## Methods

### Test Cases

10 decision scenarios selected based on:
1. Well-established research literature with consensus "correct" answer
2. Common real-world applicability
3. Known cognitive biases that lead people astray
4. Diversity of domains (hiring, finance, planning, medicine, etc.)

Cases are defined in `cases.py` with:
- Scenario text
- Correct recommendation (ground truth)
- Research basis (citation)
- Key biases (for scoring H3)
- Relevant base rates (for scoring H2)

### Experimental Conditions

**Condition A (Naive):**
```
You are a helpful assistant. Answer this question directly:

"{scenario}"

Give your recommendation and reasoning.
```

**Condition B (Farness):**
```
You are a decision analyst using the "farness" framework. This framework requires you to:

1. Define explicit, measurable KPIs for the decision
2. Make numeric forecasts with confidence intervals for each option
3. Cite base rates from research (outside view) before adjusting with inside view
4. Identify cognitive biases that might be affecting the framing
5. Give a clear recommendation based on expected value
6. Set a review date to score the decision against actuals

Apply this framework to:

"{scenario}"
```

### Procedure

1. Each case run 3 times per condition (to account for LLM stochasticity)
2. Order randomized
3. Same model used for all runs (Claude via subagent)
4. Outputs collected with timestamps and run metadata

### Scoring Rubric

Each response scored on:

| Metric | Type | Scoring Rule |
|--------|------|--------------|
| `correct_recommendation` | Binary | 1 if recommendation matches ground truth, 0 otherwise |
| `cites_base_rate` | Binary | 1 if mentions any relevant statistic from base_rates list |
| `bias_count` | Count | Number of biases from key_biases list that are named |
| `has_confidence_interval` | Binary | 1 if contains numeric ranges (X-Y, ±, confidence interval) |
| `has_accountability` | Binary | 1 if suggests review date, tracking, or measurement |
| `quantifies_tradeoffs` | Binary | 1 if compares options with numbers |

### Scoring Protocol

- Scoring done programmatically where possible (regex for CIs, keyword matching for biases)
- Recommendation correctness requires human judgment (or LLM-as-judge with explicit rubric)
- Scorer is blind to condition where feasible

## Analysis Plan

### Primary Analysis

For each metric, compare Farness vs Naive using:
- **Binary outcomes (H1, H2, H4, H5):** Two-proportion z-test or Fisher's exact test
- **Count outcomes (H3):** Mann-Whitney U test (non-parametric)

Report:
- Effect size (difference in proportions or means)
- 95% confidence interval
- p-value (two-tailed, α = 0.05)

### Sample Size

- 10 cases × 3 runs × 2 conditions = 60 total responses
- 30 per condition
- Power analysis: With n=30 per group, we have 80% power to detect a 25 percentage point difference in proportions (50% vs 75%) at α=0.05

### Secondary Analyses

1. **Per-case breakdown:** Which cases show largest effect?
2. **Correlation:** Do cases where naive fails show larger farness benefit?
3. **Qualitative:** Example responses showing mechanism of improvement

### Multiple Comparisons

- Primary hypothesis (H1) tested at α=0.05
- Secondary hypotheses (H2-H6) Bonferroni-corrected: α=0.01 each

## Exclusion Criteria

Exclude runs where:
- Model fails to respond (API error)
- Response is completely off-topic
- Response explicitly refuses to answer

Document all exclusions.

## Deviations

Any deviations from this plan will be documented and justified in the final analysis.

## Data Availability

All prompts, responses, and scores will be published in:
- `experiments/results/` - Raw outputs
- `experiments/analysis/` - Processed data and figures

---

*This preregistration was written before any experimental data was collected.*
