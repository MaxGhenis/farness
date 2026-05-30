"""Run a medium pilot of the decision-usefulness experiment.

This freezes a small but realistic case subset so pilot runs are reproducible
and comparable across models.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from brier.experiments.decision_usefulness import (
    DECISION_USEFULNESS_CONDITIONS,
    JUDGE_TASKS,
    PRIMARY_PAIRWISE_COMPARISONS,
    REPRESENTATIONS,
    get_decision_usefulness_case,
    print_decision_usefulness_summary,
    run_decision_usefulness_experiment,
    run_decision_usefulness_judging,
)


DEFAULT_MODELS = ["claude-opus-4-6", "gpt-5.4"]
PILOT_CASE_IDS = [
    "auth_rewrite",
    "interactive_feature_prioritization",
    "microdata_model_parameters",
    "policy_research_centralization",
    "wealth_tax_outreach",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the medium pilot for the decision-usefulness experiment."
    )
    parser.add_argument(
        "--models",
        nargs="+",
        default=DEFAULT_MODELS,
        help="Generator models to run (default: claude-opus-4-6 gpt-5.4)",
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=2,
        help="Runs per condition (default: 2)",
    )
    parser.add_argument(
        "--start-run",
        type=int,
        default=1,
        help="Starting run number (default: 1)",
    )
    parser.add_argument(
        "--case",
        type=str,
        action="append",
        default=None,
        help="Optional case ID to run. Can be passed multiple times. Defaults to the frozen pilot subset.",
    )
    parser.add_argument(
        "--conditions",
        nargs="+",
        choices=DECISION_USEFULNESS_CONDITIONS,
        default=DECISION_USEFULNESS_CONDITIONS,
        help="Conditions to run (default: all four pilot conditions)",
    )
    parser.add_argument(
        "--representations",
        nargs="+",
        choices=REPRESENTATIONS,
        default=REPRESENTATIONS,
        help="Representations to judge (default: decision_memo raw normalized)",
    )
    parser.add_argument(
        "--output-base",
        type=Path,
        default=Path("experiments/decision_usefulness/pilot"),
        help="Base output directory (default: experiments/decision_usefulness/pilot)",
    )
    parser.add_argument(
        "--judge-model",
        type=str,
        default=None,
        help="Optional fixed judge model (default: held-out cross-family judge)",
    )
    parser.add_argument(
        "--judge-tasks",
        nargs="+",
        choices=JUDGE_TASKS,
        default=JUDGE_TASKS,
        help="Judge tasks to run (default: utility omission critique_survival)",
    )
    parser.add_argument(
        "--generate-only",
        action="store_true",
        help="Generate artifacts only; skip pairwise judging",
    )
    parser.add_argument(
        "--judge-only",
        action="store_true",
        help="Run judging only on existing artifacts",
    )
    return parser.parse_args()


def resolve_cases(case_ids: list[str] | None) -> list:
    """Resolve case IDs into case objects."""
    resolved = []
    for case_id in case_ids or PILOT_CASE_IDS:
        case = get_decision_usefulness_case(case_id)
        if case is None:
            raise SystemExit(f"Unknown decision-usefulness case: {case_id}")
        resolved.append(case)
    return resolved


def main() -> None:
    args = parse_args()
    cases = resolve_cases(args.case)

    generation_count_per_model = len(cases) * len(args.conditions) * args.runs
    comparison_count_per_case_run = len(PRIMARY_PAIRWISE_COMPARISONS)
    judge_tasks_per_pair = len(args.judge_tasks)
    judge_calls_per_case_run = (
        comparison_count_per_case_run * len(args.representations) * judge_tasks_per_pair
    )
    judge_calls_per_model = len(cases) * args.runs * judge_calls_per_case_run

    print("Decision-usefulness medium pilot")
    print(f"  Cases: {len(cases)}")
    print(f"  Case IDs: {', '.join(case.id for case in cases)}")
    print(f"  Conditions: {', '.join(args.conditions)}")
    print(f"  Representations: {', '.join(args.representations)}")
    print(f"  Judge tasks: {', '.join(args.judge_tasks)}")
    print(f"  Runs per condition: {args.runs}")
    print(f"  Generated analyses per model: {generation_count_per_model}")
    print(f"  Judge calls per model: {judge_calls_per_model}")

    for model in args.models:
        output_dir = args.output_base / model
        print(f"\nModel: {model}")
        print(f"  Output: {output_dir}")

        if not args.judge_only:
            run_decision_usefulness_experiment(
                cases=cases,
                conditions=args.conditions,
                runs_per_condition=args.runs,
                model=model,
                start_run=args.start_run,
                output_dir=output_dir,
                verbose=True,
            )

        if not args.generate_only:
            utility_results, omission_results, critique_results = run_decision_usefulness_judging(
                output_dir=output_dir,
                cases=cases,
                representations=args.representations,
                judge_tasks=args.judge_tasks,
                judge_model=args.judge_model,
                verbose=True,
            )
            print_decision_usefulness_summary(
                utility_results,
                omission_results,
                critique_results,
            )

            pilot_metadata = {
                "pilot_case_ids": [case.id for case in cases],
                "conditions": args.conditions,
                "representations": args.representations,
                "judge_tasks": args.judge_tasks,
                "runs_per_condition": args.runs,
                "judge_model_override": args.judge_model,
                "model": model,
            }
            with open(output_dir / "pilot_metadata.json", "w") as fh:
                json.dump(pilot_metadata, fh, indent=2)


if __name__ == "__main__":
    main()
