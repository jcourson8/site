/**
 * Texture-to-dither GLSL shaders.
 *
 * Samples a u_source texture, converts to luma, applies contrast/brightness,
 * then thresholds with ordered (Bayer 2/4/8) or noise dithering to produce
 * a 1-bit image in the chosen fg/bg colors.
 *
 * The Bayer matrices and noise hash are defined once here so the procedural
 * playground shader can import the same GLSL chunks via string concatenation.
 */

// ── Shared GLSL chunks (reusable across shaders) ────────────────────────

export const GLSL_BAYER_MATRICES = /* glsl */ `
const float B2[4] = float[](0.0, 2.0, 3.0, 1.0);
const float B4[16] = float[](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);
const float B8[64] = float[](
  0.0, 32.0, 8.0, 40.0, 2.0, 34.0, 10.0, 42.0,
  48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0,
  12.0, 44.0, 4.0, 36.0, 14.0, 46.0, 6.0, 38.0,
  60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0,
  3.0, 35.0, 11.0, 43.0, 1.0, 33.0, 9.0, 41.0,
  51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0,
  15.0, 47.0, 7.0, 39.0, 13.0, 45.0, 5.0, 37.0,
  63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0
);

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float bayer2(ivec2 c) { return B2[(c.y & 1) * 2 + (c.x & 1)] / 4.0; }
float bayer4(ivec2 c) { return B4[(c.y & 3) * 4 + (c.x & 3)] / 16.0; }
float bayer8(ivec2 c) { return B8[(c.y & 7) * 8 + (c.x & 7)] / 64.0; }
`;

// ── Texture dither vertex shader ────────────────────────────────────────

export const TEXTURE_DITHER_VERT = /* glsl */ `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// ── Texture dither fragment shader ──────────────────────────────────────

export const TEXTURE_DITHER_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_source;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_pxSize;
uniform int u_dither;   // 0 = noise, 1 = bayer
uniform int u_bayer;    // 0 = 2x2, 1 = 4x4, 2 = 8x8
uniform float u_contrast;
uniform float u_brightness;
uniform vec3 u_fg;
uniform vec3 u_bg;

${GLSL_BAYER_MATRICES}

void main() {
  float px = max(0.5, u_pxSize * u_pixelRatio);
  vec2 frag = gl_FragCoord.xy;
  vec2 cell = floor(frag / px);
  vec2 snapped = (cell + 0.5) * px / u_resolution;

  vec4 texel = texture(u_source, vec2(snapped.x, 1.0 - snapped.y));
  float luma = dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722));
  luma = clamp((luma - 0.5) * u_contrast + 0.5 + u_brightness, 0.0, 1.0);

  float d;
  ivec2 ic = ivec2(cell);
  if (u_dither == 0) {
    d = hash21(cell) - 0.5;
  } else {
    if (u_bayer == 0) d = bayer2(ic) - 0.5;
    else if (u_bayer == 1) d = bayer4(ic) - 0.5;
    else d = bayer8(ic) - 0.5;
  }

  float m = step(0.5, luma + d);
  vec3 color = mix(u_bg, u_fg, m);
  fragColor = vec4(color, 1.0);
}
`;

// ── Uniform name mapping ────────────────────────────────────────────────

export interface TextureDitherUniforms {
  bayer: WebGLUniformLocation | null;
  bg: WebGLUniformLocation | null;
  brightness: WebGLUniformLocation | null;
  contrast: WebGLUniformLocation | null;
  dither: WebGLUniformLocation | null;
  fg: WebGLUniformLocation | null;
  pixelRatio: WebGLUniformLocation | null;
  pxSize: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  source: WebGLUniformLocation | null;
}

export function getTextureDitherUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
): TextureDitherUniforms {
  return {
    source: gl.getUniformLocation(program, "u_source"),
    resolution: gl.getUniformLocation(program, "u_resolution"),
    pixelRatio: gl.getUniformLocation(program, "u_pixelRatio"),
    pxSize: gl.getUniformLocation(program, "u_pxSize"),
    dither: gl.getUniformLocation(program, "u_dither"),
    bayer: gl.getUniformLocation(program, "u_bayer"),
    contrast: gl.getUniformLocation(program, "u_contrast"),
    brightness: gl.getUniformLocation(program, "u_brightness"),
    fg: gl.getUniformLocation(program, "u_fg"),
    bg: gl.getUniformLocation(program, "u_bg"),
  };
}
