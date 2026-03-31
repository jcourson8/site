"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";
import {
  bindActiveProgram,
  compileShader,
  type DitherUniforms,
  FRAG,
  getDitherUniforms,
  linkProgram,
  VERT,
} from "@/lib/dither-webgl";
import { createQuadBuffer, createWebGL2 } from "@/lib/webgl/core";
import { resolveProceduralColors } from "@/lib/webgl/theme-colors";

// ── Defaults ────────────────────────────────────────────────────────────

export const DITHER_DEFAULTS = {
  shape: 0,
  dither: 3,
  pixelSize: 2.5,
  scale: 0.35,
  animationSpeed: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
} as const;

// ── Types ───────────────────────────────────────────────────────────────

export type DitherProps = React.ComponentProps<"div"> & {
  /** Shape field index (0 = warp, 1 = rings, 2 = diagonal, 3 = flow) */
  shape?: number;
  /** Dither pattern (0 = noise, 1 = 2×2, 2 = 4×4, 3 = 8×8 bayer) */
  dither?: number;
  /** Pixel block size in CSS pixels @default 2.5 */
  pixelSize?: number;
  /** Zoom level @default 0.35 */
  scale?: number;
  /** Animation speed multiplier — 0 pauses @default 1 */
  animationSpeed?: number;
  /** Pattern rotation in degrees @default 0 */
  rotation?: number;
  /** Horizontal pattern offset, −1 to 1 @default 0 */
  offsetX?: number;
  /** Vertical pattern offset, −1 to 1 @default 0 */
  offsetY?: number;
};

// ── Component ───────────────────────────────────────────────────────────

export function Dither({
  shape = DITHER_DEFAULTS.shape,
  dither = DITHER_DEFAULTS.dither,
  pixelSize = DITHER_DEFAULTS.pixelSize,
  scale = DITHER_DEFAULTS.scale,
  animationSpeed = DITHER_DEFAULTS.animationSpeed,
  rotation = DITHER_DEFAULTS.rotation,
  offsetX = DITHER_DEFAULTS.offsetX,
  offsetY = DITHER_DEFAULTS.offsetY,
  className,
  style,
  children,
  ...props
}: DitherProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const glRef = React.useRef<WebGL2RenderingContext | null>(null);
  const programRef = React.useRef<WebGLProgram | null>(null);
  const uniformsRef = React.useRef<DitherUniforms | null>(null);
  const rafRef = React.useRef(0);
  const timeRef = React.useRef(0);
  const prevRef = React.useRef(0);

  const paramsRef = React.useRef({
    shape,
    dither,
    pixelSize,
    scale,
    animationSpeed,
    rotation,
    offsetX,
    offsetY,
  });
  paramsRef.current = {
    shape,
    dither,
    pixelSize,
    scale,
    animationSpeed,
    rotation,
    offsetX,
    offsetY,
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!(canvas && wrap)) {
      return;
    }

    let gl: WebGL2RenderingContext;
    let program: WebGLProgram;
    let buf: WebGLBuffer;

    try {
      gl = createWebGL2(canvas);
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
      program = linkProgram(gl, vs, fs);
      bindActiveProgram(gl, program);
      buf = createQuadBuffer(gl);
    } catch {
      return;
    }

    glRef.current = gl;
    programRef.current = program;
    uniformsRef.current = getDitherUniforms(gl, program);

    const syncSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(wrap.clientWidth * dpr));
      const h = Math.max(1, Math.floor(wrap.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(wrap);
    syncSize();

    prevRef.current = performance.now();
    timeRef.current = 0;

    const frame = (now: number) => {
      const g = glRef.current;
      const prog = programRef.current;
      const u = uniformsRef.current;
      if (!(g && prog && u)) {
        return;
      }

      const dt = (now - prevRef.current) / 1000;
      prevRef.current = now;
      const p = paramsRef.current;
      timeRef.current += dt * p.animationSpeed;

      const w = canvas.width;
      const h = canvas.height;
      const dpr = w / Math.max(1, canvas.clientWidth);

      g.viewport(0, 0, w, h);
      bindActiveProgram(g, prog);

      const { fg, bg } = resolveProceduralColors(wrap);

      if (u.time) {
        g.uniform1f(u.time, timeRef.current);
      }
      if (u.resolution) {
        g.uniform2f(u.resolution, w, h);
      }
      if (u.pixelRatio) {
        g.uniform1f(u.pixelRatio, dpr);
      }
      if (u.pxSize) {
        g.uniform1f(u.pxSize, p.pixelSize);
      }
      if (u.scale) {
        g.uniform1f(u.scale, p.scale);
      }
      if (u.rotation) {
        g.uniform1f(u.rotation, (p.rotation * Math.PI) / 180);
      }
      if (u.offset) {
        g.uniform2f(u.offset, p.offsetX, p.offsetY);
      }
      if (u.anim) {
        g.uniform1f(u.anim, 1);
      }
      if (u.shape) {
        g.uniform1i(u.shape, p.shape);
      }
      if (u.dither) {
        g.uniform1i(u.dither, p.dither);
      }
      if (u.fg) {
        g.uniform3fv(u.fg, fg);
      }
      if (u.bg) {
        g.uniform3fv(u.bg, bg);
      }

      g.drawArrays(g.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
      glRef.current = null;
      programRef.current = null;
      uniformsRef.current = null;
    };
  }, []);

  return (
    <div
      data-slot="dither"
      {...props}
      className={cn("relative overflow-hidden", className)}
      ref={wrapRef}
      style={{
        color: "var(--foreground)",
        backgroundColor: "var(--background)",
        ...style,
      }}
    >
      <canvas className="block h-full w-full" ref={canvasRef} />
      {children}
    </div>
  );
}
