"use client";

import { useState } from "react";

const SENTENCES = [
  "The city was founded in 1847 near the river.",
  "Early settlers built a mill and a general store.",
  "By 1900 the population had reached twelve thousand.",
  "The railroad arrived in 1905 and connected the town to the coast.",
  "Factories opened along the tracks.",
];

const COLORS = [
  "var(--lattice-1)",
  "var(--lattice-2)",
  "var(--lattice-3)",
  "var(--lattice-4)",
  "var(--lattice-5)",
];

interface QueryDef {
  height: number;
  id: string;
  insight: string;
  label: string;
  range: [number, number];
  score: number;
  text: string;
}

const QUERIES: QueryDef[] = [
  {
    id: "factual",
    text: "When was the city founded?",
    label: "S\u2081",
    height: 0,
    range: [0, 0],
    score: 0.91,
    insight: "The answer lives in one sentence. A leaf node is the best match.",
  },
  {
    id: "thematic",
    text: "How did the railroad change the town?",
    label: "S\u2083\u208B\u2085",
    height: 2,
    range: [2, 4],
    score: 0.87,
    insight:
      "No single sentence captures this. Concatenate all three, embed that, and now the vector represents the full cause-and-effect.",
  },
  {
    id: "broad",
    text: "Summarize the early history of the town.",
    label: "S\u2081\u208B\u2085",
    height: 4,
    range: [0, 4],
    score: 0.84,
    insight:
      "A broad question matches the broadest window \u2014 the full passage.",
  },
];

export function QueryExample() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = QUERIES.find((q) => q.id === activeId) ?? null;

  return (
    <figure className="my-10">
      <div className="rounded-lg border border-border bg-muted/30 p-5">
        <div className="space-y-0.5">
          {SENTENCES.map((sentence, i) => {
            const inRange =
              active !== null && i >= active.range[0] && i <= active.range[1];
            let op = 0.8;
            if (active) {
              op = inRange ? 1 : 0.25;
            }
            return (
              <p
                className="text-sm leading-relaxed"
                key={sentence}
                style={{
                  opacity: op,
                  transition: "opacity 250ms ease",
                }}
              >
                <span
                  className="rounded-sm px-0.5 py-px"
                  style={{
                    backgroundColor: inRange
                      ? `color-mix(in oklch, ${COLORS[i] ?? COLORS[0]}, transparent 78%)`
                      : "transparent",
                    color: inRange ? "var(--foreground)" : undefined,
                    transition: "background-color 250ms ease, color 250ms ease",
                  }}
                >
                  {sentence}
                </span>
              </p>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {QUERIES.map((q) => (
            <button
              className={`rounded-md border p-3 text-left transition-colors duration-150 ${
                activeId === q.id
                  ? "border-foreground/20 bg-muted"
                  : "border-border hover:border-foreground/10 hover:bg-muted/50"
              }`}
              key={q.id}
              onClick={() => setActiveId(activeId === q.id ? null : q.id)}
              type="button"
            >
              <p className="font-mono text-foreground text-xs">
                &ldquo;{q.text}&rdquo;
              </p>
            </button>
          ))}
        </div>

        <div className="mt-3 min-h-[2.5rem]">
          <p
            className="text-[13px] text-muted-foreground leading-relaxed"
            style={{
              opacity: active ? 1 : 0,
              transition: "opacity 200ms ease",
            }}
          >
            {active?.insight}
          </p>
        </div>
      </div>
    </figure>
  );
}
