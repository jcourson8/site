declare module "gifenc" {
  export function GIFEncoder(): {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: { palette?: number[][]; delay?: number; dispose?: number }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
  };
  export function quantize(
    rgba: Uint8Array,
    maxColors: number,
    opts?: { format?: string; oneBitAlpha?: boolean }
  ): number[][];
  export function applyPalette(
    rgba: Uint8Array,
    palette: number[][],
    format?: string
  ): Uint8Array;
}
