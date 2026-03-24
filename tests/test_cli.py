"""Tests for CLI commands."""

import pytest
import tempfile
from pathlib import Path
from unittest.mock import patch
import sys

from farness.framework import Decision, KPI, Option, Forecast
from farness.storage import DecisionStore
from farness.cli import main


@pytest.fixture
def temp_store():
    """Create a temporary decision store."""
    with tempfile.TemporaryDirectory() as tmpdir:
        path = Path(tmpdir) / "decisions.jsonl"
        yield DecisionStore(path)


class TestNewCommand:
    """Tests for `farness new` CLI command."""

    def test_new_creates_decision(self, temp_store):
        """farness new 'question' should create and save a decision."""
        with patch("farness.cli.DecisionStore", return_value=temp_store):
            with patch("sys.argv", ["farness", "new", "Should I take this job?"]):
                main()

        decisions = temp_store.list_all()
        assert len(decisions) == 1
        assert decisions[0].question == "Should I take this job?"

    def test_new_with_context(self, temp_store):
        """farness new 'question' --context 'details' should include context."""
        with patch("farness.cli.DecisionStore", return_value=temp_store):
            with patch(
                "sys.argv",
                ["farness", "new", "Which city?", "--context", "Considering SF vs NYC"],
            ):
                main()

        decisions = temp_store.list_all()
        assert len(decisions) == 1
        assert decisions[0].context == "Considering SF vs NYC"

    def test_new_prints_id(self, temp_store, capsys):
        """farness new should print the new decision ID."""
        with patch("farness.cli.DecisionStore", return_value=temp_store):
            with patch("sys.argv", ["farness", "new", "Test question"]):
                main()

        output = capsys.readouterr().out
        decisions = temp_store.list_all()
        # Output should contain the decision ID (at least prefix)
        assert decisions[0].id[:8] in output

    def test_new_without_question_fails(self, capsys):
        """farness new without a question should fail."""
        with patch("sys.argv", ["farness", "new"]):
            with pytest.raises(SystemExit):
                main()


class TestShowWithPrefix:
    """Tests for prefix matching in show command."""

    def test_show_finds_by_prefix(self, temp_store, capsys):
        """farness show <prefix> should find decision by ID prefix."""
        d = Decision(question="Test decision for show")
        temp_store.save(d)
        prefix = d.id[:8]

        with patch("farness.cli.DecisionStore", return_value=temp_store):
            with patch("sys.argv", ["farness", "show", prefix]):
                main()

        output = capsys.readouterr().out
        assert "Test decision for show" in output


class TestInstallSkillCommand:
    """Tests for the packaged skill installer."""

    def test_install_skill_writes_codex_skill(self, tmp_path, capsys):
        """farness install-skill codex should create a SKILL.md file."""
        target = tmp_path / "codex-skill"

        with patch("sys.argv", ["farness", "install-skill", "codex", "--target", str(target)]):
            main()

        skill_path = target / "SKILL.md"
        assert skill_path.exists()
        assert "Use this skill to turn vague decisions into forecastable choices." in skill_path.read_text()
        output = capsys.readouterr().out
        assert str(skill_path) in output

    def test_install_skill_refuses_overwrite_without_force(self, tmp_path, capsys):
        """install-skill should fail rather than overwrite different contents by default."""
        target = tmp_path / "claude-skill"
        target.mkdir(parents=True)
        (target / "SKILL.md").write_text("different")

        with patch(
            "sys.argv", ["farness", "install-skill", "claude", "--target", str(target)]
        ):
            with pytest.raises(SystemExit):
                main()

        output = capsys.readouterr().out
        assert "--force" in output

    def test_install_skill_force_overwrites(self, tmp_path):
        """install-skill --force should replace a different existing skill."""
        target = tmp_path / "claude-skill"
        target.mkdir(parents=True)
        skill_path = target / "SKILL.md"
        skill_path.write_text("different")

        with patch(
            "sys.argv",
            ["farness", "install-skill", "claude", "--target", str(target), "--force"],
        ):
            main()

        assert "Prefer the local `farness` MCP server" in skill_path.read_text()
