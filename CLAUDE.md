# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Farness is a decision-making framework that reframes subjective questions ("Should I...?") into forecasting problems with explicit KPIs, confidence intervals, and calibration tracking. The core thesis: making numeric predictions forces mechanism thinking, creates accountability, and reduces sycophancy.

## Commands

### Python Package

```bash
# Install for development
pip install -e ".[dev]"

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
farness list              # List all decisions
farness list --pending    # Decisions past review date
farness show <id>         # Show decision details (supports prefix match)
farness calibration       # Show calibration statistics
farness pending           # Alias for list --pending
```

### Site (React/Vite)

```bash
cd site
npm install
npm run dev      # Development server
npm run build    # Build for production
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

React/TypeScript site built with Vite, deployed via GitHub Pages.

## Key Design Decisions

- Forecasts require both point estimates and confidence intervals
- Confidence levels are explicit (default 80%)
- Base rates and inside-view adjustments are first-class fields for outside/inside view reasoning
- Fermi decomposition supported via `Forecast.components` dict
- Decisions are append-only to JSONL; updates rewrite the file
