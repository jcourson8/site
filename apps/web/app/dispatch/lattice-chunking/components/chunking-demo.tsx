"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SENTENCES = [
  "The morning was cold.",
  "Frost covered the windows.",
  "The kettle began to whistle.",
  "Steam rose from the cup.",
  "The day had started.",
];

const N = SENTENCES.length;
const MAX_H = N - 1;

const COLORS = [
  "var(--lattice-1)",
  "var(--lattice-2)",
  "var(--lattice-3)",
  "var(--lattice-4)",
  "var(--lattice-5)",
];

const GHOST_OP = 0.07;

const STEP_COUNT = 4;
const STEP_IDS = ["text", "split", "nodes", "lattice"] as const;
const CAPTIONS = [
  "A paragraph of text.",
  "Five sentences. Each is a semantic unit.",
  "Each sentence becomes a node.",
  "Overlapping windows build up. Hover any node.",
];

/*
  Build narration (step 4):
  0: ghost lattice only, leaves colored
  1: S₁ + S₂ brighten              (sentences 1,2 highlight)
  2: edges S₁→S₁₂, S₂→S₁₂ draw   (lines appear)
  3: S₁₂ lights up                 (node pops)
  4: S₂ + S₃ brighten              (sentences 2,3 highlight)
  5: edges S₂→S₂₃, S₃→S₂₃ draw
  6: S₂₃ lights up
  7: S₁₂ + S₂₃ brighten            (sentences 1,2,3 highlight)
  8: edges to S₁₂₃ draw
  9: S₁₂₃ lights up
  10: fill remaining h=1
  11: fill remaining h=2
  12: fill remaining h=3
  13: done — hover enabled
*/
const BUILD_DONE = 10;
const PHASE_DELAYS = [
  0,
  500, // 1: highlight S₁ S₂
  700, // 2: draw edges
  600, // 3: S₁₂ appears
  800, // 4: highlight S₂ S₃
  700, // 5: draw edges
  600, // 6: S₂₃ appears
  800, // 7: highlight S₁₂ S₂₃
  700, // 8: draw edges
  600, // 9: S₁₂₃ appears
  500, // 10: fill all remaining at once
];

function sub(n: number): string {
  return String(n)
    .split("")
    .map((d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)] ?? d)
    .join("");
}

interface GNode {
  end: number;
  height: number;
  id: string;
  label: string;
  start: number;
  x: number;
  y: number;
}

interface GEdge {
  from: string;
  to: string;
}

const COL = 64;
const ROW = 56;

function buildGraph(): { edges: GEdge[]; nodes: GNode[] } {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const map = new Map<string, GNode>();

  for (let i = 0; i < N; i++) {
    const node: GNode = {
      id: `${i}`,
      label: `S${sub(i + 1)}`,
      x: i * COL,
      y: 0,
      height: 0,
      start: i,
      end: i,
    };
    nodes.push(node);
    map.set(node.id, node);
  }

  for (let h = 1; h <= MAX_H; h++) {
    const ws = h + 1;
    for (let i = 0; i <= N - ws; i++) {
      const id = `h${h}-${i}`;
      const pL = h === 1 ? `${i}` : `h${h - 1}-${i}`;
      const pR = h === 1 ? `${i + 1}` : `h${h - 1}-${i + 1}`;
      const left = map.get(pL);
      const right = map.get(pR);
      if (!(left && right)) {
        continue;
      }
      const first = i + 1;
      const last = i + ws;
      const node: GNode = {
        id,
        label:
          ws === 2
            ? `S${sub(first)}${sub(last)}`
            : `S${sub(first)}₋${sub(last)}`,
        x: (left.x + right.x) / 2,
        y: h * ROW,
        height: h,
        start: i,
        end: i + ws - 1,
      };
      nodes.push(node);
      map.set(id, node);
      edges.push({ from: pL, to: id });
      edges.push({ from: pR, to: id });
    }
  }

  return { nodes, edges };
}

// When does a narrated node light up?
function nodeRevealPhase(id: string, height: number): number {
  if (height === 0) {
    return 0;
  }
  if (id === "h1-0") {
    return 3;
  }
  if (id === "h1-1") {
    return 6;
  }
  if (id === "h2-0") {
    return 9;
  }
  return 10;
}

// When do edges to a node draw?
function edgeRevealPhase(to: string): number {
  if (to === "h1-0") {
    return 2;
  }
  if (to === "h1-1") {
    return 5;
  }
  if (to === "h2-0") {
    return 8;
  }
  return 10;
}

// Which sentences to highlight during the narration
function narrateLeaves(phase: number): Set<number> | null {
  if (phase >= 1 && phase <= 3) {
    return new Set([0, 1]);
  }
  if (phase >= 4 && phase <= 6) {
    return new Set([1, 2]);
  }
  if (phase >= 7 && phase <= 9) {
    return new Set([0, 1, 2]);
  }
  return null;
}

export function ChunkingDemo() {
  const [step, setStep] = useState(0);
  const [bp, setBp] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const showColor = step >= 1;
  const showGraph = step >= 2;
  const showLattice = step >= 3;
  const done = bp >= BUILD_DONE;

  const graph = useMemo(() => buildGraph(), []);

  useEffect(() => {
    for (const t of timers.current) {
      clearTimeout(t);
    }
    timers.current = [];

    if (!showLattice) {
      setBp(0);
      return;
    }

    let cum = 0;
    for (let p = 1; p <= BUILD_DONE; p++) {
      cum += PHASE_DELAYS[p] ?? 300;
      const phase = p;
      timers.current.push(setTimeout(() => setBp(phase), cum));
    }

    return () => {
      for (const t of timers.current) {
        clearTimeout(t);
      }
    };
  }, [showLattice]);

  const featured = useMemo(() => narrateLeaves(bp), [bp]);

  const hoveredNode = useMemo(
    () => graph.nodes.find((n) => n.id === hovered) ?? null,
    [hovered, graph.nodes]
  );

  const hoveredChildren = useMemo(() => {
    if (!hoveredNode) {
      return new Set<string>();
    }
    const set = new Set<string>();
    set.add(hoveredNode.id);
    for (const n of graph.nodes) {
      if (
        n.height < hoveredNode.height &&
        n.start >= hoveredNode.start &&
        n.end <= hoveredNode.end
      ) {
        set.add(n.id);
      }
    }
    return set;
  }, [hoveredNode, graph.nodes]);

  const hoverLeaves = useMemo(() => {
    if (!hoveredNode) {
      return null;
    }
    const set = new Set<number>();
    for (let i = hoveredNode.start; i <= hoveredNode.end; i++) {
      set.add(i);
    }
    return set;
  }, [hoveredNode]);

  function skipBuild() {
    for (const t of timers.current) {
      clearTimeout(t);
    }
    timers.current = [];
    setBp(BUILD_DONE);
  }

  function goTo(target: number) {
    if (target < 0) {
      return;
    }
    if (target >= STEP_COUNT || target === step) {
      if (showLattice && !done) {
        skipBuild();
      }
      return;
    }
    setHovered(null);
    setStep(target);
  }

  function getSentenceDim(i: number): number {
    if (done && hovered) {
      return hoverLeaves?.has(i) ? 1 : 0.15;
    }
    if (showLattice && !done && featured) {
      return featured.has(i) ? 1 : 0.2;
    }
    return 1;
  }

  const padX = 20;
  const padY = 20;
  const svgW = (N - 1) * COL + padX * 2;
  const fullH = MAX_H * ROW + padY * 2;
  const nodeR = 10;
  const popR = 14;

  return (
    <figure className="my-10">
      <div className="rounded-lg border border-border bg-muted/30 p-5">
        {/* ── Nav ─────────────────── */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <button
            aria-label="Previous step"
            className="text-muted-foreground transition-opacity duration-150 hover:opacity-60 disabled:opacity-20"
            disabled={step === 0}
            onClick={() => goTo(step - 1)}
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
            {STEP_IDS.map((id, i) => (
              <button
                aria-label={`Step: ${id}`}
                className={`h-1.5 rounded-full transition-all duration-200 ease-out ${
                  i === step
                    ? "w-6 bg-foreground"
                    : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                }`}
                key={id}
                onClick={() => goTo(i)}
                type="button"
              />
            ))}
          </div>

          <button
            aria-label="Next step"
            className="text-muted-foreground transition-opacity duration-150 hover:opacity-60 disabled:opacity-20"
            disabled={step === STEP_COUNT - 1 && done}
            onClick={() => goTo(step + 1)}
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

        {/* ── Caption ─────────────── */}
        <p className="mb-4 font-mono text-[11px] text-muted-foreground">
          {CAPTIONS[step]}
        </p>

        {/* ── Sentences ──────────── */}
        <p className="text-sm leading-relaxed">
          {SENTENCES.map((sentence, i) => (
            <span
              key={sentence}
              style={{
                opacity: getSentenceDim(i),
                transition: "opacity 300ms ease",
              }}
            >
              <span
                className="rounded-sm px-0.5 py-px"
                style={{
                  color: showColor
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                  backgroundColor: showColor
                    ? `color-mix(in oklch, ${COLORS[i]}, transparent 78%)`
                    : "transparent",
                  transition: "background-color 300ms ease, color 300ms ease",
                }}
              >
                {sentence}
              </span>
              {i < N - 1 ? " " : ""}
            </span>
          ))}
        </p>

        {/* ── Graph (always full height, ghost when not active) ── */}
        <div
          style={{
            maxHeight: showGraph ? fullH + 20 : 0,
            opacity: showGraph ? 1 : 0,
            marginTop: showGraph ? 16 : 0,
            overflow: "hidden",
            transition:
              "max-height 400ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms ease-out, margin-top 300ms ease-out",
          }}
        >
          <div className="overflow-x-auto">
            <svg
              aria-label="Lattice graph"
              className="mx-auto block"
              role="img"
              style={{ width: svgW, height: fullH }}
              viewBox={`0 0 ${svgW} ${fullH}`}
            >
              <title>Lattice graph showing overlapping text windows</title>

              {/* Edges — always rendered as ghost, light up when revealed */}
              {graph.edges.map((edge) => {
                const from = graph.nodes.find((n) => n.id === edge.from);
                const to = graph.nodes.find((n) => n.id === edge.to);
                if (!(from && to)) {
                  return null;
                }
                const key = `${edge.from}->${edge.to}`;
                const ep = edgeRevealPhase(to.id);
                const lit = showLattice && bp >= ep;
                const isNarrate = ep <= 8;
                const isChild =
                  hovered !== null &&
                  hoveredChildren.has(edge.from) &&
                  hoveredChildren.has(edge.to);

                let op = GHOST_OP;
                if (lit) {
                  op = isNarrate && !done ? 0.4 : 0.2;
                  if (done && hovered) {
                    op = isChild ? 0.5 : 0.04;
                  }
                }

                return (
                  <line
                    key={key}
                    opacity={op}
                    stroke="var(--foreground)"
                    strokeWidth={1}
                    style={{
                      transition: "opacity 350ms ease",
                    }}
                    x1={from.x + padX}
                    x2={to.x + padX}
                    y1={fullH - padY - from.y}
                    y2={fullH - padY - to.y}
                  />
                );
              })}

              {/* Nodes — ghost circles always present, light up on reveal */}
              {graph.nodes.map((node) => {
                const cx = node.x + padX;
                const cy = fullH - padY - node.y;
                const isLeaf = node.height === 0;
                const np = nodeRevealPhase(node.id, node.height);
                const lit = isLeaf || (showLattice && bp >= np);

                const justPopped =
                  !done && showLattice && np === bp && np <= 9 && !isLeaf;

                const isHov = hovered === node.id;
                const isChild = hoveredChildren.has(node.id);

                // Fill opacity
                let fillOp = GHOST_OP;
                let textOp = 0;

                if (isLeaf) {
                  fillOp = 1;
                  textOp = 1;
                  if (showLattice && !done && featured) {
                    fillOp = featured.has(node.start) ? 1 : 0.2;
                    textOp = fillOp;
                  }
                  if (done && hovered) {
                    fillOp = isChild ? 1 : 0.1;
                    textOp = fillOp;
                  }
                } else if (lit) {
                  fillOp = justPopped ? 1 : 0.85;
                  textOp = 1;
                  if (done && hovered) {
                    fillOp = isChild ? 1 : 0.06;
                    textOp = isChild ? 1 : 0.06;
                  }
                }

                const color =
                  isLeaf && node.start < COLORS.length
                    ? (COLORS[node.start] ?? "var(--foreground)")
                    : "var(--foreground)";

                let r = nodeR;
                if (justPopped) {
                  r = popR;
                } else if (isHov) {
                  r = nodeR + 2;
                }

                return (
                  <g
                    key={node.id}
                    onPointerEnter={
                      lit && done ? () => setHovered(node.id) : undefined
                    }
                    onPointerLeave={
                      lit && done ? () => setHovered(null) : undefined
                    }
                    style={{
                      cursor: lit && done ? "pointer" : "default",
                    }}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      fill={lit ? color : "var(--muted-foreground)"}
                      opacity={fillOp}
                      r={r}
                      style={{
                        transition: "opacity 350ms ease, r 200ms ease-out",
                      }}
                    />
                    {/* Only show label text for lit nodes */}
                    <text
                      dominantBaseline="central"
                      fill="var(--background)"
                      fontFamily="var(--font-mono)"
                      fontSize={isLeaf ? 9 : 7}
                      opacity={textOp}
                      style={{
                        transition: "opacity 350ms ease",
                      }}
                      textAnchor="middle"
                      x={cx}
                      y={cy}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </figure>
  );
}
