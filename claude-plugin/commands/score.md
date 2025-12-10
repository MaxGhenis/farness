---
description: Score a past decision's outcome and update calibration
arguments:
  - name: id
    description: Decision ID to score (optional - will list recent if not provided)
    required: false
---

# Score Decision Outcome

Review a past decision and score how the forecasts performed.

## Option A: Use the CLI (Recommended)

Run the interactive scoring command:

```bash
farness score $ARGUMENTS
```

This will:
1. Show unscored decisions (or find by ID if provided)
2. Display original forecasts for the chosen option
3. Prompt for actual outcomes per KPI
4. Calculate errors and CI coverage
5. Save results and show updated calibration

## Option B: Guided Scoring (if CLI unavailable)

### Step 1: Find the Decision

List unscored decisions:

```bash
farness list --unscored
```

Or show a specific decision:

```bash
farness show <id>
```

### Step 2: Review Original Forecasts

Display:
- The decision question
- The chosen option
- Forecasts for each KPI (point estimate, confidence interval)
- Key assumptions at the time

### Step 3: Gather Outcomes

For each KPI, ask the user:
"What was the actual outcome for [KPI]?"

Get specific numbers.

### Step 4: Update via Python

```python
from datetime import datetime
from farness import DecisionStore

store = DecisionStore()
decision = store.get("<decision_id>")

decision.actual_outcomes = {
    "<kpi1>": <actual_value>,
    "<kpi2>": <actual_value>,
}
decision.scored_at = datetime.now()
decision.reflections = "<user reflections>"

store.update(decision)
```

### Step 5: Show Calibration

```bash
farness calibration
```

## Reflection Questions

After scoring, ask:
- "What did you learn from this decision?"
- "Would you make the same choice with hindsight?"
- "What would you do differently in the analysis?"

Record reflections in the decision.
