"""Helpers for configuring agent-specific MCP integrations."""

from __future__ import annotations

import shlex
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from farness.skills import install_skill
from farness.skills import default_skill_dir


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
    skill_installed: bool
    mcp_server_name: str
    mcp_configured: bool
    manual_command: str


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
    skill_dir = default_skill_dir(agent) if target_dir is None else Path(target_dir).expanduser()
    skill_path = skill_dir if skill_dir.name == "SKILL.md" else skill_dir / "SKILL.md"

    cli_path = shutil.which(cli)
    mcp_configured = False
    if cli_path is not None:
        get_result = subprocess.run(
            _mcp_get_command(agent, server_name),
            capture_output=True,
            text=True,
            check=False,
        )
        mcp_configured = get_result.returncode == 0

    return AgentDoctorResult(
        agent_cli=cli,
        cli_path=cli_path,
        skill_path=str(skill_path),
        skill_installed=skill_path.exists(),
        mcp_server_name=server_name,
        mcp_configured=mcp_configured,
        manual_command=manual_setup_command(agent, python_bin, server_name),
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
    python_bin = python_bin or sys.executable
    skill_path = install_skill(agent, target_dir, force_skill)

    if shutil.which(cli) is None:
        raise RuntimeError(
            (
                f"Installed the {agent} skill at {skill_path}, but the `{cli}` CLI "
                "was not found on PATH.\n"
                "Register the MCP server manually with:\n"
                f"{manual_setup_command(agent, python_bin, server_name)}"
            )
        )

    get_result = subprocess.run(
        _mcp_get_command(agent, server_name),
        capture_output=True,
        text=True,
        check=False,
    )
    if get_result.returncode == 0:
        return AgentSetupResult(
            skill_path=str(skill_path),
            mcp_server_name=server_name,
            mcp_already_configured=True,
            agent_cli=cli,
            python_bin=python_bin,
        )

    add_result = subprocess.run(
        _mcp_add_command(agent, server_name, python_bin),
        capture_output=True,
        text=True,
        check=False,
    )
    if add_result.returncode != 0:
        stderr = add_result.stderr.strip() or add_result.stdout.strip()
        raise RuntimeError(
            (
                f"Installed the {agent} skill at {skill_path}, but MCP "
                "registration failed.\n"
                f"Command: {manual_setup_command(agent, python_bin, server_name)}\n"
                f"Error: {stderr}"
            )
        )

    return AgentSetupResult(
        skill_path=str(skill_path),
        mcp_server_name=server_name,
        mcp_already_configured=False,
        agent_cli=cli,
        python_bin=python_bin,
    )
