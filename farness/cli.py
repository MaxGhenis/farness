"""Command-line interface for farness."""

import argparse
import sys
from datetime import datetime, timedelta

from farness import DecisionStore, CalibrationTracker


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

    args = parser.parse_args()
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
            status = "✓ scored" if d.scored_at else ("⏳ pending" if d.chosen_option else "○ open")
            print(f"  [{d.id[:8]}] {d.question[:50]} ({status})")

    elif args.command == "show":
        # Find by prefix
        decisions = store.list_all()
        matches = [d for d in decisions if d.id.startswith(args.id)]

        if not matches:
            print(f"No decision found with ID starting with '{args.id}'")
            sys.exit(1)
        if len(matches) > 1:
            print(f"Multiple matches for '{args.id}':")
            for d in matches:
                print(f"  {d.id}")
            sys.exit(1)

        d = matches[0]
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
                    print(f"    {kpi_name}: {f.point_estimate} ({ci_low}-{ci_high} @ {f.confidence_level:.0%})")

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

        if summary['coverage'] is not None:
            print(f"\nCoverage: {summary['coverage']:.1%}")
            print(f"Expected: {summary['expected_coverage']:.1%}")
            print(f"\n{summary['interpretation']}")

        if summary['mean_absolute_error'] is not None:
            print(f"\nMean absolute error: {summary['mean_absolute_error']:.2f}")

        if summary['mean_relative_error'] is not None:
            print(f"Mean relative error: {summary['mean_relative_error']:.1%}")

    elif args.command == "pending":
        pending = store.list_pending_review()
        if not pending:
            print("No decisions pending review.")
        else:
            print(f"{len(pending)} decision(s) ready for review:\n")
            for d in pending:
                days_past = (datetime.now() - d.review_date).days if d.review_date else 0
                print(f"  [{d.id[:8]}] {d.question[:50]}")
                print(f"           Review was {days_past} days ago")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
