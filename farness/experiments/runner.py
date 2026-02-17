"""Run the farness effectiveness experiment."""

from __future__ import annotations

import json
import random
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

from farness.experiments.cases import TestCase, get_all_cases
from farness.experiments.llm import call_llm
from farness.experiments.scorer import ResponseScore, ResponseScorer


@dataclass
class ExperimentRun:
    """A single experimental run."""

    case_id: str
    condition: str
    run_number: int
    prompt: str
    response: str
    timestamp: str
    duration_seconds: Optional[float] = None


NAIVE_TEMPLATE = """You are a helpful assistant. Answer this question directly:

"{scenario}"

Give your recommendation and reasoning."""

FARNESS_TEMPLATE = """You are a decision analyst using the "farness" framework. This framework requires you to:

1. Define explicit, measurable KPIs for the decision
2. Make numeric forecasts with confidence intervals for each option
3. Cite base rates from research (outside view) before adjusting with inside view
4. Identify cognitive biases that might be affecting the framing
5. Give a clear recommendation based on expected value
6. Set a review date to score the decision against actuals

Apply this framework to:

"{scenario}\""""


def generate_prompt(case: TestCase, condition: str) -> str:
    """Generate the prompt for a given case and condition."""
    template = NAIVE_TEMPLATE if condition == "naive" else FARNESS_TEMPLATE
    return template.format(scenario=case.scenario.strip())


def run_single(
    case: TestCase,
    condition: str,
    run_number: int,
    timeout: int = 120,
) -> ExperimentRun:
    """Run a single experimental trial using Claude CLI.

    Args:
        case: The test case
        condition: "naive" or "farness"
        run_number: Which run this is
        timeout: Max seconds to wait for response

    Returns:
        ExperimentRun with prompt and response
    """
    prompt = generate_prompt(case, condition)
    timestamp = datetime.now().isoformat()

    response, duration = call_llm(prompt, timeout=float(timeout))

    return ExperimentRun(
        case_id=case.id,
        condition=condition,
        run_number=run_number,
        prompt=prompt,
        response=response,
        timestamp=timestamp,
        duration_seconds=duration,
    )


def run_experiment(
    cases: Optional[list[TestCase]] = None,
    runs_per_condition: int = 3,
    output_dir: Optional[Path] = None,
    randomize_order: bool = True,
    verbose: bool = True,
) -> list[ExperimentRun]:
    """Run the full experiment.

    Args:
        cases: Test cases to run (default: all)
        runs_per_condition: How many times to run each case per condition
        output_dir: Where to save results
        randomize_order: Whether to randomize run order
        verbose: Print progress

    Returns:
        List of all experimental runs
    """
    if cases is None:
        cases = get_all_cases()

    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    # Generate all trials
    trials = []
    for case in cases:
        for condition in ["naive", "farness"]:
            for run_num in range(1, runs_per_condition + 1):
                trials.append((case, condition, run_num))

    if randomize_order:
        random.shuffle(trials)

    # Run trials
    runs = []
    total = len(trials)
    for i, (case, condition, run_num) in enumerate(trials):
        if verbose:
            print(f"[{i+1}/{total}] {case.id} - {condition} - run {run_num}")

        run = run_single(case, condition, run_num)
        runs.append(run)

        # Save incrementally
        if output_dir:
            run_file = output_dir / f"{case.id}_{condition}_{run_num}.json"
            with open(run_file, "w") as f:
                json.dump(
                    {
                        "case_id": run.case_id,
                        "condition": run.condition,
                        "run_number": run.run_number,
                        "prompt": run.prompt,
                        "response": run.response,
                        "timestamp": run.timestamp,
                        "duration_seconds": run.duration_seconds,
                    },
                    f,
                    indent=2,
                )

    return runs


def score_runs(runs: list[ExperimentRun], cases: list[TestCase]) -> list[ResponseScore]:
    """Score all experimental runs.

    Args:
        runs: Experimental runs to score
        cases: Test cases (for ground truth)

    Returns:
        List of ResponseScore objects
    """
    case_map = {c.id: c for c in cases}
    scores = []

    for run in runs:
        if run.response.startswith("ERROR:"):
            continue

        case = case_map.get(run.case_id)
        if not case:
            continue

        scorer = ResponseScorer(case)
        score = scorer.score(
            response_text=run.response,
            condition=run.condition,
            run_number=run.run_number,
        )
        scores.append(score)

    return scores


def generate_prompts_for_manual_run(
    cases: Optional[list[TestCase]] = None,
    output_file: Optional[Path] = None,
) -> list[dict]:
    """Generate prompts for manual running (e.g., in Claude UI).

    Useful when CLI access isn't available.

    Args:
        cases: Test cases (default: all)
        output_file: Optional file to save prompts

    Returns:
        List of prompt dicts with case_id, condition, prompt
    """
    if cases is None:
        cases = get_all_cases()

    prompts = []
    for case in cases:
        for condition in ["naive", "farness"]:
            prompts.append({
                "case_id": case.id,
                "condition": condition,
                "prompt": generate_prompt(case, condition),
            })

    if output_file:
        output_file = Path(output_file)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, "w") as f:
            json.dump(prompts, f, indent=2)

    return prompts


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run farness experiment")
    parser.add_argument(
        "--generate-prompts",
        action="store_true",
        help="Just generate prompts for manual running",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("experiments/results"),
        help="Output directory for results",
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=3,
        help="Runs per condition",
    )
    parser.add_argument(
        "--case",
        type=str,
        help="Run only a specific case by ID",
    )

    args = parser.parse_args()

    from farness.experiments.cases import get_case

    if args.case:
        case = get_case(args.case)
        if not case:
            print(f"Case not found: {args.case}")
            exit(1)
        cases = [case]
    else:
        cases = get_all_cases()

    if args.generate_prompts:
        prompts = generate_prompts_for_manual_run(
            cases=cases,
            output_file=args.output_dir / "prompts.json",
        )
        print(f"Generated {len(prompts)} prompts")
        for p in prompts:
            print(f"  - {p['case_id']} ({p['condition']})")
    else:
        runs = run_experiment(
            cases=cases,
            runs_per_condition=args.runs,
            output_dir=args.output_dir,
        )
        print(f"\nCompleted {len(runs)} runs")

        # Score them
        scores = score_runs(runs, cases)
        print(f"Scored {len(scores)} responses")

        # Save scores
        scores_file = args.output_dir / "scores.json"
        with open(scores_file, "w") as f:
            json.dump([s.to_dict() for s in scores], f, indent=2)
        print(f"Saved scores to {scores_file}")
