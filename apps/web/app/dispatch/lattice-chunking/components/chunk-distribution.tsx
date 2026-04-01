"use client";

import { useState } from "react";

type Method = "fixed" | "semantic" | "lattice";

interface BinData {
  label: string;
  value: number;
}

const DISTRIBUTIONS: Record<Method, { bins: BinData[]; note: string }> = {
  fixed: {
    bins: [
      { label: "1v", value: 0 },
      { label: "2v", value: 0 },
      { label: "3v", value: 0 },
      { label: "4v", value: 12 },
      { label: "5v", value: 0 },
      { label: "6v", value: 0 },
      { label: "7+", value: 0 },
    ],
    note: "All chunks identical size. No granularity adaptation.",
  },
  semantic: {
    bins: [
      { label: "1v", value: 2 },
      { label: "2v", value: 1 },
      { label: "3v", value: 3 },
      { label: "4v", value: 2 },
      { label: "5v", value: 1 },
      { label: "6v", value: 0 },
      { label: "7+", value: 3 },
    ],
    note: "Unpredictable sizes. Chunk boundaries are model-dependent.",
  },
  lattice: {
    bins: [
      { label: "1v", value: 4 },
      { label: "2v", value: 3 },
      { label: "3v", value: 2 },
      { label: "4v", value: 2 },
      { label: "5v", value: 1 },
      { label: "6v", value: 0 },
      { label: "7+", value: 0 },
    ],
    note: "Adapts per query. Verse lookups pull height-0; thematic queries pull higher.",
  },
};

const METHOD_LABELS: Record<Method, string> = {
  fixed: "Fixed-size",
  semantic: "Semantic",
  lattice: "Lattice",
};

function Histogram({ bins, max }: { bins: BinData[]; max: number }) {
  return (
    <div className="flex items-end gap-1" style={{ height: 80 }}>
      {bins.map((bin) => {
        const h = max > 0 ? (bin.value / max) * 100 : 0;
        return (
          <div
            className="flex flex-1 flex-col items-center gap-1"
            key={bin.label}
          >
            <span className="font-mono text-[9px] text-muted-foreground tabular-nums">
              {bin.value || ""}
            </span>
            <div
              className="w-full rounded-t bg-foreground/60 transition-all duration-300 ease-out"
              style={{ height: `${Math.max(h, 2)}%` }}
            />
            <span className="font-mono text-[9px] text-muted-foreground">
              {bin.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ChunkDistribution() {
  const [active, setActive] = useState<Method>("lattice");

  const allMax = Math.max(
    ...Object.values(DISTRIBUTIONS).flatMap((d) => d.bins.map((b) => b.value))
  );

  return (
    <figure className="my-10">
      <div className="rounded-lg border border-border bg-muted/30 p-5">
        <div className="mb-4 flex justify-center gap-1 rounded-md border border-border bg-background p-0.5">
          {(Object.keys(DISTRIBUTIONS) as Method[]).map((m) => (
            <button
              className={`rounded px-3 py-1 font-mono text-[11px] transition-colors duration-150 ${
                active === m
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              key={m}
              onClick={() => setActive(m)}
              type="button"
            >
              {METHOD_LABELS[m]}
            </button>
          ))}
        </div>

        <Histogram bins={DISTRIBUTIONS[active].bins} max={allMax} />

        <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
          {DISTRIBUTIONS[active].note}
        </p>
      </div>
      <figcaption className="mt-2 text-balance text-center font-mono text-[11px] text-muted-foreground">
        Retrieved chunk size distribution for the same query set across chunking
        methods.
      </figcaption>
    </figure>
  );
}
