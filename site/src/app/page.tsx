"use client";

import Link from "next/link";
import { Header } from "@/components/Header";

/* ── Hero ── */

function Hero() {
  return (
    <div className="relative overflow-hidden px-8 pt-20 pb-20 max-md:px-4 max-md:pt-12 max-md:pb-12">
      {/* Atmospheric sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(1200px 500px at 50% -5%, rgba(159, 196, 230, 0.22), transparent 58%)",
            "radial-gradient(900px 280px at 50% 65%, rgba(231, 166, 200, 0.08), transparent 62%)",
            "linear-gradient(180deg, #F9FCFE 0%, #F3F8FB 52%, #EEF4F8 100%)",
          ].join(", "),
        }}
      />

      {/* Content: two-column on desktop */}
      <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-2 gap-12 items-start max-md:grid-cols-1 max-md:gap-8">
        {/* LEFT — headline, subhead, CTAs */}
        <div className="animate-[fade-up_0.8s_ease-out]">
          <div className="[font-family:var(--font-mono)] text-[0.72rem] tracking-[0.12em] uppercase text-[#A94E80] mb-5">
            Decision framework for agents
          </div>
          <h1 className="[font-family:var(--font-display)] text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.12] tracking-[-0.03em] mb-6 text-[#14202B]">
            Make your agent forecast the decision.
          </h1>

          <p className="text-[1.05rem] text-[#415463] max-w-[520px] mb-8 leading-[1.65] animate-[fade-up_0.8s_ease-out_0.12s_both]">
            <span className="[font-family:var(--font-editorial)] italic">farness</span>{" "}
            gives Codex, Claude Code, and other agents a common decision workflow.
            In Codex it now runs as a native skill with a local MCP server, so the
            output is explicit KPIs, reference classes, confidence intervals,
            disconfirming evidence, and review dates.
          </p>

          <div className="flex gap-4 flex-wrap animate-[fade-up_0.8s_ease-out_0.24s_both] max-[480px]:flex-col max-[480px]:items-start">
            <a
              href="/docs#install"
              className="inline-flex items-center gap-2 py-[0.75em] px-6 [font-family:var(--font-display)] text-[0.88rem] font-semibold no-underline rounded-lg cursor-pointer transition-all duration-200 hover:no-underline hover:translate-y-[-1px] bg-[#14202B] text-[#FCFDFE] shadow-[0_2px_8px_rgba(20,32,43,0.12)]"
            >
              Get started
            </a>
            <Link
              href="/paper"
              className="inline-flex items-center gap-2 py-[0.75em] px-2 [font-family:var(--font-body)] text-[0.88rem] font-medium no-underline cursor-pointer transition-all duration-200 text-[#415463] underline decoration-[#BED0DB] underline-offset-4 hover:text-[#14202B] hover:decoration-[#14202B]"
            >
              Read the paper
            </Link>
          </div>
        </div>

        {/* RIGHT — Forecast artifact on dark panel */}
        <div className="animate-[fade-up_0.8s_ease-out_0.24s_both]">
          <ForecastArtifact />
        </div>
      </div>
    </div>
  );
}

/* ── Forecast Artifact — dark instrument panel ── */

function ForecastArtifact() {
  return (
    <div
      className="rounded-[18px] p-8 max-md:p-5"
      style={{
        background: "linear-gradient(180deg, #172633 0%, #0F1A24 100%)",
        border: "1px solid #2B3D4B",
        boxShadow: "0 20px 50px rgba(15, 26, 36, 0.28)",
      }}
    >
      <div className="[font-family:var(--font-mono)] text-[0.78rem] leading-[1.7] text-[#9DB1BF]">
        <div className="mb-4">
          <span className="text-[#6B8494] text-[0.7rem]">Decision prompt:</span>
          <div className="text-[#E8F0F5] mt-1">Should we rewrite the auth layer now?</div>
        </div>

        <div className="mb-4">
          <span className="text-[#6B8494] text-[0.7rem]">Reframed as:</span>
          <div className="text-[#7FB2DA] mt-1">
            P(critical auth incidents decrease by &gt;40% in 90 days | rewrite now)
          </div>
        </div>

        <div className="mb-4">
          <span className="text-[#6B8494] text-[0.7rem]">KPI:</span>
          <div className="text-[#E8F0F5] mt-1">critical_auth_incidents / 90d</div>
        </div>

        <div className="mb-4">
          <span className="text-[#6B8494] text-[0.7rem]">Forecast:</span>
          <div className="mt-2 flex flex-col gap-2">
            <ForecastBar label="rewrite now" value={58} low={42} high={71} />
            <ForecastBar label="defer 60d" value={31} low={19} high={44} />
          </div>
        </div>

        <div className="mb-4">
          <span className="text-[#6B8494] text-[0.7rem]">Base rate:</span>
          <div className="mt-1">
            <span className="text-[#F3B562]">27%</span>
            <span className="text-[#9DB1BF] ml-2">similar infra rewrites yielding material reliability gains</span>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-[#6B8494] text-[0.7rem]">Disconfirming evidence:</span>
          <div className="mt-2 flex gap-2 flex-wrap">
            <EvidenceTag>ops fixes may solve this faster</EvidenceTag>
            <EvidenceTag>rewrite could slip roadmap delivery</EvidenceTag>
            <EvidenceTag>recent outage may overweight urgency</EvidenceTag>
          </div>
        </div>

        <div>
          <span className="text-[#6B8494] text-[0.7rem]">Review date:</span>
          <div className="text-[#E8F0F5] mt-1">2026-06-15</div>
        </div>
      </div>
    </div>
  );
}

function ForecastBar({
  label,
  value,
  low,
  high,
}: {
  label: string;
  value: number;
  low: number;
  high: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#E8F0F5] w-[100px] text-right max-md:w-[80px] text-[0.75rem]">{label}:</span>
      <div className="flex-1 relative h-5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.04)]">
        {/* Confidence interval fill */}
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${low}%`,
            width: `${high - low}%`,
            background: "rgba(143, 124, 255, 0.22)",
            borderLeft: "1px solid rgba(143, 124, 255, 0.45)",
            borderRight: "1px solid rgba(143, 124, 255, 0.45)",
          }}
        />
        {/* Point estimate */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E8F0F5]"
          style={{ left: `${value}%`, boxShadow: "0 0 8px rgba(127, 178, 218, 0.6)" }}
        />
      </div>
      <span className="text-[#7FB2DA] w-[80px] text-[0.75rem] max-md:w-[65px]">
        {value}% [{low}-{high}]
      </span>
    </div>
  );
}

function EvidenceTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[0.7rem] rounded-full py-[5px] px-[10px]"
      style={{
        background: "rgba(231, 166, 200, 0.14)",
        color: "#E7A6C8",
        border: "1px solid rgba(231, 166, 200, 0.25)",
      }}
    >
      {children}
    </span>
  );
}

/* ── Horizon Divider ── */

function HorizonDivider() {
  return (
    <div className="relative h-px my-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(217,228,236,0) 0%, rgba(190,208,219,0.4) 30%, rgba(159,196,230,0.5) 50%, rgba(190,208,219,0.4) 70%, rgba(217,228,236,0) 100%)",
        }}
      />
    </div>
  );
}

/* ── How It Works — 3 steps on light cards ── */

function HowItWorks() {
  const stages = [
    {
      num: "01",
      title: "Intercept",
      description: "Catch decision-language before the model hardens into advice. When a prompt sounds like 'Should we...?' or 'Which is better?', farness reframes it as a forecastable choice.",
    },
    {
      num: "02",
      title: "Reframe",
      description: "Convert vague 'Should I?' into explicit, measurable outcome questions. Define the KPIs that would actually tell you whether the decision was good.",
    },
    {
      num: "03",
      title: "Anchor",
      description: "Produce numeric forecasts with confidence intervals, reference classes from comparable situations, disconfirming evidence, and a review date for accountability.",
    },
  ];

  return (
    <section className="py-[clamp(88px,12vw,140px)] px-8 max-md:px-4 bg-[#F7FAFC]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <span className="[font-family:var(--font-mono)] text-[0.68rem] tracking-[0.12em] uppercase text-[#A94E80] block mb-4 font-medium">
            How farness works
          </span>
          <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.03em] text-[#14202B]">
            From intuition to instrument
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
          {stages.map((stage) => (
            <div
              key={stage.num}
              className="bg-white rounded-2xl p-8 border border-[#D9E4EC] transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(20,32,43,0.06)]"
            >
              <div className="[font-family:var(--font-mono)] text-[0.72rem] font-medium text-[#A94E80] mb-3">
                {stage.num}
              </div>
              <h3 className="[font-family:var(--font-display)] text-[1.2rem] font-semibold mb-3 tracking-[-0.01em] text-[#14202B]">
                {stage.title}
              </h3>
              <p className="text-[0.9rem] text-[#415463] leading-[1.6] m-0">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Example Transformation (Before / After) ── */

function ExampleTransformation() {
  return (
    <section className="py-[clamp(88px,12vw,140px)] px-8 max-md:px-4 bg-[#EEF4F8]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <span className="[font-family:var(--font-mono)] text-[0.68rem] tracking-[0.12em] uppercase text-[#5E7A8D] block mb-4 font-medium">
            From intuition to forecast
          </span>
          <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.03em] text-[#14202B]">
            What the framework forces into view
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-[900px] mx-auto max-md:grid-cols-1">
          {/* Before — light card */}
          <div className="rounded-2xl p-8 bg-white border border-[#D9E4EC]">
            <span className="[font-family:var(--font-mono)] text-[0.65rem] tracking-[0.08em] uppercase text-[#6B7C89] block mb-4">
              Diffuse prompt
            </span>
            <p className="[font-family:var(--font-editorial)] text-[clamp(1.2rem,2vw,1.5rem)] leading-[1.3] text-[#415463] italic m-0">
              &ldquo;Should I refactor this module first?&rdquo;
            </p>
          </div>

          {/* After — dark instrument panel */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "linear-gradient(180deg, #172633 0%, #0F1A24 100%)",
              border: "1px solid #2B3D4B",
              boxShadow: "0 12px 32px rgba(15, 26, 36, 0.18)",
            }}
          >
            <span className="[font-family:var(--font-mono)] text-[0.65rem] tracking-[0.08em] uppercase text-[#7FB2DA] block mb-4">
              Farness output
            </span>
            <div className="[font-family:var(--font-mono)] text-[0.8rem] leading-[1.8] text-[#E8F0F5]">
              <div className="mb-2">
                <span className="text-[#7FB2DA]">KPI:</span> bug_rate / 30d
              </div>
              <div className="mb-2">
                <span className="text-[#7FB2DA]">Event:</span> &gt;25% bug reduction
              </div>
              <div className="mb-2">
                <span className="text-[#7FB2DA]">Horizon:</span> 90 days
              </div>
              <div className="mb-2">
                <span className="text-[#8F7CFF]">Forecast:</span> 44% [28-61]
              </div>
              <div className="mb-2">
                <span className="text-[#F3B562]">Base rate:</span> 22%
              </div>
              <div className="mb-2">
                <span className="text-[#E7A6C8]">Disconfirming evidence:</span> migration drag, auth edge cases
              </div>
              <div>
                <span className="text-[#7FB2DA]">Review:</span> 2026-06-15
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Research Proof — Scholarly Panel ── */

function ResearchProof() {
  return (
    <section className="py-[clamp(88px,12vw,140px)] px-8 max-md:px-4 bg-[#EEF4F8]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <span className="[font-family:var(--font-mono)] text-[0.68rem] tracking-[0.12em] uppercase text-[#5E7A8D] block mb-4 font-medium">
            Research
          </span>
          <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.03em] text-[#14202B]">
            Stability-under-probing
          </h2>
        </div>

        <div className="max-w-[900px] mx-auto rounded-2xl p-10 max-md:p-6 bg-white border border-[#D9E4EC] relative overflow-hidden">
          {/* Faint grid texture */}
          <div
            className="absolute inset-0 rounded-2xl opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(20,32,43,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,32,43,1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative grid grid-cols-3 gap-8 mb-10 max-md:grid-cols-1 max-md:gap-4">
            <StatBlock value="11" label="study 1 scenarios" accent="#356C99" />
            <StatBlock value="2" label="studies in the paper" accent="#A94E80" />
            <StatBlock value="8" label="held-out validation cases" accent="#5E7A8D" />
          </div>

          <div className="relative text-[0.9rem] text-[#415463] leading-[1.65] max-w-[680px] mx-auto">
            <p className="mb-4">
              The paper introduces stability-under-probing as a way to evaluate
              decision prompts without waiting for outcomes. In Study 1, farness
              looked more prepared for the shared probe battery on Claude Opus 4.6
              and GPT-5.4.
            </p>
            <p className="mb-4">
              Study 2 then added held-out probes and showed the broader claim weakens
              sharply off-framework. That makes the paper a methods result first,
              not proof that farness is universally superior.
            </p>
            <p className="mb-6">
              The useful claim is narrower and better: structured decision prompts
              can be tested empirically, and farness is one case study.
            </p>
          </div>

          <div className="relative text-center">
            <Link
              href="/paper"
              className="inline-flex items-center gap-2 py-[0.7em] px-5 [font-family:var(--font-display)] text-[0.85rem] font-medium no-underline rounded-lg cursor-pointer transition-all duration-200 hover:no-underline bg-white text-[#415463] border border-[#BED0DB] hover:border-[#A94E80] hover:text-[#14202B]"
            >
              Read the full paper
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBlock({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="text-center">
      <div
        className="[font-family:var(--font-mono)] text-[1.6rem] font-medium mb-1 max-md:text-[1.3rem]"
        style={{ color: accent }}
      >
        {value}
      </div>
      <div className="[font-family:var(--font-mono)] text-[0.7rem] text-[#6B7C89] tracking-[0.04em]">
        {label}
      </div>
    </div>
  );
}

/* ── Instrument Modules — What farness produces ── */

function InstrumentModules() {
  const modules = [
    {
      title: "KPI",
      description: "What outcome actually matters. Defined before the analysis, not after.",
    },
    {
      title: "Forecast",
      description: "Numeric probability for each option. Not opinions — predictions you can score.",
    },
    {
      title: "Confidence interval",
      description: "The honest range around the estimate. Calibrated uncertainty, not false precision.",
    },
    {
      title: "Base rate",
      description: "What usually happens in comparable situations. The outside view as empirical anchor.",
    },
    {
      title: "Disconfirming evidence",
      description: "What counter-evidence, failure modes, or decision traps could make the leading option wrong.",
    },
    {
      title: "Review date",
      description: "When to check the forecast against reality. Accountability built in.",
    },
  ];

  return (
    <section className="py-[clamp(88px,12vw,140px)] px-8 max-md:px-4 bg-[#F7FAFC]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <span className="[font-family:var(--font-mono)] text-[0.68rem] tracking-[0.12em] uppercase text-[#A94E80] block mb-4 font-medium">
            Output primitives
          </span>
          <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.03em] text-[#14202B]">
            What farness produces
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-[480px]:grid-cols-1">
          {modules.map((mod) => (
            <div
              key={mod.title}
              className="rounded-2xl p-6 bg-white border border-[#D9E4EC] transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(20,32,43,0.06)]"
            >
              <div className="[font-family:var(--font-mono)] text-[0.72rem] font-medium tracking-[0.04em] mb-3 text-[#A94E80]">
                {mod.title}
              </div>
              <p className="text-[0.85rem] text-[#415463] leading-[1.55] m-0">
                {mod.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Editorial Pull Quote ── */

function WhyItMatters() {
  return (
    <section className="py-[clamp(88px,12vw,140px)] px-8 max-md:px-4 bg-[#EEF4F8]">
      <div className="max-w-[680px] mx-auto text-center">
        <p className="[font-family:var(--font-editorial)] text-[clamp(1.4rem,3vw,2.2rem)] leading-[1.2] text-[#14202B] italic mb-8">
          AI is often fluent about decisions before it is rigorous about them.
          farness adds structure before confidence hardens into action.
        </p>
        <div className="w-12 h-px mx-auto bg-[#BED0DB]" />
      </div>
    </section>
  );
}

/* ── Installation ── */

function Installation() {
  const workflows = [
    {
      title: "Codex",
      description:
        "Install the package, run one setup command, then use $farness when a decision prompt shows up.",
      code: `$ python -m pip install 'farness[mcp]'
$ farness setup codex
$ # restart Codex, then use $farness`,
    },
    {
      title: "Claude Code",
      description:
        "Use the same single-command setup flow for Claude. The plugin is still available if you prefer slash-command UX.",
      code: `$ python -m pip install 'farness[mcp]'
$ farness setup claude
$ # restart Claude Code`,
    },
    {
      title: "CLI / Python",
      description:
        "Local decision log and calibration tool. No LLM API key required unless you run separate experiment code against external models.",
      code: `$ python -m pip install farness
$ farness new "Should we rewrite the auth layer?"
$ farness calibration`,
    },
  ];

  return (
    <section id="install" className="py-[clamp(88px,12vw,140px)] px-8 max-md:px-4 bg-[#F7FAFC]">
      <div className="max-w-[1100px] mx-auto text-center">
        <span className="[font-family:var(--font-mono)] text-[0.68rem] tracking-[0.12em] uppercase text-[#A94E80] block mb-4 font-medium">
          Agent integrations
        </span>
        <h2 className="[font-family:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.03em] text-[#14202B] mb-8">
          Use it natively or from the CLI
        </h2>

        <p className="text-[0.9rem] text-[#415463] mb-8 leading-[1.65] max-w-[760px] mx-auto">
          Farness now has a package-first agent path: a local MCP server for
          persistence, packaged skills for Codex and Claude Code, and the same
          forecast structure used in the paper. The Claude plugin remains optional,
          and the CLI is a local store and calibration surface, not an LLM client.
          If setup drifts, `farness doctor --fix` repairs the local integration.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8 max-md:grid-cols-1">
          {workflows.map((workflow) => (
            <div
              key={workflow.title}
              className="rounded-2xl p-5 text-left bg-white border border-[#D9E4EC]"
            >
              <div className="[font-family:var(--font-display)] text-[1rem] font-semibold text-[#14202B] mb-2">
                {workflow.title}
              </div>
              <p className="text-[0.82rem] text-[#415463] leading-[1.55] mb-4">
                {workflow.description}
              </p>
              <div
                className="rounded-xl p-4"
                style={{
                  background: "linear-gradient(180deg, #172633 0%, #0F1A24 100%)",
                  border: "1px solid #2B3D4B",
                }}
              >
                <pre className="[font-family:var(--font-mono)] text-[0.74rem] text-[#E8F0F5] leading-[1.7] whitespace-pre-wrap m-0">
                  {workflow.code}
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="https://github.com/MaxGhenis/farness"
            className="inline-flex items-center gap-2 py-[0.75em] px-6 [font-family:var(--font-display)] text-[0.88rem] font-semibold no-underline rounded-lg cursor-pointer transition-all duration-200 hover:no-underline hover:translate-y-[-1px] bg-[#14202B] text-[#FCFDFE] shadow-[0_2px_8px_rgba(20,32,43,0.12)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
          <a
            href="/docs"
            className="inline-flex items-center gap-2 py-[0.75em] px-6 [font-family:var(--font-display)] text-[0.88rem] font-medium no-underline rounded-lg cursor-pointer transition-all duration-200 hover:no-underline bg-white text-[#415463] border border-[#BED0DB] hover:border-[#A94E80] hover:text-[#14202B]"
          >
            <span className="[font-family:var(--font-mono)] text-[0.82rem]">open docs</span>
          </a>
          <a
            href="https://github.com/MaxGhenis/farness/blob/main/docs/agent-workflows.md"
            className="inline-flex items-center gap-2 py-[0.75em] px-6 [font-family:var(--font-display)] text-[0.88rem] font-medium no-underline rounded-lg cursor-pointer transition-all duration-200 hover:no-underline bg-white text-[#415463] border border-[#BED0DB] hover:border-[#A94E80] hover:text-[#14202B]"
          >
            Agent workflows
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Closing + Footer ── */

function ClosingSection() {
  return (
    <section className="py-[clamp(88px,12vw,140px)] px-8 max-md:px-4 text-center bg-[#EEF4F8]">
      <h2 className="[font-family:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.05] tracking-[-0.03em] text-[#14202B] mb-6">
        See further before you decide.
      </h2>
      <a
        href="/docs#install"
        className="inline-flex items-center gap-2 py-[0.75em] px-6 [font-family:var(--font-display)] text-[0.88rem] font-semibold no-underline rounded-lg cursor-pointer transition-all duration-200 hover:no-underline hover:translate-y-[-1px] bg-[#A94E80] text-white shadow-[0_2px_8px_rgba(169,78,128,0.18)]"
      >
        Start with farness
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 px-8 text-center bg-[#F7FAFC] border-t border-[#D9E4EC]">
      <p className="[font-family:var(--font-editorial)] text-[1rem] text-[#6B7C89] italic mb-6">
        Clarity at distance.
      </p>
      <div className="flex gap-6 justify-center text-[0.78rem] [font-family:var(--font-mono)]">
        <a href="https://github.com/MaxGhenis/farness" className="text-[#6B7C89] no-underline hover:text-[#14202B] transition-colors">
          GitHub
        </a>
        <a href="/docs" className="text-[#6B7C89] no-underline hover:text-[#14202B] transition-colors">
          Docs
        </a>
        <a href="/paper" className="text-[#6B7C89] no-underline hover:text-[#14202B] transition-colors">
          Research
        </a>
        <a href="/thesis" className="text-[#6B7C89] no-underline hover:text-[#14202B] transition-colors">
          Thesis
        </a>
      </div>
      <p className="mt-6 text-[0.75rem] text-[#94A3AF]">
        Built by <a href="https://maxghenis.com" className="text-[#6B7C89] no-underline hover:text-[#14202B] transition-colors">Max Ghenis</a>
      </p>
    </footer>
  );
}

/* ── App ── */

export default function HomePage() {
  return (
    <div className="bg-[#F7FAFC] text-[#14202B] min-h-screen grain-overlay">
      <Header />
      <Hero />
      <HowItWorks />
      <HorizonDivider />
      <ExampleTransformation />
      <ResearchProof />
      <HorizonDivider />
      <InstrumentModules />
      <WhyItMatters />
      <Installation />
      <ClosingSection />
      <Footer />
    </div>
  );
}
