export const CPI_SERIES_ID = "CUUR0000SA0";
export const CPI_MARKET_SLUG = "cpi-u-annual-2026";
export const CPI_TARGET_YEAR = 2026;

interface BlsResponse {
  status: string;
  message?: string[];
  Results?: {
    series?: Array<{
      seriesID: string;
      data: BlsObservationRaw[];
    }>;
  };
}

interface BlsObservationRaw {
  year: string;
  period: string;
  periodName: string;
  latest?: string;
  value: string;
  footnotes?: Array<{ code?: string; text?: string }>;
}

export interface CpiObservation {
  year: number;
  month: number;
  period: string;
  periodName: string;
  value: number;
  latest: boolean;
  footnotes: string[];
}

export interface AnnualAverage {
  year: number;
  months: number;
  average: number;
  complete: boolean;
  changeFromPreviousCompleteYearPct?: number;
}

export interface CpiSummary {
  seriesId: string;
  fetchedAt: string;
  latest: CpiObservation;
  annualAverages: AnnualAverage[];
  targetYear: number;
  targetYearMonths: number;
  targetYtdAverage: number;
  priorYear: number;
  priorYearMonths: number;
  priorYearObservedAverage: number;
  targetYtdVsPriorObservedAveragePct: number;
  carryForwardAnnualAverageInflationPct: number;
  recentAnnualizedPct: number;
  caveats: string[];
}

export interface CpiDataset {
  observations: CpiObservation[];
  summary: CpiSummary;
}

export async function fetchCpiDataset(): Promise<CpiDataset> {
  const startYear = CPI_TARGET_YEAR - 7;
  const url =
    `https://api.bls.gov/publicAPI/v2/timeseries/data/${CPI_SERIES_ID}` +
    `?startyear=${startYear}&endyear=${CPI_TARGET_YEAR}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`BLS request failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as BlsResponse;
  if (payload.status !== "REQUEST_SUCCEEDED") {
    throw new Error(payload.message?.join("; ") || "BLS request failed");
  }

  const raw = payload.Results?.series?.[0]?.data;
  if (!raw?.length) {
    throw new Error("BLS returned no CPI observations");
  }

  const observations = raw
    .filter((point) => /^M(0[1-9]|1[0-2])$/.test(point.period))
    .filter((point) => Number.isFinite(Number(point.value)))
    .map((point) => ({
      year: Number(point.year),
      month: Number(point.period.slice(1)),
      period: point.period,
      periodName: point.periodName,
      value: Number(point.value),
      latest: point.latest === "true",
      footnotes:
        point.footnotes
          ?.map((footnote) => footnote.text)
          .filter((text): text is string => Boolean(text)) ?? [],
    }))
    .sort((a, b) => a.year - b.year || a.month - b.month);

  if (!observations.length) {
    throw new Error("BLS returned no numeric monthly CPI observations");
  }

  return {
    observations,
    summary: buildCpiSummary(observations),
  };
}

export function serializeCpiToolResult(dataset: CpiDataset) {
  const { observations, summary } = dataset;
  return JSON.stringify(
    {
      seriesId: summary.seriesId,
      latest: {
        year: summary.latest.year,
        month: summary.latest.periodName,
        value: summary.latest.value,
      },
      annualAverages: summary.annualAverages.slice(-5),
      targetYear: {
        observedMonths: summary.targetYearMonths,
        ytdAverage: round(summary.targetYtdAverage, 3),
        ytdVsPriorObservedAveragePct: round(
          summary.targetYtdVsPriorObservedAveragePct,
          2,
        ),
        carryForwardAnnualAverageInflationPct: round(
          summary.carryForwardAnnualAverageInflationPct,
          2,
        ),
        recentAnnualizedPct: round(summary.recentAnnualizedPct, 2),
      },
      recentObservations: observations.slice(-8).map((point) => ({
        date: `${point.year}-${String(point.month).padStart(2, "0")}`,
        value: point.value,
      })),
      caveats: summary.caveats,
    },
    null,
    2,
  );
}

export function formatCpiSummary(summary: CpiSummary) {
  return [
    `Latest CPI-U observation is ${summary.latest.periodName} ${summary.latest.year} at ${summary.latest.value.toFixed(3)}.`,
    `${summary.targetYear} has ${summary.targetYearMonths} observed months; the observed-year average is ${summary.targetYtdAverage.toFixed(3)}, ${summary.targetYtdVsPriorObservedAveragePct.toFixed(2)}% above the ${summary.priorYear} observed average.`,
    `If the latest CPI-U level persisted through December, annual-average inflation would be ${summary.carryForwardAnnualAverageInflationPct.toFixed(2)}%.`,
    `The most recent monthly changes annualize to ${summary.recentAnnualizedPct.toFixed(2)}%, so the live data put more weight on upside risk than the static mock did.`,
  ].join(" ");
}

function buildCpiSummary(observations: CpiObservation[]): CpiSummary {
  const latest =
    observations.find((point) => point.latest) ??
    observations[observations.length - 1];
  const annualAverages = buildAnnualAverages(observations);
  const targetYearPoints = observations.filter(
    (point) => point.year === CPI_TARGET_YEAR,
  );
  const priorYear = CPI_TARGET_YEAR - 1;
  const priorYearPoints = observations.filter(
    (point) => point.year === priorYear,
  );
  const targetYtdAverage = average(
    targetYearPoints.map((point) => point.value),
  );
  const priorYearObservedAverage = average(
    priorYearPoints.map((point) => point.value),
  );
  const carryForwardAverage = average([
    ...targetYearPoints.map((point) => point.value),
    ...Array.from({ length: 12 - targetYearPoints.length }, () => latest.value),
  ]);

  const missingPriorMonths = new Set(
    Array.from({ length: 12 }, (_, index) => index + 1),
  );
  for (const point of priorYearPoints) missingPriorMonths.delete(point.month);

  return {
    seriesId: CPI_SERIES_ID,
    fetchedAt: new Date().toISOString(),
    latest,
    annualAverages,
    targetYear: CPI_TARGET_YEAR,
    targetYearMonths: targetYearPoints.length,
    targetYtdAverage,
    priorYear,
    priorYearMonths: priorYearPoints.length,
    priorYearObservedAverage,
    targetYtdVsPriorObservedAveragePct:
      percentChange(targetYtdAverage, priorYearObservedAverage) ?? 0,
    carryForwardAnnualAverageInflationPct:
      percentChange(carryForwardAverage, priorYearObservedAverage) ?? 0,
    recentAnnualizedPct: recentAnnualizedRate(observations),
    caveats:
      missingPriorMonths.size > 0
        ? [
            `${priorYear} has ${priorYearPoints.length} numeric monthly observations in the BLS API response; missing months: ${Array.from(
              missingPriorMonths,
            ).join(", ")}.`,
          ]
        : [],
  };
}

function buildAnnualAverages(observations: CpiObservation[]): AnnualAverage[] {
  const byYear = new Map<number, CpiObservation[]>();
  for (const point of observations) {
    byYear.set(point.year, [...(byYear.get(point.year) ?? []), point]);
  }

  const annualAverages: AnnualAverage[] = Array.from(byYear.entries())
    .map(([year, points]) => ({
      year,
      months: points.length,
      average: average(points.map((point) => point.value)),
      complete: points.length === 12,
    }))
    .sort((a, b) => a.year - b.year);

  for (const annualAverage of annualAverages) {
    const previous = [...annualAverages]
      .reverse()
      .find(
        (candidate) =>
          candidate.year < annualAverage.year && candidate.complete,
      );
    if (annualAverage.complete && previous) {
      annualAverage.changeFromPreviousCompleteYearPct =
        percentChange(annualAverage.average, previous.average) ?? undefined;
    }
  }

  return annualAverages;
}

function recentAnnualizedRate(observations: CpiObservation[]) {
  const recent = observations.slice(-4);
  if (recent.length < 2) return 0;
  const rates = recent
    .slice(1)
    .map((point, index) => point.value / recent[index].value - 1);
  const compounded = rates.reduce((product, rate) => product * (1 + rate), 1);
  return (Math.pow(compounded, 12 / rates.length) - 1) * 100;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentChange(value: number, base: number) {
  if (!Number.isFinite(value) || !Number.isFinite(base) || base === 0) {
    return null;
  }
  return (value / base - 1) * 100;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
