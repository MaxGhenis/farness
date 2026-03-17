"""Tests for shared LLM retry behavior."""

from farness.experiments import llm


def test_retryable_error_detection():
    """Transient provider failures should be recognized as retryable."""
    assert llm._is_retryable_error("ERROR: Timeout")
    assert llm._is_retryable_error("ERROR: Error code: 529 - overloaded")
    assert llm._is_retryable_error("ERROR: rate limit exceeded")
    assert not llm._is_retryable_error("ERROR: invalid API key")
    assert not llm._is_retryable_error("All good")


def test_call_llm_retries_retryable_errors(monkeypatch):
    """call_llm should retry transient errors before succeeding."""
    responses = iter(["ERROR: Timeout", "ERROR: overloaded", "final response"])
    calls = []

    def fake_call(prompt, model, max_tokens, temperature, timeout):
        calls.append(model)
        return next(responses)

    monkeypatch.setattr(llm, "_call_openai", fake_call)
    monkeypatch.setattr(llm.time, "sleep", lambda _: None)

    response, _ = llm.call_llm("test", model="gpt-5.2", max_retries=3)
    assert response == "final response"
    assert len(calls) == 3


def test_call_llm_does_not_retry_non_retryable_errors(monkeypatch):
    """Permanent errors should return immediately."""
    calls = []

    def fake_call(prompt, model, max_tokens, temperature, timeout):
        calls.append(model)
        return "ERROR: invalid API key"

    monkeypatch.setattr(llm, "_call_openai", fake_call)
    monkeypatch.setattr(llm.time, "sleep", lambda _: None)

    response, _ = llm.call_llm("test", model="gpt-5.2", max_retries=3)
    assert response == "ERROR: invalid API key"
    assert len(calls) == 1
