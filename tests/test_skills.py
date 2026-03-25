"""Tests for packaged skill helpers."""

from __future__ import annotations

from farness.skills import inspect_skill, remove_skill


def test_inspect_skill_reports_missing(tmp_path):
    inspection = inspect_skill("codex", tmp_path / "missing-skill")

    assert inspection.status == "missing"
    assert inspection.skill_path.name == "SKILL.md"


def test_inspect_skill_reports_modified(tmp_path):
    target = tmp_path / "claude-skill"
    target.mkdir(parents=True)
    skill_path = target / "SKILL.md"
    skill_path.write_text("custom", encoding="utf-8")

    inspection = inspect_skill("claude", target)

    assert inspection.status == "modified"
    assert inspection.skill_path == skill_path


def test_remove_skill_deletes_file_and_empty_directory(tmp_path):
    target = tmp_path / "codex-skill"
    target.mkdir(parents=True)
    skill_path = target / "SKILL.md"
    skill_path.write_text("contents", encoding="utf-8")

    removed_path, removed = remove_skill("codex", target)

    assert removed is True
    assert removed_path == skill_path
    assert not skill_path.exists()
    assert not target.exists()
