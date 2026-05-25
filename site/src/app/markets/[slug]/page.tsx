import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ForecastViz } from "@/components/ForecastViz";
import { AgentReasoning } from "@/components/AgentReasoning";
import {
  MARKETS,
  TYPE_LABEL,
  TYPE_DESCRIPTION,
  formatValue,
  getMarket,
  type Market,
} from "@/data/markets";

export function generateStaticParams() {
  return MARKETS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getMarket(slug);
  if (!m) return { title: "Market not found — Farness" };
  return {
    title: `${m.title} — Farness markets`,
    description: m.question,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

const typeBadgeClass: Record<Market["type"], string> = {
  arch: "bg-[var(--color-mist-100)] text-[var(--color-horizon-700)] border-[var(--color-mist-200)]",
  policy:
    "bg-[var(--color-accent-subtle)] text-[var(--color-rose-700)] border-[var(--color-rose-100)]",
  conditional: "bg-[#FFF4DD] text-[#7A5C20] border-[#F2DCAF]",
};

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const market = getMarket(slug);
  if (!market) notFound();

  return (
    <div>
      <Header activePage="markets" />
      <main className="mx-auto max-w-[1100px] px-8 pb-32 pt-10 max-md:px-5">
        <nav className="mb-6 [font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.12em] text-[var(--theme-text-muted)]">
          <Link
            href="/markets"
            className="text-[var(--theme-text-muted)] hover:text-[var(--color-accent)] no-underline"
          >
            ← all markets
          </Link>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-block rounded-full border px-2 py-[2px] [font-family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.1em] ${typeBadgeClass[market.type]}`}
            >
              {TYPE_LABEL[market.type]}
            </span>
            <span className="[font-family:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.12em] text-[var(--theme-text-dim)]">
              {TYPE_DESCRIPTION[market.type]}
            </span>
          </div>
          <h1 className="[font-family:var(--font-display)] text-[clamp(1.7rem,3.5vw,2.4rem)] font-light leading-[1.2] tracking-[-0.02em] text-[var(--theme-text)] mb-5">
            {market.title}
          </h1>
          <p className="max-w-[820px] text-[1rem] leading-[1.65] text-[var(--theme-text-muted)]">
            {market.question}
          </p>
          {market.conditionalOn && (
            <p className="mt-4 inline-block rounded-md border border-[#F2DCAF] bg-[#FFF4DD] px-3 py-2 [font-family:var(--font-mono)] text-[0.72rem] text-[#7A5C20]">
              conditional on:{" "}
              <span className="font-medium">{market.conditionalOn}</span>
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr]">
          {/* Forecast panel */}
          <section className="min-w-0">
            <div
              className="rounded-xl border bg-[var(--theme-bg-elevated)] p-6"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <div className="mb-4 flex items-baseline justify-between">
                <span className="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.12em] text-[var(--theme-text-dim)]">
                  current forecast · 80% CI
                </span>
                <span className="[font-family:var(--font-display)] text-[2rem] font-semibold leading-none text-[var(--color-accent)]">
                  {formatValue(market.pointEstimate, market.unit)}
                </span>
              </div>
              <ForecastViz
                point={market.pointEstimate}
                ciLow={market.ciLow}
                ciHigh={market.ciHigh}
                unit={market.unit}
                history={market.historicalContext}
                size="full"
              />
            </div>

            {/* Drivers */}
            <div
              className="mt-6 rounded-xl border bg-[var(--theme-bg-elevated)] p-6"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <h2 className="mb-3 [font-family:var(--font-display)] text-[0.95rem] font-semibold tracking-[-0.01em]">
                Key drivers
              </h2>
              <ul className="grid grid-cols-1 gap-2 [font-family:var(--font-body)] text-[0.88rem] text-[var(--theme-text)] sm:grid-cols-2">
                {market.drivers.map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-2 leading-[1.5]"
                  >
                    <span className="mt-[6px] inline-block h-1 w-2 shrink-0 bg-[var(--color-accent)]" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resolution + identifier */}
            <div
              className="mt-6 rounded-xl border bg-[var(--theme-bg-elevated)] p-6"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <h2 className="mb-4 [font-family:var(--font-display)] text-[0.95rem] font-semibold tracking-[-0.01em]">
                Resolution
              </h2>
              <dl className="grid grid-cols-[120px_1fr] gap-y-3 [font-family:var(--font-body)] text-[0.86rem]">
                <dt className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--theme-text-dim)]">
                  source
                </dt>
                <dd className="text-[var(--theme-text)]">
                  {market.resolutionSource}
                </dd>
                <dt className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--theme-text-dim)]">
                  expected
                </dt>
                <dd className="text-[var(--theme-text)]">
                  {formatFullDate(market.resolutionDate)}
                </dd>
                <dt className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--theme-text-dim)]">
                  rule
                </dt>
                <dd className="leading-[1.55] text-[var(--theme-text)]">
                  {market.resolutionRule}
                </dd>
                {market.archCell && (
                  <>
                    <dt className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--theme-text-dim)]">
                      ARCH cell
                    </dt>
                    <dd className="[font-family:var(--font-mono)] text-[0.78rem] text-[var(--color-horizon-700)]">
                      {market.archCell}
                    </dd>
                  </>
                )}
                {market.policyParameter && (
                  <>
                    <dt className="[font-family:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.1em] text-[var(--theme-text-dim)]">
                      Axiom param
                    </dt>
                    <dd className="[font-family:var(--font-mono)] text-[0.78rem] text-[var(--color-rose-700)]">
                      {market.policyParameter}
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </section>

          {/* Agent reasoning panel */}
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="[font-family:var(--font-display)] text-[1rem] font-semibold tracking-[-0.01em]">
                Analyst agent · live reasoning
              </h2>
              <span className="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-[var(--theme-text-dim)]">
                {market.reasoning.length} steps
              </span>
            </div>
            <AgentReasoning steps={market.reasoning} unit={market.unit} />
            <p className="mt-3 text-[0.76rem] leading-[1.55] text-[var(--theme-text-dim)]">
              The agent decomposes the question, queries Axiom-encoded statutes,
              calls the Farness microsim against MICROPLEX synthetic
              populations, integrates external baselines, and emits a
              calibrated forecast with full audit trail. Stream replays the
              reasoning trace; in production the same trace is generated live
              against current data.
            </p>
          </section>
        </div>

        {/* Related markets */}
        <RelatedMarkets currentSlug={market.slug} currentType={market.type} />
      </main>
    </div>
  );
}

function RelatedMarkets({
  currentSlug,
  currentType,
}: {
  currentSlug: string;
  currentType: Market["type"];
}) {
  const related = MARKETS.filter(
    (m) => m.slug !== currentSlug && m.type === currentType,
  ).slice(0, 3);
  if (related.length === 0) return null;
  return (
    <section className="mt-20 border-t pt-10" style={{ borderColor: "var(--theme-border)" }}>
      <h2 className="[font-family:var(--font-display)] text-[1.1rem] font-semibold tracking-[-0.01em] mb-5">
        More {TYPE_LABEL[currentType].toLowerCase()} markets
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {related.map((m) => (
          <Link
            key={m.slug}
            href={`/markets/${m.slug}`}
            className="rounded-xl border bg-[var(--theme-bg-elevated)] p-5 no-underline transition-colors hover:no-underline"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <div className="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-[var(--theme-text-dim)] mb-2">
              resolves {formatShortDate(m.resolutionDate)}
            </div>
            <div className="[font-family:var(--font-display)] text-[0.95rem] font-semibold leading-[1.3] text-[var(--theme-text)] mb-3">
              {m.title}
            </div>
            <div className="[font-family:var(--font-display)] text-[1rem] font-semibold text-[var(--color-accent)]">
              {formatValue(m.pointEstimate, m.unit)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
