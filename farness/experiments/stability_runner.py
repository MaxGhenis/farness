"""Runner for stability-under-probing experiments.

Implements randomization and blinding as described in methodology:
- Condition order is randomized per case
- Extraction functions operate on anonymized responses (blinding)
- Random seed is logged for reproducibility
"""

from __future__ import annotations

import json
import random
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from farness.experiments.llm import call_llm, model_short_name
from farness.experiments.stability import (
    DEFAULT_PROBE_BATTERY,
    QuantitativeCase,
    StabilityResult,
    StabilityExperiment,
    extract_estimate,
    extract_ci,
    format_probe_battery_name,
    generate_probe_prompt,
    generate_initial_prompt,
    get_all_stability_cases,
    get_stability_case,
)


def run_prompt(prompt: str, model: str = "claude-opus-4-6", timeout: int = 180) -> str:
    """Run a prompt through the LLM API."""
    response, _ = call_llm(prompt, model=model, timeout=float(timeout))
    return response


def _extract_estimate_or_raise(response: str, unit: str, phase: str) -> float:
    """Extract estimate from response, falling back to first number found.

    Raises ValueError if no number can be extracted.
    """
    estimate = extract_estimate(response, unit)
    if estimate is not None:
        return estimate

    numbers = re.findall(r'\b(\d+\.?\d*)\b', response)
    if numbers:
        return float(numbers[0])

    raise ValueError(
        f"Could not extract {phase} estimate from response: {response[:200]}"
    )


def run_single_stability_test(
    case: QuantitativeCase,
    condition: str,
    probe_battery: str = DEFAULT_PROBE_BATTERY,
    model: str = "claude-opus-4-6",
    verbose: bool = True,
) -> StabilityResult:
    """Run a single stability test (initial + probing).

    Args:
        case: The quantitative case to test
        condition: Prompt condition to test
        probe_battery: Probe battery to use
        model: LLM model ID
        verbose: Print progress

    Returns:
        StabilityResult with initial and final estimates
    """
    if verbose:
        print(
            f"  [{condition} | {format_probe_battery_name(probe_battery)}] Running initial prompt..."
        )

    # Phase 1: Initial prompt
    initial_prompt = generate_initial_prompt(case, condition)

    initial_response = run_prompt(initial_prompt, model=model)

    if initial_response.startswith("ERROR:"):
        raise RuntimeError(f"Initial prompt failed: {initial_response}")

    # Extract initial estimate
    initial_estimate = _extract_estimate_or_raise(initial_response, case.estimate_unit, "initial")
    initial_ci_low, initial_ci_high = extract_ci(initial_response)

    if verbose:
        ci_str = f" (CI: {initial_ci_low}-{initial_ci_high})" if initial_ci_low else ""
        print(f"    Initial: {initial_estimate}{case.estimate_unit}{ci_str}")

    # Phase 2: Probing
    if verbose:
        print(
            f"  [{condition} | {format_probe_battery_name(probe_battery)}] Running probing prompt..."
        )

    probe_prompt = generate_probe_prompt(
        case,
        initial_estimate,
        (initial_ci_low, initial_ci_high) if initial_ci_low else None,
        condition,
        probe_battery=probe_battery,
    )

    final_response = run_prompt(probe_prompt, model=model)

    if final_response.startswith("ERROR:"):
        raise RuntimeError(f"Probe prompt failed: {final_response}")

    # Extract final estimate
    final_estimate = _extract_estimate_or_raise(final_response, case.estimate_unit, "final")
    final_ci_low, final_ci_high = extract_ci(final_response)

    if verbose:
        ci_str = f" (CI: {final_ci_low}-{final_ci_high})" if final_ci_low else ""
        print(f"    Final: {final_estimate}{case.estimate_unit}{ci_str}")
        print(f"    Update: {final_estimate - initial_estimate:+.2f}{case.estimate_unit}")

    return StabilityResult(
        case_id=case.id,
        condition=condition,
        probe_battery=probe_battery,
        model=model,
        initial_estimate=initial_estimate,
        initial_ci_low=initial_ci_low,
        initial_ci_high=initial_ci_high,
        initial_response_text=initial_response,
        final_estimate=final_estimate,
        final_ci_low=final_ci_low,
        final_ci_high=final_ci_high,
        final_response_text=final_response,
    )


def run_stability_experiment(
    cases: Optional[list[QuantitativeCase]] = None,
    runs_per_condition: int = 1,
    output_dir: Optional[Path] = None,
    verbose: bool = True,
    random_seed: Optional[int] = None,
    randomize_order: bool = True,
    start_run: int = 1,
    model: str = "claude-opus-4-6",
    conditions: Optional[list[str]] = None,
    probe_batteries: Optional[list[str]] = None,
) -> StabilityExperiment:
    """Run the full stability experiment with randomization.

    Args:
        cases: Cases to test (default: all)
        runs_per_condition: How many times to run each case per condition
        output_dir: Where to save results
        verbose: Print progress
        random_seed: Seed for reproducibility (default: timestamp-based)
        randomize_order: Whether to randomize condition order per case

    Returns:
        StabilityExperiment with all results
    """
    if cases is None:
        cases = get_all_stability_cases()

    # Set random seed for reproducibility
    if random_seed is None:
        random_seed = int(datetime.now().timestamp() * 1000) % (2**31)
    random.seed(random_seed)

    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    if conditions is None:
        conditions = ["naive", "farness"]
    if probe_batteries is None:
        probe_batteries = [DEFAULT_PROBE_BATTERY]

    for case in cases:
        missing_batteries = [
            battery
            for battery in probe_batteries
            if battery not in case.available_probe_batteries()
        ]
        if missing_batteries:
            raise ValueError(
                f"Case {case.id} does not support probe batteries: {', '.join(missing_batteries)}"
            )

    experiment = StabilityExperiment(cases=cases)

    # Metadata for reproducibility
    metadata = {
        "random_seed": random_seed,
        "randomize_order": randomize_order,
        "runs_per_condition": runs_per_condition,
        "n_cases": len(cases),
        "case_ids": [c.id for c in cases],
        "conditions": conditions,
        "probe_batteries": probe_batteries,
        "model": model,
        "started_at": datetime.now().isoformat(),
        "test_orders": {},  # Log randomized condition/battery order per case
    }

    total_tests = len(cases) * len(conditions) * len(probe_batteries) * runs_per_condition
    test_num = 0

    for case in cases:
        if verbose:
            print(f"\n{'='*60}")
            print(f"Case: {case.name}")
            print(f"{'='*60}")

        for run_offset in range(runs_per_condition):
            run_num = start_run + run_offset
            test_pairs = [
                (condition, probe_battery)
                for probe_battery in probe_batteries
                for condition in conditions
            ]
            if randomize_order:
                random.shuffle(test_pairs)

            run_key = f"{case.id}_run{run_num}"
            metadata["test_orders"][run_key] = [
                {"condition": condition, "probe_battery": probe_battery}
                for condition, probe_battery in test_pairs
            ]

            for condition, probe_battery in test_pairs:
                test_num += 1
                if verbose:
                    print(
                        f"\n[{test_num}/{total_tests}] {case.id} - {condition} - {probe_battery} - run {run_num}"
                    )

                try:
                    result = run_single_stability_test(
                        case,
                        condition,
                        probe_battery=probe_battery,
                        model=model,
                        verbose=verbose,
                    )
                    experiment.results.append(result)

                    # Save incrementally
                    if output_dir:
                        result_file = output_dir / (
                            f"{case.id}_{probe_battery}_{condition}_run{run_num}.json"
                        )
                        with open(result_file, "w") as f:
                            json.dump(result.to_dict(), f, indent=2)

                except Exception as e:
                    print(f"    ERROR: {e}")
                    continue

    metadata["completed_at"] = datetime.now().isoformat()
    metadata["n_results"] = len(experiment.results)

    # Save summary and metadata
    if output_dir:
        # Save metadata for reproducibility
        metadata_file = output_dir / "experiment_metadata.json"
        with open(metadata_file, "w") as f:
            json.dump(metadata, f, indent=2)

        summary_file = output_dir / "summary.json"
        analysis = experiment.analyze()
        analysis["metadata"] = metadata
        with open(summary_file, "w") as f:
            json.dump(analysis, f, indent=2)

        table_file = output_dir / "results_table.md"
        with open(table_file, "w") as f:
            f.write(f"# Stability Experiment Results\n\n")
            f.write(f"**Random seed**: {random_seed}\n")
            f.write(f"**Runs per condition**: {runs_per_condition}\n\n")
            f.write(experiment.summary_table())

    if verbose:
        print(f"\n[Experiment metadata]")
        print(f"  Random seed: {random_seed}")
        print(f"  Randomize order: {randomize_order}")

    return experiment


def print_experiment_summary(experiment: StabilityExperiment) -> None:
    """Print a formatted summary of experiment results."""
    print("\n" + "=" * 70)
    print("STABILITY-UNDER-PROBING EXPERIMENT RESULTS")
    print("=" * 70)
    print(experiment.summary_table())
    print("\n" + "=" * 70)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run stability-under-probing experiment")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("experiments/stability_results"),
        help="Output directory",
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=1,
        help="Runs per condition",
    )
    parser.add_argument(
        "--case",
        type=str,
        help="Run specific case only",
    )
    parser.add_argument(
        "--list-cases",
        action="store_true",
        help="List available cases",
    )
    parser.add_argument(
        "--seed",
        type=int,
        help="Random seed for reproducibility",
    )
    parser.add_argument(
        "--no-randomize",
        action="store_true",
        help="Don't randomize condition order",
    )
    parser.add_argument(
        "--start-run",
        type=int,
        default=1,
        help="Starting run number (for appending to existing results)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="claude-opus-4-6",
        help="Model ID (e.g. claude-opus-4-6, gpt-5.2)",
    )
    parser.add_argument(
        "--conditions",
        type=str,
        nargs="+",
        default=None,
        help="Conditions to test (default: naive farness)",
    )

    args = parser.parse_args()

    if args.list_cases:
        print("Available stability test cases:\n")
        for case in get_all_stability_cases():
            print(f"  {case.id}")
            print(f"    {case.name} ({case.domain})")
            print(f"    Estimate: {case.estimate_unit}")
            print(f"    Expected update: {case.expected_update_direction}")
            print()
        exit(0)

    if args.case:
        case = get_stability_case(args.case)
        if not case:
            print(f"Case not found: {args.case}")
            exit(1)
        cases = [case]
    else:
        cases = get_all_stability_cases()

    print(f"Running stability experiment with {len(cases)} cases, {args.runs} runs per condition")
    if args.seed:
        print(f"Using random seed: {args.seed}")

    experiment = run_stability_experiment(
        cases=cases,
        runs_per_condition=args.runs,
        output_dir=args.output_dir,
        verbose=True,
        random_seed=args.seed,
        randomize_order=not args.no_randomize,
        start_run=args.start_run,
        model=args.model,
        conditions=args.conditions,
    )

    print_experiment_summary(experiment)
    print(f"\nResults saved to {args.output_dir}")
