"use client";

import { useEffect, useMemo, useState } from "react";

interface NodeMeta {
  e: number;
  h: number;
  i: number;
  preview: string;
  s: number;
}

interface HeatmapData {
  examples: { query: string; scores: number[] }[];
  meta: {
    leafCount: number;
    maxHeight: number;
    nodeCount: number;
  };
  nodes: NodeMeta[];
}

const QUERY_ORDER = [1, 2, 3, 4, 5];
const CELL = 5;
const GAP = 1;
const STEP = CELL + GAP;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function scoreToColor(t: number): string {
  const h = lerp(220, 10, t);
  const s = lerp(15, 90, t);
  const l = lerp(15, 55, t);
  return `hsl(${h} ${s}% ${l}%)`;
}

function safeScore(scores: number[], i: number): number {
  return scores[i] ?? 0;
}

export function LatticeHeatmap() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [activeQuery, setActiveQuery] = useState(0);

  useEffect(() => {
    fetch("/data/beemovie-lattice-heatmap.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const grid = useMemo(() => {
    const empty: {
      col: number;
      idx: number;
      norm: number;
      row: number;
      xOff: number;
    }[][] = [];
    if (!data) {
      return empty;
    }
    const dataIdx = QUERY_ORDER[activeQuery] ?? activeQuery;
    const example = data.examples[dataIdx];
    if (!example) {
      return empty;
    }

    const scores = example.scores;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < scores.length; i++) {
      const s = safeScore(scores, i);
      if (s < min) {
        min = s;
      }
      if (s > max) {
        max = s;
      }
    }

    const N = data.meta.leafCount;
    const gridRows: {
      col: number;
      idx: number;
      norm: number;
      row: number;
      xOff: number;
    }[][] = [];

    for (let h = 0; h <= data.meta.maxHeight; h++) {
      const nodesAtH = N - h;
      const rowOffset = ((N - nodesAtH) * STEP) / 2;
      const row: {
        col: number;
        idx: number;
        norm: number;
        row: number;
        xOff: number;
      }[] = [];
      for (const node of data.nodes) {
        if (node.h !== h) {
          continue;
        }
        const raw = safeScore(scores, node.i);
        const norm = max > min ? (raw - min) / (max - min) : 0;
        row.push({
          row: h,
          col: node.s,
          idx: node.i,
          norm,
          xOff: rowOffset,
        });
      }
      gridRows.push(row);
    }

    return gridRows;
  }, [data, activeQuery]);

  if (!data) {
    return (
      <div className="my-10 flex h-48 items-center justify-center rounded-lg border border-border bg-muted/30">
        <span className="font-mono text-[11px] text-muted-foreground">
          Loading heatmap…
        </span>
      </div>
    );
  }

  const cols = data.meta.leafCount;
  const rowCount = data.meta.maxHeight + 1;
  const svgW = cols * STEP + 1;
  const svgH = rowCount * STEP + 1;

  const queryLabels = [
    "Sequence",
    "Section",
    "Discovery",
    "Generic",
    "Consequence",
  ];

  const total = queryLabels.length;
  const prev = () => setActiveQuery(Math.max(0, activeQuery - 1));
  const next = () => setActiveQuery(Math.min(total - 1, activeQuery + 1));

  return (
    <figure className="my-10">
      <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="Previous query"
              className="cursor-pointer text-muted-foreground transition-opacity duration-150 hover:opacity-60 disabled:opacity-20"
              disabled={activeQuery === 0}
              onClick={prev}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5">
              {queryLabels.map((label, i) => (
                <button
                  aria-label={label}
                  className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ease-out ${
                    i === activeQuery
                      ? "w-6 bg-foreground"
                      : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                  key={label}
                  onClick={() => setActiveQuery(i)}
                  type="button"
                />
              ))}
            </div>

            <button
              aria-label="Next query"
              className="cursor-pointer text-muted-foreground transition-opacity duration-150 hover:opacity-60 disabled:opacity-20"
              disabled={activeQuery === total - 1}
              onClick={next}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              low
            </span>
            <div
              className="h-1.5 w-16 rounded-sm"
              style={{
                background: `linear-gradient(to right, ${scoreToColor(0)}, ${scoreToColor(0.5)}, ${scoreToColor(1)})`,
              }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">
              high
            </span>
          </div>
        </div>

        <p className="mb-3 min-h-20 font-mono text-[11px] text-muted-foreground leading-relaxed">
          &ldquo;{data.examples[QUERY_ORDER[activeQuery] ?? 0]?.query}&rdquo;
        </p>

        <svg
          aria-label="Lattice similarity heatmap"
          className="mx-auto block w-full"
          role="img"
          viewBox={`0 0 ${svgW} ${svgH}`}
        >
          <title>Lattice similarity heatmap</title>
          {grid.map((row) =>
            row.map((cell) => {
              const x = cell.xOff + cell.col * STEP;
              const y = (rowCount - 1 - cell.row) * STEP;
              return (
                <rect
                  fill={scoreToColor(cell.norm)}
                  height={CELL}
                  key={cell.idx}
                  rx={1}
                  width={CELL}
                  x={x}
                  y={y}
                />
              );
            })
          )}
        </svg>
      </div>
      <figcaption className="mt-2 text-balance text-center font-mono text-[11px] text-muted-foreground">
        Bee Movie script · {data.meta.nodeCount.toLocaleString()} lattice nodes
        · cosine similarity vs. query
      </figcaption>
    </figure>
  );
}
