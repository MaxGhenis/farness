# Agent Workflows

`farness` is not tied to one assistant. The Claude Code plugin is the most integrated path today, but the framework also works with Codex, Cursor, Windsurf, ChatGPT, and any other agent that can follow structured instructions.

## Core instruction

Give your agent this instruction when you want a decision analyzed with `farness`:

```text
Use the farness workflow for this decision.
1. Define the KPI or outcome that would make the decision successful.
2. Expand the option set beyond the choices already mentioned.
3. Anchor on a relevant reference class or base rate before using the inside view.
4. Show the main mechanism or decomposition that drives the forecast.
5. List the strongest disconfirming evidence, failure modes, or decision traps.
6. Give point estimates with 80% confidence intervals for each option on each KPI.
7. Recommend a review date and say what would be logged later for calibration.
Do not answer with a vague recommendation until the forecasts are explicit.
```

## Codex and other coding agents

This works well in tools like Codex because they already have the two things `farness` needs:

- access to local context
- the ability to log decisions through the CLI or Python package

Minimal workflow:

```bash
pip install farness
farness new "Should we rewrite the auth layer?" --context "3 incidents this quarter; CTO prefers Rust; team is strongest in Node."
```

Then ask the agent to use the core instruction above and to read or update the decision in `~/.farness/decisions.jsonl`.

## Claude Code

For Claude Code, you can use the plugin:

```bash
claude plugin marketplace add MaxGhenis/farness
claude plugin install farness@maxghenis-plugins
```

Then run `/farness:decide` for the full structured workflow.

## Python and CLI

If you do not want any agent integration, `farness` still works as a local decision log and calibration tool.

Useful commands:

```bash
farness new "Should we rewrite the auth layer?"
farness list
farness show <id>
farness pending
farness calibration
```

## Recommended prompt shape

The strongest current version of the framework is:

1. KPI definition
2. option expansion
3. reference class
4. mechanism / decomposition
5. disconfirming evidence
6. numeric forecast with confidence interval
7. review date and later scoring

That sequence is more portable across models than prompting heavily for named cognitive biases alone.
