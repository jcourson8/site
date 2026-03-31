import { Slider } from "@workspace/ui/components/slider";
import type {
  BayerSize,
  DitherMode,
  DitherParams,
} from "@/lib/webgl/dither-renderer";

interface DitherControlsProps {
  onChange: (next: Partial<DitherParams>) => void;
  params: DitherParams;
}

export function DitherControls({ params, onChange }: DitherControlsProps) {
  return (
    <div className="space-y-5">
      <span className="block font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
        Controls
      </span>

      <ControlField label="Mode">
        <select
          className="h-7 w-full rounded-md border border-input bg-background px-2 font-mono text-[11px] shadow-xs outline-none focus-visible:border-ring"
          onChange={(e) => onChange({ mode: e.target.value as DitherMode })}
          value={params.mode}
        >
          <option value="noise">Noise</option>
          <option value="bayer">Bayer (ordered)</option>
        </select>
      </ControlField>

      {params.mode === "bayer" && (
        <ControlField label="Matrix">
          <select
            className="h-7 w-full rounded-md border border-input bg-background px-2 font-mono text-[11px] shadow-xs outline-none focus-visible:border-ring"
            onChange={(e) =>
              onChange({ bayerSize: Number(e.target.value) as BayerSize })
            }
            value={params.bayerSize}
          >
            <option value={2}>2 &times; 2</option>
            <option value={4}>4 &times; 4</option>
            <option value={8}>8 &times; 8</option>
          </select>
        </ControlField>
      )}

      <SliderField
        label="Pixel size"
        max={8}
        min={0.5}
        onChange={(v) => onChange({ pixelSize: v })}
        step={0.1}
        suffix="px"
        value={params.pixelSize}
      />
      <SliderField
        label="Contrast"
        max={3}
        min={0.5}
        onChange={(v) => onChange({ contrast: v })}
        step={0.05}
        suffix={"\u00d7"}
        value={params.contrast}
      />
      <SliderField
        label="Brightness"
        max={0.5}
        min={-0.5}
        onChange={(v) => onChange({ brightness: v })}
        step={0.01}
        value={params.brightness}
      />

      <button
        aria-pressed={params.invert}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 transition-colors hover:bg-muted/50"
        onClick={() => onChange({ invert: !params.invert })}
        type="button"
      >
        <span className="font-mono text-[11px] text-muted-foreground">
          Invert
        </span>
        <span
          className={`inline-block size-3 rounded-sm border ${params.invert ? "border-foreground bg-foreground" : "border-muted-foreground"}`}
        />
      </button>
    </div>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────

function ControlField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] text-muted-foreground">
        {label}
      </span>
      {children}
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
