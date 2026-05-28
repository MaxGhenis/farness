import type { PolicyEnginePolicy } from "@/lib/policyengine";

export const SPM_CHILD_POVERTY_2025_SLUG = "spm-child-poverty-2025";
export const SPM_TARGET_YEAR = 2025;

const CENSUS_INCOME_POVERTY_SCHEDULE_URL =
  "https://www.census.gov/newsroom/press-releases/2025/income-poverty-schedule.html";
const CENSUS_SPM_TABLES_URL =
  "https://www.census.gov/topics/income-poverty/supplemental-poverty-measure/data/tables.html";

const SPM_CHILD_POVERTY_HISTORY: SpmHistoryPoint[] = [
  {
    year: 2021,
    childPovertyRatePct: 5.2,
    note: "Expanded Child Tax Credit year; low anchor for current-law comparisons.",
  },
  {
    year: 2022,
    childPovertyRatePct: 12.4,
    note: "Post-expanded-CTC rebound year.",
  },
  {
    year: 2023,
    childPovertyRatePct: 13.7,
    note: "Recent high-water mark in the prototype history.",
  },
  {
    year: 2024,
    childPovertyRatePct: 13.4,
    note: "Latest published SPM child poverty rate used by this prototype.",
  },
];

const SPM_CHILD_POVERTY_CALIBRATION: SpmChildPovertyCalibration = {
  policyEngineCurrentLawPriorPct: 13.0,
  policyEngineWeight: 0.55,
  postExpansionHistoryWeight: 0.35,
  latestPublishedWeight: 0.1,
  macroAdjustmentPct: -0.05,
  lowerCiHalfWidthPct: 1.1,
  upperCiHalfWidthPct: 1.3,
  source:
    "prototype calibration prior: blend a current-law PolicyEngine poverty seed with post-expanded-CTC Census SPM child-poverty history, then widen for ASEC sampling and SPM expense/resource volatility",
};

export interface SpmHistoryPoint {
  year: number;
  childPovertyRatePct: number;
  note: string;
}

export interface CensusPageEvidence {
  url: string;
  fetchedAt: string;
  status: "ok" | "error";
  httpStatus?: number;
  title?: string;
  evidence?: string;
  error?: string;
}

export interface PolicyEnginePolicySnapshot {
  status: "ok" | "unavailable";
  id: number;
  label?: string;
  apiVersion?: string;
  error?: string;
}

export interface SpmChildPovertyCalibration {
  policyEngineCurrentLawPriorPct: number;
  policyEngineWeight: number;
  postExpansionHistoryWeight: number;
  latestPublishedWeight: number;
  macroAdjustmentPct: number;
  lowerCiHalfWidthPct: number;
  upperCiHalfWidthPct: number;
  source: string;
}

export interface SpmChildPovertySummary {
  question: string;
  targetYear: number;
  expectedRelease: string;
  expectedReleaseRationale: string;
  latestHistoricalYear: number;
  latestHistoricalChildPovertyRatePct: number;
  postExpansionAveragePct: number;
  recentChangePct: number;
  policyEnginePriorPct: number;
  calibratedPointEstimatePct: number;
  calibratedCiLowPct: number;
  calibratedCiHighPct: number;
  calibration: SpmChildPovertyCalibration;
  currentLawPolicy: PolicyEnginePolicySnapshot;
  releaseSchedule: CensusPageEvidence;
  spmTables: CensusPageEvidence;
  caveats: string[];
}

export interface SpmChildPovertyDataset {
  historical: SpmHistoryPoint[];
  summary: SpmChildPovertySummary;
}

export function policySnapshotFromPolicy(
  policy: PolicyEnginePolicy,
): PolicyEnginePolicySnapshot {
  return {
    status: "ok",
    id: policy.id,
    label: policy.label,
    apiVersion: policy.api_version,
  };
}

export function unavailablePolicySnapshot(
  policyId: number,
  error: unknown,
): PolicyEnginePolicySnapshot {
  return {
    status: "unavailable",
    id: policyId,
    error: error instanceof Error ? error.message : "Policy lookup failed.",
  };
}

export async function fetchSpmChildPovertyDataset({
  currentLawPolicy,
}: {
  currentLawPolicy?: PolicyEnginePolicySnapshot;
} = {}): Promise<SpmChildPovertyDataset> {
  const [releaseSchedule, spmTables] = await Promise.all([
    fetchCensusEvidence(CENSUS_INCOME_POVERTY_SCHEDULE_URL, [
      "National 2024 poverty statistics",
      "Supplemental Poverty Measure",
      "September 9, 2025",
    ]),
    fetchCensusEvidence(CENSUS_SPM_TABLES_URL, [
      "Supplemental Poverty Measure",
      "Historical Data Tables",
      "children",
    ]),
  ]);

  return {
    historical: SPM_CHILD_POVERTY_HISTORY,
    summary: buildSpmChildPovertySummary({
      releaseSchedule,
      spmTables,
      currentLawPolicy:
        currentLawPolicy ??
        ({
          status: "unavailable",
          id: 2,
          error: "PolicyEngine current-law policy was not checked.",
        } satisfies PolicyEnginePolicySnapshot),
    }),
  };
}

export function serializeSpmCalibrationToolResult(
  dataset: SpmChildPovertyDataset,
) {
  const { summary } = dataset;
  return JSON.stringify(
    {
      currentLawPolicy: summary.currentLawPolicy,
      policyEnginePriorPct: summary.policyEnginePriorPct,
      postExpansionAveragePct: summary.postExpansionAveragePct,
      latestPublishedChildPovertyRatePct:
        summary.latestHistoricalChildPovertyRatePct,
      calibration: summary.calibration,
      calibratedPointEstimatePct: summary.calibratedPointEstimatePct,
      calibratedCi80Pct: [
        summary.calibratedCiLowPct,
        summary.calibratedCiHighPct,
      ],
    },
    null,
    2,
  );
}

export function formatSpmChildPovertySummary(
  summary: SpmChildPovertySummary,
) {
  const policy =
    summary.currentLawPolicy.status === "ok"
      ? `PolicyEngine current law policy ${summary.currentLawPolicy.id} (${summary.currentLawPolicy.label}) loaded with API version ${summary.currentLawPolicy.apiVersion}.`
      : `PolicyEngine current law policy ${summary.currentLawPolicy.id} was unavailable, so the stored current-law prior carries that part of the run.`;

  return [
    `Census evidence points to a September 2026 release window for the calendar-year 2025 income, poverty, and SPM tables: ${summary.expectedReleaseRationale}`,
    `The latest published SPM child poverty rate in this prototype history is ${summary.latestHistoricalChildPovertyRatePct.toFixed(1)}% for ${summary.latestHistoricalYear}; the 2022-2024 post-expanded-CTC average is ${summary.postExpansionAveragePct.toFixed(1)}%.`,
    policy,
  ].join(" ");
}

function buildSpmChildPovertySummary({
  releaseSchedule,
  spmTables,
  currentLawPolicy,
}: {
  releaseSchedule: CensusPageEvidence;
  spmTables: CensusPageEvidence;
  currentLawPolicy: PolicyEnginePolicySnapshot;
}): SpmChildPovertySummary {
  const latest = SPM_CHILD_POVERTY_HISTORY.at(-1);
  const previous = SPM_CHILD_POVERTY_HISTORY.at(-2);
  if (!latest || !previous) {
    throw new Error("SPM child poverty history is missing recent points.");
  }

  const postExpansionHistory = SPM_CHILD_POVERTY_HISTORY.filter(
    (point) => point.year >= 2022,
  );
  const postExpansionAveragePct = average(
    postExpansionHistory.map((point) => point.childPovertyRatePct),
  );
  const recentChangePct =
    latest.childPovertyRatePct - previous.childPovertyRatePct;
  const calibration = SPM_CHILD_POVERTY_CALIBRATION;
  const point =
    calibration.policyEngineWeight *
      calibration.policyEngineCurrentLawPriorPct +
    calibration.postExpansionHistoryWeight * postExpansionAveragePct +
    calibration.latestPublishedWeight * latest.childPovertyRatePct +
    calibration.macroAdjustmentPct;

  return {
    question:
      "What will the Supplemental Poverty Measure child poverty rate be for calendar year 2025 as published by the U.S. Census Bureau?",
    targetYear: SPM_TARGET_YEAR,
    expectedRelease: "September 2026",
    expectedReleaseRationale:
      "Census scheduled the prior-year income, poverty, health insurance, and SPM release for September 2025, including annual official poverty and Supplemental Poverty Measure estimates.",
    latestHistoricalYear: latest.year,
    latestHistoricalChildPovertyRatePct: latest.childPovertyRatePct,
    postExpansionAveragePct: round(postExpansionAveragePct, 1),
    recentChangePct: round(recentChangePct, 1),
    policyEnginePriorPct: calibration.policyEngineCurrentLawPriorPct,
    calibratedPointEstimatePct: round(point, 1),
    calibratedCiLowPct: round(point - calibration.lowerCiHalfWidthPct, 1),
    calibratedCiHighPct: round(point + calibration.upperCiHalfWidthPct, 1),
    calibration,
    currentLawPolicy,
    releaseSchedule,
    spmTables,
    caveats: [
      "The Census pages are fetched live; the child-poverty history is a prototype seed until the API uses a machine-readable Census SPM table endpoint.",
      "The PolicyEngine input currently verifies current law and contributes a stored poverty prior; it is not yet a fresh server-side microsimulation run for this cell.",
      "SPM estimates include taxes, transfers, work expenses, medical out-of-pocket expenses, and geographic housing adjustments, so policy and price changes can move the series differently from official poverty.",
    ],
  };
}

async function fetchCensusEvidence(
  url: string,
  patterns: string[],
): Promise<CensusPageEvidence> {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetchWithTimeout(url, 8000);
    const html = await response.text();
    const evidence = extractEvidence(html, patterns);
    return {
      url,
      fetchedAt,
      status: response.ok ? "ok" : "error",
      httpStatus: response.status,
      title: extractTitle(html),
      evidence,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      url,
      fetchedAt,
      status: "error",
      error: error instanceof Error ? error.message : "Census fetch failed.",
    };
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return undefined;
  return stripHtml(match[1]).slice(0, 180);
}

function extractEvidence(html: string, patterns: string[]) {
  const text = stripHtml(html);
  const lower = text.toLowerCase();
  const pattern = patterns.find((candidate) =>
    lower.includes(candidate.toLowerCase()),
  );
  if (!pattern) return text.slice(0, 360);

  const index = lower.indexOf(pattern.toLowerCase());
  const start = Math.max(0, index - 160);
  const end = Math.min(text.length, index + pattern.length + 220);
  return text.slice(start, end).trim();
}

function stripHtml(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
