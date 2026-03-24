"""Tests for agent setup helpers."""

from __future__ import annotations

import subprocess
from types import SimpleNamespace

import pytest

from farness.agent_setup import inspect_agent_setup, manual_setup_command, setup_agent


def test_manual_setup_command_for_claude():
    command = manual_setup_command("claude", "/tmp/venv/bin/python")
    assert (
        command == "claude mcp add --scope user farness -- "
        "/tmp/venv/bin/python -m farness.mcp_server"
    )


def test_setup_agent_skips_add_when_server_exists(monkeypatch, tmp_path):
    skill_path = tmp_path / "skill" / "SKILL.md"
    skill_path.parent.mkdir(parents=True)
    skill_path.write_text("skill")

    monkeypatch.setattr(
        "farness.agent_setup.install_skill", lambda *args, **kwargs: skill_path
    )
    monkeypatch.setattr(
        "farness.agent_setup.shutil.which", lambda name: f"/usr/bin/{name}"
    )

    calls = []

    def fake_run(cmd, capture_output, text, check):
        calls.append(cmd)
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    monkeypatch.setattr("farness.agent_setup.subprocess.run", fake_run)

    result = setup_agent("codex", python_bin="/tmp/python")

    assert result.mcp_already_configured is True
    assert calls == [["codex", "mcp", "get", "farness"]]


def test_setup_agent_adds_missing_server(monkeypatch, tmp_path):
    skill_path = tmp_path / "skill" / "SKILL.md"
    skill_path.parent.mkdir(parents=True)
    skill_path.write_text("skill")

    monkeypatch.setattr(
        "farness.agent_setup.install_skill", lambda *args, **kwargs: skill_path
    )
    monkeypatch.setattr(
        "farness.agent_setup.shutil.which", lambda name: f"/usr/bin/{name}"
    )

    calls = []

    def fake_run(cmd, capture_output, text, check):
        calls.append(cmd)
        if cmd[:3] == ["claude", "mcp", "get"]:
            return SimpleNamespace(returncode=1, stdout="", stderr="missing")
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    monkeypatch.setattr("farness.agent_setup.subprocess.run", fake_run)

    result = setup_agent("claude", python_bin="/tmp/python")

    assert result.mcp_already_configured is False
    assert calls == [
        ["claude", "mcp", "get", "farness"],
        [
            "claude",
            "mcp",
            "add",
            "--scope",
            "user",
            "farness",
            "--",
            "/tmp/python",
            "-m",
            "farness.mcp_server",
        ],
    ]


def test_setup_agent_reports_missing_cli(monkeypatch, tmp_path):
    skill_path = tmp_path / "skill" / "SKILL.md"
    skill_path.parent.mkdir(parents=True)
    skill_path.write_text("skill")

    monkeypatch.setattr(
        "farness.agent_setup.install_skill", lambda *args, **kwargs: skill_path
    )
    monkeypatch.setattr("farness.agent_setup.shutil.which", lambda name: None)

    with pytest.raises(RuntimeError) as excinfo:
        setup_agent("codex", python_bin="/tmp/python")

    message = str(excinfo.value)
    assert "Installed the codex skill" in message
    assert "codex mcp add farness -- /tmp/python -m farness.mcp_server" in message


def test_inspect_agent_setup_uses_codex_home(monkeypatch, tmp_path):
    codex_home = tmp_path / "codex-home"
    skill_path = codex_home / "skills" / "farness" / "SKILL.md"
    skill_path.parent.mkdir(parents=True)
    skill_path.write_text("skill")

    monkeypatch.setenv("CODEX_HOME", str(codex_home))
    monkeypatch.setattr(
        "farness.agent_setup.shutil.which", lambda name: f"/usr/bin/{name}"
    )

    def fake_run(cmd, capture_output, text, check):
        assert cmd == ["codex", "mcp", "get", "farness"]
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    monkeypatch.setattr("farness.agent_setup.subprocess.run", fake_run)

    result = inspect_agent_setup("codex", python_bin="/tmp/python")

    assert result.skill_path == str(skill_path)
    assert result.skill_installed is True
    assert result.mcp_configured is True


def test_inspect_agent_setup_skips_mcp_check_without_cli(monkeypatch, tmp_path):
    target = tmp_path / "claude-skill"
    target.mkdir(parents=True)

    monkeypatch.setattr("farness.agent_setup.shutil.which", lambda name: None)

    def fail_run(*args, **kwargs):  # pragma: no cover
        raise AssertionError("subprocess.run should not be called when CLI is missing")

    monkeypatch.setattr("farness.agent_setup.subprocess.run", fail_run)

    result = inspect_agent_setup("claude", target_dir=str(target), python_bin="/tmp/python")

    assert result.skill_path == str(target / "SKILL.md")
    assert result.skill_installed is False
    assert result.cli_path is None
    assert result.mcp_configured is False
