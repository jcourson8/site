"use client";

import { Slider } from "@workspace/ui/components/slider";
import Image from "next/image";
import * as React from "react";

export interface ExportResult {
  bytes: number;
  url: string;
}

interface DitherExportProps {
  onExport: (width: number, height: number) => Promise<Blob>;
  sourceSize: { width: number; height: number } | null;
}

export function DitherExport({ sourceSize, onExport }: DitherExportProps) {
  const [outWidth, setOutWidth] = React.useState(480);
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ExportResult | null>(null);

  const aspectRatio = sourceSize ? sourceSize.width / sourceSize.height : 1;
  const outHeight = Math.round(outWidth / aspectRatio);

  const handleExport = () => {
    setResult(null);
    startTransition(async () => {
      const blob = await onExport(outWidth, outHeight);
      const url = URL.createObjectURL(blob);
      setResult({ url, bytes: blob.size });
    });
  };

  const handleDownload = () => {
    if (!result) {
      return;
    }
    const a = document.createElement("a");
    a.href = result.url;
    a.download = "dither-export.png";
    a.click();
  };

  React.useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  return (
    <div className="space-y-5">
      <span className="block font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
        Export
      </span>

      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-muted-foreground">Width</span>
          <span className="text-foreground tabular-nums">{outWidth}px</span>
        </div>
        <Slider
          max={1920}
          min={120}
          onValueChange={(v) =>
            setOutWidth(Array.isArray(v) ? (v[0] ?? 480) : v)
          }
          step={20}
          value={[outWidth]}
        />
      </div>

      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
        {outWidth} &times; {outHeight}px &middot; PNG
      </p>

      <button
        className="mt-4 w-full rounded-md bg-foreground px-4 py-2 font-mono text-[11px] text-background uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50"
        disabled={isPending || !sourceSize}
        onClick={handleExport}
        type="button"
      >
        {isPending ? "Rendering\u2026" : "Export PNG"}
      </button>

      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
            <span>Preview</span>
            <span className="tabular-nums">
              {(result.bytes / 1024).toFixed(0)} KB
            </span>
          </div>
          <Image
            alt="Dither export preview"
            className="h-auto w-full rounded-md border border-border"
            height={outHeight}
            src={result.url}
            unoptimized
            width={outWidth}
          />
          <button
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted"
            onClick={handleDownload}
            type="button"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
