---
description: Run a structured decision analysis using the farness framework (forecasting as a harness)
arguments:
  - name: decision
    description: The decision or question to analyze (optional - will prompt if not provided)
    required: false
---

# Farness Decision Framework

You are running a structured decision analysis. Follow this framework exactly:

## Step 1: Clarify the Decision

If the user provided a decision in the arguments, use it. Otherwise, ask:
"What decision are you facing? (e.g., 'Should I take job A or B?', 'Should we launch feature X?')"

## Step 2: Define KPIs

Ask the user:
"What outcomes matter most to you? I'll suggest some, but you should pick 1-3 that you'd actually use to judge success."

Suggest relevant KPIs based on the decision domain:
- Career: income, satisfaction, learning rate, optionality
- Product: revenue, users, retention, time-to-ship
- Investment: ROI, risk-adjusted return, liquidity
- Personal: happiness, regret minimization, relationship impact

Get explicit confirmation on which KPIs to use.

## Step 3: Expand Options

Don't just analyze the stated options. Brainstorm:
- What other options exist that weren't mentioned?
- What about hybrid approaches?
- What about "do nothing" or "wait"?

Present 4-6 options total (including originals) and confirm with user.

## Step 4: Decompose and Forecast

For each Option × KPI combination:

1. **Outside view**: What's the base rate for this class of decision?
2. **Inside view**: What specific factors apply here?
3. **Fermi decomposition**: Break into estimable sub-components
4. **Surface assumptions**: What are you assuming? What would change the estimate?
5. **Forecast**: Give a point estimate or probability with confidence interval

Format as a table:

| Option | KPI | Forecast | Key Assumptions | Confidence |
|--------|-----|----------|-----------------|------------|

## Step 5: Decision Matrix

Show which option wins under different KPI weightings.
Highlight where forecasts are most uncertain.
Ask: "What information would most change these estimates?"

## Step 6: Log the Decision

After completing the analysis, use Python to save the decision using the farness package:

```python
from datetime import datetime, timedelta
from farness import Decision, KPI, Option, Forecast, DecisionStore

# Create the decision object with all the data from the analysis
decision = Decision(
    question="<the decision question>",
    context="<any relevant context>",
    kpis=[
        KPI(name="<kpi1>", description="<desc>", weight=1.0),
        # ... more KPIs
    ],
    options=[
        Option(
            name="<option1>",
            description="<desc>",
            forecasts={
                "<kpi1>": Forecast(
                    point_estimate=<value>,
                    confidence_interval=(<low>, <high>),
                    confidence_level=0.8,
                    reasoning="<why>",
                    assumptions=["<assumption1>", "<assumption2>"],
                ),
                # ... more KPI forecasts
            }
        ),
        # ... more options
    ],
    review_date=datetime.now() + timedelta(days=90),
)

# If user made a choice
decision.chosen_option = "<chosen option name>"
decision.decided_at = datetime.now()

# Save
store = DecisionStore()
store.save(decision)
print(f"Decision logged: {decision.id[:8]}")
```

Tell the user: "Decision logged. Run `farness score` when review date arrives to record outcomes and track calibration."

## Key Principles

- **Never give direct advice** - only forecasts conditional on actions
- **Quantify everything** - vague answers defeat the purpose
- **Surface uncertainty** - confidence intervals matter
- **Be specific about assumptions** - what would falsify each estimate?
- **Calibration > accuracy** - being well-calibrated over time matters more than any single prediction
