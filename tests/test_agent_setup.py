"""Tests for agent setup helpers."""

from __future__ import annotations

import subprocess
from types import SimpleNamespace

import pytest

from farness.agent_setup import manual_setup_command, setup_agent


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
