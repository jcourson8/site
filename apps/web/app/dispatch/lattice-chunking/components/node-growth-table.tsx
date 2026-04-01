"use client";

import { useState } from "react";

export function NodeGrowthTable() {
  const [n, setN] = useState(31_102);
  const [h, setH] = useState(4);

  const heights = Array.from({ length: h }, (_, i) => i + 1);
  const chunks = heights.map((height) => Math.max(0, n - height));
  const total = chunks.reduce((s, c) => s + c, 0);
  const ratio = (total / n).toFixed(2);

  return (
    <figure className="my-10">
      <div className="rounded-lg border border-border bg-muted/30 p-5">
        <div className="mb-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            n (leaves)
            <input
              className="w-20 rounded border border-border bg-background px-2 py-1 font-mono text-foreground text-xs"
              max={100_000}
              min={10}
              onChange={(e) => setN(Number(e.target.value))}
              type="number"
              value={n}
            />
          </label>
          <label className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            H (max height)
            <input
              className="h-1.5 w-20 cursor-pointer accent-foreground"
              max={8}
              min={1}
              onChange={(e) => setH(Number(e.target.value))}
              type="range"
              value={h}
            />
            <span className="w-4 text-foreground">{h}</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-[12px]">
            <thead>
              <tr className="border-border/40 border-b text-muted-foreground">
                <th className="py-1.5 pr-4 text-left font-normal">Height</th>
                <th className="py-1.5 pr-4 text-left font-normal">
                  Window size
                </th>
                <th className="py-1.5 text-right font-normal">Chunks</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-muted-foreground">
                <td className="py-1 pr-4">0 (leaves)</td>
                <td className="py-1 pr-4">1</td>
                <td className="py-1 text-right text-foreground tabular-nums">
                  {n.toLocaleString()}
                </td>
              </tr>
              {heights.map((height, i) => (
                <tr className="text-muted-foreground" key={height}>
                  <td className="py-1 pr-4">{height}</td>
                  <td className="py-1 pr-4">{height + 1}</td>
                  <td className="py-1 text-right text-foreground tabular-nums">
                    {(chunks[i] ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="border-border/40 border-t font-medium text-foreground">
                <td className="py-1.5 pr-4" colSpan={2}>
                  Total chunks (excl. leaves)
                </td>
                <td className="py-1.5 text-right tabular-nums">
                  {total.toLocaleString()}
                </td>
              </tr>
              <tr className="text-muted-foreground">
                <td className="py-1 pr-4" colSpan={2}>
                  Ratio to base
                </td>
                <td className="py-1 text-right text-foreground tabular-nums">
                  {ratio}×
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <figcaption className="mt-2 text-balance text-center font-mono text-[11px] text-muted-foreground">
        Node growth calculator. Adjust n and H to see scaling behavior.
      </figcaption>
    </figure>
  );
}
