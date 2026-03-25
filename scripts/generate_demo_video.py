#!/usr/bin/env python3
"""Generate the farness end-to-end workflow demo video."""

from __future__ import annotations

import math
import os
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable

from PIL import Image
from PIL import ImageDraw
from PIL import ImageFilter
from PIL import ImageFont

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from farness.framework import Decision  # noqa: E402
from farness.framework import Forecast  # noqa: E402
from farness.framework import KPI  # noqa: E402
from farness.framework import Option  # noqa: E402
from farness.storage import DecisionStore  # noqa: E402


WIDTH = 1280
HEIGHT = 800
FPS = 16
DURATION = 18.0
OUT_DIR = ROOT / "site" / "public" / "demo"
VIDEO_PATH = OUT_DIR / "farness-demo.mp4"
POSTER_PATH = OUT_DIR / "farness-demo-poster.png"

BG_TOP = "#F9FCFE"
BG_BOTTOM = "#EEF4F8"
INK = "#14202B"
INK_MUTED = "#415463"
INK_DIM = "#6B7C89"
BORDER = "#D9E4EC"
BORDER_STRONG = "#BED0DB"
ROSE = "#A94E80"
ROSE_SOFT = "#F6E7F0"
BLUE = "#7FB2DA"
BLUE_DARK = "#356C99"
PANEL_DARK = "#0F1A24"
PANEL_DARK_TOP = "#172633"
PANEL_BORDER = "#2B3D4B"
INK_TEXT = "#E8F0F5"
INK_SOFT = "#9DB1BF"
VIOLET = "#8F7CFF"
GOLD = "#F3B562"

MONO_FONT = Path("/System/Library/Fonts/Menlo.ttc")
BODY_FONT = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
DISPLAY_FONT = Path("/System/Library/Fonts/Supplemental/Georgia.ttf")
DISPLAY_ITALIC_FONT = Path("/System/Library/Fonts/Supplemental/Georgia Italic.ttf")


@dataclass(frozen=True)
class TerminalEvent:
    start: float
    command: str
    output: list[str]
    type_duration: float = 0.8
    output_delay: float = 0.18
    line_duration: float = 0.12
    hold: float = 0.3


@dataclass(frozen=True)
class DemoState:
    decision_id: str
    setup_lines: list[str]
    doctor_lines: list[str]
    new_lines: list[str]
    show_lines: list[str]
    list_lines: list[str]


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


DISPLAY_40 = load_font(DISPLAY_FONT, 40)
DISPLAY_28 = load_font(DISPLAY_FONT, 28)
DISPLAY_24 = load_font(DISPLAY_FONT, 24)
DISPLAY_20 = load_font(DISPLAY_FONT, 20)
DISPLAY_ITALIC_22 = load_font(DISPLAY_ITALIC_FONT, 22)
BODY_18 = load_font(BODY_FONT, 18)
BODY_20 = load_font(BODY_FONT, 20)
BODY_24 = load_font(BODY_FONT, 24)
BODY_16 = load_font(BODY_FONT, 16)
MONO_16 = load_font(MONO_FONT, 16)
MONO_18 = load_font(MONO_FONT, 18)
MONO_20 = load_font(MONO_FONT, 20)
MONO_24 = load_font(MONO_FONT, 24)


def hex_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def ease_in_out(value: float) -> float:
    value = clamp(value)
    return value * value * (3 - 2 * value)


def lerp(start: float, end: float, t: float) -> float:
    return start + (end - start) * t


def blend(a: str, b: str, t: float) -> tuple[int, int, int]:
    ar, ag, ab, _ = hex_rgba(a)
    br, bg, bb, _ = hex_rgba(b)
    return (
        int(lerp(ar, br, t)),
        int(lerp(ag, bg, t)),
        int(lerp(ab, bb, t)),
    )


def ffmpeg_path() -> str:
    binary = shutil.which("ffmpeg")
    if binary is None:
        raise RuntimeError("ffmpeg is required to generate the demo video.")
    return binary


def run(cmd: list[str], env: dict[str, str]) -> list[str]:
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(ROOT),
        env=env,
        check=False,
    )
    if result.returncode != 0:
        stderr = result.stderr.strip() or result.stdout.strip()
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{stderr}")
    return result.stdout.rstrip().splitlines()


def sanitize(lines: Iterable[str], *, decision_id: str | None = None) -> list[str]:
    sanitized: list[str] = []
    for raw in lines:
        line = raw.strip("\n")
        if line.startswith("Installed codex skill at "):
            line = "Installed codex skill at ~/.codex/skills/farness/SKILL.md"
        elif line.startswith("Configured MCP server `farness` in codex using "):
            line = "Configured MCP server `farness` in codex using python3."
        elif line.startswith("CLI found: "):
            line = "CLI found: codex"
        line = line.replace("(⏳ pending)", "(pending)")
        if decision_id is not None:
            line = line.replace(decision_id, decision_id[:8])
        sanitized.append(line)
    return sanitized


def build_demo_state() -> DemoState:
    fallback_id = "d73b2ec2"
    fallback = DemoState(
        decision_id=fallback_id,
        setup_lines=[
            "Installed codex skill at ~/.codex/skills/farness/SKILL.md",
            "Configured MCP server `farness` in codex using python3.",
            "Restart the agent so it picks up the new skill and MCP server.",
        ],
        doctor_lines=[
            "Agent: codex",
            "Skill path: ~/.codex/skills/farness/SKILL.md",
            "Skill status: installed",
            "CLI found: codex",
            "MCP server `farness` configured: yes",
            "Status: ready. Restart the agent if it was already open.",
        ],
        new_lines=[
            "Created decision [d73b2ec2]: Should we rewrite the auth layer now?",
        ],
        show_lines=[
            "Decision: Should we rewrite the auth layer now?",
            "ID: d73b2ec2",
            "Created: 2026-03-25 16:36",
            "",
            "KPIs:",
            "  - incident_reduction_probability",
            "  - roadmap_slip_weeks",
            "",
            "Chosen: harden_existing",
        ],
        list_lines=[
            "All decisions (1):",
            "",
            "  [d73b2ec2] Should we rewrite the auth layer now? (pending)",
        ],
    )

    if shutil.which("codex") is None:
        return fallback

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            temp_root = Path(tmpdir)
            env = os.environ.copy()
            env["HOME"] = str(temp_root / "home")
            env["CODEX_HOME"] = str(temp_root / "codex")
            env["FARNESS_STORE_PATH"] = str(temp_root / "decisions.jsonl")
            Path(env["HOME"]).mkdir(parents=True, exist_ok=True)
            Path(env["CODEX_HOME"]).mkdir(parents=True, exist_ok=True)

            setup_lines = run([sys.executable, "-m", "farness.cli", "setup", "codex"], env)
            doctor_lines = run([sys.executable, "-m", "farness.cli", "doctor", "codex"], env)

            store = DecisionStore(Path(env["FARNESS_STORE_PATH"]))
            decision = Decision(
                question="Should we rewrite the auth layer now?",
                context=(
                    "3 incidents this quarter; team strongest in Node; "
                    "two roadmap commitments tied to Q2 launch."
                ),
                kpis=[
                    KPI(
                        name="incident_reduction_probability",
                        description=(
                            "Probability of reducing critical auth incidents by more "
                            "than 40% within 90 days."
                        ),
                        unit="%",
                        target=60.0,
                    ),
                    KPI(
                        name="roadmap_slip_weeks",
                        description="Net roadmap delay over the next quarter.",
                        unit="weeks",
                        target=1.0,
                        weight=0.7,
                    ),
                ],
                options=[
                    Option(
                        name="rewrite_now",
                        description="Rewrite the auth layer immediately.",
                        forecasts={
                            "incident_reduction_probability": Forecast(46.0, (30.0, 60.0)),
                            "roadmap_slip_weeks": Forecast(3.0, (2.0, 5.0)),
                        },
                    ),
                    Option(
                        name="harden_existing",
                        description="Stabilize the current service and defer a rewrite.",
                        forecasts={
                            "incident_reduction_probability": Forecast(64.0, (51.0, 74.0)),
                            "roadmap_slip_weeks": Forecast(1.0, (0.0, 2.0)),
                        },
                    ),
                    Option(
                        name="defer_60d",
                        description="Defer the decision for 60 days while gathering more data.",
                        forecasts={
                            "incident_reduction_probability": Forecast(29.0, (18.0, 40.0)),
                            "roadmap_slip_weeks": Forecast(0.0, (0.0, 1.0)),
                        },
                    ),
                ],
                chosen_option="harden_existing",
                review_date=datetime.fromisoformat("2026-06-15T00:00:00"),
                reflections=(
                    "Rewrite-first is attractive, but the outside view still favors "
                    "mitigation before replacement."
                ),
            )
            store.save(decision)

            show_lines = run(
                [sys.executable, "-m", "farness.cli", "show", decision.id],
                env,
            )
            list_lines = run([sys.executable, "-m", "farness.cli", "list"], env)

            show_subset = [
                show_lines[0],
                f"ID: {decision.id[:8]}",
                show_lines[2],
                "",
                "KPIs:",
                "  - incident_reduction_probability",
                "  - roadmap_slip_weeks",
                "",
                show_lines[-1],
            ]

            return DemoState(
                decision_id=decision.id[:8],
                setup_lines=sanitize(setup_lines),
                doctor_lines=sanitize(doctor_lines),
                new_lines=[
                    f"Created decision [{decision.id[:8]}]: {decision.question}",
                ],
                show_lines=sanitize(show_subset, decision_id=decision.id),
                list_lines=sanitize(list_lines, decision_id=decision.id),
            )
    except Exception:
        return fallback


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    if not text:
        return [""]
    words = text.split(" ")
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def panel_shadow(base: Image.Image, box: tuple[int, int, int, int], radius: int, opacity: int) -> None:
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    x0, y0, x1, y1 = box
    shadow_draw.rounded_rectangle(
        (x0, y0 + 12, x1, y1 + 12),
        radius=radius,
        fill=(15, 26, 36, opacity),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(shadow)


def draw_gradient_background(t: float) -> Image.Image:
    image = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    draw = ImageDraw.Draw(image)
    for y in range(HEIGHT):
        color = blend(BG_TOP, BG_BOTTOM, y / max(HEIGHT - 1, 1))
        draw.line((0, y, WIDTH, y), fill=color)

    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    phase = math.sin(t * 0.9) * 0.5 + 0.5
    glow_draw.ellipse((-160, -120, 700, 420), fill=hex_rgba("#9FC4E6", int(42 + phase * 18)))
    glow_draw.ellipse((760, 120, 1320, 620), fill=hex_rgba("#E7A6C8", 34))
    glow_draw.ellipse((760, -200, 1460, 260), fill=hex_rgba("#BED0DB", 28))
    glow = glow.filter(ImageFilter.GaussianBlur(72))
    image.alpha_composite(glow)
    return image


def typing_lines(events: list[TerminalEvent], t: float) -> list[tuple[str, str]]:
    lines: list[tuple[str, str]] = []
    for event in events:
        if t < event.start:
            break

        elapsed = t - event.start
        typed_ratio = clamp(elapsed / event.type_duration)
        typed_chars = int(len(event.command) * typed_ratio)
        command_text = event.command[:typed_chars]

        if typed_ratio < 1.0:
            lines.append(("command_active", f"$ {command_text}"))
            break

        lines.append(("command", f"$ {event.command}"))
        reveal_elapsed = elapsed - event.type_duration - event.output_delay
        if reveal_elapsed < 0:
            break

        visible = min(len(event.output), int(reveal_elapsed / event.line_duration) + 1)
        for output_line in event.output[:visible]:
            lines.append(("output", output_line))

        event_end = (
            event.type_duration
            + event.output_delay
            + len(event.output) * event.line_duration
            + event.hold
        )
        if elapsed < event_end:
            break
        lines.append(("spacer", ""))
    return lines


def render_terminal(
    base: Image.Image,
    *,
    t: float,
    box: tuple[int, int, int, int],
    events: list[TerminalEvent],
    title: str,
) -> None:
    panel_shadow(base, box, radius=28, opacity=62)
    panel = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(panel)
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=28, fill=hex_rgba(PANEL_DARK, 255), outline=hex_rgba(PANEL_BORDER), width=1)
    draw.rounded_rectangle((x0, y0, x1, y0 + 48), radius=28, fill=hex_rgba(PANEL_DARK_TOP))
    draw.rectangle((x0, y0 + 24, x1, y0 + 48), fill=hex_rgba(PANEL_DARK_TOP))

    for i, color in enumerate(("#FC5F57", "#FDBC2E", "#28C840")):
        draw.ellipse((x0 + 22 + i * 20, y0 + 17, x0 + 34 + i * 20, y0 + 29), fill=hex_rgba(color))
    draw.text((x0 + 76, y0 + 14), title, font=MONO_18, fill=hex_rgba(INK_SOFT))

    body_x = x0 + 24
    body_y = y0 + 68
    max_width = (x1 - x0) - 48
    line_gap = 10
    cursor_visible = int(t * 2.5) % 2 == 0
    prepared: list[tuple[str, list[str], int]] = []
    total_height = 0

    for style, text in typing_lines(events, t):
        if style == "spacer":
            prepared.append((style, [""], 8))
            total_height += 8
            continue

        if style == "command_active" and cursor_visible:
            text += "_"
        wrapped = wrap_text(draw, text, MONO_16, max_width)
        block_height = len(wrapped) * (MONO_16.size + line_gap)
        prepared.append((style, wrapped, block_height))
        total_height += block_height

    available_height = (y1 - 32) - body_y
    while prepared and total_height > available_height:
        _, _, removed = prepared.pop(0)
        total_height -= removed

    y = body_y
    for style, wrapped_lines, _ in prepared:
        if style == "spacer":
            y += 8
            continue

        fill = hex_rgba(INK_TEXT)
        if style in {"command", "command_active"}:
            fill = hex_rgba(BLUE)
        elif style == "output":
            fill = hex_rgba(INK_SOFT)

        for wrapped in wrapped_lines:
            draw.text((body_x, y), wrapped, font=MONO_16, fill=fill)
            y += MONO_16.size + line_gap

    base.alpha_composite(panel)


def draw_badge(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fill: str, fg: str = "#FFFFFF") -> None:
    x, y = xy
    padding_x = 14
    padding_y = 8
    width = int(draw.textlength(text, font=MONO_16)) + padding_x * 2
    height = MONO_16.size + padding_y * 2 - 2
    draw.rounded_rectangle((x, y, x + width, y + height), radius=height // 2, fill=hex_rgba(fill))
    draw.text((x + padding_x, y + padding_y - 1), text, font=MONO_16, fill=hex_rgba(fg))


def draw_probability_row(
    draw: ImageDraw.ImageDraw,
    *,
    x: int,
    y: int,
    label: str,
    value: float,
    ci_low: float,
    ci_high: float,
    slip: str,
    accent: str,
) -> None:
    draw.text((x, y), label, font=MONO_18, fill=hex_rgba(INK))
    bar_x = x + 188
    bar_y = y + 7
    bar_w = 194
    bar_h = 14
    draw.rounded_rectangle(
        (bar_x, bar_y, bar_x + bar_w, bar_y + bar_h),
        radius=7,
        fill=hex_rgba("#EAF1F6"),
    )
    interval_x0 = bar_x + int(bar_w * (ci_low / 100.0))
    interval_x1 = bar_x + int(bar_w * (ci_high / 100.0))
    draw.rounded_rectangle(
        (interval_x0, bar_y, interval_x1, bar_y + bar_h),
        radius=7,
        fill=hex_rgba(accent, 84),
    )
    point_x = bar_x + int(bar_w * (value / 100.0))
    draw.ellipse((point_x - 6, bar_y - 1, point_x + 6, bar_y + 11), fill=hex_rgba(accent))
    draw.text((bar_x + bar_w + 14, y - 1), f"{int(value)}% [{int(ci_low)}-{int(ci_high)}]", font=MONO_16, fill=hex_rgba(BLUE_DARK))
    draw.text((bar_x + bar_w + 124, y - 1), slip, font=MONO_16, fill=hex_rgba(INK_DIM))


def draw_codex_panel(base: Image.Image, *, t: float, box: tuple[int, int, int, int]) -> None:
    appear = ease_in_out((t - 7.3) / 1.0)
    if appear <= 0:
        return

    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x0, y0, x1, y1 = box
    y_shift = int(18 * (1 - appear))

    panel_shadow(base, (x0, y0 + y_shift, x1, y1 + y_shift), radius=30, opacity=int(68 * appear))
    draw.rounded_rectangle(
        (x0, y0 + y_shift, x1, y1 + y_shift),
        radius=30,
        fill=hex_rgba("#FCFDFE", int(255 * appear)),
        outline=hex_rgba(BORDER, int(255 * appear)),
        width=1,
    )

    header_y = y0 + 28 + y_shift
    draw.text((x0 + 26, header_y), "Codex", font=DISPLAY_24, fill=hex_rgba(INK, int(255 * appear)))
    draw.text((x0 + 112, header_y + 3), "native skill + local MCP", font=MONO_16, fill=hex_rgba(INK_DIM, int(255 * appear)))
    draw_badge(draw, (x1 - 116, header_y - 2), "$farness", fill=ROSE, fg="#FCFDFE")

    bubble_box = (x0 + 24, y0 + 72 + y_shift, x1 - 24, y0 + 148 + y_shift)
    draw.rounded_rectangle(bubble_box, radius=22, fill=hex_rgba("#F4F8FB", int(255 * appear)))
    draw.text((bubble_box[0] + 18, bubble_box[1] + 18), "Should we rewrite the auth layer now?", font=DISPLAY_20, fill=hex_rgba(INK, int(255 * appear)))
    draw.text(
        (bubble_box[0] + 18, bubble_box[1] + 48),
        "3 incidents this quarter. Node team. Q2 launch locked.",
        font=BODY_18,
        fill=hex_rgba(INK_MUTED, int(255 * appear)),
    )

    details_y = y0 + 186 + y_shift
    draw.text((x0 + 24, details_y), "KPI", font=MONO_16, fill=hex_rgba(ROSE, int(255 * appear)))
    draw.text((x0 + 24, details_y + 22), "incident_reduction_probability / 90d", font=MONO_20, fill=hex_rgba(INK, int(255 * appear)))
    draw.text((x0 + 24, details_y + 54), "Outside view says rewrites rarely pay back this quickly.", font=BODY_18, fill=hex_rgba(INK_MUTED, int(255 * appear)))

    row_start = details_y + 106
    rows = [
        ("rewrite_now", 46, 30, 60, "slip 3w", BLUE),
        ("harden_existing", 64, 51, 74, "slip 1w", ROSE),
        ("defer_60d", 29, 18, 40, "slip 0w", GOLD),
    ]
    for index, (label, value, low, high, slip, accent) in enumerate(rows):
        row_progress = ease_in_out((t - (8.1 + index * 0.45)) / 0.45)
        if row_progress <= 0:
            continue
        row_y = int(row_start + index * 58 + 10 * (1 - row_progress))
        draw_probability_row(
            draw,
            x=x0 + 24,
            y=row_y,
            label=label,
            value=value,
            ci_low=low,
            ci_high=high,
            slip=slip,
            accent=accent,
        )

    note_y = y0 + 452 + y_shift
    notes = [
        ("Base rate", "27% quick payoff in similar infra rewrites", BLUE_DARK),
        ("Counterevidence", "recent outage may overweight urgency", "#C96B9C"),
        ("Recommendation", "harden_existing", INK),
        ("Review date", "2026-06-15", INK_MUTED),
    ]
    for index, (label, value, color) in enumerate(notes):
        note_progress = ease_in_out((t - (9.6 + index * 0.3)) / 0.35)
        if note_progress <= 0:
            continue
        alpha = int(255 * note_progress * appear)
        label_y = int(note_y + index * 42 + 8 * (1 - note_progress))
        draw.text((x0 + 24, label_y), label, font=MONO_16, fill=hex_rgba(ROSE if index != 2 else BLUE, alpha))
        draw.text((x0 + 210, label_y - 1), value, font=BODY_18, fill=hex_rgba(color, alpha))

    base.alpha_composite(overlay)


def draw_intro(base: Image.Image, t: float) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    alpha = int(255 * ease_in_out((t - 0.1) / 0.8))
    draw.text((88, 86), "farness", font=DISPLAY_40, fill=hex_rgba(INK, alpha))
    draw.text((248, 95), "end-to-end setup for Codex", font=MONO_18, fill=hex_rgba(ROSE, alpha))
    draw.text(
        (88, 138),
        "Install the package, register the MCP server, use $farness, then keep the decision in a local log.",
        font=BODY_20,
        fill=hex_rgba(INK_MUTED, alpha),
    )
    draw_badge(draw, (88, 192), "setup", fill=ROSE)
    draw_badge(draw, (182, 192), "$farness", fill=BLUE_DARK)
    draw_badge(draw, (308, 192), "review locally", fill=INK)
    base.alpha_composite(overlay)


def terminal_box(t: float) -> tuple[int, int, int, int]:
    full = (88, 246, 1192, 696)
    split = (76, 238, 594, 688)
    progress = ease_in_out((t - 7.0) / 1.0)
    return tuple(
        int(lerp(start, end, progress))
        for start, end in zip(full, split, strict=True)
    )


def render_frame(t: float, state: DemoState, *, title_text: str) -> Image.Image:
    image = draw_gradient_background(t)
    draw_intro(image, t)

    events = [
        TerminalEvent(
            start=1.0,
            command="python -m pip install 'farness[mcp]'",
            output=[
                "Collecting farness[mcp]",
                "Installing collected packages: farness",
                "Successfully installed farness-0.2.4",
            ],
            type_duration=1.25,
            line_duration=0.24,
            hold=0.4,
        ),
        TerminalEvent(
            start=4.1,
            command="farness setup codex",
            output=state.setup_lines,
            type_duration=0.85,
            line_duration=0.18,
            hold=0.35,
        ),
        TerminalEvent(
            start=6.7,
            command="farness doctor codex",
            output=state.doctor_lines,
            type_duration=0.85,
            line_duration=0.15,
            hold=0.3,
        ),
        TerminalEvent(
            start=8.6,
            command='farness new "Should we rewrite the auth layer now?"',
            output=state.new_lines,
            type_duration=1.3,
            line_duration=0.18,
            hold=0.18,
        ),
        TerminalEvent(
            start=10.8,
            command=f"farness show {state.decision_id}",
            output=state.show_lines,
            type_duration=0.95,
            line_duration=0.16,
            hold=0.18,
        ),
        TerminalEvent(
            start=14.0,
            command="farness list",
            output=state.list_lines,
            type_duration=0.65,
            line_duration=0.16,
            hold=1.0,
        ),
    ]
    render_terminal(image, t=t, box=terminal_box(t), events=events, title=title_text)
    draw_codex_panel(image, t=t, box=(628, 168, 1214, 700))
    return image.convert("RGB")


def build_video() -> None:
    state = build_demo_state()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    frame_count = int(DURATION * FPS)
    ffmpeg = ffmpeg_path()

    with tempfile.TemporaryDirectory() as tmpdir:
        temp_dir = Path(tmpdir)
        poster_frame = int(16.2 * FPS)
        for frame in range(frame_count):
            t = frame / FPS
            image = render_frame(t, state, title_text="Codex setup + decision log")
            image.save(temp_dir / f"frame_{frame:04d}.png")
            if frame == poster_frame:
                image.save(POSTER_PATH)

        subprocess.run(
            [
                ffmpeg,
                "-y",
                "-framerate",
                str(FPS),
                "-i",
                str(temp_dir / "frame_%04d.png"),
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                "-crf",
                "24",
                str(VIDEO_PATH),
            ],
            check=True,
        )


def main() -> None:
    build_video()
    print(f"Wrote {VIDEO_PATH}")
    print(f"Wrote {POSTER_PATH}")


if __name__ == "__main__":
    main()
