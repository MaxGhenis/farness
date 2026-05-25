// Market definitions and AI analyst reasoning scripts.
// Each market is a self-contained record with a pre-written reasoning stream
// that the AgentReasoning component plays back with simulated streaming.
//
// The reasoning is illustrative — numbers and tool-call results are
// constructed to demonstrate the integrated stack (Axiom-encoded law,
// farness microsim, ARCH cells) rather than to be live forecasts.

export type MarketType = "arch" | "policy" | "conditional";

export type Unit = "percent" | "usd" | "usd_monthly" | "ratio" | "percent_growth";

export interface HistoricalPoint {
  label: string;
  value: number;
}

export type ReasoningStep =
  | { kind: "heading"; text: string }
  | { kind: "text"; text: string }
  | {
      kind: "tool"; // call to farness simulation engine or data lookup
      call: string;
      result: string;
      tool?: string; // optional tool name override; defaults to farness.simulate
    }
  | { kind: "math"; text: string } // styled equation/weighting line
  | { kind: "forecast"; point: number; ciLow: number; ciHigh: number };

export interface Market {
  slug: string;
  type: MarketType;
  title: string;
  question: string;
  unit: Unit;
  pointEstimate: number;
  ciLow: number;
  ciHigh: number;
  confidence: number; // 0.80 etc.
  resolutionDate: string; // ISO date, e.g. "2027-09-15"
  resolutionSource: string;
  resolutionRule: string;
  historicalContext: HistoricalPoint[];
  drivers: string[];
  archCell?: string; // for ARCH markets
  policyParameter?: string; // for policy markets
  conditionalOn?: string; // for conditional markets
  reasoning: ReasoningStep[];
}

export const MARKETS: Market[] = [
  // ─── ARCH cells ──────────────────────────────────────────────────────────
  {
    slug: "spm-child-poverty-2027",
    type: "arch",
    title: "SPM child poverty rate, 2027",
    question:
      "What will the Supplemental Poverty Measure child poverty rate be for calendar year 2027 as published by the U.S. Census Bureau?",
    unit: "percent",
    pointEstimate: 11.8,
    ciLow: 10.5,
    ciHigh: 13.4,
    confidence: 0.8,
    resolutionDate: "2028-09-15",
    resolutionSource: "U.S. Census Bureau, SPM annual release",
    resolutionRule:
      "Resolves to the official SPM child poverty rate (children under 18) published in the Census Poverty in the United States report covering CY2027.",
    archCell: "census.spm.child_poverty_rate.2027",
    historicalContext: [
      { label: "2021", value: 5.2 },
      { label: "2022", value: 12.4 },
      { label: "2023", value: 13.7 },
      { label: "2024", value: 13.4 },
      { label: "2025e", value: 12.9 },
    ],
    drivers: [
      "TCJA extension status (CTC, EITC)",
      "Unemployment trajectory",
      "SNAP benefit levels",
      "Refundable credit phase-ins",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "The SPM child poverty rate for 2027 is dominated by the configuration of refundable credits under whatever tax regime is in force, plus the labor market. The CTC is the single largest policy lever — it directly raised the CTC sensitivity of SPM child poverty by roughly 4 percentage points during the 2021 expansion. The 2027 reading depends critically on how TCJA-extension legislation resolves.",
      },
      { kind: "heading", text: "Running the simulation engine" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "current_law_scheduled", year: 2027, output: "spm_child_poverty_rate", population: "microplex.us.2027" })',
        result: '{ point: 13.1, ci80: [12.2, 14.0], drivers: ["CTC reverts to $1,000 / child", "EITC expansions sunset", "CTC phase-in unchanged"] }',
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "tcja_extended_full", year: 2027, output: "spm_child_poverty_rate", population: "microplex.us.2027" })',
        result: '{ point: 11.4, ci80: [10.5, 12.4], drivers: ["CTC remains $2,000 / child", "$1,700 refundable portion preserved", "EITC parameters unchanged"] }',
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "tcja_extended_partial", year: 2027, output: "spm_child_poverty_rate", population: "microplex.us.2027" })',
        result: '{ point: 12.2, ci80: [11.3, 13.1], drivers: ["CTC at $1,500 / child", "refundability cap retained", "EITC reverts"] }',
      },
      { kind: "heading", text: "Macro and external inputs" },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "budget_economic_outlook_2026", series: "unemployment_rate", year: 2027 })',
        result: "{ baseline: 4.2%, range: [3.8%, 4.7%] }",
      },
      {
        kind: "text",
        text: "Labor-market path is close to neutral for child poverty at this baseline — the 4.2% projected 2027 unemployment rate is near the historical average and the simulation shows ±0.3pp on child poverty over the [3.8%, 4.7%] band.",
      },
      { kind: "heading", text: "Legislative weighting" },
      {
        kind: "text",
        text: "House passed a TCJA extension package in March. Senate markup is expected Q3. Conditional on the Senate moving a vehicle, full extension is the modal outcome but partial scaling (especially on CTC refundability) is a live possibility. Weighting:",
      },
      {
        kind: "math",
        text: "P(full TCJA extension) = 0.65 · P(partial extension) = 0.20 · P(expiration) = 0.15",
      },
      {
        kind: "math",
        text: "E[SPM child poverty 2027] = 0.65·11.4 + 0.20·12.2 + 0.15·13.1 = 11.83",
      },
      { kind: "heading", text: "Forecast" },
      { kind: "forecast", point: 11.8, ciLow: 10.5, ciHigh: 13.4 },
    ],
  },

  {
    slug: "unemployment-dec-2026",
    type: "arch",
    title: "Unemployment rate, December 2026",
    question:
      "What will the seasonally-adjusted U.S. civilian unemployment rate be for December 2026 as published in the BLS Employment Situation release?",
    unit: "percent",
    pointEstimate: 4.3,
    ciLow: 3.9,
    ciHigh: 4.8,
    confidence: 0.8,
    resolutionDate: "2027-01-09",
    resolutionSource: "BLS Employment Situation (CES/CPS)",
    resolutionRule:
      "Resolves to the first-print seasonally-adjusted U-3 unemployment rate for December 2026, released on the first Friday of January 2027 (subject to revision; first print is the resolution value).",
    archCell: "bls.lns14000000.2026-12",
    historicalContext: [
      { label: "Dec 2022", value: 3.5 },
      { label: "Dec 2023", value: 3.7 },
      { label: "Dec 2024", value: 4.1 },
      { label: "Dec 2025", value: 4.2 },
    ],
    drivers: [
      "Fed funds rate path",
      "Goods-sector labor demand",
      "Immigration-adjusted labor force growth",
      "AI-driven displacement vs. productivity",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "Single-month U-3 print, first release. Historically the median absolute monthly change in U-3 is roughly 0.1pp; six-month windows have a median absolute change of 0.3pp. The interesting dispersion is whether 2026 ends in a normal late-cycle drift (4.2 → 4.4) or whether there is enough labor-demand softening to push past 4.6.",
      },
      { kind: "heading", text: "Calling structural and reduced-form models" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "baseline_macro", year: 2026, output: "unemployment_rate_monthly", month: 12, model: "structural_var" })',
        result: "{ point: 4.31, ci80: [3.92, 4.74] }",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "baseline_macro", year: 2026, output: "unemployment_rate_monthly", month: 12, model: "reduced_form_phillips" })',
        result: "{ point: 4.27, ci80: [3.95, 4.61] }",
      },
      { kind: "heading", text: "External baselines" },
      {
        kind: "tool",
        tool: "fed.lookup",
        call: 'fed.lookup({ source: "SEP_dec_2025", variable: "unemployment_rate", year: 2026, statistic: "median" })',
        result: "{ value: 4.3, central_tendency: [4.1, 4.5] }",
      },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "budget_economic_outlook_2026", series: "unemployment_rate", year: 2026 })',
        result: "{ value: 4.4, range: [4.0, 4.8] }",
      },
      {
        kind: "text",
        text: "The FOMC SEP median, CBO projection, and the farness structural-VAR all cluster between 4.27 and 4.40 for full-year 2026. December prints tend to run very slightly below the annual mean in expansions due to seasonal adjustment behavior in the household survey.",
      },
      { kind: "heading", text: "Risk distribution" },
      {
        kind: "text",
        text: "Upside-risk asymmetry is real: cycle endings tend to look like normal drift right up until a discontinuity. The 80% CI should be slightly wider on the high side to reflect that.",
      },
      { kind: "heading", text: "Forecast" },
      { kind: "forecast", point: 4.3, ciLow: 3.9, ciHigh: 4.8 },
    ],
  },

  {
    slug: "cpi-u-annual-2026",
    type: "arch",
    title: "CPI-U annual average inflation, 2026",
    question:
      "What will the annual average percent change in CPI-U for calendar year 2026 (vs. 2025 annual average) be, as published by BLS?",
    unit: "percent",
    pointEstimate: 2.6,
    ciLow: 2.1,
    ciHigh: 3.2,
    confidence: 0.8,
    resolutionDate: "2027-01-15",
    resolutionSource: "BLS CPI-U release",
    resolutionRule:
      "Resolves to the percent change in CPI-U annual average for 2026 over 2025 (BLS series CUUR0000SA0, annual average), first-published value.",
    archCell: "bls.cpi.u.annual_pct_change.2026",
    historicalContext: [
      { label: "2022", value: 8.0 },
      { label: "2023", value: 4.1 },
      { label: "2024", value: 2.9 },
      { label: "2025e", value: 2.7 },
    ],
    drivers: [
      "Shelter disinflation trajectory",
      "Goods price pass-through from tariffs",
      "Wage growth and unit labor costs",
      "Energy prices",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "Annual-average year-over-year for 2026. Different from December-to-December — the annual-average measure carries more weight on early-year readings (since the level is averaged across 12 months). The H1 2026 trajectory is largely baked in by the time we get to Q3 2026 reads.",
      },
      { kind: "heading", text: "Component decomposition" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "baseline_macro", year: 2026, output: "cpi_components", decomposition: true })',
        result:
          "{ shelter: 3.4, services_ex_shelter: 3.1, core_goods: 0.8, food: 2.5, energy: 1.9, weighted_total: 2.62 }",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "tariff_passthrough_central", year: 2026, output: "cpi_u_annual" })',
        result: "{ point: 2.63, ci80: [2.18, 3.15] }",
      },
      { kind: "heading", text: "Cross-checks" },
      {
        kind: "tool",
        tool: "fed.lookup",
        call: 'fed.lookup({ source: "SEP_dec_2025", variable: "core_pce_inflation", year: 2026, statistic: "median" })',
        result: "{ value: 2.4 }",
      },
      {
        kind: "tool",
        tool: "fed.lookup",
        call: 'fed.lookup({ source: "consensus_blue_chip", variable: "cpi_u_yoy", year: 2026 })',
        result: "{ point: 2.6, dispersion_iqr: [2.4, 2.8] }",
      },
      {
        kind: "text",
        text: "CPI-U typically runs 0.2-0.4pp above core PCE due to shelter weights. A 2.4 core-PCE median translates to roughly 2.7 CPI-U headline before tariff effects. Tariff pass-through to core goods is modest in the central case but is the principal upside-risk channel.",
      },
      { kind: "heading", text: "Skew and forecast" },
      {
        kind: "text",
        text: "Distribution is mildly right-skewed: more upside risk from tariff escalation and energy shocks than downside risk from a sudden disinflationary collapse. CI reflects this.",
      },
      { kind: "forecast", point: 2.6, ciLow: 2.1, ciHigh: 3.2 },
    ],
  },

  {
    slug: "median-household-income-2026",
    type: "arch",
    title: "Median household income, 2026",
    question:
      "What will the real (2026 dollars) median household income for the United States be in calendar year 2026, as published in the Census ASEC?",
    unit: "usd",
    pointEstimate: 81200,
    ciLow: 79100,
    ciHigh: 83400,
    confidence: 0.8,
    resolutionDate: "2027-09-15",
    resolutionSource: "Census ASEC (Current Population Survey)",
    resolutionRule:
      "Resolves to the real median household income for 2026 as published in the Census income report, expressed in 2026 dollars.",
    archCell: "census.asec.median_household_income.2026",
    historicalContext: [
      { label: "2022", value: 77540 },
      { label: "2023", value: 80610 },
      { label: "2024", value: 80100 },
      { label: "2025e", value: 80600 },
    ],
    drivers: [
      "Real wage growth",
      "Employment-to-population ratio",
      "Household composition shifts",
      "Top-end income trajectory",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "Real median household income, ASEC measure. Tracks real labor earnings of the typical household closely. ASEC sample noise is meaningful at the median (standard error ~$700 historically).",
      },
      { kind: "heading", text: "Decomposed simulation" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "baseline_macro", year: 2026, output: "median_household_income_real", source: "asec" })',
        result: "{ point: 81230, ci80: [79140, 83370] }",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "baseline_macro", year: 2026, output: "real_wage_growth", deciles: true })',
        result: "{ p10: 0.4, p25: 0.6, p50: 0.8, p75: 0.9, p90: 1.0 }",
      },
      { kind: "heading", text: "External anchors" },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "budget_economic_outlook_2026", series: "real_disposable_income_pc", year: 2026 })',
        result: "{ growth: 1.6% }",
      },
      {
        kind: "text",
        text: "Real per-capita disposable income growth in the CBO baseline maps to roughly 0.7–1.0% growth in real median household income (household composition trends are a slight drag). $80,600 base × ~1.0% growth → ~$81,400. The simulation result is consistent.",
      },
      { kind: "heading", text: "Forecast" },
      { kind: "forecast", point: 81200, ciLow: 79100, ciHigh: 83400 },
    ],
  },

  {
    slug: "irs-individual-income-tax-fy2027",
    type: "arch",
    title: "Federal individual income tax revenue, FY2027",
    question:
      "What will total federal individual income tax revenue be for fiscal year 2027 in nominal dollars, as published in the Monthly Treasury Statement?",
    unit: "usd",
    pointEstimate: 2740,
    ciLow: 2580,
    ciHigh: 2910,
    confidence: 0.8,
    resolutionDate: "2027-10-20",
    resolutionSource: "U.S. Treasury Monthly Statement (final September FY2027)",
    resolutionRule:
      "Resolves to total individual income tax receipts for FY2027 as reported in the Monthly Treasury Statement covering September 2027, in billions of nominal dollars.",
    archCell: "treasury.mts.individual_income_tax.fy2027",
    historicalContext: [
      { label: "FY2023", value: 2176 },
      { label: "FY2024", value: 2426 },
      { label: "FY2025e", value: 2520 },
      { label: "FY2026e", value: 2640 },
    ],
    drivers: [
      "TCJA extension status",
      "Capital gains realizations",
      "Nominal income growth",
      "Withholding vs. nonwithheld mix",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "FY2027 means October 2026 through September 2027. The April 2027 final-payment surge dominates the year-over-year variance — that print captures TY2026 returns, which are filed under whatever tax law is in force for TY2026.",
      },
      { kind: "heading", text: "Microsim under each legislative path" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "current_law_scheduled", year: 2027, output: "individual_income_tax_receipts_fy", policy_year: 2026 })',
        result: '{ point: 2810, ci80: [2640, 2980], note: "assumes TCJA expires end-2025 → TY2026 under post-TCJA brackets" }',
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "tcja_extended_full", year: 2027, output: "individual_income_tax_receipts_fy", policy_year: 2026 })',
        result: '{ point: 2680, ci80: [2520, 2840], note: "TCJA-permanent brackets, $24K standard deduction, SALT cap" }',
      },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "budget_outlook_2026", series: "individual_income_tax", year: "FY2027", policy: "current_law" })',
        result: "{ value: 2790 }",
      },
      { kind: "heading", text: "Legislative weighting" },
      {
        kind: "math",
        text: "P(TCJA extended fully retroactive to 2026) = 0.55 · P(extended w/ modifications) = 0.25 · P(expiration / partial) = 0.20",
      },
      {
        kind: "math",
        text: "E[FY2027 IIT receipts] = 0.55·2680 + 0.25·2740 + 0.20·2810 = 2735",
      },
      { kind: "heading", text: "Realizations risk" },
      {
        kind: "text",
        text: "Capital-gains realizations are the biggest residual variance — a sustained equity drawdown into 2026 would reduce nonwithheld revenue by $40-90bn. Reflected in the wider downside tail.",
      },
      { kind: "forecast", point: 2740, ciLow: 2580, ciHigh: 2910 },
    ],
  },

  {
    slug: "real-gdp-growth-2026",
    type: "arch",
    title: "Real GDP growth, 2026 (Q4/Q4)",
    question:
      "What will real GDP growth be from Q4 2025 to Q4 2026 (year-over-year, fourth-quarter basis), as published by BEA?",
    unit: "percent_growth",
    pointEstimate: 1.9,
    ciLow: 0.9,
    ciHigh: 2.8,
    confidence: 0.8,
    resolutionDate: "2027-01-28",
    resolutionSource: "BEA GDP advance estimate (Q4 2026)",
    resolutionRule:
      "Resolves to the Q4/Q4 real GDP growth rate for 2026 as published in the BEA Q4 2026 advance estimate (late January 2027).",
    archCell: "bea.gdpc1.q4q4.2026",
    historicalContext: [
      { label: "2022", value: 0.6 },
      { label: "2023", value: 3.2 },
      { label: "2024", value: 2.5 },
      { label: "2025e", value: 2.1 },
    ],
    drivers: [
      "Business investment in AI / data center buildout",
      "Consumer spending resilience",
      "Net exports under tariff regime",
      "Government spending trajectory",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "Q4/Q4 is the standard FOMC and CBO horizon. Less noisy than single-quarter prints but still subject to substantial revision. Advance estimate is what resolves — the second and third releases come later.",
      },
      { kind: "heading", text: "Structural model + nowcast blend" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "baseline_macro", year: 2026, output: "real_gdp_q4q4", model: "structural_neoclassical" })',
        result: "{ point: 1.86, ci80: [1.05, 2.69] }",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "baseline_macro", year: 2026, output: "real_gdp_q4q4", model: "bayesian_var" })',
        result: "{ point: 1.92, ci80: [0.85, 2.99] }",
      },
      {
        kind: "tool",
        tool: "fed.lookup",
        call: 'fed.lookup({ source: "SEP_dec_2025", variable: "real_gdp_growth", year: 2026, statistic: "median" })',
        result: "{ value: 1.8, central_tendency: [1.5, 2.1] }",
      },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "budget_economic_outlook_2026", series: "real_gdp_q4q4", year: 2026 })',
        result: "{ value: 2.0 }",
      },
      { kind: "heading", text: "Composition" },
      {
        kind: "text",
        text: "Investment composition is unusual — AI-related capex is contributing roughly 0.5pp to real GDP growth on its own. That makes the upside tail wider than typical late-cycle distributions and the downside tail heavier (sudden capex pullback).",
      },
      { kind: "forecast", point: 1.9, ciLow: 0.9, ciHigh: 2.8 },
    ],
  },

  {
    slug: "uninsured-rate-2026",
    type: "arch",
    title: "Uninsured rate (under 65), 2026",
    question:
      "What will the uninsured rate among the U.S. population under 65 be for calendar year 2026, as published in the Census ASEC?",
    unit: "percent",
    pointEstimate: 10.1,
    ciLow: 9.2,
    ciHigh: 11.2,
    confidence: 0.8,
    resolutionDate: "2027-09-15",
    resolutionSource: "Census ASEC health insurance report",
    resolutionRule:
      "Resolves to the uninsured rate (any point during the year) for the population under 65 as published in the Census ASEC health insurance coverage report covering CY2026.",
    archCell: "census.asec.uninsured_rate_under_65.2026",
    historicalContext: [
      { label: "2021", value: 9.6 },
      { label: "2022", value: 8.6 },
      { label: "2023", value: 8.0 },
      { label: "2024", value: 8.2 },
      { label: "2025e", value: 8.9 },
    ],
    drivers: [
      "ACA enhanced subsidy status",
      "Medicaid unwinding completion",
      "Employer-sponsored coverage trajectory",
      "ACA marketplace enrollment",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "2026 is the first full year after the scheduled expiration of the ACA enhanced premium tax credits (ARPA/IRA). The marketplace-coverage response is the dominant driver. Medicaid unwinding has largely run its course by 2026; ESI is fairly stable.",
      },
      { kind: "heading", text: "Policy-state branches" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "ept_expired", year: 2026, output: "uninsured_rate_under_65" })',
        result: "{ point: 10.4, ci80: [9.5, 11.4], drivers: [\"~3.8M coverage loss\", \"net of churn into ESI/Medicaid\"] }",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "ept_extended", year: 2026, output: "uninsured_rate_under_65" })',
        result: "{ point: 9.0, ci80: [8.2, 9.9] }",
      },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "health_insurance_baseline_2026", series: "uninsured_rate_under_65", year: 2026, policy: "ept_expire" })',
        result: "{ value: 10.6 }",
      },
      { kind: "heading", text: "Legislative weighting" },
      {
        kind: "text",
        text: "Subsidy extension is contested. Standalone-extension bills have not advanced; vehicle is most likely a year-end omnibus or reconciliation. We weight: 25% extension via vehicle, 65% expiration as scheduled, 10% partial extension.",
      },
      {
        kind: "math",
        text: "E[uninsured 2026] = 0.65·10.4 + 0.10·9.7 + 0.25·9.0 = 9.97",
      },
      { kind: "forecast", point: 10.1, ciLow: 9.2, ciHigh: 11.2 },
    ],
  },

  {
    slug: "labor-force-participation-dec-2026",
    type: "arch",
    title: "Labor force participation rate, December 2026",
    question:
      "What will the seasonally-adjusted civilian labor force participation rate be for December 2026 as published in the BLS Employment Situation release?",
    unit: "percent",
    pointEstimate: 62.4,
    ciLow: 61.9,
    ciHigh: 62.8,
    confidence: 0.8,
    resolutionDate: "2027-01-09",
    resolutionSource: "BLS Employment Situation",
    resolutionRule:
      "Resolves to the first-print seasonally-adjusted civilian labor force participation rate for December 2026 (BLS series LNS11300000).",
    archCell: "bls.lns11300000.2026-12",
    historicalContext: [
      { label: "Dec 2022", value: 62.3 },
      { label: "Dec 2023", value: 62.5 },
      { label: "Dec 2024", value: 62.6 },
      { label: "Dec 2025", value: 62.5 },
    ],
    drivers: [
      "Prime-age participation trend",
      "55+ retirement timing",
      "Immigration-adjusted denominator",
      "Disability and long-COVID trends",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "Aggregate LFPR is mechanically dragged down by demographic aging (~0.15pp/year) and pushed up by rising prime-age participation. The net has been roughly flat at 62.5 for two years. The interesting question is whether 2026 holds the line or starts to slip on demographics.",
      },
      { kind: "heading", text: "Decomposition" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "baseline_demographics", year: 2026, output: "lfpr_decomposition_dec" })',
        result: "{ prime_age_25_54: 83.6, age_55_plus: 38.2, aggregate: 62.42, aging_drag_yoy: -0.13 }",
      },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "budget_economic_outlook_2026", series: "labor_force_participation_rate", year: 2026 })',
        result: "{ value: 62.3 }",
      },
      {
        kind: "text",
        text: "CBO baseline implies a small slip from 62.5 to 62.3. Our prime-age trajectory is slightly more optimistic — recent vintages of the BLS data show 25-54 LFPR holding above 83.5. Net: 62.4 is the central case for December.",
      },
      { kind: "heading", text: "Forecast" },
      { kind: "forecast", point: 62.4, ciLow: 61.9, ciHigh: 62.8 },
    ],
  },

  // ─── Policy state markets ────────────────────────────────────────────────
  {
    slug: "ctc-monthly-max-ty2027",
    type: "policy",
    title: "CTC monthly maximum per child, TY2027",
    question:
      "What will the maximum federal Child Tax Credit per qualifying child be in tax year 2027, on a monthly equivalent basis?",
    unit: "usd_monthly",
    pointEstimate: 183,
    ciLow: 83,
    ciHigh: 250,
    confidence: 0.8,
    resolutionDate: "2027-04-15",
    resolutionSource: "Internal Revenue Code §24 as enacted",
    resolutionRule:
      "Resolves to the maximum federal CTC per qualifying child in effect for TY2027, divided by 12. Resolution snapshot is taken as of the IRS Form 1040 instructions published for TY2027 returns (April 2028).",
    policyParameter: "irc.24.maximum_per_child.2027",
    historicalContext: [
      { label: "2021", value: 300 },
      { label: "2022", value: 167 },
      { label: "2024", value: 167 },
      { label: "2025", value: 167 },
      { label: "2026e", value: 167 },
    ],
    drivers: [
      "TCJA permanence package status",
      "Refundability provisions in extension bill",
      "Bipartisan child-credit deal trajectory",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "Maximum is the headline parameter — refundability and phase-in are separate (different markets). Current law: $2,000/child through TY2025, reverting to $1,000/child in TY2026 absent legislation. Any TCJA extension would lock at $2,000 (= $167/mo) or higher.",
      },
      { kind: "heading", text: "Axiom-encoded policy paths" },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "IRC.24", parameter: "maximum_per_child", year: 2027, branch: "current_law" })',
        result: '{ value: 1000, source: "PL 115-97 §11022 sunset" }',
      },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "IRC.24", parameter: "maximum_per_child", year: 2027, branch: "tcja_permanent_house_pass" })',
        result: '{ value: 2000, source: "HR 1234 §103" }',
      },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "IRC.24", parameter: "maximum_per_child", year: 2027, branch: "bipartisan_expansion_b" })',
        result: '{ value: 2500, source: "draft S amendment, Wyden-Crapo framework" }',
      },
      { kind: "heading", text: "Legislative probability weighting" },
      {
        kind: "math",
        text: "P(TCJA extended at $2,000) = 0.55 · P(expanded to $2,500+) = 0.20 · P(reversion to $1,000) = 0.20 · P(other) = 0.05",
      },
      {
        kind: "math",
        text: "E[max CTC TY2027 monthly] = (0.55·2000 + 0.20·2500 + 0.20·1000 + 0.05·1500) / 12 = $183/mo",
      },
      { kind: "heading", text: "Distribution shape" },
      {
        kind: "text",
        text: "Bimodal in spirit — mass at $1,000 (revert) and $2,000 (extend), with thin tails. Single-number CI obscures this; the 80% CI is wide to reflect the bimodality.",
      },
      { kind: "forecast", point: 183, ciLow: 83, ciHigh: 250 },
    ],
  },

  {
    slug: "federal-minimum-wage-jan-2027",
    type: "policy",
    title: "Federal minimum wage on Jan 1, 2027",
    question:
      "What will the federal minimum wage under FLSA §6(a)(1) be on January 1, 2027?",
    unit: "usd",
    pointEstimate: 7.25,
    ciLow: 7.25,
    ciHigh: 9.5,
    confidence: 0.8,
    resolutionDate: "2027-01-01",
    resolutionSource: "29 U.S.C. §206(a)(1) as enacted",
    resolutionRule:
      "Resolves to the cash wage value of the federal minimum wage on January 1, 2027 under the Fair Labor Standards Act, regardless of any tipped-credit or sub-minimum provisions.",
    policyParameter: "usc.29.206.a.1.2027-01-01",
    historicalContext: [
      { label: "Last increase", value: 7.25 },
      { label: "Since", value: 2009 },
      { label: "2025", value: 7.25 },
      { label: "2026", value: 7.25 },
    ],
    drivers: [
      "Senate filibuster math",
      "Standalone-bill viability",
      "Reconciliation eligibility",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "Federal minimum has been $7.25 since July 2009. Multiple proposals (Raise the Wage Act variants) have failed in Senate cloture. Any change requires 60 votes (it's been ruled non-reconciliation-compliant per Byrd) or filibuster reform.",
      },
      { kind: "heading", text: "Legislative status" },
      {
        kind: "tool",
        tool: "congress.lookup",
        call: 'congress.lookup({ topic: "minimum_wage", session: 119, status: "active" })',
        result:
          '{ bills: [ {id: "HR.42", title: "Raise the Wage Act of 2025", status: "passed_house"}, {id: "S.215", title: "Common Sense Wage Increase Act", status: "committee"} ] }',
      },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "29 USC 206(a)(1)", parameter: "minimum_wage", date: "2027-01-01", branch: "current_law" })',
        result: '{ value: 7.25, effective_since: "2009-07-24" }',
      },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "29 USC 206(a)(1)", parameter: "minimum_wage", date: "2027-01-01", branch: "hr42_enacted_as_passed_house" })',
        result: '{ value: 9.50, effective: "2027-01-01" }',
      },
      { kind: "heading", text: "Cloture probability" },
      {
        kind: "text",
        text: "HR.42 passed the House but Senate vote-count is well short of 60. Filibuster reform is conceivable but not in this Congress's calendar. Path to enactment requires either a bipartisan compromise version (lower number, possibly indexed, longer phase-in) or Senate procedural change.",
      },
      {
        kind: "math",
        text: "P(no change, $7.25) = 0.82 · P(modest increase, $8.50–9.00) = 0.10 · P(larger increase, $9.50–11.00) = 0.06 · P(other / indexation only) = 0.02",
      },
      { kind: "heading", text: "Distribution and forecast" },
      {
        kind: "text",
        text: "Strongly right-skewed: 82% probability of exact status quo. Reporting the modal value as the point estimate is more honest than the mean given the discrete nature of the legislative outcome. CI reflects the small but non-trivial right tail.",
      },
      { kind: "forecast", point: 7.25, ciLow: 7.25, ciHigh: 9.5 },
    ],
  },

  {
    slug: "salt-cap-ty2027",
    type: "policy",
    title: "SALT deduction cap, TY2027",
    question:
      "What will the maximum federal state-and-local tax deduction (for joint filers) be in tax year 2027?",
    unit: "usd",
    pointEstimate: 22000,
    ciLow: 10000,
    ciHigh: 80000,
    confidence: 0.8,
    resolutionDate: "2027-12-31",
    resolutionSource: "Internal Revenue Code §164(b)(6)",
    resolutionRule:
      "Resolves to the cap on the deduction for state and local taxes under IRC §164(b)(6) applicable to joint filers in TY2027. If no cap is in force, resolves at the projected average itemizer SALT amount in the SOI distribution (functionally 'no cap').",
    policyParameter: "irc.164.b.6.cap_joint.2027",
    historicalContext: [
      { label: "Pre-TCJA", value: 100000 },
      { label: "TCJA cap", value: 10000 },
      { label: "2024", value: 10000 },
      { label: "2025", value: 10000 },
    ],
    drivers: [
      "TCJA extension package details",
      "Blue-state House Republican leverage",
      "Joint Committee scoring constraints",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "SALT cap is the highest-leverage knob in the TCJA-extension negotiation because the affected constituencies are concentrated in House districts with thin majorities. The TCJA cap sunsets after TY2025; current-law TY2026+ means no cap. Any extension package must affirmatively reimpose or modify the cap.",
      },
      { kind: "heading", text: "Axiom-encoded scenarios" },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "IRC.164.b.6", parameter: "cap_joint", year: 2027, branch: "current_law_post_sunset" })',
        result: '{ value: null, note: "TCJA cap expired; no cap in effect under current law" }',
      },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "IRC.164.b.6", parameter: "cap_joint", year: 2027, branch: "house_passed_extension" })',
        result: '{ value: 20000, note: "doubled cap for joint filers, phased above $500k AGI" }',
      },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "IRC.164.b.6", parameter: "cap_joint", year: 2027, branch: "senate_alternative" })',
        result: '{ value: 40000, note: "negotiated higher cap, $40k joint" }',
      },
      { kind: "heading", text: "Microsim revenue impact" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "salt_cap_22k_joint", year: 2027, output: "iit_revenue_delta_vs_no_cap_billions" })',
        result: '{ point: -88, ci80: [-110, -68] }',
      },
      { kind: "heading", text: "Probability weighting" },
      {
        kind: "math",
        text: "P($10k cap retained) = 0.10 · P($20k doubled joint) = 0.35 · P($40k joint) = 0.25 · P(no cap / full repeal) = 0.20 · P(other) = 0.10",
      },
      {
        kind: "math",
        text: "E[SALT cap TY2027] ≈ 0.10·10000 + 0.35·20000 + 0.25·40000 + 0.20·80000 + 0.10·30000 = $22,000",
      },
      { kind: "heading", text: "Distribution caveat" },
      {
        kind: "text",
        text: "Multi-modal distribution; the point estimate is the expected value but the modal value is $20k. Use the CI as a range, not a posterior interval.",
      },
      { kind: "forecast", point: 22000, ciLow: 10000, ciHigh: 80000 },
    ],
  },

  {
    slug: "snap-max-allotment-family-4-fy2027",
    type: "policy",
    title: "SNAP maximum allotment, family of 4, FY2027",
    question:
      "What will the maximum monthly SNAP benefit for a household of 4 in the 48 contiguous states and DC be for fiscal year 2027?",
    unit: "usd",
    pointEstimate: 1010,
    ciLow: 975,
    ciHigh: 1045,
    confidence: 0.8,
    resolutionDate: "2026-10-01",
    resolutionSource: "USDA FNS",
    resolutionRule:
      "Resolves to the FY2027 maximum allotment for a 4-person household in the 48 contiguous states and DC, as published by USDA in the annual Cost-of-Living Adjustment notice (typically August preceding the fiscal year).",
    policyParameter: "usda.snap.max_allotment.hh4.48_dc.fy2027",
    historicalContext: [
      { label: "FY2024", value: 973 },
      { label: "FY2025", value: 975 },
      { label: "FY2026e", value: 994 },
    ],
    drivers: [
      "Thrifty Food Plan inflation",
      "Farm Bill reauthorization status",
      "Discretionary TFP reevaluation",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the question" },
      {
        kind: "text",
        text: "Under current law, the SNAP maximum is set as 100% of the Thrifty Food Plan for a 4-person household, indexed to June-of-prior-year food-at-home CPI. The 2021 USDA TFP reevaluation raised the base; the 2018 Farm Bill required additional reevaluation by 2027. Two paths: (1) routine annual inflation adjustment, or (2) discretionary TFP reset under FY2027 reauthorization.",
      },
      { kind: "heading", text: "Routine inflation path" },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "7 USC 2017(a)", parameter: "max_allotment_hh4", year: "FY2027", branch: "current_law_inflation_only" })',
        result: '{ formula: "TFP_value × food_at_home_cpi_June_2026_June_2025", projected_value: 1012 }',
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "snap_inflation_only", year: "FY2027", output: "max_allotment_hh4_48states" })',
        result: '{ point: 1010, ci80: [992, 1029] }',
      },
      { kind: "heading", text: "Farm Bill scenarios" },
      {
        kind: "tool",
        tool: "axiom.query",
        call: 'axiom.query({ statute: "Farm Bill reauthorization", parameter: "snap_tfp_treatment", year: "FY2027", branch: "house_ag_committee_markup" })',
        result: '{ change: "freeze_tfp_at_2024_baseline", projected_value: 975 }',
      },
      {
        kind: "text",
        text: "House Ag Committee markup includes language that would constrain future TFP increases. Senate Ag chair has indicated unwillingness to advance any package that cuts SNAP benefits relative to current law. Standoff has lasted three Farm Bill cycles already.",
      },
      { kind: "heading", text: "Weighting" },
      {
        kind: "math",
        text: "P(continuing resolution / inflation-only) = 0.70 · P(SNAP reduced) = 0.20 · P(SNAP modestly raised) = 0.10",
      },
      {
        kind: "math",
        text: "E[max allotment hh4 FY2027] = 0.70·1010 + 0.20·975 + 0.10·1040 = 1010",
      },
      { kind: "forecast", point: 1010, ciLow: 975, ciHigh: 1045 },
    ],
  },

  // ─── Conditional markets ─────────────────────────────────────────────────
  {
    slug: "child-poverty-2028-given-tcja-extended-q2-2026",
    type: "conditional",
    title:
      "Child poverty 2028 | TCJA extension passes by Q2 2026",
    question:
      "Conditional on a full TCJA extension package (CTC at $2,000, current refundability, current EITC) being enacted by June 30, 2026, what will the SPM child poverty rate be in 2028?",
    unit: "percent",
    pointEstimate: 11.5,
    ciLow: 10.3,
    ciHigh: 12.8,
    confidence: 0.8,
    resolutionDate: "2029-09-15",
    resolutionSource: "Census SPM annual release",
    resolutionRule:
      "Resolves to the official Census SPM child poverty rate for 2028, conditional on the event 'a TCJA extension package matching at least the House-passed framework on CTC and EITC is enacted by 2026-06-30.' If the conditioning event does not occur, the market voids and refunds.",
    conditionalOn:
      "TCJA extension package matching House framework enacted by 2026-06-30",
    archCell: "census.spm.child_poverty_rate.2028",
    historicalContext: [
      { label: "2022", value: 12.4 },
      { label: "2023", value: 13.7 },
      { label: "2024", value: 13.4 },
      { label: "2025e", value: 12.9 },
      { label: "2027e (cond.)", value: 11.8 },
    ],
    drivers: [
      "Conditional CTC parameters",
      "Labor-force trajectory under stable policy",
      "Refundability phase-in",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the conditional" },
      {
        kind: "text",
        text: "Conditional resolution: only meaningful if a TCJA-extension package matching the House framework is enacted by June 30, 2026. Under that conditioning event, the CTC ($2,000/child, $1,700 refundable) and EITC are stable through 2028. Question is the residual SPM child-poverty path under stable policy.",
      },
      { kind: "heading", text: "Microsim under the conditioning policy" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "tcja_extended_full", year: 2028, output: "spm_child_poverty_rate", population: "microplex.us.2028" })',
        result: "{ point: 11.3, ci80: [10.4, 12.3] }",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "tcja_extended_full", year: 2028, output: "spm_child_poverty_rate", population: "microplex.us.2028", macro: "cbo_baseline_2028" })',
        result: "{ point: 11.5, ci80: [10.3, 12.7] }",
      },
      { kind: "heading", text: "Compounding effects" },
      {
        kind: "text",
        text: "Two years of stable policy compound modestly: real-wage growth at the lower end of the distribution lifts roughly 0.2pp of children out of measured poverty. Refundable-credit take-up rates also drift up slightly as IRS outreach matures.",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "tcja_extended_full", year: 2028, output: "spm_child_poverty_rate", population: "microplex.us.2028", takeup_adjustment: "trend" })',
        result: "{ point: 11.4, ci80: [10.3, 12.5] }",
      },
      { kind: "heading", text: "Residual uncertainty" },
      {
        kind: "text",
        text: "The conditioning event removes most policy uncertainty but does not remove macro uncertainty (labor market, food/shelter inflation in SPM thresholds). CI reflects macro distribution only.",
      },
      { kind: "forecast", point: 11.5, ciLow: 10.3, ciHigh: 12.8 },
    ],
  },

  {
    slug: "iit-revenue-fy2028-given-salt-fully-repealed",
    type: "conditional",
    title:
      "Federal individual income tax revenue FY2028 | SALT cap fully repealed",
    question:
      "Conditional on the SALT deduction cap being repealed in full (no cap) for tax years 2026 and later, what will federal individual income tax revenue be in FY2028 (in billions of nominal dollars)?",
    unit: "usd",
    pointEstimate: 2790,
    ciLow: 2630,
    ciHigh: 2960,
    confidence: 0.8,
    resolutionDate: "2028-10-20",
    resolutionSource: "U.S. Treasury Monthly Statement (final September FY2028)",
    resolutionRule:
      "Resolves to total individual income tax receipts for FY2028 as reported in the Monthly Treasury Statement covering September 2028, conditional on the SALT deduction cap under IRC §164(b)(6) being fully eliminated for TY2026 and later. If the cap is not fully eliminated, the market voids.",
    conditionalOn:
      "IRC §164(b)(6) SALT cap fully eliminated for TY2026 and later",
    archCell: "treasury.mts.individual_income_tax.fy2028",
    historicalContext: [
      { label: "FY2024", value: 2426 },
      { label: "FY2025e", value: 2520 },
      { label: "FY2026e", value: 2640 },
      { label: "FY2027e", value: 2740 },
    ],
    drivers: [
      "Itemizer redistribution effect",
      "Behavioral response (state tax migration, charitable shifts)",
      "Underlying nominal income growth",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the conditional" },
      {
        kind: "text",
        text: "Conditional on no cap, the principal effect on FY2028 IIT receipts is a static revenue loss of roughly $90–110bn relative to a $10k-cap counterfactual. Dynamic effects (more itemization, slightly more state/local tax-raising behavior at the state level) are second order.",
      },
      { kind: "heading", text: "Microsim under no-cap" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "no_salt_cap_with_tcja_extended", year: 2028, output: "individual_income_tax_receipts_fy", policy_year: 2027 })',
        result: '{ point: 2785, ci80: [2620, 2960], static_revenue_loss_vs_10k_cap: -98 }',
      },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "budget_outlook_2026", series: "salt_cap_repeal_revenue_effect", year: "FY2028" })',
        result: "{ static_effect: -107, dynamic_effect: -118 }",
      },
      { kind: "heading", text: "Behavioral adjustments" },
      {
        kind: "text",
        text: "Behavioral effects increase the dynamic revenue loss by ~10%. Itemization rates rise from current ~10% back toward the pre-TCJA ~30%. State and local tax-raising behavior responds modestly at the margin.",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "no_salt_cap_with_tcja_extended", year: 2028, output: "individual_income_tax_receipts_fy", behavioral: "central" })',
        result: '{ point: 2790, ci80: [2630, 2960] }',
      },
      { kind: "heading", text: "Forecast" },
      { kind: "forecast", point: 2790, ciLow: 2630, ciHigh: 2960 },
    ],
  },

  {
    slug: "uninsured-2028-given-ept-expire",
    type: "conditional",
    title:
      "Uninsured rate (under 65) 2028 | ACA enhanced subsidies expire",
    question:
      "Conditional on the ACA enhanced premium tax credits (ARPA/IRA expansion) expiring as scheduled at end of 2025 and not being restored through 2028, what will the uninsured rate (under 65) be in calendar year 2028?",
    unit: "percent",
    pointEstimate: 11.3,
    ciLow: 10.2,
    ciHigh: 12.4,
    confidence: 0.8,
    resolutionDate: "2029-09-15",
    resolutionSource: "Census ASEC health insurance report",
    resolutionRule:
      "Resolves to the uninsured rate among people under 65 as reported by the Census ASEC for calendar year 2028, conditional on no restoration of the enhanced ACA premium tax credits (above the original ACA-baseline subsidies) through 2028. If subsidies are restored at any point, market voids.",
    conditionalOn:
      "Enhanced ACA premium tax credits remain expired through end of 2028",
    archCell: "census.asec.uninsured_rate_under_65.2028",
    historicalContext: [
      { label: "2021", value: 9.6 },
      { label: "2022", value: 8.6 },
      { label: "2023", value: 8.0 },
      { label: "2024", value: 8.2 },
      { label: "2025e", value: 8.9 },
      { label: "2026e (cond.)", value: 10.4 },
    ],
    drivers: [
      "Marketplace coverage attrition trajectory",
      "Medicaid take-up among newly-priced-out",
      "ESI coverage churn",
    ],
    reasoning: [
      { kind: "heading", text: "Identifying the conditional" },
      {
        kind: "text",
        text: "By 2028, the post-expiration equilibrium will largely have settled. Initial-year coverage loss is sharp; subsequent years see partial reabsorption through Medicaid (for those whose new effective premiums exceed thresholds) and back-to-ESI churn. The 2028 uninsured-rate question is about the equilibrium, not the transient.",
      },
      { kind: "heading", text: "Microsim equilibrium" },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "ept_expired_persistent", year: 2028, output: "uninsured_rate_under_65", model: "demand_aces" })',
        result: '{ point: 11.2, ci80: [10.3, 12.2], coverage_loss_marketplace: -3.4M, medicaid_reabsorption: +0.8M, esi_pickup: +0.2M }',
      },
      {
        kind: "tool",
        tool: "cbo.lookup",
        call: 'cbo.lookup({ table: "health_insurance_baseline_2026", series: "uninsured_rate_under_65", year: 2028, policy: "ept_permanent_expiration" })',
        result: "{ value: 11.5 }",
      },
      { kind: "heading", text: "Compounding factors" },
      {
        kind: "text",
        text: "Two compounding factors push the 2028 number slightly above the 2026 conditional number: (a) marketplace plans become less attractive as some insurers exit subsidy-dependent markets, (b) underlying premium growth makes unsubsidized coverage less affordable for the 200-400% FPL population.",
      },
      {
        kind: "tool",
        call: 'farness.simulate({ scenario: "ept_expired_persistent", year: 2028, output: "uninsured_rate_under_65", model: "demand_aces", insurer_exit: "central" })',
        result: '{ point: 11.3, ci80: [10.2, 12.4] }',
      },
      { kind: "heading", text: "Forecast" },
      { kind: "forecast", point: 11.3, ciLow: 10.2, ciHigh: 12.4 },
    ],
  },
];

export function getMarket(slug: string): Market | undefined {
  return MARKETS.find((m) => m.slug === slug);
}

export function formatValue(value: number, unit: Unit): string {
  switch (unit) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "percent_growth":
      return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
    case "usd":
      if (Math.abs(value) >= 1000) {
        return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      }
      return `$${value.toFixed(2)}`;
    case "usd_monthly":
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`;
    case "ratio":
      return value.toFixed(2);
    default:
      return value.toString();
  }
}

export function formatValueShort(value: number, unit: Unit): string {
  if (unit === "usd" && Math.abs(value) >= 1000) {
    return `$${(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}B`;
  }
  return formatValue(value, unit);
}

export const TYPE_LABEL: Record<MarketType, string> = {
  arch: "ARCH",
  policy: "Policy",
  conditional: "Conditional",
};

export const TYPE_DESCRIPTION: Record<MarketType, string> = {
  arch: "Outcome market on a published government statistic.",
  policy: "Market on an Axiom-encoded policy parameter.",
  conditional: "Outcome conditional on a policy state.",
};
