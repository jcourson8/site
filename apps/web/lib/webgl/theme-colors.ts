/**
 * Resolves CSS custom-property colors (oklch, lab, etc.) into
 * [r, g, b] triples in the 0–1 range for WebGL uniforms.
 *
 * Uses a 2D canvas probe to normalize browser-native color formats,
 * then validates that fg/bg have enough contrast to produce a visible
 * dither pattern.
 */

type RGB = [number, number, number];

const CSS_RGB_PATTERN = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/;

function parseCssRgb(s: string): RGB | null {
  const m = s.match(CSS_RGB_PATTERN);
  if (!(m?.[1] && m[2] && m[3])) {
    return null;
  }
  return [
    Number.parseFloat(m[1]) / 255,
    Number.parseFloat(m[2]) / 255,
    Number.parseFloat(m[3]) / 255,
  ];
}

function parseCssHex(s: string): RGB | null {
  let h = s.replace("#", "").trim();
  if (h.length === 3) {
    h = [...h].map((c) => c + c).join("");
  }
  if (h.length !== 6) {
    return null;
  }
  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n)) {
    return null;
  }
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function resolveCssColor(css: string): RGB | null {
  const t = css.trim();
  if (!t) {
    return null;
  }
  const fromRgb = parseCssRgb(t);
  if (fromRgb) {
    return fromRgb;
  }
  const fromHex = parseCssHex(t);
  if (fromHex) {
    return fromHex;
  }
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) {
    return null;
  }
  try {
    probe.fillStyle = "#000000";
    probe.fillStyle = t;
    const normalized = probe.fillStyle;
    if (typeof normalized !== "string") {
      return null;
    }
    return parseCssRgb(normalized) ?? parseCssHex(normalized);
  } catch {
    return null;
  }
}

const DARK_FG: RGB = [0.93, 0.93, 0.93];
const DARK_BG: RGB = [0.08, 0.08, 0.08];
const LIGHT_FG: RGB = [0.06, 0.06, 0.06];
const LIGHT_BG: RGB = [0.93, 0.93, 0.93];

/**
 * Reads the current CSS `color` and `background-color` from an element
 * and returns WebGL-ready fg/bg triples. Falls back to high-contrast
 * defaults if the colors are too close together.
 */
export function resolveThemeColors(element: Element | null): {
  fg: RGB;
  bg: RGB;
} {
  if (!element) {
    return { fg: DARK_FG, bg: DARK_BG };
  }

  const cs = getComputedStyle(element);
  let fg = resolveCssColor(cs.color);
  let bg = resolveCssColor(cs.backgroundColor);

  if (!fg) {
    fg = LIGHT_FG;
  }
  if (!bg) {
    bg = LIGHT_BG;
  }

  const dist = Math.hypot(fg[0] - bg[0], fg[1] - bg[1], fg[2] - bg[2]);
  if (dist < 0.12) {
    const lum = fg[0] * 0.2126 + fg[1] * 0.7152 + fg[2] * 0.0722;
    return lum > 0.5
      ? { fg: LIGHT_FG, bg: LIGHT_BG }
      : { fg: DARK_FG, bg: DARK_BG };
  }

  // Shader convention: mix(u_bg, u_fg, m) maps bright luma → fg,
  // dark luma → bg. Ensure fg is always the brighter of the pair so
  // image tonality is preserved regardless of light/dark theme.
  const fgLum = fg[0] * 0.2126 + fg[1] * 0.7152 + fg[2] * 0.0722;
  const bgLum = bg[0] * 0.2126 + bg[1] * 0.7152 + bg[2] * 0.0722;
  if (fgLum < bgLum) {
    return { fg: bg, bg: fg };
  }

  return { fg, bg };
}

/**
 * Like resolveThemeColors but without the luminance-based fg/bg swap.
 * Used for procedural shape fields where CSS fg maps directly to the
 * pattern's foreground regardless of relative brightness.
 */
export function resolveProceduralColors(element: Element | null): {
  fg: RGB;
  bg: RGB;
} {
  if (!element) {
    return { fg: LIGHT_FG, bg: LIGHT_BG };
  }

  const cs = getComputedStyle(element);
  let fg = resolveCssColor(cs.color);
  let bg = resolveCssColor(cs.backgroundColor);

  if (!fg) {
    fg = LIGHT_FG;
  }
  if (!bg) {
    bg = LIGHT_BG;
  }

  const dist = Math.hypot(fg[0] - bg[0], fg[1] - bg[1], fg[2] - bg[2]);
  if (dist < 0.12) {
    const lum = fg[0] * 0.2126 + fg[1] * 0.7152 + fg[2] * 0.0722;
    return lum > 0.5
      ? { fg: LIGHT_FG, bg: LIGHT_BG }
      : { fg: DARK_FG, bg: DARK_BG };
  }

  return { fg, bg };
}
