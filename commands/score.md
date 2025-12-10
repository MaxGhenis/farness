---
description: Score a past decision's outcome and update calibration
arguments:
  - name: id
    description: Decision ID to score (optional - will list recent if not provided)
    required: false
---

# Score Decision Outcome

Review a past decision and score how the forecasts performed.

## Step 1: Find the Decision

If no ID provided, read ~/.farness/decisions.jsonl and show recent unscored decisions:

```bash
cat ~/.farness/decisions.jsonl | grep '"outcome_scored": false'
```

Display as a list:
- [id] Decision summary (date) - KPIs: X, Y, Z

Ask user which to score.

## Step 2: Review Original Forecasts

Load the decision and display:
- The decision question
- Options considered
- The forecasts made for each option × KPI
- Which option was chosen
- Key assumptions at the time

## Step 3: Gather Outcomes

For each KPI, ask:
"What was the actual outcome for [KPI]?"

Get specific numbers where possible.

## Step 4: Score Forecasts

For each forecast:
- Compare prediction to actual
- Calculate error (for point estimates) or whether actual fell in CI (for ranges)
- Note if key assumptions held or not

## Step 5: Update Log

```bash
# Update the decision entry with outcomes
# Add: actual_outcomes, forecast_errors, scored_at, notes
```

## Step 6: Show Calibration

Read all scored decisions and show:
- Overall calibration curve (% of actuals falling within stated CIs)
- Brier score trend over time
- Systematic biases (overconfident? underconfident on certain domains?)

"Your calibration: X% of outcomes fell within your confidence intervals (target: match your stated confidence levels)"

## Step 7: Reflection

Ask:
- "What did you learn from this decision?"
- "Would you make the same choice with hindsight?"
- "What would you do differently in the analysis?"

Log reflections with the scored decision.
