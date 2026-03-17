#!/usr/bin/env python3
"""Render the Quarto paper and sync the generated Markdown copy."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PAPER_DIR = ROOT / "paper"
BOOK_DIR = PAPER_DIR / "_book"
SITE_PAPER_DIR = ROOT / "site" / "public" / "paper-raw"


def run(cmd: list[str], cwd: Path) -> None:
    print("$", " ".join(str(part) for part in cmd))
    subprocess.run(cmd, cwd=cwd, check=True)


def main() -> int:
    if shutil.which("quarto") is None:
        print("Quarto is required but was not found on PATH.", file=sys.stderr)
        return 1

    figure_python = [sys.executable]
    if shutil.which("uv") is not None:
        figure_python = ["uv", "run", "--extra", "experiments", "python"]

    run([*figure_python, "generate_figures.py"], cwd=PAPER_DIR)
    run(["quarto", "render", str(PAPER_DIR), "--to", "html"], cwd=ROOT)
    run(
        [
            "quarto",
            "render",
            str(PAPER_DIR / "index.qmd"),
            "--to",
            "gfm",
            "--output",
            "preemptive_rigor.md",
            "--output-dir",
            str(PAPER_DIR),
        ],
        cwd=PAPER_DIR,
    )
    shutil.copytree(BOOK_DIR, SITE_PAPER_DIR, dirs_exist_ok=True)
    print(f"$ sync {BOOK_DIR} -> {SITE_PAPER_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
