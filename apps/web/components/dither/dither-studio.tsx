"use client";

import { Slider } from "@workspace/ui/components/slider";
import Link from "next/link";
import * as React from "react";
import { DITHER_DEFAULTS, Dither } from "@/components/dither/dither";
import { DitherControls } from "@/components/dither/dither-controls";
import { DitherExport } from "@/components/dither/dither-export";
import { useDitherRenderer } from "@/components/dither/use-dither-renderer";

type StudioMode = "generate" | "image";

// ── Main ────────────────────────────────────────────────────────────────

export function DitherStudio() {
  const [mode, setMode] = React.useState<StudioMode>("generate");

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-6 pt-10 pb-24 sm:pt-14">
      <Link
        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground uppercase tracking-widest transition-opacity duration-150 hover:opacity-60"
        href="/"
      >
        &larr; Home
      </Link>

      <div className="mt-10 sm:mt-14">
        <h1 className="font-heading font-light text-3xl tracking-tight sm:text-4xl">
          Dither
        </h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          Generate procedural patterns or apply dithering to your own images.
        </p>
      </div>

      <div className="mt-8 flex w-fit items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
        <ModeTab
          active={mode === "generate"}
          onClick={() => setMode("generate")}
        >
          Generate
        </ModeTab>
        <ModeTab active={mode === "image"} onClick={() => setMode("image")}>
          Image
        </ModeTab>
      </div>

      {mode === "generate" ? <GenerateView /> : <ImageView />}
    </div>
  );
}

// ── Mode toggle ─────────────────────────────────────────────────────────

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`rounded-md px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-all ${
        active
          ? "bg-background text-foreground shadow-xs"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

// ── Generate ────────────────────────────────────────────────────────────

function GenerateView() {
  const [pxSize, setPxSize] = React.useState<number>(DITHER_DEFAULTS.pixelSize);
  const [scale, setScale] = React.useState<number>(DITHER_DEFAULTS.scale);
  const [rotation, setRotation] = React.useState<number>(
    DITHER_DEFAULTS.rotation
  );
  const [offsetX, setOffsetX] = React.useState<number>(DITHER_DEFAULTS.offsetX);
  const [offsetY, setOffsetY] = React.useState<number>(DITHER_DEFAULTS.offsetY);
  const [anim, setAnim] = React.useState<number>(
    DITHER_DEFAULTS.animationSpeed
  );
  const [shape, setShape] = React.useState<number>(DITHER_DEFAULTS.shape);
  const [dither, setDither] = React.useState<number>(DITHER_DEFAULTS.dither);

  const reset = () => {
    setPxSize(DITHER_DEFAULTS.pixelSize);
    setScale(DITHER_DEFAULTS.scale);
    setRotation(DITHER_DEFAULTS.rotation);
    setOffsetX(DITHER_DEFAULTS.offsetX);
    setOffsetY(DITHER_DEFAULTS.offsetY);
    setAnim(DITHER_DEFAULTS.animationSpeed);
    setShape(DITHER_DEFAULTS.shape);
    setDither(DITHER_DEFAULTS.dither);
  };

  return (
    <>
      <Dither
        animationSpeed={anim}
        className="mt-6 aspect-4/3 w-full rounded-xl border border-border"
        dither={dither}
        offsetX={offsetX}
        offsetY={offsetY}
        pixelSize={pxSize}
        rotation={rotation}
        scale={scale}
        shape={shape}
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Shape"
          onChange={(v) => setShape(Number(v))}
          value={shape}
        >
          <option value={0}>Warp</option>
          <option value={1}>Rings</option>
          <option value={2}>Diagonal</option>
          <option value={3}>Flow</option>
        </SelectField>

        <SelectField
          label="Dither"
          onChange={(v) => setDither(Number(v))}
          value={dither}
        >
          <option value={0}>Noise</option>
          <option value={1}>2&times;2 Bayer</option>
          <option value={2}>4&times;4 Bayer</option>
          <option value={3}>8&times;8 Bayer</option>
        </SelectField>

        <SliderField
          label="Pixel size"
          max={10}
          min={0.5}
          onChange={setPxSize}
          step={0.1}
          suffix="px"
          value={pxSize}
        />
        <SliderField
          label="Zoom"
          max={2}
          min={0.1}
          onChange={setScale}
          step={0.05}
          suffix="&times;"
          value={scale}
        />
        <SliderField
          label="Animation"
          max={2}
          min={0}
          onChange={setAnim}
          step={0.05}
          suffix="&times;"
          value={anim}
        />
        <SliderField
          label="Rotation"
          max={360}
          min={0}
          onChange={setRotation}
          step={5}
          suffix="&deg;"
          value={rotation}
        />
        <SliderField
          label="Offset X"
          max={1}
          min={-1}
          onChange={setOffsetX}
          step={0.05}
          value={offsetX}
        />
        <SliderField
          label="Offset Y"
          max={1}
          min={-1}
          onChange={setOffsetY}
          step={0.05}
          value={offsetY}
        />
      </div>

      <button
        className="mt-8 rounded-md border border-border bg-background px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors hover:bg-muted"
        onClick={reset}
        type="button"
      >
        Reset
      </button>
    </>
  );
}

// ── Image ───────────────────────────────────────────────────────────────

function ImageView() {
  const {
    canvasRef,
    themeRef,
    setSource,
    params,
    updateParams,
    renderToBlob,
    sourceSize,
    error,
  } = useDitherRenderer();

  const [phase, setPhase] = React.useState<"idle" | "loaded">("idle");

  const handleFile = React.useCallback(
    async (file: File) => {
      try {
        const bitmap = await createImageBitmap(file);
        setSource(bitmap);
        setPhase("loaded");
      } catch {
        console.error("Failed to decode image");
      }
    },
    [setSource]
  );

  const onFileInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const onDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const onDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <>
      {error && (
        <p className="mt-4 text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      {phase === "idle" && (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: drag-and-drop target
        <fieldset
          aria-label="Image upload drop zone"
          className="mt-6 rounded-xl border border-border border-dashed p-16 text-center transition-colors hover:bg-muted/40"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <label className="flex cursor-pointer flex-col items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
              Upload
            </span>
            <span className="text-muted-foreground text-xs">
              Drop an image or click to browse
            </span>
            <input
              accept="image/*"
              className="hidden"
              onChange={onFileInput}
              type="file"
            />
          </label>
        </fieldset>
      )}

      {phase === "loaded" && (
        <>
          <div className="mt-6">
            <div
              className="overflow-hidden rounded-xl border border-border"
              ref={themeRef}
              style={{
                color: "var(--foreground)",
                backgroundColor: "var(--background)",
              }}
            >
              <canvas className="aspect-square w-full" ref={canvasRef} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              {sourceSize && (
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  {sourceSize.width} &times; {sourceSize.height}
                </span>
              )}
              <label className="ml-auto cursor-pointer font-mono text-[11px] text-muted-foreground transition-opacity hover:opacity-60">
                Replace
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={onFileInput}
                  type="file"
                />
              </label>
            </div>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <DitherControls onChange={updateParams} params={params} />
            <DitherExport onExport={renderToBlob} sourceSize={sourceSize} />
          </div>
        </>
      )}
    </>
  );
}

// ── Shared field components ─────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] text-muted-foreground">
        {label}
      </span>
      <select
        className="h-7 w-full rounded-md border border-input bg-background px-2 font-mono text-[11px] shadow-xs outline-none focus-visible:border-ring"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {children}
      </select>
    </div>
  );
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
  label: string;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between font-mono text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground tabular-nums">
          {step >= 1 ? Math.round(value) : value.toFixed(2)}
          {suffix}
        </span>
      </div>
      <Slider
        max={max}
        min={min}
        onValueChange={(v) => onChange(Array.isArray(v) ? (v[0] ?? min) : v)}
        step={step}
        value={[value]}
      />
    </div>
  );
}
