import {
  CPI_SERIES_ID,
  CPI_TARGET_YEAR,
  fetchCpiDataset,
  type CpiDataset,
} from "@/lib/bls";
import {
  fetchSpmChildPovertyDataset,
  SPM_TARGET_YEAR,
  type PolicyEnginePolicySnapshot,
  type SpmChildPovertyDataset,
} from "@/lib/census";

export const DATA_POINT_IDS = {
  CPI_U_ANNUAL_PCT_CHANGE_2026: "bls.cpi.u.annual_pct_change.2026",
  SPM_CHILD_POVERTY_RATE_2025: "census.spm.child_poverty_rate.2025",
} as const;

export type DataPointId =
  (typeof DATA_POINT_IDS)[keyof typeof DATA_POINT_IDS];

export type ProcessorInputState = "live" | "mixed";

export interface DataPointSource {
  name: string;
  url: string;
  live: boolean;
  note?: string;
}

export interface DataPointProcessor {
  id: string;
  version: string;
  inputState: ProcessorInputState;
  note: string;
}

export interface DataPointTarget {
  agency: string;
  geography: string;
  period: string;
  measure: string;
  expectedRelease: string;
}

export interface DataPointSnapshot<TDataset, TSummary = unknown> {
  dataPointId: DataPointId;
  fetchedAt: string;
  processor: DataPointProcessor;
  target: DataPointTarget;
  sources: DataPointSource[];
  summary: TSummary;
  preview: unknown;
  caveats: string[];
  dataset: TDataset;
}

export type CpiDataPointSnapshot = DataPointSnapshot<
  CpiDataset,
  CpiDataset["summary"]
>;

export type SpmChildPovertyDataPointSnapshot = DataPointSnapshot<
  SpmChildPovertyDataset,
  SpmChildPovertyDataset["summary"]
>;

export type ForecastDataPointSnapshot =
  | CpiDataPointSnapshot
  | SpmChildPovertyDataPointSnapshot;

export async function getDataPointSnapshot(
  dataPointId: typeof DATA_POINT_IDS.CPI_U_ANNUAL_PCT_CHANGE_2026,
): Promise<CpiDataPointSnapshot>;
export async function getDataPointSnapshot(
  dataPointId: typeof DATA_POINT_IDS.SPM_CHILD_POVERTY_RATE_2025,
  options?: { currentLawPolicy?: PolicyEnginePolicySnapshot },
): Promise<SpmChildPovertyDataPointSnapshot>;
export async function getDataPointSnapshot(
  dataPointId: DataPointId,
  options: { currentLawPolicy?: PolicyEnginePolicySnapshot } = {},
): Promise<ForecastDataPointSnapshot> {
  if (dataPointId === DATA_POINT_IDS.CPI_U_ANNUAL_PCT_CHANGE_2026) {
    return getCpiSnapshot();
  }

  if (dataPointId === DATA_POINT_IDS.SPM_CHILD_POVERTY_RATE_2025) {
    return getSpmChildPovertySnapshot(options);
  }

  throw new Error(`No data-point processor is configured for ${dataPointId}.`);
}

export function serializeDataPointSnapshot(snapshot: ForecastDataPointSnapshot) {
  return JSON.stringify(
    {
      dataPointId: snapshot.dataPointId,
      fetchedAt: snapshot.fetchedAt,
      processor: snapshot.processor,
      target: snapshot.target,
      sources: snapshot.sources,
      preview: snapshot.preview,
      caveats: snapshot.caveats,
    },
    null,
    2,
  );
}

async function getCpiSnapshot(): Promise<CpiDataPointSnapshot> {
  const dataset = await fetchCpiDataset();
  const { observations, summary } = dataset;
  const startYear = CPI_TARGET_YEAR - 7;

  return {
    dataPointId: DATA_POINT_IDS.CPI_U_ANNUAL_PCT_CHANGE_2026,
    fetchedAt: summary.fetchedAt,
    processor: {
      id: "bls.cpi_u_annual_pct_change",
      version: "prototype-v1",
      inputState: "live",
      note: "Normalizes BLS monthly CPI-U observations into the annual-average percent-change target used for forecast and resolution.",
    },
    target: {
      agency: "Bureau of Labor Statistics",
      geography: "United States",
      period: String(CPI_TARGET_YEAR),
      measure:
        "Annual average percent change in CPI-U versus the prior annual average",
      expectedRelease: "January 2027 CPI release",
    },
    sources: [
      {
        name: "BLS public data API",
        url:
          `https://api.bls.gov/publicAPI/v2/timeseries/data/${CPI_SERIES_ID}` +
          `?startyear=${startYear}&endyear=${CPI_TARGET_YEAR}`,
        live: true,
      },
    ],
    summary,
    preview: {
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
    },
    caveats: summary.caveats,
    dataset,
  };
}

async function getSpmChildPovertySnapshot({
  currentLawPolicy,
}: {
  currentLawPolicy?: PolicyEnginePolicySnapshot;
}): Promise<SpmChildPovertyDataPointSnapshot> {
  const dataset = await fetchSpmChildPovertyDataset({ currentLawPolicy });
  const { historical, summary } = dataset;

  return {
    dataPointId: DATA_POINT_IDS.SPM_CHILD_POVERTY_RATE_2025,
    fetchedAt: summary.releaseSchedule.fetchedAt,
    processor: {
      id: "census.spm_child_poverty_rate",
      version: "prototype-v1",
      inputState: "mixed",
      note: "Fetches Census release/SPM pages live and normalizes a seeded SPM child-poverty history until the machine-readable Census table processor is wired.",
    },
    target: {
      agency: "U.S. Census Bureau",
      geography: "United States",
      period: String(SPM_TARGET_YEAR),
      measure: "Supplemental Poverty Measure child poverty rate",
      expectedRelease: summary.expectedRelease,
    },
    sources: [
      {
        name: "Census income, poverty, and health insurance schedule",
        url: summary.releaseSchedule.url,
        live: summary.releaseSchedule.status === "ok",
      },
      {
        name: "Census Supplemental Poverty Measure data tables",
        url: summary.spmTables.url,
        live: summary.spmTables.status === "ok",
      },
      {
        name: "Seeded SPM child-poverty history",
        url: summary.spmTables.url,
        live: false,
        note: "Temporary prototype input pending a machine-readable Census SPM historical table processor.",
      },
    ],
    summary,
    preview: {
      censusReleaseSchedule: summary.releaseSchedule,
      censusSpmTables: summary.spmTables,
      historical: historical.map((point) => ({
        year: point.year,
        spmChildPovertyRatePct: point.childPovertyRatePct,
        note: point.note,
      })),
      expectedRelease: summary.expectedRelease,
      expectedReleaseRationale: summary.expectedReleaseRationale,
    },
    caveats: summary.caveats,
    dataset,
  };
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
