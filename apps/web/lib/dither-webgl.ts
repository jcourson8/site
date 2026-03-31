/**
 * Procedural dithering demo — shape-field GLSL + shared WebGL utilities.
 *
 * The Bayer/noise GLSL is inlined in the fragment shader since the procedural
 * shape field is tightly coupled to the dither sampling. The compiler/linker
 * utilities are re-exported from the shared core.
 */

export {
  bindActiveProgram,
  compileShader,
  linkProgram,
} from "@/lib/webgl/core";

export interface DitherUniforms {
  anim: WebGLUniformLocation | null;
  bg: WebGLUniformLocation | null;
  dither: WebGLUniformLocation | null;
  fg: WebGLUniformLocation | null;
  offset: WebGLUniformLocation | null;
  pixelRatio: WebGLUniformLocation | null;
  pxSize: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  rotation: WebGLUniformLocation | null;
  scale: WebGLUniformLocation | null;
  shape: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
}

export function getDitherUniforms(
  gl: WebGL2RenderingContext,
  p: WebGLProgram
): DitherUniforms {
  return {
    time: gl.getUniformLocation(p, "u_time"),
    resolution: gl.getUniformLocation(p, "u_resolution"),
    pixelRatio: gl.getUniformLocation(p, "u_pixelRatio"),
    pxSize: gl.getUniformLocation(p, "u_pxSize"),
    scale: gl.getUniformLocation(p, "u_scale"),
    rotation: gl.getUniformLocation(p, "u_rotation"),
    offset: gl.getUniformLocation(p, "u_offset"),
    anim: gl.getUniformLocation(p, "u_anim"),
    shape: gl.getUniformLocation(p, "u_shape"),
    dither: gl.getUniformLocation(p, "u_dither"),
    fg: gl.getUniformLocation(p, "u_fg"),
    bg: gl.getUniformLocation(p, "u_bg"),
  };
}

export const VERT = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAG = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_pxSize;
uniform float u_scale;
uniform float u_rotation;
uniform vec2 u_offset;
uniform float u_anim;
uniform int u_shape;
uniform int u_dither;
uniform vec3 u_fg;
uniform vec3 u_bg;

out vec4 fragColor;

const float PI = 3.14159265359;

const float B2[4] = float[](0.0 / 4.0, 2.0 / 4.0, 3.0 / 4.0, 1.0 / 4.0);

const float B4[16] = float[](
  0.0 / 16.0, 8.0 / 16.0, 2.0 / 16.0, 10.0 / 16.0,
  12.0 / 16.0, 4.0 / 16.0, 14.0 / 16.0, 6.0 / 16.0,
  3.0 / 16.0, 11.0 / 16.0, 1.0 / 16.0, 9.0 / 16.0,
  15.0 / 16.0, 7.0 / 16.0, 13.0 / 16.0, 5.0 / 16.0
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

float bayer2Val(ivec2 c) {
  int i = (c.y & 1) * 2 + (c.x & 1);
  return B2[i];
}

float bayer4Val(ivec2 c) {
  int i = (c.y & 3) * 4 + (c.x & 3);
  return B4[i];
}

float bayer8Val(ivec2 c) {
  int i = (c.y & 7) * 8 + (c.x & 7);
  return B8[i] / 64.0;
}

float sampleDither(int mode, vec2 fragPx, vec2 pxGrid) {
  ivec2 ic = ivec2(pxGrid);
  if (mode == 0) {
    return hash21(floor(fragPx)) - 0.5;
  }
  if (mode == 1) return bayer2Val(ic) - 0.5;
  if (mode == 2) return bayer4Val(ic) - 0.5;
  return bayer8Val(ic) - 0.5;
}

float shapeField(vec2 p, float t, int mode) {
  if (mode == 0) {
    return 0.5 + 0.5 * sin(p.x * 0.015 + t) * cos(p.y * 0.015 - t * 0.7);
  }
  if (mode == 1) {
    float r = length(p * 0.008);
    return 0.5 + 0.5 * sin(r - t * 2.0);
  }
  if (mode == 2) {
    return 0.5 + 0.5 * sin((p.x + p.y) * 0.012 + t);
  }
  float sx = sin(p.x * 0.01 + t * 0.3);
  float sy = cos(p.y * 0.01 - t * 0.4);
  return 0.5 + 0.5 * sin(length(vec2(sx, sy)) * 3.0);
}

void main() {
  float t = u_time * u_anim;
  vec2 frag = gl_FragCoord.xy;

  float px = max(0.25, u_pxSize * u_pixelRatio);
  vec2 cell = floor(frag / px);
  vec2 snapped = cell * px;

  vec2 uv = (snapped + 0.5 * px) / u_resolution;
  uv -= 0.5;
  float c = cos(u_rotation);
  float s = sin(u_rotation);
  uv = mat2(c, -s, s, c) * uv;
  uv += 0.5;

  vec2 patterned = uv * u_resolution / u_pixelRatio / max(0.05, u_scale);
  patterned += vec2(-u_offset.x, u_offset.y) * 200.0 / max(0.05, u_scale);

  float shape = shapeField(patterned, t, u_shape);
  float d = sampleDither(u_dither, frag, cell);
  float m = step(0.5, shape + d);

  vec3 color = mix(u_bg, u_fg, m);
  fragColor = vec4(color, 1.0);
}
`;
