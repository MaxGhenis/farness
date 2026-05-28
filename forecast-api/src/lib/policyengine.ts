export const CTC_EXPANSION_COST_SLUG = "ctc-expansion-cost-ty2026";
export const CTC_CURRENT_LAW_OUTLAYS_SLUG = "ctc-current-law-outlays-ty2026";
export const POLICYENGINE_BASE_URL =
  process.env.POLICYENGINE_API_BASE_URL ?? "https://api.policyengine.org";

export const CURRENT_LAW_POLICY_ID = 2;
export const CTC_3000_FULLY_REFUNDABLE_POLICY_ID = 29093;
export const CTC_TARGET_YEAR = 2026;

export interface PolicyEnginePolicy {
  id: number;
  country_id: string;
  label: string;
  api_version: string;
  policy_json: Record<string, unknown>;
  policy_hash: string;
}

interface PolicyEngineEnvelope<T> {
  status: "ok" | "computing" | "error";
  message: string | null;
  result: T | null;
}

export interface PolicyEngineEconomyResponse {
  status: "ok" | "computing" | "error" | "timeout";
  message: string | null;
  result: unknown;
  url: string;
  budgetaryImpactUsdBillions: number | null;
}

export interface CtcExpansionDataset {
  baselinePolicy: PolicyEnginePolicy;
  reformPolicy: PolicyEnginePolicy;
  economy: PolicyEngineEconomyResponse;
  calibration: CtcCalibrationPrior;
  summary: CtcExpansionSummary;
}

export interface CtcCalibrationPrior {
  rawToFinalRatio: number;
  additiveUsdBillions: number;
  minimumCiHalfWidthUsdBillions: number;
  uncertaintyMultiplierWhenQueued: number;
  source: string;
}

export interface CtcExpansionSummary {
  question: string;
  baselinePolicyId: number;
  reformPolicyId: number;
  targetYear: number;
  reformLabel: string;
  baselineLabel: string;
  policyEngineApiVersion: string;
  rawPolicyEngineEstimateUsdBillions: number | null;
  policyEngineStatus: PolicyEngineEconomyResponse["status"];
  policyEngineMessage: string | null;
  calibratedPointEstimateUsdBillions: number;
  calibratedCiLowUsdBillions: number;
  calibratedCiHighUsdBillions: number;
  calibration: CtcCalibrationPrior;
}

const CTC_CALIBRATION_PRIOR: CtcCalibrationPrior = {
  rawToFinalRatio: 1.04,
  additiveUsdBillions: 3.5,
  minimumCiHalfWidthUsdBillions: 22,
  uncertaintyMultiplierWhenQueued: 1.4,
  source:
    "prototype calibration prior: compare PolicyEngine static federal budget impacts with later official scores, then shrink toward a small upward adjustment for take-up, timing, and behavioral/scoring differences",
};

export async function fetchCtcExpansionDataset(): Promise<CtcExpansionDataset> {
  const [baselinePolicy, reformPolicy] = await Promise.all([
    fetchPolicy(CURRENT_LAW_POLICY_ID),
    fetchPolicy(CTC_3000_FULLY_REFUNDABLE_POLICY_ID),
  ]);

  const economy = await fetchEconomyImpact({
    policyId: CTC_3000_FULLY_REFUNDABLE_POLICY_ID,
    baselinePolicyId: CURRENT_LAW_POLICY_ID,
    region: "us",
    timePeriod: CTC_TARGET_YEAR,
    timeoutMs: 12000,
  });
  const summary = buildCtcExpansionSummary({
    baselinePolicy,
    reformPolicy,
    economy,
    calibration: CTC_CALIBRATION_PRIOR,
  });

  return {
    baselinePolicy,
    reformPolicy,
    economy,
    calibration: CTC_CALIBRATION_PRIOR,
    summary,
  };
}

export function serializePolicyToolResult(policy: PolicyEnginePolicy) {
  return JSON.stringify(
    {
      status: "ok",
      id: policy.id,
      label: policy.label,
      apiVersion: policy.api_version,
      parameterChanges: policy.policy_json,
    },
    null,
    2,
  );
}

export function serializeEconomyToolResult(
  economy: PolicyEngineEconomyResponse,
) {
  return JSON.stringify(
    {
      status: economy.status,
      message: economy.message,
      budgetaryImpactUsdBillions: economy.budgetaryImpactUsdBillions,
      resultPreview: summarizeUnknown(economy.result),
    },
    null,
    2,
  );
}

export function formatCtcExpansionSummary(summary: CtcExpansionSummary) {
  const raw =
    summary.rawPolicyEngineEstimateUsdBillions == null
      ? "not yet returned by the PolicyEngine economy API"
      : `$${summary.rawPolicyEngineEstimateUsdBillions.toFixed(1)}B`;
  return [
    `PolicyEngine compares policy ${summary.reformPolicyId} (${summary.reformLabel}) against policy ${summary.baselinePolicyId} (${summary.baselineLabel}) for ${summary.targetYear}.`,
    `The raw economy endpoint status is ${summary.policyEngineStatus}; the raw budget impact is ${raw}.`,
    `The calibration layer applies a ${summary.calibration.rawToFinalRatio.toFixed(2)}x ratio and a $${summary.calibration.additiveUsdBillions.toFixed(1)}B additive adjustment before widening uncertainty for queued/error states.`,
  ].join(" ");
}

function buildCtcExpansionSummary({
  baselinePolicy,
  reformPolicy,
  economy,
  calibration,
}: {
  baselinePolicy: PolicyEnginePolicy;
  reformPolicy: PolicyEnginePolicy;
  economy: PolicyEngineEconomyResponse;
  calibration: CtcCalibrationPrior;
}): CtcExpansionSummary {
  const raw = economy.budgetaryImpactUsdBillions;
  const fallbackRaw = 102;
  const rawForForecast = raw ?? fallbackRaw;
  const point =
    rawForForecast * calibration.rawToFinalRatio +
    calibration.additiveUsdBillions;
  const statusMultiplier =
    raw == null ? calibration.uncertaintyMultiplierWhenQueued : 1;
  const halfWidth =
    Math.max(
      calibration.minimumCiHalfWidthUsdBillions,
      Math.abs(point) * 0.18,
    ) * statusMultiplier;

  return {
    question:
      "What will the federal budget cost of a $3,000 fully refundable Child Tax Credit for tax year 2026 be, relative to current law?",
    baselinePolicyId: baselinePolicy.id,
    reformPolicyId: reformPolicy.id,
    targetYear: CTC_TARGET_YEAR,
    reformLabel: reformPolicy.label,
    baselineLabel: baselinePolicy.label,
    policyEngineApiVersion: reformPolicy.api_version,
    rawPolicyEngineEstimateUsdBillions: raw,
    policyEngineStatus: economy.status,
    policyEngineMessage: economy.message,
    calibratedPointEstimateUsdBillions: round(point, 1),
    calibratedCiLowUsdBillions: round(Math.max(0, point - halfWidth), 1),
    calibratedCiHighUsdBillions: round(point + halfWidth, 1),
    calibration,
  };
}

export async function fetchPolicy(
  policyId: number,
): Promise<PolicyEnginePolicy> {
  const response = await fetchWithTimeout(
    `${POLICYENGINE_BASE_URL}/us/policy/${policyId}`,
    8000,
  );
  const envelope =
    (await response.json()) as PolicyEngineEnvelope<PolicyEnginePolicy>;
  if (!response.ok || envelope.status !== "ok" || !envelope.result) {
    throw new Error(
      `PolicyEngine policy ${policyId} returned ${envelope.status}.`,
    );
  }
  return envelope.result;
}

async function fetchEconomyImpact({
  policyId,
  baselinePolicyId,
  region,
  timePeriod,
  timeoutMs,
}: {
  policyId: number;
  baselinePolicyId: number;
  region: string;
  timePeriod: number;
  timeoutMs: number;
}): Promise<PolicyEngineEconomyResponse> {
  const url = `${POLICYENGINE_BASE_URL}/us/economy/${policyId}/over/${baselinePolicyId}?region=${region}&time_period=${timePeriod}`;

  try {
    const response = await fetchWithTimeout(url, timeoutMs);
    const envelope = (await response.json()) as PolicyEngineEnvelope<unknown>;
    const budgetaryImpactUsdBillions = extractBudgetaryImpactUsdBillions(
      envelope.result,
    );
    return {
      status: envelope.status,
      message: envelope.message,
      result: envelope.result,
      url,
      budgetaryImpactUsdBillions,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "timeout",
        message: `PolicyEngine economy request exceeded ${timeoutMs}ms.`,
        result: null,
        url,
        budgetaryImpactUsdBillions: null,
      };
    }
    throw error;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractBudgetaryImpactUsdBillions(result: unknown): number | null {
  const matches: number[] = [];
  visitUnknown(result, (path, value) => {
    if (typeof value !== "number" || !Number.isFinite(value)) return;
    const joined = path.join(".").toLowerCase();
    if (
      joined.includes("budget") ||
      joined.includes("fiscal") ||
      joined.includes("revenue") ||
      joined.includes("household_net_income")
    ) {
      matches.push(value);
    }
  });

  if (matches.length === 0) return null;
  const selected = matches
    .map((value) => {
      const magnitude = Math.abs(value);
      return magnitude > 1_000_000_000 ? value / 1_000_000_000 : value;
    })
    .find((value) => Math.abs(value) >= 1 && Math.abs(value) <= 1000);

  return selected == null ? null : round(Math.abs(selected), 1);
}

function visitUnknown(
  value: unknown,
  visitor: (path: string[], value: unknown) => void,
  path: string[] = [],
) {
  visitor(path, value);
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      visitUnknown(item, visitor, [...path, `${index}`]),
    );
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      visitUnknown(child, visitor, [...path, key]);
    }
  }
}

function summarizeUnknown(value: unknown): unknown {
  if (value == null) return value;
  const text = JSON.stringify(value);
  if (text.length <= 1200) return value;
  return `${text.slice(0, 1200)}...`;
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
