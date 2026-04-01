"use client";

import { useMemo, useState } from "react";

interface Node {
  end: number;
  height: number;
  id: string;
  label: string;
  start: number;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

function subscript(n: number): string {
  const subs = "₀₁₂₃₄₅₆₇₈₉";
  return String(n)
    .split("")
    .map((d) => subs[Number(d)] ?? d)
    .join("");
}

const LEAF_COUNT = 8;
const COL = 52;
const ROW = 48;
const NODE_R = 8;

function buildGraph(
  leafCount: number,
  maxH: number
): { edges: Edge[]; nodes: Node[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, Node>();

  for (let i = 0; i < leafCount; i++) {
    const node: Node = {
      id: `${i}`,
      label: `S${subscript(i + 1)}`,
      x: i * COL,
      y: 0,
      height: 0,
      start: i,
      end: i,
    };
    nodes.push(node);
    nodeMap.set(node.id, node);
  }

  for (let h = 1; h <= maxH; h++) {
    const ws = h + 1;
    for (let i = 0; i <= leafCount - ws; i++) {
      const id = `h${h}-${i}`;
      const first = i + 1;
      const last = i + ws;

      const pL = h === 1 ? `${i}` : `h${h - 1}-${i}`;
      const pR = h === 1 ? `${i + 1}` : `h${h - 1}-${i + 1}`;

      const left = nodeMap.get(pL);
      const right = nodeMap.get(pR);
      if (!(left && right)) {
        continue;
      }

      const node: Node = {
        id,
        label:
          ws === 2
            ? `S${subscript(first)}${subscript(last)}`
            : `S${subscript(first)}₋${subscript(last)}`,
        x: (left.x + right.x) / 2,
        y: h * ROW,
        height: h,
        start: i,
        end: i + ws - 1,
      };
      nodes.push(node);
      nodeMap.set(id, node);
      edges.push({ from: pL, to: id });
      edges.push({ from: pR, to: id });
    }
  }

  return { nodes, edges };
}

export function LatticeVisualizer() {
  const [maxHeight, setMaxHeight] = useState(4);

  const fullGraph = useMemo(() => buildGraph(LEAF_COUNT, LEAF_COUNT - 1), []);
  const activeGraph = useMemo(
    () => buildGraph(LEAF_COUNT, maxHeight),
    [maxHeight]
  );

  const activeIds = new Set(activeGraph.nodes.map((n) => n.id));
  const activeEdgeSet = new Set(
    activeGraph.edges.map((e) => `${e.from}->${e.to}`)
  );

  const padX = 16;
  const padY = 16;
  const svgW = (LEAF_COUNT - 1) * COL + padX * 2;
  const svgH = (LEAF_COUNT - 1) * ROW + padY * 2;

  const activeCount = activeGraph.nodes.length;
  const fullCount = fullGraph.nodes.length;
  const ratio = (activeCount / LEAF_COUNT).toFixed(1);

  return (
    <figure className="my-10">
      <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label
              className="font-mono text-[11px] text-muted-foreground"
              htmlFor="max-height-slider"
            >
              H
            </label>
            <input
              className="h-1.5 w-24 cursor-pointer accent-foreground"
              id="max-height-slider"
              max={LEAF_COUNT - 1}
              min={1}
              onChange={(e) => setMaxHeight(Number(e.target.value))}
              type="range"
              value={maxHeight}
            />
            <span className="font-mono text-[11px] text-foreground tabular-nums">
              {maxHeight}
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            <span className="text-foreground">{activeCount}</span>
            <span className="opacity-40">/{fullCount}</span> nodes · {ratio}×
          </span>
        </div>

        <svg
          aria-label="Binomial lattice graph"
          className="mx-auto block w-full"
          role="img"
          style={{ maxWidth: svgW }}
          viewBox={`0 0 ${svgW} ${svgH}`}
        >
          <title>Binomial lattice graph with height limit</title>

          {fullGraph.edges.map((edge) => {
            const from = fullGraph.nodes.find((n) => n.id === edge.from);
            const to = fullGraph.nodes.find((n) => n.id === edge.to);
            if (!(from && to)) {
              return null;
            }
            const isActive = activeEdgeSet.has(`${edge.from}->${edge.to}`);

            return (
              <line
                key={`${edge.from}->${edge.to}`}
                opacity={isActive ? 0.25 : 0.06}
                stroke="var(--foreground)"
                strokeWidth={1}
                style={{ transition: "opacity 150ms ease" }}
                x1={from.x + padX}
                x2={to.x + padX}
                y1={svgH - padY - from.y}
                y2={svgH - padY - to.y}
              />
            );
          })}

          {fullGraph.nodes.map((node) => {
            const cx = node.x + padX;
            const cy = svgH - padY - node.y;
            const isActive = activeIds.has(node.id);

            return (
              <g key={node.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  fill={
                    isActive ? "var(--foreground)" : "var(--muted-foreground)"
                  }
                  opacity={isActive ? 1 : 0.12}
                  r={NODE_R}
                  style={{ transition: "opacity 150ms ease" }}
                />
                <text
                  dominantBaseline="central"
                  fill={
                    isActive ? "var(--background)" : "var(--muted-foreground)"
                  }
                  fontFamily="var(--font-mono)"
                  fontSize={node.height === 0 ? 7 : 6}
                  opacity={isActive ? 1 : 0.15}
                  style={{ transition: "opacity 150ms ease" }}
                  textAnchor="middle"
                  x={cx}
                  y={cy}
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          <line
            opacity={0.2}
            stroke="var(--foreground)"
            strokeDasharray="4 3"
            strokeWidth={1}
            x1={padX - 10}
            x2={svgW - padX + 10}
            y1={svgH - padY - maxHeight * ROW - ROW / 2}
            y2={svgH - padY - maxHeight * ROW - ROW / 2}
          />
        </svg>

        <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
          8 sentences, height capped at {maxHeight}. Greyed nodes are pruned.
        </p>
      </div>
    </figure>
  );
}
