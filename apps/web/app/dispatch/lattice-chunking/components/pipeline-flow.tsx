"use client";

import { useState } from "react";

interface Stage {
  active?: boolean;
  detail: string;
  id: string;
  label: string;
  timing: string;
}

const STAGES: Stage[] = [
  {
    id: "embed",
    label: "Embed",
    detail: "Query → 3072-dim vector via Gemini Embedding 2",
    timing: "~500ms",
  },
  {
    id: "index",
    label: "4-Index UNION ALL",
    detail:
      "Single Bolt round-trip: verseEmbedding + chunkEmbedding + verseText + chunkText",
    timing: "~480ms",
  },
  {
    id: "rrf",
    label: "RRF Fusion",
    detail: "Reciprocal Rank Fusion (k=60) merges vector + text ranked lists",
    timing: "<1ms",
  },
  {
    id: "merge",
    label: "Overlap Merge",
    detail:
      "Sort by position → cluster overlapping spans → fetch authoritative verse text",
    timing: "~230ms",
  },
  {
    id: "result",
    label: "Top K Results",
    detail: "Each result: reference, text, score, height, positions",
    timing: "—",
  },
];

const INDEX_ARMS = [
  { label: "verseEmbedding", type: "vector", desc: "HNSW, top 25" },
  { label: "chunkEmbedding", type: "vector", desc: "HNSW, top 25" },
  { label: "verseText", type: "text", desc: "BM25, top 25" },
  { label: "chunkText", type: "text", desc: "BM25, top 25" },
];

export function PipelineFlow() {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  return (
    <figure className="my-10">
      <div className="rounded-lg border border-border bg-muted/30 p-5">
        <div className="flex flex-col gap-2">
          {STAGES.map((stage, i) => {
            const isActive = activeStage === stage.id;
            const isIndexStage = stage.id === "index";

            return (
              <div key={stage.id}>
                <button
                  className="group flex w-full items-start gap-3 rounded-md p-3 text-left transition-colors duration-150 hover:bg-muted"
                  onClick={() => setActiveStage(isActive ? null : stage.id)}
                  type="button"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-[11px] text-muted-foreground">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-foreground text-sm">
                        {stage.label}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {stage.timing}
                      </span>
                    </div>
                    <p
                      className="overflow-hidden text-[13px] text-muted-foreground leading-relaxed transition-all duration-200 ease-out"
                      style={{
                        maxHeight: isActive ? 200 : 0,
                        opacity: isActive ? 1 : 0,
                        marginTop: isActive ? 4 : 0,
                      }}
                    >
                      {stage.detail}
                    </p>
                  </div>
                </button>

                {isIndexStage && isActive && (
                  <div className="mb-1 ml-9 grid grid-cols-2 gap-2 px-3">
                    {INDEX_ARMS.map((arm) => (
                      <div
                        className="rounded border border-border/60 bg-background px-3 py-2"
                        key={arm.label}
                      >
                        <div className="font-mono text-[11px] text-foreground">
                          {arm.label}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {arm.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {i < STAGES.length - 1 && (
                  <div className="ml-[23px] h-4 border-border/40 border-l" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <figcaption className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
        Search pipeline stages. Click to expand details.
      </figcaption>
    </figure>
  );
}
