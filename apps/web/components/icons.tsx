/**
 * Project icons — single-source SVG components.
 *
 * Each icon renders at 24x24 by default, uses currentColor for strokes,
 * and forwards all standard SVG props for sizing overrides.
 *
 * Usage:
 *   import { ArrowRight } from "@/components/icons"
 *   <ArrowRight className="size-3.5" />
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const defaults: IconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
};

// ── Arrows ────────────────────────────────────────────────────────────

export function ArrowRight(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <title>Arrow right</title>
      <path
        d="M3 12H21M21 12L14 5M21 12L14 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <title>Arrow left</title>
      <path
        d="M21 12H3M3 12L10 5M3 12L10 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <title>Arrow up right</title>
      <path
        d="M7 17L17 7M17 7H8M17 7V16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
