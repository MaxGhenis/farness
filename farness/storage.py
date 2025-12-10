"""Decision storage and retrieval."""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional

from farness.framework import Decision


class DecisionStore:
    """Store and retrieve decisions from a JSONL file."""

    def __init__(self, path: Optional[Path] = None):
        if path is None:
            path = Path.home() / ".farness" / "decisions.jsonl"
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def save(self, decision: Decision) -> None:
        """Append a decision to the store."""
        with open(self.path, "a") as f:
            f.write(json.dumps(decision.to_dict()) + "\n")

    def update(self, decision: Decision) -> None:
        """Update an existing decision (rewrite the file)."""
        decisions = self.list_all()
        updated = False

        for i, d in enumerate(decisions):
            if d.id == decision.id:
                decisions[i] = decision
                updated = True
                break

        if not updated:
            decisions.append(decision)

        # Rewrite file
        with open(self.path, "w") as f:
            for d in decisions:
                f.write(json.dumps(d.to_dict()) + "\n")

    def get(self, decision_id: str) -> Optional[Decision]:
        """Get a decision by ID."""
        for decision in self.list_all():
            if decision.id == decision_id:
                return decision
        return None

    def list_all(self) -> list[Decision]:
        """List all decisions."""
        if not self.path.exists():
            return []

        decisions = []
        with open(self.path) as f:
            for line in f:
                line = line.strip()
                if line:
                    data = json.loads(line)
                    decisions.append(Decision.from_dict(data))
        return decisions

    def list_unscored(self) -> list[Decision]:
        """List decisions that haven't been scored yet."""
        return [d for d in self.list_all() if d.scored_at is None and d.chosen_option]

    def list_pending_review(self) -> list[Decision]:
        """List decisions past their review date that haven't been scored."""
        now = datetime.now()
        return [
            d for d in self.list_unscored()
            if d.review_date and d.review_date <= now
        ]

    def list_scored(self) -> list[Decision]:
        """List decisions that have been scored."""
        return [d for d in self.list_all() if d.scored_at is not None]
