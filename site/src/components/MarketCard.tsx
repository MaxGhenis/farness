import Link from "next/link";
import {
  type Market,
  TYPE_LABEL,
  formatValue,
} from "@/data/markets";
import { ForecastViz } from "./ForecastViz";

const typeBadgeClass: Record<Market["type"], string> = {
  arch: "bg-[var(--color-mist-100)] text-[var(--color-horizon-700)] border-[var(--color-mist-200)]",
  policy:
    "bg-[var(--color-accent-subtle)] text-[var(--color-rose-700)] border-[var(--color-rose-100)]",
  conditional:
    "bg-[#FFF4DD] text-[#7A5C20] border-[#F2DCAF]",
};

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const resolutionLabel = formatResolutionLabel(market.resolutionDate);
  return (
    <Link
      href={`/markets/${market.slug}`}
      className="group flex flex-col gap-4 rounded-xl border bg-[var(--theme-bg-elevated)] p-6 no-underline transition-all duration-200 hover:no-underline hover:translate-y-[-2px] hover:shadow-md"
      style={{
        borderColor: "var(--theme-border)",
        color: "var(--theme-text)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-block rounded-full border px-2 py-[2px] [font-family:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.1em] ${typeBadgeClass[market.type]}`}
        >
          {TYPE_LABEL[market.type]}
        </span>
        <span className="[font-family:var(--font-mono)] text-[0.62rem] text-[var(--theme-text-dim)]">
          resolves {resolutionLabel}
        </span>
      </div>
      <h3 className="[font-family:var(--font-display)] text-[1.05rem] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--theme-text)] group-hover:text-[var(--color-accent)] transition-colors">
        {market.title}
      </h3>
      <div className="mt-auto">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="[font-family:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.1em] text-[var(--theme-text-dim)]">
            forecast · 80% CI
          </span>
          <span className="[font-family:var(--font-display)] text-[1.15rem] font-semibold text-[var(--color-accent)]">
            {formatValue(market.pointEstimate, market.unit)}
          </span>
        </div>
        <ForecastViz
          point={market.pointEstimate}
          ciLow={market.ciLow}
          ciHigh={market.ciHigh}
          unit={market.unit}
          size="compact"
        />
      </div>
    </Link>
  );
}

function formatResolutionLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
