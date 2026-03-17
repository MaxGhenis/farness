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
from farness.experiments.stability import (
    get_all_stability_cases,
    get_primary_stability_cases,
    get_stability_case,
)
from farness.experiments.stability_runner import (
    run_stability_experiment,
    print_experiment_summary,
)
from farness.experiments.llm import model_short_name

ALL_CONDITIONS = ["naive", "estimate_only", "format_control", "cot", "farness"]
ALL_PROBE_BATTERIES = ["on_framework", "off_framework"]


def _add_model_args(parser: argparse.ArgumentParser) -> None:
    """Add --model and --conditions args to a subparser."""
    parser.add_argument(
        "--model",
        type=str,
        default="claude-opus-4-6",
        help="LLM model ID (e.g. claude-opus-4-6, gpt-5.2)",
    )
    parser.add_argument(
        "--conditions",
        type=str,
        nargs="+",
        choices=ALL_CONDITIONS,
        default=None,
        help="Conditions to run (default: naive farness)",
    )
    parser.add_argument(
        "--probe-batteries",
        type=str,
        nargs="+",
        choices=ALL_PROBE_BATTERIES,
        default=None,
        help="Probe batteries to run (default: on_framework)",
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
    subparsers.add_parser("cases", help="List available test cases")

    # Stability experiment
    stability_parser = subparsers.add_parser(
        "stability", help="Run stability-under-probing experiment"
    )
    stability_parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Output directory (default: experiments/stability_results/{model})",
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
    stability_parser.add_argument(
        "--seed",
        type=int,
        help="Random seed for reproducibility",
    )
    stability_parser.add_argument(
        "--start-run",
        type=int,
        default=1,
        help="Starting run number (for appending to existing results)",
    )
    stability_parser.add_argument(
        "--primary-only",
        action="store_true",
        help="Run only the 8 primary non-adversarial scenarios",
    )
    stability_parser.add_argument(
        "--strongest-validation",
        action="store_true",
        help="Run the strongest reviewer-facing validation preset (primary scenarios, on/off-framework probes, naive + estimate-only + format-control + farness)",
    )
    _add_model_args(stability_parser)

    # Reframing experiment
    reframing_parser = subparsers.add_parser(
        "reframing", help="Run reframing experiment"
    )
    reframing_parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Output directory (default: experiments/reframing_results/{model})",
    )
    reframing_parser.add_argument(
        "--runs",
        type=int,
        default=5,
        help="Runs per condition",
    )
    reframing_parser.add_argument(
        "--start-run",
        type=int,
        default=1,
        help="Starting run number",
    )
    _add_model_args(reframing_parser)

    # Reanalyze from saved files
    reanalyze_parser = subparsers.add_parser(
        "reanalyze", help="Reanalyze results from saved JSON files"
    )
    reanalyze_parser.add_argument(
        "--stability-dir",
        type=Path,
        default=Path("experiments/stability_results"),
        help="Stability results directory (searches subdirs for model-specific results)",
    )
    reanalyze_parser.add_argument(
        "--reframing-dir",
        type=Path,
        default=Path("experiments/reframing_results"),
        help="Reframing results directory (searches subdirs for model-specific results)",
    )

    # Judge experiment
    judge_parser = subparsers.add_parser(
        "judge", help="Run LLM-as-judge evaluation"
    )
    judge_parser.add_argument(
        "--reframing-dir",
        type=Path,
        default=Path("experiments/reframing_results"),
        help="Reframing results directory",
    )
    judge_parser.add_argument(
        "--stability-dir",
        type=Path,
        default=Path("experiments/stability_results"),
        help="Stability results directory",
    )
    judge_parser.add_argument(
        "--judge-model",
        type=str,
        default=None,
        help="Model to use as judge (default: cross-model judging)",
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
                print(f"    Analysis role: {case.analysis_role}")
                print(f"    Batteries: {', '.join(case.available_probe_batteries())}")
                print(f"    Expected update (on-framework): {case.expected_update_direction}")
                if case.off_framework_expected_update_direction is not None:
                    print(
                        f"    Expected update (off-framework): {case.off_framework_expected_update_direction}"
                    )
                print()
            return 0

        if args.case:
            case = get_stability_case(args.case)
            if not case:
                print(f"Case not found: {args.case}")
                return 1
            cases = [case]
        elif args.strongest_validation or args.primary_only:
            cases = get_primary_stability_cases()
        else:
            cases = get_all_stability_cases()

        model = args.model
        if args.strongest_validation and args.conditions is None:
            conditions = ["naive", "estimate_only", "format_control", "farness"]
        else:
            conditions = args.conditions
        if args.strongest_validation and args.probe_batteries is None:
            probe_batteries = ["on_framework", "off_framework"]
        else:
            probe_batteries = args.probe_batteries

        if args.output_dir:
            output_dir = args.output_dir
        elif args.strongest_validation:
            output_dir = Path(
                f"experiments/stability_validation/strongest/{model_short_name(model)}"
            )
        else:
            output_dir = Path(f"experiments/stability_results/{model_short_name(model)}")

        print(f"Running stability experiment: {len(cases)} cases, {args.runs} runs/condition")
        print(f"  Model: {model}")
        print(f"  Conditions: {conditions or ['naive', 'farness']}")
        print(f"  Probe batteries: {probe_batteries or ['on_framework']}")
        print(f"  Output: {output_dir}")
        print(f"  Starting at run {args.start_run}")

        experiment = run_stability_experiment(
            cases=cases,
            runs_per_condition=args.runs,
            output_dir=output_dir,
            verbose=True,
            random_seed=args.seed,
            start_run=args.start_run,
            model=model,
            conditions=conditions,
            probe_batteries=probe_batteries,
        )

        print_experiment_summary(experiment)
        print(f"\nResults saved to {output_dir}")

    elif args.command == "reframing":
        from farness.experiments.reframing import (
            REFRAMING_CASES,
            run_reframing_experiment,
            analyze_reframing,
            summary_table,
        )

        model = args.model
        conditions = args.conditions
        output_dir = args.output_dir or Path(f"experiments/reframing_results/{model_short_name(model)}")

        print(f"Running reframing experiment: {len(REFRAMING_CASES)} cases, {args.runs} runs/condition")
        print(f"  Model: {model}")
        print(f"  Conditions: {conditions or ['naive', 'farness']}")
        print(f"  Output: {output_dir}")

        results = run_reframing_experiment(
            runs_per_condition=args.runs,
            output_dir=output_dir,
            verbose=True,
            start_run=args.start_run,
            model=model,
            conditions=conditions,
        )

        analysis = analyze_reframing(results)
        print(summary_table(results))

        with open(output_dir / "summary.json", "w") as fh:
            json.dump(analysis, fh, indent=2)
        print(f"\nResults saved to {output_dir}")

    elif args.command == "reanalyze":
        _reanalyze(args)

    elif args.command == "judge":
        from farness.experiments.judge import run_judge_evaluation
        run_judge_evaluation(
            reframing_dir=args.reframing_dir,
            stability_dir=args.stability_dir,
            judge_model=args.judge_model,
        )

    else:
        parser.print_help()

    return 0


def _reanalyze(args):
    """Reanalyze results from saved JSON files, discovering model subdirectories."""
    from farness.experiments.stability import StabilityResult, StabilityExperiment
    from farness.experiments.reframing import ReframingResult, analyze_reframing, summary_table

    stability_base = Path(args.stability_dir)
    reframing_base = Path(args.reframing_dir)

    # Discover model subdirectories (or use flat dir for backward compat)
    def _find_result_dirs(base: Path) -> list[tuple[str, Path]]:
        """Return list of (model_name, dir_path) for result directories."""
        if not base.exists():
            return []
        # Check for model subdirectories
        subdirs = [d for d in base.iterdir() if d.is_dir() and not d.name.startswith(".")]
        if subdirs:
            return [(d.name, d) for d in sorted(subdirs)]
        # Flat directory (legacy) — treat as unknown model
        return [("claude-opus-4-6", base)]

    # Stability
    all_stability_results = []
    for model_name, sdir in _find_result_dirs(stability_base):
        results = []
        for f in sorted(sdir.glob("*_run*.json")):
            if f.name in ("summary.json", "experiment_metadata.json"):
                continue
            with open(f) as fh:
                data = json.load(fh)
            results.append(StabilityResult(
                case_id=data["case_id"],
                condition=data["condition"],
                probe_battery=data.get("probe_battery", "on_framework"),
                model=data.get("model", model_name),
                initial_estimate=data["initial_estimate"],
                initial_ci_low=data.get("initial_ci", [None, None])[0],
                initial_ci_high=data.get("initial_ci", [None, None])[1],
                final_estimate=data["final_estimate"],
                final_ci_low=data.get("final_ci", [None, None])[0],
                final_ci_high=data.get("final_ci", [None, None])[1],
            ))

        if results:
            print(f"\n{'='*60}")
            print(f"Stability results: {model_name} ({len(results)} results)")
            print(f"{'='*60}")
            experiment = StabilityExperiment(
                cases=get_all_stability_cases(),
                results=results,
            )
            print_experiment_summary(experiment)

            # Save updated summary
            analysis = experiment.analyze()
            analysis["model"] = model_name
            with open(sdir / "summary.json", "w") as fh:
                json.dump(analysis, fh, indent=2)
            with open(sdir / "results_table.md", "w") as fh:
                fh.write(f"# Stability experiment results ({model_name})\n\n")
                fh.write(f"**Total results**: {len(results)}\n\n")
                fh.write(experiment.summary_table())

            all_stability_results.extend(results)

    # Cross-model stability comparison
    if all_stability_results:
        models = sorted(set(r.model for r in all_stability_results))
        if len(models) > 1:
            print(f"\n{'='*60}")
            print(f"Cross-model stability comparison ({', '.join(models)})")
            print(f"{'='*60}")
            _cross_model_stability(all_stability_results, models, stability_base)

    # Reframing
    all_reframing_results = []
    for model_name, rdir in _find_result_dirs(reframing_base):
        results = []
        for f in sorted(rdir.glob("reframe_*.json")):
            if f.name in ("summary.json", "scores.json"):
                continue
            with open(f) as fh:
                data = json.load(fh)
            results.append(ReframingResult(
                case_id=data["case_id"],
                condition=data["condition"],
                run_number=data["run_number"],
                response_text=data.get("response_text", ""),
                timestamp=data.get("timestamp", ""),
                duration_seconds=data.get("duration_seconds", 0),
                model=data.get("model", model_name),
                reframe_count=data.get("reframe_count", 0),
                reframe_matches=data.get("reframe_matches", []),
                introduced_new_kpis=data.get("introduced_new_kpis", False),
                challenged_framing=data.get("challenged_framing", False),
            ))

        if results:
            print(f"\n{'='*60}")
            print(f"Reframing results: {model_name} ({len(results)} results)")
            print(f"{'='*60}")
            analysis = analyze_reframing(results)
            print(summary_table(results))

            analysis["model"] = model_name
            with open(rdir / "summary.json", "w") as fh:
                json.dump(analysis, fh, indent=2)

            all_reframing_results.extend(results)

    # Cross-model reframing comparison
    if all_reframing_results:
        models = sorted(set(r.model for r in all_reframing_results))
        if len(models) > 1:
            print(f"\n{'='*60}")
            print(f"Cross-model reframing comparison ({', '.join(models)})")
            print(f"{'='*60}")
            _cross_model_reframing(all_reframing_results, models)


def _cross_model_stability(results, models, base_dir):
    """Print cross-model comparison for stability results."""
    try:
        import numpy as np
        from scipy import stats as sp_stats
    except ImportError:
        print("Install scipy for cross-model comparison statistics")
        return

    for model in models:
        model_results = [r for r in results if r.model == model]
        conditions = sorted(set(r.condition for r in model_results))
        for cond in conditions:
            cond_results = [r for r in model_results if r.condition == cond]
            updates = [r.update_magnitude for r in cond_results]
            if updates:
                print(f"  {model}/{cond}: mean_update={np.mean(updates):.2f} (n={len(updates)})")

    # Pairwise model comparison for each condition
    conditions = sorted(set(r.condition for r in results))
    for cond in conditions:
        print(f"\n  Condition: {cond}")
        for i, m1 in enumerate(models):
            for m2 in models[i+1:]:
                u1 = [r.update_magnitude for r in results if r.model == m1 and r.condition == cond]
                u2 = [r.update_magnitude for r in results if r.model == m2 and r.condition == cond]
                if len(u1) >= 2 and len(u2) >= 2:
                    stat, p = sp_stats.mannwhitneyu(u1, u2, alternative='two-sided')
                    print(f"    {m1} vs {m2}: U={stat:.1f}, p={p:.3f}")


def _cross_model_reframing(results, models):
    """Print cross-model comparison for reframing results."""
    try:
        import numpy as np
        from scipy import stats as sp_stats
    except ImportError:
        print("Install scipy for cross-model comparison statistics")
        return

    for model in models:
        model_results = [r for r in results if r.model == model]
        conditions = sorted(set(r.condition for r in model_results))
        for cond in conditions:
            cond_results = [r for r in model_results if r.condition == cond]
            counts = [r.reframe_count for r in cond_results]
            if counts:
                print(f"  {model}/{cond}: mean_reframe={np.mean(counts):.2f} (n={len(counts)})")


if __name__ == "__main__":
    exit(main())
