"""Command-line interface for farness."""

import argparse
import sys
from datetime import datetime

from farness import Decision, DecisionStore, CalibrationTracker
from farness.agent_setup import inspect_agent_setup, remove_agent_setup, repair_agent_setup, setup_agent
from farness.skills import install_skill


def main():
    parser = argparse.ArgumentParser(
        prog="farness",
        description="Forecasting as a harness for decision-making",
    )
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # List decisions
    list_parser = subparsers.add_parser("list", help="List decisions")
    list_parser.add_argument(
        "--unscored", action="store_true", help="Show only unscored decisions"
    )
    list_parser.add_argument(
        "--pending", action="store_true", help="Show only decisions pending review"
    )

    # Show a decision
    show_parser = subparsers.add_parser("show", help="Show decision details")
    show_parser.add_argument("id", help="Decision ID (or prefix)")

    # Calibration stats
    subparsers.add_parser("calibration", help="Show calibration statistics")

    # Pending reviews
    subparsers.add_parser("pending", help="Show decisions pending review")

    # Create a new decision
    new_parser = subparsers.add_parser("new", help="Create a new decision")
    new_parser.add_argument("question", help="The decision question")
    new_parser.add_argument("--context", default="", help="Additional context")

    # Score a decision
    score_parser = subparsers.add_parser("score", help="Score a decision's outcomes")
    score_parser.add_argument("id", nargs="?", help="Decision ID (or prefix)")

    install_skill_parser = subparsers.add_parser(
        "install-skill", help="Install the packaged Codex or Claude skill"
    )
    install_skill_parser.add_argument(
        "agent", choices=["codex", "claude"], help="Agent skill to install"
    )
    install_skill_parser.add_argument(
        "--target",
        help=(
            "Optional target skill directory. Defaults to "
            "$CODEX_HOME/skills/farness (or ~/.codex/skills/farness) for Codex, "
            "or ~/.claude/skills/farness for Claude."
        ),
    )
    install_skill_parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite an existing skill with different contents",
    )

    uninstall_parser = subparsers.add_parser(
        "uninstall", help="Remove the packaged skill and MCP setup for Codex or Claude"
    )
    uninstall_parser.add_argument(
        "agent", choices=["codex", "claude"], help="Agent to remove"
    )
    uninstall_parser.add_argument(
        "--target",
        help=(
            "Optional target skill directory. Defaults to "
            "$CODEX_HOME/skills/farness (or ~/.codex/skills/farness) for Codex, "
            "or ~/.claude/skills/farness for Claude."
        ),
    )
    uninstall_parser.add_argument(
        "--keep-mcp",
        action="store_true",
        help="Remove the local skill only and leave the MCP server registration intact",
    )

    setup_parser = subparsers.add_parser(
        "setup", help="Install the skill and configure MCP for Codex or Claude"
    )
    setup_parser.add_argument(
        "agent", choices=["codex", "claude"], help="Agent to configure"
    )
    setup_parser.add_argument(
        "--target",
        help=(
            "Optional target skill directory. Defaults to "
            "$CODEX_HOME/skills/farness (or ~/.codex/skills/farness) for Codex, "
            "or ~/.claude/skills/farness for Claude."
        ),
    )
    setup_parser.add_argument(
        "--force-skill",
        action="store_true",
        help="Overwrite an existing skill with different contents",
    )
    setup_parser.add_argument(
        "--python-bin",
        help=(
            "Override the Python interpreter used for MCP registration. "
            "Defaults to the current interpreter."
        ),
    )

    doctor_parser = subparsers.add_parser(
        "doctor", help="Check local Codex or Claude skill and MCP setup"
    )
    doctor_parser.add_argument(
        "agent", choices=["codex", "claude"], help="Agent to inspect"
    )
    doctor_parser.add_argument(
        "--target",
        help=(
            "Optional target skill directory. Defaults to "
            "$CODEX_HOME/skills/farness (or ~/.codex/skills/farness) for Codex, "
            "or ~/.claude/skills/farness for Claude."
        ),
    )
    doctor_parser.add_argument(
        "--python-bin",
        help=(
            "Override the Python interpreter shown in the manual MCP command. "
            "Defaults to the current interpreter."
        ),
    )
    doctor_parser.add_argument(
        "--fix",
        action="store_true",
        help="Repair a missing or modified skill and register MCP if the agent CLI is available",
    )

    args = parser.parse_args()

    if args.command == "install-skill":
        try:
            skill_path = install_skill(args.agent, args.target, args.force)
        except FileExistsError as exc:
            print(str(exc))
            sys.exit(1)

        print(f"Installed {args.agent} skill at {skill_path}")
        print("Restart the agent so it picks up the new skill.")
        return

    if args.command == "uninstall":
        try:
            result = remove_agent_setup(
                args.agent,
                target_dir=args.target,
                remove_mcp=not args.keep_mcp,
            )
        except RuntimeError as exc:
            print(str(exc))
            sys.exit(1)

        if result.skill_removed:
            print(f"Removed {args.agent} skill at {result.skill_path}")
        else:
            print(f"No {args.agent} skill found at {result.skill_path}")

        if args.keep_mcp:
            print(f"Left MCP server `{result.mcp_server_name}` configured.")
        elif result.mcp_removed:
            print(f"Removed MCP server `{result.mcp_server_name}` from {result.agent_cli}.")
        elif result.cli_path is None:
            print(
                f"Could not verify MCP removal because the `{result.agent_cli}` CLI "
                "was not found on PATH."
            )
        else:
            print(f"No MCP server `{result.mcp_server_name}` was configured in {result.agent_cli}.")
        return

    if args.command == "setup":
        try:
            result = setup_agent(
                args.agent,
                target_dir=args.target,
                force_skill=args.force_skill,
                python_bin=args.python_bin,
            )
        except RuntimeError as exc:
            print(str(exc))
            sys.exit(1)

        print(f"Installed {args.agent} skill at {result.skill_path}")
        if result.mcp_already_configured:
            print(
                f"MCP server `{result.mcp_server_name}` is already configured "
                f"in {result.agent_cli}."
            )
        else:
            print(
                f"Configured MCP server `{result.mcp_server_name}` in "
                f"{result.agent_cli} using {result.python_bin}."
            )
        print("Restart the agent so it picks up the new skill and MCP server.")
        return

    if args.command == "doctor":
        if args.fix:
            try:
                repaired = repair_agent_setup(
                    args.agent,
                    target_dir=args.target,
                    python_bin=args.python_bin,
                )
            except RuntimeError as exc:
                print(str(exc))
                sys.exit(1)

            print(f"Applied fixes for {args.agent}:")
            print(f"  Skill: {repaired.skill_action}")
            if repaired.mcp_action == "skipped":
                print(f"  MCP: skipped ({repaired.agent_cli} CLI not found)")
            else:
                print(f"  MCP: {repaired.mcp_action}")

        result = inspect_agent_setup(
            args.agent,
            target_dir=args.target,
            python_bin=args.python_bin,
        )

        print(f"Agent: {args.agent}")
        print(f"Skill path: {result.skill_path}")
        print(f"Skill status: {result.skill_state}")
        print(f"CLI found: {result.cli_path or 'no'}")
        print(
            f"MCP server `{result.mcp_server_name}` configured: "
            f"{'yes' if result.mcp_configured else 'no'}"
        )

        if result.skill_state == "installed" and result.mcp_configured:
            print("Status: ready. Restart the agent if it was already open.")
            return

        print("Recommended next step:")
        if result.skill_state == "missing" and not result.mcp_configured and result.cli_path:
            print(f"  farness setup {args.agent}")
        elif result.skill_state == "missing":
            print(f"  farness install-skill {args.agent}")
            if result.cli_path is None:
                print(f"  Then install the {args.agent} CLI and run:")
                print(f"  {result.manual_command}")
        elif result.skill_state == "modified":
            print(f"  farness doctor {args.agent} --fix")
        elif result.cli_path is None:
            print(f"  Install the {args.agent} CLI and run:")
            print(f"  {result.manual_command}")
        elif not result.mcp_configured:
            print(f"  {result.manual_command}")
        return

    store = DecisionStore()

    if args.command == "list":
        if args.pending:
            decisions = store.list_pending_review()
            print(f"Decisions pending review ({len(decisions)}):\n")
        elif args.unscored:
            decisions = store.list_unscored()
            print(f"Unscored decisions ({len(decisions)}):\n")
        else:
            decisions = store.list_all()
            print(f"All decisions ({len(decisions)}):\n")

        for d in decisions:
            status = (
                "✓ scored"
                if d.scored_at
                else ("⏳ pending" if d.chosen_option else "○ open")
            )
            print(f"  [{d.id[:8]}] {d.question[:50]} ({status})")

    elif args.command == "new":
        decision = Decision(question=args.question, context=args.context)
        store.save(decision)
        print(f"Created decision [{decision.id[:8]}]: {decision.question}")

    elif args.command == "show":
        d = store.get(args.id)
        if not d:
            # Check if multiple matches for better error message
            all_decisions = store.list_all()
            matches = [dd for dd in all_decisions if dd.id.startswith(args.id)]
            if len(matches) > 1:
                print(f"Multiple matches for '{args.id}':")
                for dd in matches:
                    print(f"  {dd.id}")
            else:
                print(f"No decision found with ID starting with '{args.id}'")
            sys.exit(1)
        print(f"Decision: {d.question}")
        print(f"ID: {d.id}")
        print(f"Created: {d.created_at.strftime('%Y-%m-%d %H:%M')}")

        if d.kpis:
            print(f"\nKPIs:")
            for k in d.kpis:
                print(f"  - {k.name}: {k.description}")

        if d.options:
            print(f"\nOptions:")
            for o in d.options:
                print(f"\n  {o.name}: {o.description}")
                for kpi_name, f in o.forecasts.items():
                    ci_low, ci_high = f.confidence_interval
                    print(
                        f"    {kpi_name}: {f.point_estimate} ({ci_low}-{ci_high} @ {f.confidence_level:.0%})"
                    )

        if d.chosen_option:
            print(f"\nChosen: {d.chosen_option}")

        if d.actual_outcomes:
            print(f"\nActual outcomes:")
            for k, v in d.actual_outcomes.items():
                print(f"  {k}: {v}")

    elif args.command == "calibration":
        tracker = CalibrationTracker(store.list_all())
        summary = tracker.summary()

        print("Calibration Summary")
        print("=" * 40)
        print(f"Decisions scored: {summary['n_decisions']}")
        print(f"Forecasts scored: {summary['n_forecasts']}")

        if summary["coverage"] is not None:
            print(f"\nCoverage: {summary['coverage']:.1%}")
            print(f"Expected: {summary['expected_coverage']:.1%}")
            print(f"\n{summary['interpretation']}")

        if summary["mean_absolute_error"] is not None:
            print(f"\nMean absolute error: {summary['mean_absolute_error']:.2f}")

        if summary["mean_relative_error"] is not None:
            print(f"Mean relative error: {summary['mean_relative_error']:.1%}")

    elif args.command == "pending":
        pending = store.list_pending_review()
        if not pending:
            print("No decisions pending review.")
        else:
            print(f"{len(pending)} decision(s) ready for review:\n")
            for d in pending:
                days_past = (
                    (datetime.now() - d.review_date).days if d.review_date else 0
                )
                print(f"  [{d.id[:8]}] {d.question[:50]}")
                print(f"           Review was {days_past} days ago")

    elif args.command == "score":
        # Find the decision to score
        if args.id:
            decisions = store.list_all()
            matches = [d for d in decisions if d.id.startswith(args.id)]
        else:
            # Show unscored decisions and prompt
            matches = store.list_unscored()
            if not matches:
                print("No unscored decisions to score.")
                sys.exit(0)
            print("Unscored decisions:\n")
            for i, d in enumerate(matches, 1):
                print(f"  {i}. [{d.id[:8]}] {d.question[:50]}")
            print()
            try:
                choice = input("Enter number to score (or q to quit): ").strip()
                if choice.lower() == "q":
                    sys.exit(0)
                idx = int(choice) - 1
                if 0 <= idx < len(matches):
                    matches = [matches[idx]]
                else:
                    print("Invalid selection.")
                    sys.exit(1)
            except (ValueError, EOFError):
                print("Invalid input.")
                sys.exit(1)

        if not matches:
            print(f"No decision found with ID starting with '{args.id}'")
            sys.exit(1)
        if len(matches) > 1:
            print(f"Multiple matches for '{args.id}':")
            for d in matches:
                print(f"  {d.id}")
            sys.exit(1)

        d = matches[0]

        if d.scored_at:
            print(f"Decision [{d.id[:8]}] has already been scored.")
            sys.exit(1)

        if not d.chosen_option:
            print(f"Decision [{d.id[:8]}] has no chosen option yet.")
            sys.exit(1)

        # Find the chosen option
        chosen = None
        for opt in d.options:
            if opt.name == d.chosen_option:
                chosen = opt
                break

        if not chosen:
            print(f"Chosen option '{d.chosen_option}' not found in decision.")
            sys.exit(1)

        # Display decision and forecasts
        print(f"\nScoring: {d.question}")
        print(f"Chosen option: {d.chosen_option}")
        print(f"\nOriginal forecasts:")
        for kpi in d.kpis:
            if kpi.name in chosen.forecasts:
                f = chosen.forecasts[kpi.name]
                ci_low, ci_high = f.confidence_interval
                unit = f" {kpi.unit}" if kpi.unit else ""
                print(
                    f"  {kpi.name}: {f.point_estimate}{unit} ({ci_low}-{ci_high} @ {f.confidence_level:.0%})"
                )

        # Gather actual outcomes
        print(f"\nEnter actual outcomes:")
        actual_outcomes = {}
        for kpi in d.kpis:
            if kpi.name in chosen.forecasts:
                unit = f" ({kpi.unit})" if kpi.unit else ""
                try:
                    value = input(f"  {kpi.name}{unit}: ").strip()
                    if value:
                        actual_outcomes[kpi.name] = float(value)
                except (ValueError, EOFError):
                    print(f"  Skipping {kpi.name} (invalid input)")

        if not actual_outcomes:
            print("\nNo outcomes entered. Aborting.")
            sys.exit(1)

        # Optional reflections
        print()
        try:
            reflections = input("Reflections (optional, press Enter to skip): ").strip()
        except EOFError:
            reflections = ""

        # Update decision
        d.actual_outcomes = actual_outcomes
        d.scored_at = datetime.now()
        d.reflections = reflections
        store.update(d)

        # Show results
        print(f"\nDecision scored!")
        print(f"\nResults:")
        for kpi_name, actual in actual_outcomes.items():
            f = chosen.forecasts[kpi_name]
            ci_low, ci_high = f.confidence_interval
            in_ci = "✓" if ci_low <= actual <= ci_high else "✗"
            error = actual - f.point_estimate
            print(
                f"  {kpi_name}: predicted {f.point_estimate}, actual {actual} (error: {error:+.2f}) {in_ci}"
            )

        # Show updated calibration
        tracker = CalibrationTracker(store.list_all())
        if tracker.scores:
            print(
                f"\nCalibration: {tracker.coverage:.0%} coverage ({tracker.expected_coverage:.0%} expected)"
            )

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
