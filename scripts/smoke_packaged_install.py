#!/usr/bin/env python3
"""Smoke-test a built farness artifact in an isolated environment."""

from __future__ import annotations

import argparse
import os
import shlex
import subprocess
import sys
import tempfile
import textwrap
import venv
from pathlib import Path


FAKE_AGENT_SCRIPT = """#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path


def load_store(path):
    if path.exists():
        return json.loads(path.read_text())
    return {}


def save_store(path, data):
    path.write_text(json.dumps(data, indent=2, sort_keys=True))


def parse_name(arguments):
    args = list(arguments)
    index = 0
    while index < len(args):
        item = args[index]
        if item == "--":
            break
        if item in {"--scope", "-s", "-e", "--header", "--transport"}:
            index += 2
            continue
        if item.startswith("-"):
            index += 1
            continue
        return item
    raise SystemExit("missing MCP server name")


def main():
    cli_name = Path(sys.argv[0]).name
    store_path = Path(os.environ["FAKE_MCP_ROOT"]) / f"{cli_name}.json"
    store_path.parent.mkdir(parents=True, exist_ok=True)
    store = load_store(store_path)

    argv = sys.argv[1:]
    if not argv or argv[0] != "mcp":
        raise SystemExit(f"unsupported command: {argv}")

    if len(argv) < 2:
        raise SystemExit("missing mcp subcommand")

    command = argv[1]
    payload = argv[2:]

    if command == "get":
        name = payload[0]
        raise SystemExit(0 if name in store else 1)

    if command == "add":
        name = parse_name(payload)
        store[name] = payload
        save_store(store_path, store)
        raise SystemExit(0)

    if command == "remove":
        name = parse_name(payload)
        if name in store:
            del store[name]
            save_store(store_path, store)
            raise SystemExit(0)
        raise SystemExit(1)

    if command == "list":
        print("\\n".join(sorted(store)))
        raise SystemExit(0)

    raise SystemExit(f"unsupported mcp subcommand: {command}")


if __name__ == "__main__":
    main()
"""


def run(command: list[str], *, env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    print(f"+ {shlex.join(command)}")
    return subprocess.run(command, check=True, capture_output=True, text=True, env=env)


def write_fake_agent_cli(bin_dir: Path, name: str) -> None:
    script_path = bin_dir / name
    script_path.write_text(FAKE_AGENT_SCRIPT, encoding="utf-8")
    script_path.chmod(0o755)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("artifact", help="Path to the built wheel or sdist to test")
    args = parser.parse_args()

    artifact = Path(args.artifact).resolve()
    if not artifact.exists():
        raise SystemExit(f"Artifact not found: {artifact}")

    with tempfile.TemporaryDirectory(prefix="farness-smoke-") as tmpdir:
        root = Path(tmpdir)
        venv_dir = root / "venv"
        fake_bin = root / "fake-bin"
        fake_bin.mkdir(parents=True)

        venv.EnvBuilder(with_pip=True, clear=True).create(venv_dir)
        python_bin = venv_dir / "bin" / "python"

        for agent in ("codex", "claude"):
            write_fake_agent_cli(fake_bin, agent)

        env = os.environ.copy()
        env.update(
            {
                "HOME": str(root / "home"),
                "CODEX_HOME": str(root / "codex-home"),
                "FAKE_MCP_ROOT": str(root / "fake-mcp"),
                "PATH": os.pathsep.join([str(fake_bin), str(venv_dir / "bin"), env["PATH"]]),
            }
        )

        run(
            [
                str(python_bin),
                "-m",
                "pip",
                "install",
                f"farness[mcp] @ {artifact.as_uri()}",
            ],
            env=env,
        )

        farness = [str(venv_dir / "bin" / "farness")]
        codex_skill = Path(env["CODEX_HOME"]) / "skills" / "farness" / "SKILL.md"
        claude_skill = Path(env["HOME"]) / ".claude" / "skills" / "farness" / "SKILL.md"

        codex_setup = run(farness + ["setup", "codex"], env=env)
        assert "Configured MCP server `farness` in codex" in codex_setup.stdout
        assert codex_skill.exists()

        codex_doctor = run(farness + ["doctor", "codex"], env=env)
        assert "Skill status: installed" in codex_doctor.stdout
        assert "configured: yes" in codex_doctor.stdout

        codex_skill.write_text("drifted", encoding="utf-8")
        codex_fix = run(farness + ["doctor", "codex", "--fix"], env=env)
        assert "Skill: updated" in codex_fix.stdout
        assert "MCP: unchanged" in codex_fix.stdout

        codex_uninstall = run(farness + ["uninstall", "codex"], env=env)
        assert "Removed codex skill" in codex_uninstall.stdout
        assert "Removed MCP server `farness` from codex." in codex_uninstall.stdout
        assert not codex_skill.exists()

        codex_post = run(farness + ["doctor", "codex"], env=env)
        assert "Skill status: missing" in codex_post.stdout
        assert "configured: no" in codex_post.stdout

        claude_setup = run(farness + ["setup", "claude"], env=env)
        assert "Configured MCP server `farness` in claude" in claude_setup.stdout
        assert claude_skill.exists()

        decision_new = run(
            farness + ["new", "Should we launch now?", "--context", "2 bugs left"],
            env=env,
        )
        assert "Created decision" in decision_new.stdout
        decision_list = run(farness + ["list"], env=env)
        assert "Should we launch now?" in decision_list.stdout

        print("Packaged install smoke test passed.")


if __name__ == "__main__":
    main()
