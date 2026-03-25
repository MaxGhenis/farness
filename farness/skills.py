"""Helpers for installing packaged skill templates."""

from __future__ import annotations

import os
from dataclasses import dataclass
from importlib import resources
from pathlib import Path


SKILL_RESOURCE_PATHS = {
    "codex": ("assets", "skills", "codex", "SKILL.md"),
    "claude": ("assets", "skills", "claude", "SKILL.md"),
}


@dataclass(frozen=True)
class SkillInspection:
    """Status of a packaged skill installation."""

    agent: str
    skill_path: Path
    status: str


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


def resolve_skill_dir(agent: str, target_dir: str | Path | None = None) -> Path:
    """Resolve the target directory for an agent skill."""
    return Path(target_dir).expanduser() if target_dir else default_skill_dir(agent)


def resolve_skill_path(agent: str, target_dir: str | Path | None = None) -> Path:
    """Return the on-disk path for an agent skill file."""
    skill_dir = resolve_skill_dir(agent, target_dir)
    return skill_dir if skill_dir.name == "SKILL.md" else skill_dir / "SKILL.md"


def inspect_skill(agent: str, target_dir: str | Path | None = None) -> SkillInspection:
    """Inspect whether the packaged skill is missing, installed, or drifted."""
    skill_path = resolve_skill_path(agent, target_dir)
    if not skill_path.exists():
        return SkillInspection(agent=agent, skill_path=skill_path, status="missing")

    expected = load_skill_text(agent)
    existing = skill_path.read_text(encoding="utf-8")
    status = "installed" if existing == expected else "modified"
    return SkillInspection(agent=agent, skill_path=skill_path, status=status)


def install_skill(agent: str, target_dir: str | Path | None = None, force: bool = False) -> Path:
    """Install a packaged skill template into the target skill directory."""
    skill_dir = resolve_skill_dir(agent, target_dir)
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


def remove_skill(agent: str, target_dir: str | Path | None = None) -> tuple[Path, bool]:
    """Remove an installed packaged skill file."""
    skill_path = resolve_skill_path(agent, target_dir)
    if not skill_path.exists():
        return skill_path, False

    skill_path.unlink()
    skill_dir = skill_path.parent
    if skill_dir.exists() and not any(skill_dir.iterdir()):
        skill_dir.rmdir()
    return skill_path, True
