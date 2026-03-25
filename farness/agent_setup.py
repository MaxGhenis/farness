"""Helpers for configuring agent-specific MCP integrations."""

from __future__ import annotations

import shlex
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from farness.skills import inspect_skill
from farness.skills import install_skill
from farness.skills import remove_skill
from farness.skills import resolve_skill_path


@dataclass
class AgentSetupResult:
    """Result from configuring an agent integration."""

    skill_path: str
    mcp_server_name: str
    mcp_already_configured: bool
    agent_cli: str
    python_bin: str


@dataclass
class AgentDoctorResult:
    """Result from inspecting a local agent integration."""

    agent_cli: str
    cli_path: str | None
    skill_path: str
    skill_state: str
    skill_installed: bool
    mcp_server_name: str
    mcp_configured: bool
    manual_command: str


@dataclass
class AgentRepairResult:
    """Result from repairing a local agent integration."""

    agent_cli: str
    cli_path: str | None
    skill_path: str
    skill_action: str
    mcp_server_name: str
    mcp_action: str
    python_bin: str


@dataclass
class AgentUninstallResult:
    """Result from removing a local agent integration."""

    agent_cli: str
    cli_path: str | None
    skill_path: str
    skill_removed: bool
    mcp_server_name: str
    mcp_removed: bool


def _agent_cli_name(agent: str) -> str:
    if agent not in {"codex", "claude"}:
        raise ValueError(f"Unsupported agent: {agent}")
    return agent


def _mcp_get_command(agent: str, server_name: str) -> list[str]:
    cli = _agent_cli_name(agent)
    return [cli, "mcp", "get", server_name]


def _mcp_add_command(agent: str, server_name: str, python_bin: str) -> list[str]:
    cli = _agent_cli_name(agent)
    if agent == "codex":
        return [
            cli,
            "mcp",
            "add",
            server_name,
            "--",
            python_bin,
            "-m",
            "farness.mcp_server",
        ]
    return [
        cli,
        "mcp",
        "add",
        "--scope",
        "user",
        server_name,
        "--",
        python_bin,
        "-m",
        "farness.mcp_server",
    ]


def _mcp_remove_command(agent: str, server_name: str) -> list[str]:
    cli = _agent_cli_name(agent)
    if agent == "codex":
        return [cli, "mcp", "remove", server_name]
    return [cli, "mcp", "remove", server_name]


def _run_command(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )


def _mcp_is_configured(agent: str, server_name: str) -> bool:
    return _run_command(_mcp_get_command(agent, server_name)).returncode == 0


def _ensure_mcp_server(agent: str, server_name: str, python_bin: str) -> str:
    """Ensure the named MCP server exists. Returns configured state action."""
    if _mcp_is_configured(agent, server_name):
        return "unchanged"

    add_result = _run_command(_mcp_add_command(agent, server_name, python_bin))
    if add_result.returncode != 0:
        stderr = add_result.stderr.strip() or add_result.stdout.strip()
        raise RuntimeError(
            (
                "MCP registration failed.\n"
                f"Command: {manual_setup_command(agent, python_bin, server_name)}\n"
                f"Error: {stderr}"
            )
        )
    return "configured"


def manual_setup_command(
    agent: str, python_bin: str, server_name: str = "farness"
) -> str:
    """Return the fallback MCP registration command for an agent."""
    return shlex.join(_mcp_add_command(agent, server_name, python_bin))


def inspect_agent_setup(
    agent: str,
    *,
    target_dir: str | None = None,
    python_bin: str | None = None,
    server_name: str = "farness",
) -> AgentDoctorResult:
    """Inspect the local skill and MCP registration for an agent."""
    cli = _agent_cli_name(agent)
    python_bin = python_bin or sys.executable
    skill = inspect_skill(agent, target_dir)

    cli_path = shutil.which(cli)
    mcp_configured = False
    if cli_path is not None:
        mcp_configured = _mcp_is_configured(agent, server_name)

    return AgentDoctorResult(
        agent_cli=cli,
        cli_path=cli_path,
        skill_path=str(skill.skill_path),
        skill_state=skill.status,
        skill_installed=skill.status != "missing",
        mcp_server_name=server_name,
        mcp_configured=mcp_configured,
        manual_command=manual_setup_command(agent, python_bin, server_name),
    )


def repair_agent_setup(
    agent: str,
    *,
    target_dir: str | None = None,
    force_skill: bool = False,
    python_bin: str | None = None,
    server_name: str = "farness",
) -> AgentRepairResult:
    """Install or repair the packaged skill and MCP registration for an agent."""
    cli = _agent_cli_name(agent)
    python_bin = python_bin or sys.executable
    skill = inspect_skill(agent, target_dir)

    if skill.status == "missing":
        skill_path = install_skill(agent, target_dir, force=False)
        skill_action = "installed"
    elif skill.status == "modified" or force_skill:
        skill_path = install_skill(agent, target_dir, force=True)
        skill_action = "updated" if skill.status == "modified" else "reinstalled"
    else:
        skill_path = skill.skill_path
        skill_action = "unchanged"

    cli_path = shutil.which(cli)
    if cli_path is None:
        mcp_action = "skipped"
    else:
        mcp_action = _ensure_mcp_server(agent, server_name, python_bin)

    return AgentRepairResult(
        agent_cli=cli,
        cli_path=cli_path,
        skill_path=str(skill_path),
        skill_action=skill_action,
        mcp_server_name=server_name,
        mcp_action=mcp_action,
        python_bin=python_bin,
    )


def remove_agent_setup(
    agent: str,
    *,
    target_dir: str | None = None,
    server_name: str = "farness",
    remove_mcp: bool = True,
) -> AgentUninstallResult:
    """Remove the packaged skill and optionally the MCP server for an agent."""
    cli = _agent_cli_name(agent)
    skill_path, skill_removed = remove_skill(agent, target_dir)
    cli_path = shutil.which(cli)
    mcp_removed = False

    if remove_mcp and cli_path is not None and _mcp_is_configured(agent, server_name):
        remove_result = _run_command(_mcp_remove_command(agent, server_name))
        if remove_result.returncode != 0:
            stderr = remove_result.stderr.strip() or remove_result.stdout.strip()
            raise RuntimeError(
                (
                    f"Failed to remove MCP server `{server_name}` from {cli}.\n"
                    f"Error: {stderr}"
                )
            )
        mcp_removed = True

    return AgentUninstallResult(
        agent_cli=cli,
        cli_path=cli_path,
        skill_path=str(skill_path),
        skill_removed=skill_removed,
        mcp_server_name=server_name,
        mcp_removed=mcp_removed,
    )


def setup_agent(
    agent: str,
    *,
    target_dir: str | None = None,
    force_skill: bool = False,
    python_bin: str | None = None,
    server_name: str = "farness",
) -> AgentSetupResult:
    """Install the packaged skill and configure the local MCP server."""
    cli = _agent_cli_name(agent)
    repaired = repair_agent_setup(
        agent,
        target_dir=target_dir,
        force_skill=force_skill,
        python_bin=python_bin,
        server_name=server_name,
    )
    skill_path = Path(repaired.skill_path)

    if repaired.cli_path is None:
        raise RuntimeError(
            (
                f"Installed the {agent} skill at {skill_path}, but the `{cli}` CLI "
                "was not found on PATH.\n"
                "Register the MCP server manually with:\n"
                f"{manual_setup_command(agent, repaired.python_bin, server_name)}"
            )
        )

    return AgentSetupResult(
        skill_path=str(skill_path),
        mcp_server_name=server_name,
        mcp_already_configured=repaired.mcp_action == "unchanged",
        agent_cli=cli,
        python_bin=repaired.python_bin,
    )
