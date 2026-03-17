# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Farness is a decision-making framework that reframes subjective questions ("Should I...?") into forecasting problems with explicit KPIs, confidence intervals, and calibration tracking. The core thesis: making numeric predictions forces mechanism thinking, creates accountability, and reduces sycophancy.

## Commands

### Python Package

```bash
# Install for development
pip install -e ".[dev,experiments]"

# Run tests
pytest

# Run single test file
pytest tests/test_framework.py

# Run with coverage
pytest --cov=farness

# Format code
black farness tests
ruff check farness tests
```

### CLI

```bash
farness new "question"    # Create a new decision
farness new "q" --context "details"  # With context
farness list              # List all decisions
farness list --pending    # Decisions past review date
farness show <id>         # Show decision details (supports prefix match)
farness score [id]        # Score a decision's actual outcomes (interactive)
farness calibration       # Show calibration statistics
farness pending           # Alias for list --pending
```

### Site (Next.js)

```bash
cd site
bun install
bun run dev      # Development server
bun run build    # Build for production (static export)
bun run test     # Run vitest tests
```

### Paper

```bash
python3 paper/render_paper.py  # Generate figures, render HTML, sync preemptive_rigor.md and site/public/paper-raw
python3 paper/run_strongest_validation.py  # Strongest reviewer-facing validation across Claude Opus 4.6 and GPT-5.2
python3 -m farness.experiments stability --strongest-validation --model gpt-5.2  # Single-model strongest validation
```

## Architecture

### Python Package (`farness/`)

- **framework.py**: Core dataclasses (`Decision`, `KPI`, `Option`, `Forecast`) with serialization. `Option.expected_value()` computes weighted expected values across KPIs. `Decision.best_option()` and `sensitivity_analysis()` for analysis.
- **storage.py**: `DecisionStore` persists decisions to `~/.farness/decisions.jsonl` in JSONL format. Supports CRUD and filtered queries (unscored, pending review, scored).
- **calibration.py**: `CalibrationTracker` computes forecast accuracy metrics: coverage (% of actuals in CIs), calibration error (coverage vs stated confidence), MAE, MRE, Brier scores.
- **cli.py**: Argparse CLI wrapping the above modules.

### Claude Code Plugin (`claude-plugin/`)

- **commands/decide.md**: Full structured decision analysis workflow (KPIs → options → forecasts → logging)
- **commands/score.md**: Score past decisions against actual outcomes
- **skills/decision-framework/SKILL.md**: Skill that detects advice-seeking patterns and reframes as forecasting problems

### Site (`site/`)

Next.js App Router site with Tailwind CSS v4, statically exported for deployment.

## Key Design Decisions

- Forecasts require both point estimates and confidence intervals
- Confidence levels are explicit (default 80%)
- Base rates and inside-view adjustments are first-class fields for outside/inside view reasoning
- Fermi decomposition supported via `Forecast.components` dict
- Decisions are append-only to JSONL; updates rewrite the file
