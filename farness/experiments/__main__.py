"""CLI entry point for experiments."""

import argparse
import json
from pathlib import Path

from farness.experiments.cases import get_all_cases, get_case
from farness.experiments.runner import (
    generate_prompts_for_manual_run,
    run_experiment,
    score_runs,
)
from farness.experiments.analyze import analyze_experiment, print_results_table, load_scores
from farness.experiments.stability import get_all_stability_cases, get_stability_case
from farness.experiments.stability_runner import (
    run_stability_experiment,
    print_experiment_summary,
)


def main():
    parser = argparse.ArgumentParser(
        description="Run the farness framework effectiveness experiment"
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Generate prompts
    gen_parser = subparsers.add_parser(
        "generate", help="Generate prompts for manual running"
    )
    gen_parser.add_argument(
        "--output",
        type=Path,
        default=Path("experiments/prompts.json"),
        help="Output file for prompts",
    )
    gen_parser.add_argument(
        "--case",
        type=str,
        help="Generate for specific case only",
    )

    # Run experiment
    run_parser = subparsers.add_parser(
        "run", help="Run the experiment via Claude CLI"
    )
    run_parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("experiments/results"),
        help="Output directory",
    )
    run_parser.add_argument(
        "--runs",
        type=int,
        default=3,
        help="Runs per condition",
    )
    run_parser.add_argument(
        "--case",
        type=str,
        help="Run specific case only",
    )

    # Analyze results
    analyze_parser = subparsers.add_parser(
        "analyze", help="Analyze experiment results"
    )
    analyze_parser.add_argument(
        "scores_file",
        type=Path,
        help="Path to scores.json file",
    )

    # List cases
    list_parser = subparsers.add_parser(
        "cases", help="List available test cases"
    )

    # Stability experiment
    stability_parser = subparsers.add_parser(
        "stability", help="Run stability-under-probing experiment"
    )
    stability_parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("experiments/stability_results"),
        help="Output directory",
    )
    stability_parser.add_argument(
        "--runs",
        type=int,
        default=1,
        help="Runs per condition",
    )
    stability_parser.add_argument(
        "--case",
        type=str,
        help="Run specific case only",
    )
    stability_parser.add_argument(
        "--list",
        action="store_true",
        help="List available stability cases",
    )

    args = parser.parse_args()

    if args.command == "generate":
        cases = [get_case(args.case)] if args.case else get_all_cases()
        if args.case and not cases[0]:
            print(f"Case not found: {args.case}")
            return 1

        prompts = generate_prompts_for_manual_run(
            cases=cases,
            output_file=args.output,
        )
        print(f"Generated {len(prompts)} prompts to {args.output}")
        for p in prompts[:5]:
            print(f"  - {p['case_id']} ({p['condition']})")
        if len(prompts) > 5:
            print(f"  ... and {len(prompts) - 5} more")

    elif args.command == "run":
        cases = [get_case(args.case)] if args.case else get_all_cases()
        if args.case and not cases[0]:
            print(f"Case not found: {args.case}")
            return 1

        runs = run_experiment(
            cases=cases,
            runs_per_condition=args.runs,
            output_dir=args.output_dir,
        )
        print(f"\nCompleted {len(runs)} runs")

        scores = score_runs(runs, cases)
        print(f"Scored {len(scores)} responses")

        scores_file = args.output_dir / "scores.json"
        with open(scores_file, "w") as f:
            json.dump([s.to_dict() for s in scores], f, indent=2)
        print(f"Saved scores to {scores_file}")

        # Quick analysis
        analysis = analyze_experiment(scores)
        print_results_table(analysis)

    elif args.command == "analyze":
        scores = load_scores(args.scores_file)
        analysis = analyze_experiment(scores)
        print_results_table(analysis)

        output = args.scores_file.parent / "analysis.json"
        with open(output, "w") as f:
            json.dump(analysis, f, indent=2)
        print(f"\nSaved analysis to {output}")

    elif args.command == "cases":
        print("Available test cases:\n")
        for case in get_all_cases():
            print(f"  {case.id}")
            print(f"    {case.name}")
            print(f"    Biases: {', '.join(case.key_biases[:3])}")
            print()

    elif args.command == "stability":
        if args.list:
            print("Available stability test cases:\n")
            for case in get_all_stability_cases():
                print(f"  {case.id}")
                print(f"    {case.name} ({case.domain})")
                print(f"    Estimate: {case.estimate_unit}")
                print(f"    Expected update: {case.expected_update_direction}")
                print()
            return 0

        if args.case:
            case = get_stability_case(args.case)
            if not case:
                print(f"Case not found: {args.case}")
                return 1
            cases = [case]
        else:
            cases = get_all_stability_cases()

        print(f"Running stability experiment: {len(cases)} cases, {args.runs} runs/condition")

        experiment = run_stability_experiment(
            cases=cases,
            runs_per_condition=args.runs,
            output_dir=args.output_dir,
            verbose=True,
        )

        print_experiment_summary(experiment)
        print(f"\nResults saved to {args.output_dir}")

    else:
        parser.print_help()

    return 0


if __name__ == "__main__":
    exit(main())
