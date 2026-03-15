"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

/* ── Shared style snippets ── */

const btnBase =
  "inline-flex items-center gap-2 py-[0.7em] px-6 [font-family:var(--font-body)] text-[0.9rem] font-medium no-underline rounded-lg border border-transparent cursor-pointer transition-all duration-200 hover:no-underline";
const btnAccent = `${btnBase} bg-accent text-[var(--theme-bg)] border-accent hover:bg-accent-hover hover:border-accent-hover hover:shadow-[0_4px_20px_var(--color-accent-glow)]`;
const btnGhost = `${btnBase} bg-transparent text-[var(--theme-text-muted)] border-[var(--theme-border-strong)] hover:border-accent hover:text-accent`;
const mono = "[font-family:var(--font-mono)] text-[0.85em]";

/* ── Hero ── */

function Hero() {
  return (
    <div className="relative overflow-hidden flex justify-center px-8 pt-40 pb-24 max-md:px-4 max-md:pt-24 max-md:pb-16">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:60px_60px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
      <div className="relative text-center max-w-[780px] animate-[fade-up_0.8s_ease-out]">
        <p className="[font-family:var(--font-mono)] text-[0.72rem] tracking-[0.08em] text-accent mb-4">
          Decision framework
        </p>
        <h1 className="[font-family:var(--font-display)] text-[clamp(2.4rem,5.5vw,3.8rem)] font-normal leading-[1.18] tracking-[-0.02em] mb-8">
          Stop asking{" "}
          <em className="italic text-accent">{'"Is this good?"'}</em>
          <br />
          Start asking{" "}
          <em className="italic text-accent">{'"What will happen?"'}</em>
        </h1>
        <p className="text-[1.15rem] font-light text-[var(--theme-text-muted)] max-w-[560px] mx-auto mb-16 leading-[1.65] animate-[fade-up_0.8s_ease-out_0.12s_both]">
          Farness reframes decisions as forecasting problems—with explicit KPIs,
          confidence intervals, and calibration tracking.
        </p>
        <div className="flex gap-4 justify-center flex-wrap animate-[fade-up_0.8s_ease-out_0.24s_both] max-[480px]:flex-col max-[480px]:items-center">
          <a href="#demo" className={btnAccent}>
            See it work
          </a>
          <a href="https://pypi.org/project/farness/" className={btnGhost}>
            <span className={mono}>pip install farness</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Section ── */

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-24">
      <div className="mb-8">
        <span className="[font-family:var(--font-mono)] text-[0.7rem] tracking-[0.06em] text-accent block mb-2">
          {label}
        </span>
        <h2 className="[font-family:var(--font-display)] text-[1.8rem] font-normal leading-[1.25] tracking-[-0.01em]">
          {title}
        </h2>
      </div>
      <div className="[&_p]:text-[var(--theme-text-muted)] [&_p]:mb-4 [&_p]:font-light [&_strong]:text-[var(--theme-text)] [&_strong]:font-medium [&_em]:text-[var(--theme-text)]">
        {children}
      </div>
    </section>
  );
}

/* ── Interactive Decision Demo ── */

interface DemoScenario {
  question: string;
  kpis: { name: string; unit: string }[];
  options: {
    name: string;
    forecasts: { value: number; ci: [number, number] }[];
  }[];
}

const SCENARIOS: DemoScenario[] = [
  {
    question: "Which job should I take?",
    kpis: [
      { name: "Total comp (year 1)", unit: "$k" },
      { name: "Learning & growth", unit: "/10" },
      { name: "Work-life balance", unit: "/10" },
    ],
    options: [
      {
        name: "Startup",
        forecasts: [
          { value: 180, ci: [140, 240] },
          { value: 8.5, ci: [7, 10] },
          { value: 5, ci: [3, 7] },
        ],
      },
      {
        name: "Big co",
        forecasts: [
          { value: 250, ci: [230, 270] },
          { value: 5, ci: [4, 6] },
          { value: 7.5, ci: [6, 9] },
        ],
      },
    ],
  },
  {
    question: "Should we launch this feature?",
    kpis: [
      { name: "User retention", unit: "%" },
      { name: "Revenue impact", unit: "$k/mo" },
      { name: "Eng effort", unit: "weeks" },
    ],
    options: [
      {
        name: "Launch now",
        forecasts: [
          { value: 72, ci: [65, 80] },
          { value: 45, ci: [20, 80] },
          { value: 6, ci: [4, 10] },
        ],
      },
      {
        name: "Wait & polish",
        forecasts: [
          { value: 78, ci: [72, 85] },
          { value: 60, ci: [35, 90] },
          { value: 12, ci: [8, 18] },
        ],
      },
    ],
  },
  {
    question: "Continue or kill this project?",
    kpis: [
      { name: "Months to ship", unit: "mo" },
      { name: "Added burn", unit: "$k" },
      { name: "Strategic value", unit: "/10" },
    ],
    options: [
      {
        name: "Continue",
        forecasts: [
          { value: 8, ci: [5, 14] },
          { value: 500, ci: [300, 900] },
          { value: 7, ci: [5, 9] },
        ],
      },
      {
        name: "Kill it",
        forecasts: [
          { value: 0, ci: [0, 0] },
          { value: 0, ci: [0, 0] },
          { value: 2, ci: [1, 3] },
        ],
      },
    ],
  },
];

function ConfidenceBar({
  value,
  ci,
  max,
  color,
  animate,
}: {
  value: number;
  ci: [number, number];
  max: number;
  color: string;
  animate: boolean;
}) {
  const pct = (v: number) => `${(v / max) * 100}%`;

  return (
    <div className="relative w-full h-7 bg-[var(--theme-bg-surface)] rounded overflow-hidden">
      <div
        className={`absolute top-0 h-full rounded-[3px] transition-all duration-500 origin-left ${
          animate ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
        style={{
          left: pct(ci[0]),
          width: `${((ci[1] - ci[0]) / max) * 100}%`,
          background: `${color}20`,
          borderLeft: `1px solid ${color}40`,
          borderRight: `1px solid ${color}40`,
        }}
      />
      <div
        className={`absolute top-1/2 w-2.5 h-2.5 rounded-full transition-transform duration-[0.25s] ${
          animate
            ? "translate-x-[-50%] translate-y-[-50%] scale-100"
            : "translate-x-[-50%] translate-y-[-50%] scale-0"
        }`}
        style={{
          left: pct(value),
          background: color,
          boxShadow: `0 0 8px ${color}60`,
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
    </div>
  );
}

function InteractiveDemo() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [animate, setAnimate] = useState(true);
  const scenario = SCENARIOS[activeScenario];

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [activeScenario]);

  const colors = ["#e8a825", "#5b9bd5"];

  return (
    <div className="max-w-[1080px] mx-auto px-8 py-24" id="demo">
      <div className="text-center mb-16">
        <span className="[font-family:var(--font-mono)] text-[0.7rem] tracking-[0.06em] text-accent block mb-2">
          Interactive demo
        </span>
        <h3 className="[font-family:var(--font-display)] text-[1.6rem] font-normal italic mb-8">
          {scenario.question}
        </h3>
        <div className="flex gap-2 justify-center flex-wrap max-[480px]:flex-col max-[480px]:items-stretch">
          {SCENARIOS.map((sc, i) => (
            <button
              key={i}
              className={`[font-family:var(--font-body)] text-[0.78rem] font-normal py-[0.4em] px-4 bg-transparent border rounded-[20px] cursor-pointer transition-all duration-200 ${
                i === activeScenario
                  ? "border-accent text-accent bg-accent-subtle"
                  : "border-[var(--theme-border)] text-[var(--theme-text-dim)] hover:border-[var(--theme-text-muted)] hover:text-[var(--theme-text-muted)]"
              }`}
              onClick={() => setActiveScenario(i)}
            >
              {sc.question.length > 25
                ? sc.question.slice(0, 25) + "..."
                : sc.question}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8">
        {scenario.kpis.map((kpi, ki) => {
          const allVals = scenario.options.flatMap((o) => [
            o.forecasts[ki].ci[0],
            o.forecasts[ki].ci[1],
          ]);
          const max = Math.max(...allVals) * 1.15;

          return (
            <div
              key={kpi.name}
              className="bg-[var(--theme-bg-elevated)] border border-[var(--theme-border)] rounded-xl p-8"
            >
              <div className="flex justify-between items-baseline mb-4">
                <span className="font-medium text-[0.95rem]">{kpi.name}</span>
                <span className="[font-family:var(--font-mono)] text-[0.75rem] text-[var(--theme-text-dim)]">
                  {kpi.unit}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {scenario.options.map((opt, oi) => (
                  <div
                    key={opt.name}
                    className="grid grid-cols-[80px_1fr_50px] items-center gap-4 max-md:grid-cols-[65px_1fr_40px] max-[480px]:grid-cols-[55px_1fr_35px] max-[480px]:gap-2"
                  >
                    <span
                      className="[font-family:var(--font-body)] text-[0.82rem] font-medium text-right"
                      style={{ color: colors[oi] }}
                    >
                      {opt.name}
                    </span>
                    <div className="relative h-7">
                      <ConfidenceBar
                        value={opt.forecasts[ki].value}
                        ci={opt.forecasts[ki].ci}
                        max={max}
                        color={colors[oi]}
                        animate={animate}
                      />
                    </div>
                    <span
                      className={`${mono} text-[0.8rem] text-[var(--theme-text-muted)] text-right`}
                    >
                      {opt.forecasts[ki].value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-[0.4rem]">
                <span
                  className={`${mono} text-[0.65rem] text-[var(--theme-text-dim)]`}
                >
                  0
                </span>
                <span
                  className={`${mono} text-[0.65rem] text-[var(--theme-text-dim)]`}
                >
                  {Math.round(max / 2)}
                </span>
                <span
                  className={`${mono} text-[0.65rem] text-[var(--theme-text-dim)]`}
                >
                  {Math.round(max)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <span className="text-[0.75rem] text-[var(--theme-text-dim)] inline-flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-accent mr-1" />{" "}
          Point estimate
          <span className="inline-block w-6 h-2.5 bg-accent-subtle border-l border-r border-accent rounded-sm mr-1" />{" "}
          80% confidence interval
        </span>
      </div>
    </div>
  );
}

/* ── Reframe Examples ── */

function ReframeDemo() {
  const examples = [
    {
      before: '"Should I take job A or job B?"',
      after:
        '"What\'s my 80% CI on E[salary] at Job A vs Job B? What about work-life balance?"',
    },
    {
      before: '"Is this a good investment?"',
      after: '"What\'s P(ROI > 10% at 5 years)? What are the key assumptions?"',
    },
    {
      before: '"Should we launch this feature?"',
      after: '"What\'s P(retention > 5% | launch)? What would make us update?"',
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % examples.length);
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="my-16">
      <div className="flex items-stretch gap-4 max-md:flex-col">
        <div className="flex-1 p-8 rounded-[10px] flex flex-col gap-2 bg-[var(--theme-bg-elevated)] border border-[var(--theme-border)]">
          <span className="[font-family:var(--font-mono)] text-[0.65rem] tracking-[0.06em] text-[var(--theme-text-dim)]">
            vague
          </span>
          <p className="[font-family:var(--font-display)] text-[1.05rem] italic leading-[1.5] text-[var(--theme-text-muted)] m-0">
            {examples[current].before}
          </p>
        </div>
        <div className="flex items-center text-accent shrink-0 opacity-50 max-md:justify-center max-md:rotate-90">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </div>
        <div className="flex-1 p-8 rounded-[10px] flex flex-col gap-2 bg-[var(--theme-bg-surface)] border border-[rgba(232,168,37,0.3)]">
          <span className="[font-family:var(--font-mono)] text-[0.65rem] tracking-[0.06em] text-accent">
            precise
          </span>
          <p className="[font-family:var(--font-display)] text-[1.05rem] italic leading-[1.5] text-[var(--theme-text)] m-0">
            {examples[current].after}
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {examples.map((_, i) => (
          <button
            key={i}
            className={`w-[7px] h-[7px] rounded-full border cursor-pointer p-0 transition-all duration-200 ${
              i === current
                ? "bg-accent border-accent"
                : "bg-transparent border-[var(--theme-border-strong)] hover:border-accent"
            }`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Framework Steps ── */

const StepIcons = {
  "01": (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="2" y="6" width="4" height="12" rx="1" />
      <rect x="8" y="3" width="4" height="15" rx="1" />
      <rect x="14" y="9" width="4" height="9" rx="1" />
    </svg>
  ),
  "02": (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M3 10h6" />
      <path d="M9 10l5-6" />
      <path d="M9 10l5 0" />
      <path d="M9 10l5 6" />
      <circle cx="16" cy="4" r="2" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="16" cy="16" r="2" />
    </svg>
  ),
  "03": (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M2 14l4-4 3 3 4-6 5 5" />
      <line x1="2" y1="18" x2="18" y2="18" />
    </svg>
  ),
  "04": (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="10" cy="8" r="6" />
      <line x1="10" y1="14" x2="10" y2="18" />
      <line x1="10" y1="5" x2="10" y2="9" />
      <line x1="8" y1="7" x2="12" y2="7" />
    </svg>
  ),
  "05": (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <polyline points="2,12 6,16 18,4" />
    </svg>
  ),
} as const;

function FrameworkSteps() {
  const steps = [
    {
      num: "01" as const,
      title: "Define KPIs",
      text: "What outcomes matter? Income, satisfaction, optionality, time? Pick 1-3 you'd actually use to judge success in hindsight.",
    },
    {
      num: "02" as const,
      title: "Expand options",
      text: "Don't just compare A vs B. What about C? Waiting? A hybrid? The best option is often one you didn't initially consider.",
    },
    {
      num: "03" as const,
      title: "Decompose & forecast",
      text: "For each option x KPI: start with base rates (outside view), adjust for specifics (inside view), give a point estimate with confidence interval.",
    },
    {
      num: "04" as const,
      title: "Surface assumptions",
      text: "What are you assuming? What would change the estimate? This is where the real thinking happens.",
    },
    {
      num: "05" as const,
      title: "Log & score",
      text: "Record your forecasts. In 3-6 months, compare to reality. Build a calibration curve. Get better over time.",
    },
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 max-md:grid-cols-1">
      {steps.map((step) => (
        <div
          key={step.num}
          className="bg-[var(--theme-bg-elevated)] border border-[var(--theme-border)] rounded-xl p-8 transition-colors duration-200 hover:border-[var(--theme-border-strong)]"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-accent flex items-center opacity-70">
              {StepIcons[step.num]}
            </span>
            <span className={`${mono} text-[0.75rem] text-accent`}>
              {step.num}
            </span>
          </div>
          <h3 className="[font-family:var(--font-display)] text-[1.05rem] font-medium mb-2">
            {step.title}
          </h3>
          <p className="text-[0.88rem] text-[var(--theme-text-muted)] m-0 leading-[1.55]">
            {step.text}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Why It Works ── */

function WhyItWorks() {
  const reasons = [
    {
      title: "Reduces sycophancy",
      text: "It's harder to just agree when you have to produce a number with a confidence interval.",
    },
    {
      title: "Forces mechanism thinking",
      text: "You can't forecast without reasoning about cause and effect.",
    },
    {
      title: "Separates values from facts",
      text: "You choose what to optimize (values); the forecast is about what will happen (facts).",
    },
    {
      title: "Creates accountability",
      text: "Predictions can be scored. Opinions can't.",
    },
    {
      title: "Builds calibration",
      text: "Track predictions over time. Learn whether you're overconfident or biased in specific domains.",
    },
  ];

  return (
    <div className="grid gap-4">
      {reasons.map((r, i) => (
        <div
          key={i}
          className="flex flex-col gap-[0.3rem] py-4 border-b border-[var(--theme-border)] last:border-b-0"
        >
          <h3 className="[font-family:var(--font-display)] text-base font-medium text-[var(--theme-text)]">
            {r.title}
          </h3>
          <p className="text-[0.9rem] text-[var(--theme-text-muted)] m-0">
            {r.text}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── CTA ── */

function CTA() {
  return (
    <div className="border-t border-[var(--theme-border)] px-8 py-24">
      <div className="max-w-[720px] mx-auto text-center">
        <h2 className="[font-family:var(--font-display)] text-[1.8rem] font-normal mb-4">
          Start making better decisions
        </h2>
        <p className="text-[var(--theme-text-muted)] font-light max-w-[480px] mx-auto">
          Farness is open source. Use it as a Python library, CLI tool, or
          Claude Code plugin.
        </p>
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <a href="https://github.com/MaxGhenis/farness" className={btnAccent}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
          <a href="https://pypi.org/project/farness/" className={btnGhost}>
            <span className={mono}>pip install farness</span>
          </a>
        </div>
        <div className="mt-8 inline-block bg-[var(--theme-bg-elevated)] border border-[var(--theme-border)] rounded-[10px] py-4 px-8">
          <code
            className={`${mono} text-[0.82rem] text-[var(--theme-text-muted)] leading-[1.8]`}
          >
            $ farness new &quot;Should I take this job?&quot;
            <br />
            Created decision [a3f8b2c1]: Should I take this job?
          </code>
        </div>
      </div>
    </div>
  );
}

/* ── Footer ── */

function Footer() {
  return (
    <footer className="text-center py-16 px-8 text-[var(--theme-text-dim)] text-[0.82rem] border-t border-[var(--theme-border)]">
      <p>
        Built by{" "}
        <a
          href="https://github.com/MaxGhenis"
          className="text-[var(--theme-text-muted)] hover:text-accent"
        >
          Max Ghenis
        </a>
        . Inspired by superforecasting, Fermi estimation, and the desire for
        better decisions.
      </p>
    </footer>
  );
}

/* ── App ── */

export default function HomePage() {
  return (
    <div className="theme-dark bg-[var(--theme-bg)] text-[var(--theme-text)] min-h-screen">
      <Header />
      <Hero />
      <main className="max-w-[720px] mx-auto px-8 py-16">
        <Section id="problem" label="01" title="The problem">
          <p>
            When we ask AI (or advisors, or ourselves){" "}
            <strong>{'"Should I do X?"'}</strong>, we get opinions dressed as
            answers. The response depends on unstated assumptions about what we
            value, what success looks like, and how confident the advisor really
            is.
          </p>
          <p>
            Worse: we can&apos;t learn from these answers. Six months later, we
            can&apos;t score whether the advice was good because we never
            defined what &quot;good&quot; meant.
          </p>
        </Section>

        <Section id="reframe" label="02" title="The reframe">
          <p>
            Instead of asking for advice, ask for{" "}
            <strong>forecasts conditional on actions</strong>. Define what
            you&apos;re optimizing for, then predict outcomes.
          </p>
          <ReframeDemo />
          <p>
            This forces clarity: What do you actually care about? What are the
            real options? How uncertain are you? And crucially—you can{" "}
            <em>score this later</em> to improve.
          </p>
        </Section>

        <InteractiveDemo />

        <Section id="framework" label="03" title="The framework">
          <FrameworkSteps />
        </Section>

        <Section id="why" label="04" title="Why this works">
          <WhyItWorks />
        </Section>

        <Section id="research" label="05" title="The research">
          <p>
            How do we know structured frameworks actually improve LLM decision
            support? We developed a methodology called{" "}
            <strong>stability-under-probing</strong>: measuring whether
            responses hold up when challenged with base rates, new information,
            and adversarial pressure.
          </p>
          <p>
            Our experiments show that framework-guided responses are more stable
            under probing—not because they&apos;re stubborn, but because
            they&apos;ve already incorporated the considerations that probing
            would surface. Naive responses converge toward where the framework
            started.
          </p>
          <p>
            <Link
              href="/paper"
              className="text-accent font-medium no-underline hover:underline"
            >
              Read the full paper →
            </Link>
          </p>
        </Section>
      </main>
      <CTA />
      <Footer />
    </div>
  );
}
