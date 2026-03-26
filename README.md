# Farness

**Forecasting as a harness for decision-making.**

Instead of asking "Is X good?" or "Should I do Y?", farness helps you:
1. Define what success looks like (KPIs)
2. Expand your options (including ones you didn't consider)
3. Make explicit forecasts (with confidence intervals and resolution rules)
4. Track outcomes to improve calibration over time

## Installation

```bash
python -m pip install 'farness[mcp]'
```

## Quick Start

### Codex

```bash
farness setup codex
farness doctor codex
```

Then restart Codex and use `$farness` when a decision prompt appears.

### Claude Code

```bash
farness setup claude
farness doctor claude
```

Then restart Claude Code.

### Local CLI

```bash
farness new "Should we rewrite the auth layer?" --context "3 incidents this quarter"
farness list
farness calibration
```

The CLI is local-only and does not call an LLM or require an API key.

### Python package

```python
from farness import Decision, KPI, Option, Forecast, DecisionStore
from datetime import datetime, timedelta

# Create a decision
decision = Decision(
    question="Should I take the new job offer?",
    kpis=[
        KPI(name="income", description="Total comp after 2 years", unit="$"),
        KPI(
            name="satisfaction",
            description="Job satisfaction 1-10",
            outcome_type="score",
            resolution_date=datetime.now() + timedelta(days=365),
            resolution_rule="Ask for a 1-10 retrospective self-rating 12 months after starting.",
            data_source="Follow-up self-review",
        ),
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
farness new "Should we launch now?"
farness show abc123
farness pending
farness calibration
```

### AI Agent Workflows

`farness` is not tied to Claude. The Claude Code plugin is the most integrated path today, but the framework also works with Codex and other coding agents that can follow structured instructions or run shell commands.

For agent-agnostic setup and prompt guidance, see [`docs/agent-workflows.md`](docs/agent-workflows.md).

#### Codex and other coding agents

The default builder path is package-first:

```bash
python -m pip install 'farness[mcp]'
farness setup codex
farness doctor codex
```

For source installs during development:

```bash
python -m pip install -e /path/to/farness
```

#### MCP server

If you want a native tool interface instead of prompt copy-paste, install the package and run the MCP server locally:

```bash
python -m pip install 'farness[mcp]'
farness-mcp
```

It exposes tools for creating, listing, retrieving, saving, and scoring decisions, plus resources/prompts for the farness workflow.

To register it in Codex as a local MCP server:

```bash
farness setup codex
farness doctor codex
```

This installs the packaged Codex skill and registers the MCP server with the same Python interpreter that launched `farness`.

#### Claude Code local skill + MCP

Claude Code can use the same local MCP server and a local skill wrapper:

```bash
python -m pip install 'farness[mcp]'
farness setup claude
farness doctor claude
```

This installs the packaged Claude skill and registers the MCP server in user scope.

The plugin path still works if you prefer the slash-command workflow:

```bash
claude plugin marketplace add MaxGhenis/farness
claude plugin install farness@maxghenis-plugins
```

Then either use the local `farness` skill or `/farness:decide` if you installed the plugin.

#### Repair and reset

If setup drifted or a skill was modified locally:

```bash
farness doctor codex --fix
farness doctor claude --fix
```

If you want to remove the local integration and start over:

```bash
farness uninstall codex
farness setup codex
```

or:

```bash
farness uninstall claude
farness setup claude
```

## The Framework

Farness implements a structured decision process:

1. **KPI Definition** - What outcomes actually matter? Make them measurable.
   Add outcome type, resolution date, resolution rule, and data source when possible.

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
python -m build
python scripts/smoke_packaged_install.py dist/*.whl
python scripts/generate_demo_video.py
```

Paper build:

```bash
python3 paper/render_paper.py  # Regenerates figures, HTML, Markdown, and site/public/paper-raw
python3 paper/run_strongest_validation.py  # Runs the strongest reviewer-facing validation on Claude Opus 4.6 and GPT-5.2
python3 paper/run_study1_rerun.py --models gpt-5.4  # Reruns the original Study 1 design with legacy prompt wording
python3 -m farness.experiments stability --strongest-validation --model gpt-5.2  # Single-model equivalent
```

### Publishing to PyPI

The package is published to PyPI from GitHub Releases using PyPI Trusted Publishing.

**Setup (one-time):**
1. In PyPI, open the `farness` project publishing settings:
   - `https://pypi.org/manage/project/farness/settings/publishing/`
2. Add a GitHub Actions trusted publisher with:
   - Owner: `MaxGhenis`
   - Repository name: `farness`
   - Workflow name: `publish.yml`
   - Environment name: leave blank unless you later add a GitHub environment

**To publish a new version:**
1. Update version in `pyproject.toml`
2. Create a new release on GitHub with a tag (e.g., `v0.2.0`)
3. The GitHub Actions workflow will automatically build and publish to PyPI

The repo no longer needs a stored `PYPI_API_TOKEN` once Trusted Publishing is configured.

## License

MIT
