import { describe, expect, it } from "vitest";
import { LIVE_FORECAST_SLUGS, MARKETS } from "@/data/markets";

describe("forecast catalog", () => {
  it("has unique slugs", () => {
    const slugs = MARKETS.map((forecast) => forecast.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has valid 80% intervals", () => {
    for (const forecast of MARKETS) {
      expect(forecast.confidence).toBe(0.8);
      expect(forecast.ciLow).toBeLessThanOrEqual(forecast.pointEstimate);
      expect(forecast.pointEstimate).toBeLessThanOrEqual(forecast.ciHigh);
    }
  });

  it("has enough public context to stand alone", () => {
    for (const forecast of MARKETS) {
      expect(forecast.question.length).toBeGreaterThan(40);
      expect(forecast.resolutionRule.length).toBeGreaterThan(60);
      expect(forecast.drivers.length).toBeGreaterThanOrEqual(3);
      expect(forecast.reasoning.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("does not call user-facing forecast cells markets", () => {
    for (const forecast of MARKETS) {
      expect(forecast.title).not.toMatch(/\bmarkets?\b/i);
      expect(forecast.question).not.toMatch(/\bmarkets?\b/i);
    }
  });

  it("only marks known forecast cells as live API paths", () => {
    const slugs = new Set(MARKETS.map((forecast) => forecast.slug));
    for (const slug of LIVE_FORECAST_SLUGS) {
      expect(slugs.has(slug)).toBe(true);
    }
  });

  it("uses public data point terminology for government data forecasts", () => {
    for (const forecast of MARKETS) {
      if (forecast.type === "data") {
        expect(forecast.dataPointId).toBeTruthy();
      }
    }
  });

  it("prioritizes near-term 2025 Census release targets", () => {
    const slugs = new Set(MARKETS.map((forecast) => forecast.slug));
    expect(slugs.has("spm-child-poverty-2025")).toBe(true);
    expect(LIVE_FORECAST_SLUGS.has("spm-child-poverty-2025")).toBe(true);
    expect(slugs.has("spm-poverty-rate-2025")).toBe(true);
    expect(slugs.has("official-poverty-rate-2025")).toBe(true);
    expect(slugs.has("median-household-income-2025")).toBe(true);
    expect(slugs.has("federal-spm-poverty-rate-2026")).toBe(false);
  });
});
