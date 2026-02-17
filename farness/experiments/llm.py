"""Shared LLM client for experiments.

Uses the Anthropic Python SDK directly instead of shelling out to `claude -p`,
which fails inside Claude Code sessions.
"""

from __future__ import annotations

import os
import subprocess
import time

import anthropic


def _load_api_key() -> str:
    """Load Anthropic API key from env or macOS keychain."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key

    # Try macOS keychain
    try:
        result = subprocess.run(
            ["security", "find-generic-password", "-s", "claude-env", "-a", "ANTHROPIC_API_KEY", "-w"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    raise RuntimeError(
        "ANTHROPIC_API_KEY not found. Set it as an environment variable "
        "or store it in the macOS keychain with service 'claude-env'."
    )


def call_llm(
    prompt: str,
    model: str = "claude-opus-4-6",
    max_tokens: int = 4096,
    temperature: float = 1.0,
    timeout: float = 180.0,
) -> tuple[str, float]:
    """Call the Anthropic API and return (response_text, duration_seconds).

    Args:
        prompt: The user message to send
        model: Model ID
        max_tokens: Max response tokens
        temperature: Sampling temperature (1.0 = default, good for experiment variance)
        timeout: Request timeout in seconds

    Returns:
        Tuple of (response_text, duration_seconds)
    """
    client = anthropic.Anthropic(api_key=_load_api_key())

    start = time.time()
    try:
        message = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
            timeout=timeout,
        )
        response = message.content[0].text
    except anthropic.APITimeoutError:
        response = "ERROR: Timeout"
    except anthropic.APIError as e:
        response = f"ERROR: {e}"

    duration = time.time() - start
    return response, duration
