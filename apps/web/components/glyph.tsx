import { cn } from "@workspace/ui/lib/utils";

const glyphs = {
  solid: "■",
  dot: "⊡",
  cross: "⊠",
  minus: "⊟",
  plus: "⊞",
} as const;

type GlyphName = keyof typeof glyphs;

export function Glyph({
  name,
  className = "",
}: {
  name: GlyphName;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative -top-[0.05em] inline-block leading-none",
        className
      )}
    >
      {glyphs[name]}
    </span>
  );
}
