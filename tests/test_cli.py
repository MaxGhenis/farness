import tempfile
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from farness.cli import main
from farness.framework import Decision
from farness.skills import default_skill_dir
from farness.storage import DecisionStore


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

        with patch(
            "sys.argv", ["farness", "install-skill", "codex", "--target", str(target)]
        ):
            main()

        skill_path = target / "SKILL.md"
        assert skill_path.exists()
        assert (
            "Use this skill to turn vague decisions into forecastable choices."
            in skill_path.read_text()
        )
        output = capsys.readouterr().out
        assert str(skill_path) in output

    def test_install_skill_refuses_overwrite_without_force(self, tmp_path, capsys):
        """install-skill should fail rather than overwrite different contents."""
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

    def test_codex_default_skill_dir_respects_codex_home(self, monkeypatch, tmp_path):
        """Default Codex install path should use CODEX_HOME when it is set."""
        monkeypatch.setenv("CODEX_HOME", str(tmp_path / "codex-home"))

        skill_dir = default_skill_dir("codex")

        assert skill_dir == tmp_path / "codex-home" / "skills" / "farness"


class TestSetupCommand:
    """Tests for the one-command agent setup flow."""

    def test_setup_prints_success(self, capsys):
        result = SimpleNamespace(
            skill_path="/tmp/skill/SKILL.md",
            mcp_server_name="farness",
            mcp_already_configured=False,
            agent_cli="codex",
            python_bin="/tmp/python",
        )

        with patch("farness.cli.setup_agent", return_value=result):
            with patch("sys.argv", ["farness", "setup", "codex"]):
                main()

        output = capsys.readouterr().out
        assert "Installed codex skill at /tmp/skill/SKILL.md" in output
        assert "Configured MCP server `farness` in codex using /tmp/python." in output

    def test_setup_reports_existing_server(self, capsys):
        result = SimpleNamespace(
            skill_path="/tmp/skill/SKILL.md",
            mcp_server_name="farness",
            mcp_already_configured=True,
            agent_cli="claude",
            python_bin="/tmp/python",
        )

        with patch("farness.cli.setup_agent", return_value=result):
            with patch("sys.argv", ["farness", "setup", "claude"]):
                main()

        output = capsys.readouterr().out
        assert "MCP server `farness` is already configured in claude." in output

    def test_setup_exits_on_runtime_error(self, capsys):
        with patch("farness.cli.setup_agent", side_effect=RuntimeError("boom")):
            with patch("sys.argv", ["farness", "setup", "codex"]):
                with pytest.raises(SystemExit):
                    main()

        output = capsys.readouterr().out
        assert "boom" in output


class TestUninstallCommand:
    """Tests for the uninstall command."""

    def test_uninstall_reports_removed_skill_and_mcp(self, capsys):
        result = SimpleNamespace(
            agent_cli="codex",
            cli_path="/usr/local/bin/codex",
            skill_path="/tmp/skill/SKILL.md",
            skill_removed=True,
            mcp_server_name="farness",
            mcp_removed=True,
        )

        with patch("farness.cli.remove_agent_setup", return_value=result):
            with patch("sys.argv", ["farness", "uninstall", "codex"]):
                main()

        output = capsys.readouterr().out
        assert "Removed codex skill at /tmp/skill/SKILL.md" in output
        assert "Removed MCP server `farness` from codex." in output

    def test_uninstall_keep_mcp_reports_retained_server(self, capsys):
        result = SimpleNamespace(
            agent_cli="claude",
            cli_path="/usr/local/bin/claude",
            skill_path="/tmp/skill/SKILL.md",
            skill_removed=False,
            mcp_server_name="farness",
            mcp_removed=False,
        )

        with patch("farness.cli.remove_agent_setup", return_value=result):
            with patch("sys.argv", ["farness", "uninstall", "claude", "--keep-mcp"]):
                main()

        output = capsys.readouterr().out
        assert "No claude skill found" in output
        assert "Left MCP server `farness` configured." in output


class TestDoctorCommand:
    """Tests for the agent doctor command."""

    def test_doctor_reports_ready_status(self, capsys):
        result = SimpleNamespace(
            agent_cli="codex",
            cli_path="/usr/local/bin/codex",
            skill_path="/tmp/skill/SKILL.md",
            skill_state="installed",
            skill_installed=True,
            mcp_server_name="farness",
            mcp_configured=True,
            manual_command="codex mcp add farness -- /tmp/python -m farness.mcp_server",
        )

        with patch("farness.cli.inspect_agent_setup", return_value=result):
            with patch("sys.argv", ["farness", "doctor", "codex"]):
                main()

        output = capsys.readouterr().out
        assert "Skill status: installed" in output
        assert "configured: yes" in output
        assert "Status: ready" in output

    def test_doctor_recommends_setup_when_missing(self, capsys):
        result = SimpleNamespace(
            agent_cli="claude",
            cli_path="/usr/local/bin/claude",
            skill_path="/tmp/skill/SKILL.md",
            skill_state="missing",
            skill_installed=False,
            mcp_server_name="farness",
            mcp_configured=False,
            manual_command="claude mcp add --scope user farness -- /tmp/python -m farness.mcp_server",
        )

        with patch("farness.cli.inspect_agent_setup", return_value=result):
            with patch("sys.argv", ["farness", "doctor", "claude"]):
                main()

        output = capsys.readouterr().out
        assert "Recommended next step:" in output
        assert "farness setup claude" in output

    def test_doctor_fix_reports_actions(self, capsys):
        repaired = SimpleNamespace(
            agent_cli="codex",
            cli_path="/usr/local/bin/codex",
            skill_path="/tmp/skill/SKILL.md",
            skill_action="updated",
            mcp_server_name="farness",
            mcp_action="configured",
            python_bin="/tmp/python",
        )
        result = SimpleNamespace(
            agent_cli="codex",
            cli_path="/usr/local/bin/codex",
            skill_path="/tmp/skill/SKILL.md",
            skill_state="installed",
            skill_installed=True,
            mcp_server_name="farness",
            mcp_configured=True,
            manual_command="codex mcp add farness -- /tmp/python -m farness.mcp_server",
        )

        with patch("farness.cli.repair_agent_setup", return_value=repaired):
            with patch("farness.cli.inspect_agent_setup", return_value=result):
                with patch("sys.argv", ["farness", "doctor", "codex", "--fix"]):
                    main()

        output = capsys.readouterr().out
        assert "Applied fixes for codex:" in output
        assert "Skill: updated" in output
        assert "MCP: configured" in output
