"""Run the strongest reviewer-facing stability validation on both paper models."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from farness.experiments.stability import get_primary_stability_cases, get_stability_case
from farness.experiments.stability_runner import run_stability_experiment


DEFAULT_MODELS = ["claude-opus-4-6", "gpt-5.2"]
STRONGEST_CONDITIONS = ["naive", "estimate_only", "format_control", "farness"]
STRONGEST_PROBE_BATTERIES = ["on_framework", "off_framework"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the strongest stability validation across one or more models."
    )
    parser.add_argument(
        "--models",
        nargs="+",
        default=DEFAULT_MODELS,
        help="Models to run (default: claude-opus-4-6 gpt-5.2)",
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=6,
        help="Runs per condition/battery pair (default: 6)",
    )
    parser.add_argument(
        "--start-run",
        type=int,
        default=1,
        help="Starting run number for appending to an existing validation set",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed for reproducibility",
    )
    parser.add_argument(
        "--case",
        type=str,
        default=None,
        help="Optional single primary case ID to run instead of the full 8-case battery",
    )
    parser.add_argument(
        "--output-base",
        type=Path,
        default=Path("experiments/stability_validation/strongest"),
        help="Base output directory (default: experiments/stability_validation/strongest)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.case:
        case = get_stability_case(args.case)
        if case is None:
            raise SystemExit(f"Unknown case: {args.case}")
        if "off_framework" not in case.available_probe_batteries():
            raise SystemExit(
                f"Case {args.case} does not support the strongest validation battery"
            )
        cases = [case]
    else:
        cases = get_primary_stability_cases()

    results_per_model = (
        len(cases)
        * len(STRONGEST_CONDITIONS)
        * len(STRONGEST_PROBE_BATTERIES)
        * args.runs
    )
    api_calls_per_model = results_per_model * 2

    print("Strongest stability validation")
    print(f"  Cases: {len(cases)}")
    print(f"  Conditions: {', '.join(STRONGEST_CONDITIONS)}")
    print(f"  Probe batteries: {', '.join(STRONGEST_PROBE_BATTERIES)}")
    print(f"  Runs per pair: {args.runs}")
    print(f"  Result files per model: {results_per_model}")
    print(f"  API calls per model: {api_calls_per_model}")

    for model in args.models:
        output_dir = args.output_base / model
        print(f"\nRunning strongest validation for {model}")
        print(f"  Output: {output_dir}")
        run_stability_experiment(
            cases=cases,
            runs_per_condition=args.runs,
            output_dir=output_dir,
            verbose=True,
            random_seed=args.seed,
            start_run=args.start_run,
            model=model,
            conditions=STRONGEST_CONDITIONS,
            probe_batteries=STRONGEST_PROBE_BATTERIES,
        )


if __name__ == "__main__":
    main()
