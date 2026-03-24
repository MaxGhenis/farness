# Farness

**Forecasting as a harness for decision-making.**

Instead of asking "Is X good?" or "Should I do Y?", farness helps you:
1. Define what success looks like (KPIs)
2. Expand your options (including ones you didn't consider)
3. Make explicit forecasts (with confidence intervals)
4. Track outcomes to improve calibration over time

## Installation

```bash
python -m pip install -e /path/to/farness
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

### AI Agent Workflows

`farness` is not tied to Claude. The Claude Code plugin is the most integrated path today, but the framework also works with Codex and other coding agents that can follow structured instructions or run shell commands.

For agent-agnostic setup and prompt guidance, see [`docs/agent-workflows.md`](docs/agent-workflows.md).

#### Codex and other coding agents

The CLI is a local decision store and calibration tool. It does not call an LLM or require an API key by itself.

To use the current repo version from source:

```bash
python -m pip install -e /path/to/farness
farness new "Should we rewrite the auth layer?" --context "3 incidents this quarter; CTO prefers Rust; team is strongest in Node."
```

Then give the agent a `farness` instruction block:

```text
Use the farness workflow for this decision.
1. Define the KPI or outcome that would make the decision successful.
2. Expand the option set beyond the choices already mentioned.
3. Anchor on a relevant reference class or base rate before using the inside view.
4. Show the main mechanism or decomposition that drives the forecast.
5. List the strongest disconfirming evidence, failure modes, or decision traps.
6. Give point estimates with 80% confidence intervals for each option on each KPI.
7. Recommend a review date and say what would be logged later for calibration.
```

#### MCP server

If you want a native tool interface instead of prompt copy-paste, run the MCP server from the repo:

```bash
python -m pip install -e '/path/to/farness[mcp]'
farness-mcp
```

It exposes tools for creating, listing, retrieving, saving, and scoring decisions, plus resources/prompts for the farness workflow.

To register it in Codex as a local MCP server:

```bash
codex mcp add farness -- uv run --project /path/to/farness --extra mcp farness-mcp
```

To install the Codex skill, copy or symlink [`skills/farness`](skills/farness) into `$CODEX_HOME/skills` (default `~/.codex/skills`) and restart Codex.

#### Claude Code local skill + MCP

Claude Code can use the same local MCP server and a local skill wrapper:

```bash
python -m pip install -e '/path/to/farness[mcp]'
claude mcp add farness -- uv run --project /path/to/farness --extra mcp farness-mcp
mkdir -p ~/.claude/skills
ln -s /path/to/farness/.claude/skills/farness ~/.claude/skills/farness
```

The plugin path still works if you prefer the slash-command workflow:

```bash
claude plugin marketplace add MaxGhenis/farness
claude plugin install farness@maxghenis-plugins
```

Then either use the local `farness` skill or `/farness:decide` if you installed the plugin.

## The Framework

Farness implements a structured decision process:

1. **KPI Definition** - What outcomes actually matter? Make them measurable.

2. **Option Expansion** - Don't just compare A vs B. What about C? What about waiting? What about hybrid approaches?

3. **Reference Class** - Start with a relevant outside view or base rate before adjusting for specifics.

4. **Mechanism / Decomposition** - Break forecasts into estimable components and causal drivers.

5. **Disconfirming Evidence** - Surface the strongest failure modes, traps, and reasons the leading option could be wrong.

6. **Confidence Intervals** - Point estimates aren't enough. How uncertain are you?

7. **Tracking** - Log decisions and review outcomes to calibrate over time.

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
pip install -e ".[dev,experiments]"
pytest
```

Paper build:

```bash
python3 paper/render_paper.py  # Regenerates figures, HTML, Markdown, and site/public/paper-raw
python3 paper/run_strongest_validation.py  # Runs the strongest reviewer-facing validation on Claude Opus 4.6 and GPT-5.2
python3 paper/run_study1_rerun.py --models gpt-5.4  # Reruns the original Study 1 design with legacy prompt wording
python3 -m farness.experiments stability --strongest-validation --model gpt-5.2  # Single-model equivalent
```

### Publishing to PyPI

The package is automatically published to PyPI when a new release is created on GitHub.

**Setup (one-time):**
1. Add `PYPI_API_TOKEN` secret to the GitHub repository
   - Go to repository Settings > Secrets and variables > Actions
   - Add a new repository secret named `PYPI_API_TOKEN`
   - Value should be your PyPI API token (starts with `pypi-`)

**To publish a new version:**
1. Update version in `pyproject.toml`
2. Create a new release on GitHub with a tag (e.g., `v0.2.0`)
3. The GitHub Actions workflow will automatically build and publish to PyPI

**Manual publishing:**
```bash
# Build the package
python -m build

# Upload to PyPI
twine upload dist/* --username __token__ --password $PYPI_API_TOKEN
```

## License

MIT
