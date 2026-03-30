"use client"

import { Slider } from "@workspace/ui/components/slider"
import Link from "next/link"
import * as React from "react"
import {
  VERT,
  FRAG,
  compileShader,
  linkProgram,
  getDitherUniforms,
  type DitherUniforms,
} from "@/lib/dither-webgl"

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])

const DEFAULTS = {
  pxSize: 2.5,
  scale: 0.35,
  rotationDeg: 0,
  offsetX: 0,
  offsetY: 0,
  anim: 1,
  shape: 0,
  dither: 3,
} as const

function parseCssRgb(s: string): [number, number, number] | null {
  const m = s.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/,
  )
  if (!m?.[1] || !m[2] || !m[3]) return null
  return [
    Number.parseFloat(m[1]) / 255,
    Number.parseFloat(m[2]) / 255,
    Number.parseFloat(m[3]) / 255,
  ]
}

function parseCssHex(s: string): [number, number, number] | null {
  let h = s.replace("#", "").trim()
  if (h.length === 3) h = [...h].map((c) => c + c).join("")
  if (h.length !== 6) return null
  const n = Number.parseInt(h, 16)
  if (Number.isNaN(n)) return null
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Canvas normalizes oklch/lab/etc. to rgb on assignment in modern browsers. */
function resolveCssColorRgb(css: string): [number, number, number] | null {
  const t = css.trim()
  if (!t) return null
  const fromRgb = parseCssRgb(t)
  if (fromRgb) return fromRgb
  const fromHex = parseCssHex(t)
  if (fromHex) return fromHex
  const probe = document.createElement("canvas").getContext("2d")
  if (!probe) return null
  try {
    probe.fillStyle = "#000000"
    probe.fillStyle = t
    const normalized = probe.fillStyle
    if (typeof normalized !== "string") return null
    return parseCssRgb(normalized) ?? parseCssHex(normalized)
  } catch {
    return null
  }
}

function themeColorsForDither(
  colorCss: string,
  bgCss: string,
): { fg: [number, number, number]; bg: [number, number, number] } {
  let fg = resolveCssColorRgb(colorCss)
  let bg = resolveCssColorRgb(bgCss)
  if (!fg) fg = [0.09, 0.09, 0.09]
  if (!bg) bg = [0.97, 0.97, 0.97]
  const dist = Math.hypot(fg[0] - bg[0], fg[1] - bg[1], fg[2] - bg[2])
  if (dist < 0.12) {
    const lum = (fg[0] * 0.2126 + fg[1] * 0.7152 + fg[2] * 0.0722)
    if (lum > 0.5) {
      fg = [0.06, 0.06, 0.06]
      bg = [0.93, 0.93, 0.93]
    } else {
      fg = [0.93, 0.93, 0.93]
      bg = [0.08, 0.08, 0.08]
    }
  }
  return { fg, bg }
}

export function DitherPlayground() {
  const canvasWrapRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const glRef = React.useRef<WebGL2RenderingContext | null>(null)
  const programRef = React.useRef<WebGLProgram | null>(null)
  const uniformsRef = React.useRef<DitherUniforms | null>(null)
  const bufferRef = React.useRef<WebGLBuffer | null>(null)
  const rafRef = React.useRef<number>(0)
  const startRef = React.useRef<number>(0)
  const [webglError, setWebglError] = React.useState<string | null>(null)

  const [pxSize, setPxSize] = React.useState<number>(DEFAULTS.pxSize)
  const [scale, setScale] = React.useState<number>(DEFAULTS.scale)
  const [rotationDeg, setRotationDeg] = React.useState<number>(
    DEFAULTS.rotationDeg,
  )
  const [offsetX, setOffsetX] = React.useState<number>(DEFAULTS.offsetX)
  const [offsetY, setOffsetY] = React.useState<number>(DEFAULTS.offsetY)
  const [anim, setAnim] = React.useState<number>(DEFAULTS.anim)
  const [shape, setShape] = React.useState<number>(DEFAULTS.shape)
  const [dither, setDither] = React.useState<number>(DEFAULTS.dither)

  const paramsRef = React.useRef({
    pxSize,
    scale,
    rotationDeg,
    offsetX,
    offsetY,
    anim,
    shape,
    dither,
  })
  paramsRef.current = {
    pxSize,
    scale,
    rotationDeg,
    offsetX,
    offsetY,
    anim,
    shape,
    dither,
  }

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
    })
    if (!gl) {
      setWebglError("WebGL2 is not available in this browser.")
      return
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) {
      setWebglError("Shader compile failed (see console).")
      return
    }
    const program = linkProgram(gl, vs, fs)
    if (!program) {
      setWebglError("Program link failed (see console).")
      return
    }

    gl.useProgram(program)
    const buf = gl.createBuffer()
    if (!buf) return
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    glRef.current = gl
    programRef.current = program
    uniformsRef.current = getDitherUniforms(gl, program)
    bufferRef.current = buf

    const syncCanvasSize = () => {
      const wrap = canvasWrapRef.current
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = wrap?.clientWidth ?? canvas.clientWidth
      const ch = wrap?.clientHeight ?? canvas.clientHeight
      const w = Math.max(1, Math.floor(cw * dpr))
      const h = Math.max(1, Math.floor(ch * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }
    const ro = new ResizeObserver(syncCanvasSize)
    ro.observe(canvasWrapRef.current ?? canvas)
    syncCanvasSize()

    startRef.current = performance.now()
    const frame = (now: number) => {
      const glc = glRef.current
      const prog = programRef.current
      const u = uniformsRef.current
      if (!glc || !prog || !u) return

      const t = (now - startRef.current) / 1000
      const prm = paramsRef.current
      const w = canvas.width
      const h = canvas.height
      const dpr = w / Math.max(1, canvas.clientWidth)

      glc.viewport(0, 0, w, h)
      glc.useProgram(prog)

      const wrap = canvasWrapRef.current
      const cs = wrap ? getComputedStyle(wrap) : null
      const { fg, bg } = themeColorsForDither(
        cs?.color ?? "",
        cs?.backgroundColor ?? "",
      )

      if (u.time) glc.uniform1f(u.time, t)
      if (u.resolution) glc.uniform2f(u.resolution, w, h)
      if (u.pixelRatio) glc.uniform1f(u.pixelRatio, dpr)
      if (u.pxSize) glc.uniform1f(u.pxSize, prm.pxSize)
      if (u.scale) glc.uniform1f(u.scale, prm.scale)
      if (u.rotation)
        glc.uniform1f(u.rotation, (prm.rotationDeg * Math.PI) / 180)
      if (u.offset) glc.uniform2f(u.offset, prm.offsetX, prm.offsetY)
      if (u.anim) glc.uniform1f(u.anim, prm.anim)
      if (u.shape) glc.uniform1i(u.shape, prm.shape)
      if (u.dither) glc.uniform1i(u.dither, prm.dither)
      if (u.fg) glc.uniform3fv(u.fg, fg)
      if (u.bg) glc.uniform3fv(u.bg, bg)

      glc.drawArrays(glc.TRIANGLES, 0, 6)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      gl.deleteProgram(program)
      gl.deleteBuffer(buf)
      glRef.current = null
      programRef.current = null
      uniformsRef.current = null
      bufferRef.current = null
    }
  }, [])

  const reset = () => {
    setPxSize(DEFAULTS.pxSize)
    setScale(DEFAULTS.scale)
    setRotationDeg(DEFAULTS.rotationDeg)
    setOffsetX(DEFAULTS.offsetX)
    setOffsetY(DEFAULTS.offsetY)
    setAnim(DEFAULTS.anim)
    setShape(DEFAULTS.shape)
    setDither(DEFAULTS.dither)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 pt-12 pb-6 sm:pt-16">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-opacity duration-150 hover:opacity-60"
        >
          ← Home
        </Link>
        <h1 className="font-heading text-lg font-light tracking-tight sm:text-xl">
          Dither
        </h1>
        <span className="w-12 sm:w-20" aria-hidden />
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 pb-24">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Ordered dithering on a WebGL fullscreen quad. Adjust pixel block size,
          pattern, and Bayer matrix size.
        </p>

        {webglError ? (
          <p className="mt-6 text-sm text-destructive">{webglError}</p>
        ) : (
          <>
            <div
              ref={canvasWrapRef}
              className="mt-6 overflow-hidden rounded-xl border border-border shadow-sm"
              style={{
                color: "var(--foreground)",
                backgroundColor: "var(--background)",
              }}
            >
              <canvas
                ref={canvasRef}
                className="aspect-4/5 w-full max-h-[min(70vh,560px)] min-h-[280px]"
              />
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Field label="Shape">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  value={shape}
                  onChange={(e) => setShape(Number(e.target.value))}
                >
                  <option value={0}>Warp</option>
                  <option value={1}>Rings</option>
                  <option value={2}>Diagonal</option>
                  <option value={3}>Flow</option>
                </select>
              </Field>
              <Field label="Dither">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  value={dither}
                  onChange={(e) => setDither(Number(e.target.value))}
                >
                  <option value={0}>Noise</option>
                  <option value={1}>2×2 Bayer</option>
                  <option value={2}>4×4 Bayer</option>
                  <option value={3}>8×8 Bayer</option>
                </select>
              </Field>
              <SliderField
                label="Pixel size"
                suffix="px"
                min={0.5}
                max={10}
                step={0.1}
                value={pxSize}
                onChange={setPxSize}
              />
              <SliderField
                label="Zoom"
                suffix="×"
                min={0.1}
                max={2}
                step={0.05}
                value={scale}
                onChange={setScale}
              />
              <SliderField
                label="Animation"
                suffix="×"
                min={0}
                max={2}
                step={0.05}
                value={anim}
                onChange={setAnim}
              />
              <SliderField
                label="Rotation"
                suffix="°"
                min={0}
                max={360}
                step={5}
                value={rotationDeg}
                onChange={setRotationDeg}
              />
              <SliderField
                label="Offset X"
                min={-1}
                max={1}
                step={0.05}
                value={offsetX}
                onChange={setOffsetX}
              />
              <SliderField
                label="Offset Y"
                min={-1}
                max={1}
                step={0.05}
                value={offsetY}
                onChange={setOffsetY}
              />
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-8 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function SliderField({
  label,
  suffix = "",
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  suffix?: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-xs tabular-nums text-foreground">
          {suffix === "°"
            ? `${Math.round(value)}`
            : value.toFixed(suffix === "×" ? 2 : 2)}
          {suffix}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) =>
          onChange(Array.isArray(v) ? (v[0] ?? min) : v)
        }
      />
    </div>
  )
}
