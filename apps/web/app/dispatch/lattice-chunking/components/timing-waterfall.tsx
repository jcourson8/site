"use client";

import { useState } from "react";

interface TimingEntry {
  after: number;
  before: number;
  color: string;
  label: string;
}

const DATA: TimingEntry[] = [
  { label: "Embed", before: 510, after: 510, color: "var(--chart-1)" },
  { label: "Neo4j query", before: 1400, after: 480, color: "var(--chart-2)" },
  { label: "Merge + fetch", before: 7700, after: 230, color: "var(--chart-3)" },
];

const BEFORE_TOTAL = DATA.reduce((s, d) => s + d.before, 0);
const AFTER_TOTAL = DATA.reduce((s, d) => s + d.after, 0);
const MAX_VAL = BEFORE_TOTAL;

function Bar({
  value,
  maxVal,
  color,
  label,
  ms,
}: {
  value: number;
  maxVal: number;
  color: string;
  label: string;
  ms: number;
}) {
  const pct = (value / maxVal) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
        {label}
      </span>
      <div className="relative h-6 flex-1 rounded bg-muted/50">
        <div
          className="h-full rounded transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(pct, 1)}%`,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
        <span className="absolute top-1/2 right-2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground tabular-nums">
          {ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`}
        </span>
      </div>
    </div>
  );
}

export function TimingWaterfall() {
  const [view, setView] = useState<"before" | "after">("after");

  return (
    <figure className="my-10">
      <div className="rounded-lg border border-border bg-muted/30 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1 rounded-md border border-border bg-background p-0.5">
            <button
              className={`rounded px-3 py-1 font-mono text-[11px] transition-colors duration-150 ${
                view === "before"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setView("before")}
              type="button"
            >
              Before
            </button>
            <button
              className={`rounded px-3 py-1 font-mono text-[11px] transition-colors duration-150 ${
                view === "after"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setView("after")}
              type="button"
            >
              After
            </button>
          </div>
          <span className="font-mono text-muted-foreground text-xs tabular-nums">
            p50 total:{" "}
            <span className="text-foreground">
              {view === "before"
                ? `${(BEFORE_TOTAL / 1000).toFixed(1)}s`
                : `${(AFTER_TOTAL / 1000).toFixed(1)}s`}
            </span>
            {view === "after" && (
              <span className="ml-2 text-chart-2">
                {((1 - AFTER_TOTAL / BEFORE_TOTAL) * 100).toFixed(0)}% faster
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {DATA.map((d) => (
            <Bar
              color={d.color}
              key={d.label}
              label={d.label}
              maxVal={MAX_VAL}
              ms={view === "before" ? d.before : d.after}
              value={view === "before" ? d.before : d.after}
            />
          ))}
        </div>

        {view === "after" && (
          <div className="mt-4 border-border/40 border-t pt-3">
            <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              Key optimizations: UNION ALL (4 queries → 1), reduced candidate
              pool (50 → 25), dedup moved from Cypher to JS, dropped text
              payload from index results.
            </p>
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
        Median per-search timing breakdown. Toggle to compare before/after
        optimization.
      </figcaption>
    </figure>
  );
}
