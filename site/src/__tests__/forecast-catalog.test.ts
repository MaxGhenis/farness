import { describe, expect, it } from "vitest";
import { MARKETS } from "@/data/markets";

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
});
