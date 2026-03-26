#!/usr/bin/env python3
"""Generate a 4K demo video from a real Codex + farness session."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
import textwrap
from dataclasses import dataclass
from pathlib import Path

from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "site" / "public" / "demo"
VIDEO_PATH = OUT_DIR / "farness-demo-v2.mp4"
POSTER_PATH = OUT_DIR / "farness-demo-v2-poster.png"

WIDTH = 3840
HEIGHT = 2160
FPS = 8
INTRO_DURATION = 1.6
LINE_DURATION = 0.18
EVENT_HOLD = 1.2

BG_TOP = (8, 12, 18)
BG_BOTTOM = (14, 22, 31)
PANEL = (9, 14, 20)
PANEL_EDGE = (38, 53, 66)
PANEL_HEADER = (16, 24, 33)
PANEL_HEADER_TEXT = (173, 188, 201)
TEXT = (228, 236, 243)
TEXT_DIM = (144, 160, 174)
TEXT_MUTED = (116, 136, 154)
COMMAND = (240, 198, 116)
ACCENT = (120, 194, 255)
SUCCESS = (118, 203, 140)

MONO_FONT_PATH = Path("/System/Library/Fonts/Menlo.ttc")
SANS_FONT_PATH = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
DISPLAY_FONT_PATH = Path("/System/Library/Fonts/Supplemental/Georgia Bold.ttf")

MONO_42 = ImageFont.truetype(str(MONO_FONT_PATH), 56)
SANS_42 = ImageFont.truetype(str(SANS_FONT_PATH), 48)
SANS_30 = ImageFont.truetype(str(SANS_FONT_PATH), 30)
DISPLAY_110 = ImageFont.truetype(str(DISPLAY_FONT_PATH), 110)
DISPLAY_56 = ImageFont.truetype(str(DISPLAY_FONT_PATH), 56)

PANEL_X = 150
PANEL_Y = 175
PANEL_W = WIDTH - 300
PANEL_H = HEIGHT - 320
HEADER_H = 96
INNER_X = PANEL_X + 82
INNER_Y = PANEL_Y + HEADER_H + 56
INNER_W = PANEL_W - 164
INNER_H = PANEL_H - HEADER_H - 112
LINE_HEIGHT = 74
MAX_LINES = INNER_H // LINE_HEIGHT
WRAP_WIDTH = 76


@dataclass(frozen=True)
class Event:
    command: str
    output: list[str]
    hold: float = EVENT_HOLD


@dataclass(frozen=True)
class DemoSession:
    store_path: str
    workdir: str
    prompt_path: str
    decision_prefix: str
    codex_lines: list[str]
    list_lines: list[str]
    show_lines: list[str]


def ffmpeg_path() -> str:
    binary = shutil.which("ffmpeg")
    if binary is None:
        raise RuntimeError("ffmpeg is required to generate the demo video.")
    return binary


def _env_with_local_bins() -> dict[str, str]:
    env = os.environ.copy()
    segments = [str(ROOT / ".venv" / "bin"), str(Path.home() / ".bun" / "bin")]
    existing = env.get("PATH", "")
    env["PATH"] = ":".join([*segments, existing]) if existing else ":".join(segments)
    return env


def _farness_command() -> list[str]:
    binary = ROOT / ".venv" / "bin" / "farness"
    if binary.exists():
        return [str(binary)]
    return [sys.executable, "-m", "farness.cli"]


def run_command(
    command: list[str],
    *,
    env: dict[str, str],
    cwd: Path | None = None,
    input_text: str | None = None,
) -> str:
    result = subprocess.run(
        command,
        input=input_text,
        text=True,
        capture_output=True,
        cwd=str(cwd) if cwd else str(ROOT),
        env=env,
        check=False,
    )
    if result.returncode != 0:
        tail = (result.stderr or result.stdout).strip()
        raise RuntimeError(f"Command failed: {' '.join(command)}\n{tail}")
    return result.stdout.rstrip()


def first_match(lines: list[str], predicate) -> str | None:
    for line in lines:
        if predicate(line):
            return line
    return None


def format_forecast_value(kpi_name: str, value: float) -> str:
    lower_name = kpi_name.lower()
    percent_like = any(
        token in lower_name for token in ("prob", "probability", "chance", "confidence", "fit")
    )
    if 0 <= value <= 1:
        return f"{round(value * 100):.0f}%"
    if percent_like and 0 <= value <= 100:
        return f"{round(value):.0f}%"
    if abs(value - round(value)) < 0.05:
        return f"{round(value):.0f}"
    return f"{value:.1f}".rstrip("0").rstrip(".")


def summarize_codex_output(prompt: str, decision: dict[str, object]) -> list[str]:
    chosen_option_name = str(decision["chosen_option"])
    chosen_option = next(
        option for option in decision["options"] if option["name"] == chosen_option_name
    )
    forecasts = chosen_option["forecasts"]
    forecast_lines: list[str] = []
    for kpi_name, forecast in forecasts.items():
        low, high = forecast["confidence_interval"]
        forecast_lines.append(
            f"{kpi_name}: {format_forecast_value(kpi_name, forecast['point_estimate'])} "
            f"[{format_forecast_value(kpi_name, low)}, {format_forecast_value(kpi_name, high)}]"
        )

    question = prompt.split("Analyze this decision: ", 1)[1].split(" Context:", 1)[0].strip()
    context = prompt.split("Context:", 1)[1].strip()

    summary = [
        "user",
        question,
        f"Context: {context}",
        "",
        "codex",
        f"Recommendation: {chosen_option_name}",
    ]
    summary.extend(forecast_lines)
    summary.extend(
        [
            "Disconfirming case: one auth seam may be cleanly replaceable now.",
            f"Review date: {str(decision['review_date'])[:10]}",
        ]
    )
    return summary


def capture_real_session() -> DemoSession:
    env = _env_with_local_bins()
    codex = shutil.which("codex", path=env["PATH"])
    if codex is None:
        raise RuntimeError("codex is required on PATH to generate the real demo.")

    with tempfile.TemporaryDirectory(prefix="farness-demo-") as tmpdir:
        temp_root = Path(tmpdir)
        store_path = temp_root / "decisions.jsonl"
        prompt_path = temp_root / "prompt.txt"
        last_path = temp_root / "last.txt"
        workdir = temp_root / "work"
        workdir.mkdir(parents=True, exist_ok=True)

        prompt = (
            "Use $farness. Be concise. Analyze this decision: "
            "Should we rewrite the auth layer now? Context: 3 incidents this quarter, "
            "team strongest in Node, Q2 launch locked.\n"
        )
        prompt_path.write_text(prompt)

        codex_command = [
            codex,
            "exec",
            "--color",
            "never",
            "--skip-git-repo-check",
            "-C",
            str(workdir),
            "-c",
            'model="gpt-5.4"',
            "-c",
            'model_reasoning_effort="low"',
            "-c",
            f'mcp_servers.farness.env.FARNESS_STORE_PATH="{store_path}"',
            "--output-last-message",
            str(last_path),
            "-",
        ]
        run_command(codex_command, env=env, input_text=prompt)
        last_path.read_text()

        if not store_path.exists():
            raise RuntimeError("Expected the farness store file to exist after codex exec.")
        decision = json.loads(store_path.read_text().strip().splitlines()[-1])
        decision_prefix = decision["id"][:8]

        cli_env = env.copy()
        cli_env["FARNESS_STORE_PATH"] = str(store_path)
        run_command(_farness_command() + ["list"], env=cli_env)
        chosen_option = next(
            option for option in decision["options"] if option["name"] == decision["chosen_option"]
        )
        show_lines = [
            f"Decision: {decision['question']}",
            f"ID: {decision['id']}",
            f"Chosen: {decision['chosen_option']}",
            f"Review date: {decision['review_date'][:10]}",
            "",
            "Chosen option forecasts:",
        ]
        for kpi_name, forecast in chosen_option["forecasts"].items():
            low, high = forecast["confidence_interval"]
            show_lines.append(
                f"  {kpi_name}: {forecast['point_estimate']} ({low}-{high} @ 80%)"
            )

        list_lines = [
            "All decisions (1):",
            "",
            f"  [{decision_prefix}] {decision['question']} (pending)",
        ]

        return DemoSession(
            store_path=str(store_path),
            workdir=str(workdir),
            prompt_path=str(prompt_path),
            decision_prefix=decision_prefix,
            codex_lines=summarize_codex_output(prompt, decision),
            list_lines=list_lines,
            show_lines=show_lines,
        )


def wrap_line(text: str) -> list[str]:
    if not text:
        return [""]
    return textwrap.wrap(
        text,
        width=WRAP_WIDTH,
        break_long_words=False,
        break_on_hyphens=False,
    ) or [text]


def wrap_command(command: str) -> list[str]:
    wrapped = textwrap.wrap(
        command,
        width=WRAP_WIDTH - 2,
        break_long_words=False,
        break_on_hyphens=False,
    ) or [command]
    lines: list[str] = []
    for index, chunk in enumerate(wrapped):
        lines.append(f"$ {chunk}" if index == 0 else f"  {chunk}")
    return lines


def build_events(session: DemoSession) -> list[Event]:
    return [
        Event(
            command="codex exec - < prompt.txt",
            output=session.codex_lines,
            hold=1.2,
        ),
        Event(
            command="farness list",
            output=session.list_lines,
            hold=1.0,
        ),
        Event(
            command=f"farness show {session.decision_prefix}",
            output=session.show_lines,
            hold=1.4,
        ),
    ]


def timeline_duration(events: list[Event]) -> float:
    total = INTRO_DURATION
    for event in events:
        total += 0.45 + len(event.output) * LINE_DURATION + event.hold
    return total


def style_for_line(text: str) -> tuple[int, int, int]:
    if text in {"user", "codex"}:
        return ACCENT
    if text.startswith("mcp:") or text.startswith("mcp startup:"):
        return SUCCESS
    if text.startswith("tool farness.") or text.startswith("farness."):
        return SUCCESS
    if text.startswith("OpenAI Codex") or text.startswith("workdir:") or text.startswith("model:"):
        return TEXT_DIM
    if text.startswith("provider:") or text.startswith("approval:") or text.startswith("sandbox:"):
        return TEXT_MUTED
    if text.startswith("reasoning effort:") or text.startswith("--------"):
        return TEXT_DIM
    return TEXT


def visible_lines(events: list[Event], current_time: float) -> list[tuple[str, tuple[int, int, int]]]:
    if current_time < INTRO_DURATION:
        return []

    elapsed = current_time - INTRO_DURATION
    visible: list[tuple[str, tuple[int, int, int]]] = []

    for event in events:
        visible.extend((line, COMMAND) for line in wrap_command(event.command))
        event_total = 0.45 + len(event.output) * LINE_DURATION + event.hold
        if elapsed <= 0:
            break
        if elapsed < 0.45:
            break

        elapsed -= 0.45
        visible_output_count = min(len(event.output), int(elapsed / LINE_DURATION))
        for line in event.output[:visible_output_count]:
            for wrapped in wrap_line(line):
                visible.append((wrapped, style_for_line(line)))

        if visible_output_count < len(event.output):
            break

        elapsed -= len(event.output) * LINE_DURATION
        if elapsed < event.hold:
            break
        elapsed -= event.hold

    return visible[-MAX_LINES:]


def draw_gradient(image: Image.Image) -> None:
    draw = ImageDraw.Draw(image)
    for y in range(HEIGHT):
        t = y / max(HEIGHT - 1, 1)
        color = tuple(
            int(BG_TOP[index] + (BG_BOTTOM[index] - BG_TOP[index]) * t) for index in range(3)
        )
        draw.line((0, y, WIDTH, y), fill=color)


def draw_intro(image: Image.Image, progress: float) -> None:
    draw = ImageDraw.Draw(image)
    alpha = min(1.0, progress / max(INTRO_DURATION, 0.001))
    title_y = 560 - int((1.0 - alpha) * 60)
    subtitle_y = 700 - int((1.0 - alpha) * 30)

    draw.text((220, title_y), "farness.ai", font=DISPLAY_110, fill=(245, 247, 250))
    draw.text(
        (225, subtitle_y),
        "Condensed from a real Codex run with the local farness skill and MCP",
        font=DISPLAY_56,
        fill=(169, 184, 196),
    )
    draw.text(
        (225, subtitle_y + 110),
        "Then rendered as a clean 4K terminal asset",
        font=SANS_42,
        fill=(120, 140, 156),
    )


def draw_terminal_shell(image: Image.Image) -> None:
    draw = ImageDraw.Draw(image)
    shadow_box = (PANEL_X + 18, PANEL_Y + 28, PANEL_X + PANEL_W + 18, PANEL_Y + PANEL_H + 28)
    draw.rounded_rectangle(shadow_box, radius=44, fill=(0, 0, 0, 110))
    draw.rounded_rectangle(
        (PANEL_X, PANEL_Y, PANEL_X + PANEL_W, PANEL_Y + PANEL_H),
        radius=44,
        fill=PANEL,
        outline=PANEL_EDGE,
        width=3,
    )
    draw.rounded_rectangle(
        (PANEL_X, PANEL_Y, PANEL_X + PANEL_W, PANEL_Y + HEADER_H),
        radius=44,
        fill=PANEL_HEADER,
    )
    draw.rectangle(
        (PANEL_X, PANEL_Y + HEADER_H - 42, PANEL_X + PANEL_W, PANEL_Y + HEADER_H),
        fill=PANEL_HEADER,
    )
    draw.text((PANEL_X + 150, PANEL_Y + 26), "farness.ai", font=SANS_42, fill=PANEL_HEADER_TEXT)
    draw.text(
        (PANEL_X + PANEL_W - 540, PANEL_Y + 30),
        "condensed real run",
        font=SANS_30,
        fill=(137, 184, 255),
    )

    for index, color in enumerate(((255, 95, 86), (255, 189, 46), (39, 201, 63))):
        cx = PANEL_X + 58 + index * 34
        cy = PANEL_Y + 48
        draw.ellipse((cx - 11, cy - 11, cx + 11, cy + 11), fill=color)


def draw_terminal_lines(image: Image.Image, lines: list[tuple[str, tuple[int, int, int]]]) -> None:
    draw = ImageDraw.Draw(image)
    y = INNER_Y
    for text, color in lines:
        draw.text((INNER_X, y), text, font=MONO_42, fill=color)
        y += LINE_HEIGHT


def render_frame(events: list[Event], current_time: float) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), BG_TOP)
    draw_gradient(image)

    if current_time < INTRO_DURATION:
        draw_intro(image, current_time)
        return image

    draw_terminal_shell(image)
    draw_terminal_lines(image, visible_lines(events, current_time))
    return image


def encode_video(frame_dir: Path) -> None:
    command = [
        ffmpeg_path(),
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        str(frame_dir / "frame_%05d.png"),
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "14",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(VIDEO_PATH),
    ]
    subprocess.run(command, check=True, capture_output=True, text=True)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    session = capture_real_session()
    events = build_events(session)
    total_duration = timeline_duration(events)
    total_frames = int(total_duration * FPS) + 1
    poster_index = max(0, min(total_frames - 1, int(total_frames * 0.72)))

    with tempfile.TemporaryDirectory(prefix="farness-demo-frames-") as tmpdir:
        frame_dir = Path(tmpdir)
        for frame_index in range(total_frames):
            timestamp = frame_index / FPS
            image = render_frame(events, timestamp)
            frame_path = frame_dir / f"frame_{frame_index:05d}.png"
            image.save(frame_path)
            if frame_index == poster_index:
                image.save(POSTER_PATH)

        encode_video(frame_dir)

    print(f"Wrote {VIDEO_PATH}")
    print(f"Wrote {POSTER_PATH}")


if __name__ == "__main__":
    main()
