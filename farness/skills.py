"""Helpers for installing packaged skill templates."""

from __future__ import annotations

import os
from importlib import resources
from pathlib import Path


SKILL_RESOURCE_PATHS = {
    "codex": ("assets", "skills", "codex", "SKILL.md"),
    "claude": ("assets", "skills", "claude", "SKILL.md"),
}


def default_skill_dir(agent: str) -> Path:
    """Return the default installation directory for an agent skill."""
    if agent == "codex":
        codex_home = os.environ.get("CODEX_HOME")
        if codex_home:
            return Path(codex_home).expanduser() / "skills" / "farness"
        return Path.home() / ".codex" / "skills" / "farness"

    if agent == "claude":
        return Path.home() / ".claude" / "skills" / "farness"

    raise ValueError(f"Unsupported agent: {agent}")


def load_skill_text(agent: str) -> str:
    """Return the packaged skill template for the requested agent."""
    try:
        resource = resources.files("farness").joinpath(*SKILL_RESOURCE_PATHS[agent])
    except KeyError as exc:
        raise ValueError(f"Unsupported agent: {agent}") from exc
    return resource.read_text(encoding="utf-8")


def install_skill(agent: str, target_dir: str | Path | None = None, force: bool = False) -> Path:
    """Install a packaged skill template into the target skill directory."""
    skill_dir = Path(target_dir).expanduser() if target_dir else default_skill_dir(agent)
    skill_dir.mkdir(parents=True, exist_ok=True)
    skill_path = skill_dir / "SKILL.md"
    contents = load_skill_text(agent)

    if skill_path.exists():
        existing = skill_path.read_text(encoding="utf-8")
        if existing == contents:
            return skill_path
        if not force:
            raise FileExistsError(
                f"{skill_path} already exists with different contents. Use --force to overwrite."
            )

    skill_path.write_text(contents, encoding="utf-8")
    return skill_path
