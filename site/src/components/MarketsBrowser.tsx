"use client";

import { useMemo, useState } from "react";
import {
  MARKETS,
  TYPE_LABEL,
  TYPE_DESCRIPTION,
  type Market,
  type MarketType,
} from "@/data/markets";
import { MarketCard } from "./MarketCard";

type Filter = "all" | MarketType;

const FILTERS: { key: Filter; label: string; description: string }[] = [
  {
    key: "all",
    label: "All forecasts",
    description: "All three forecast types.",
  },
  {
    key: "arch",
    label: TYPE_LABEL.arch + " cells",
    description: TYPE_DESCRIPTION.arch,
  },
  {
    key: "policy",
    label: TYPE_LABEL.policy + " parameters",
    description: TYPE_DESCRIPTION.policy,
  },
  {
    key: "conditional",
    label: TYPE_LABEL.conditional,
    description: TYPE_DESCRIPTION.conditional,
  },
];

export function MarketsBrowser() {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(
    () =>
      filter === "all" ? MARKETS : MARKETS.filter((m) => m.type === filter),
    [filter],
  );
  const description =
    FILTERS.find((f) => f.key === filter)?.description ??
    FILTERS[0].description;

  return (
    <div>
      <div
        className="mb-6 flex flex-wrap items-center gap-1 rounded-xl border bg-[var(--theme-bg-elevated)] p-1.5"
        style={{ borderColor: "var(--theme-border)" }}
      >
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? MARKETS.length
              : MARKETS.filter((m) => m.type === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 [font-family:var(--font-body)] text-[0.85rem] transition-colors ${
                active
                  ? "bg-[var(--theme-text)] text-[var(--theme-bg)]"
                  : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              }`}
            >
              <span>{f.label}</span>
              <span
                className={`[font-family:var(--font-mono)] text-[0.7rem] ${
                  active ? "opacity-80" : "text-[var(--theme-text-dim)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mb-8 max-w-[640px] text-[0.9rem] text-[var(--theme-text-muted)]">
        {description}
      </p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m: Market) => (
          <MarketCard key={m.slug} market={m} />
        ))}
      </div>
    </div>
  );
}
