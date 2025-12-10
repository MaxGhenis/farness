# Farness

**Forecasting as a harness for decision-making.**

Instead of asking "Is X good?" or "Should I do Y?", farness helps you:
1. Define what success looks like (KPIs)
2. Expand your options (including ones you didn't consider)
3. Make explicit forecasts (with confidence intervals)
4. Track outcomes to improve calibration over time

## Installation

```bash
pip install farness
```

## Quick Start

### As a Python package

```python
from farness import Decision, KPI, Option, Forecast, DecisionStore
from datetime import datetime, timedelta

# Create a decision
decision = Decision(
    question="Should I take the new job offer?",
    kpis=[
        KPI(name="income", description="Total comp after 2 years", unit="$"),
        KPI(name="satisfaction", description="Job satisfaction 1-10"),
    ],
    options=[
        Option(
            name="Take new job",
            description="Accept the offer at Company X",
            forecasts={
                "income": Forecast(
                    point_estimate=300000,
                    confidence_interval=(250000, 400000),
                    reasoning="Base + equity, assuming normal vesting",
                ),
                "satisfaction": Forecast(
                    point_estimate=7.5,
                    confidence_interval=(6, 9),
                    reasoning="Interesting work, but unknown team",
                ),
            }
        ),
        Option(
            name="Stay at current job",
            description="Decline and stay",
            forecasts={
                "income": Forecast(
                    point_estimate=250000,
                    confidence_interval=(230000, 280000),
                    reasoning="Known trajectory, likely promotion",
                ),
                "satisfaction": Forecast(
                    point_estimate=6.5,
                    confidence_interval=(6, 7),
                    reasoning="Comfortable but plateauing",
                ),
            }
        ),
    ],
    review_date=datetime.now() + timedelta(days=180),
)

# Save it
store = DecisionStore()
store.save(decision)
```

### Command Line

```bash
# List decisions
farness list

# Show a specific decision
farness show abc123

# Check calibration
farness calibration

# See what needs review
farness pending
```

### Claude Code Plugin

Install the plugin for interactive decision analysis:

```bash
claude plugin marketplace add MaxGhenis/farness
claude plugin install farness@maxghenis-plugins
```

Then use `/farness:decide` to run a structured decision analysis.

## The Framework

Farness implements a structured decision process:

1. **KPI Definition** - What outcomes actually matter? Make them measurable.

2. **Option Expansion** - Don't just compare A vs B. What about C? What about waiting? What about hybrid approaches?

3. **Decomposition** - Break forecasts into estimable components (Fermi-style).

4. **Outside View** - Start with base rates before adjusting for specifics.

5. **Confidence Intervals** - Point estimates aren't enough. How uncertain are you?

6. **Tracking** - Log decisions and review outcomes to calibrate over time.

## Why This Works

- **Reduces sycophancy** - Harder to just agree when making numeric predictions
- **Forces mechanism thinking** - Must reason about cause and effect
- **Creates accountability** - Predictions can be scored later
- **Separates values from facts** - You pick KPIs (values), forecasts are facts
- **Builds calibration** - Track predictions over time to improve

## Development

```bash
git clone https://github.com/MaxGhenis/farness
cd farness
pip install -e ".[dev]"
pytest
```

## License

MIT
