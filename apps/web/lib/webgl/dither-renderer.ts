/**
 * DitherRenderer — owns the full WebGL2 lifecycle for applying ordered
 * dithering to a source image. Framework-agnostic; the React hook wraps this.
 *
 * Usage:
 *   const renderer = new DitherRenderer(canvas)
 *   renderer.setSource(imageBitmap)
 *   renderer.setParams({ mode: "bayer", bayerSize: 8, ... })
 *   renderer.render()
 *   const blob = await renderer.renderToBlob(480, 480)
 *   renderer.dispose()
 */

import {
  bindActiveProgram,
  compileShader,
  createQuadBuffer,
  createWebGL2,
  linkProgram,
} from "./core";
import {
  getTextureDitherUniforms,
  TEXTURE_DITHER_FRAG,
  TEXTURE_DITHER_VERT,
  type TextureDitherUniforms,
} from "./dither-shader";

export type DitherMode = "noise" | "bayer";
export type BayerSize = 2 | 4 | 8;

export interface DitherParams {
  bayerSize: BayerSize;
  bg: [number, number, number];
  brightness: number;
  contrast: number;
  fg: [number, number, number];
  invert: boolean;
  mode: DitherMode;
  pixelSize: number;
}

export const DEFAULT_PARAMS: DitherParams = {
  mode: "bayer",
  bayerSize: 8,
  pixelSize: 2.5,
  contrast: 1.2,
  brightness: 0,
  invert: false,
  fg: [0.93, 0.93, 0.93],
  bg: [0.07, 0.07, 0.07],
};

const BAYER_SIZE_TO_UNIFORM: Record<BayerSize, number> = { 2: 0, 4: 1, 8: 2 };

export class DitherRenderer {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly texture: WebGLTexture;
  private readonly uniforms: TextureDitherUniforms;
  private readonly params: DitherParams = { ...DEFAULT_PARAMS };
  private source: ImageBitmap | HTMLImageElement | null = null;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = createWebGL2(canvas, { preserveDrawingBuffer: true });
    const gl = this.gl;

    const vs = compileShader(gl, gl.VERTEX_SHADER, TEXTURE_DITHER_VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, TEXTURE_DITHER_FRAG);
    this.program = linkProgram(gl, vs, fs);

    bindActiveProgram(gl, this.program);
    this.buffer = createQuadBuffer(gl);
    this.uniforms = getTextureDitherUniforms(gl, this.program);

    this.texture = this.createSourceTexture(gl);
  }

  get ready(): boolean {
    return this.source !== null && !this.disposed;
  }

  get sourceSize(): { width: number; height: number } | null {
    if (!this.source) {
      return null;
    }
    return { width: this.source.width, height: this.source.height };
  }

  setSource(source: ImageBitmap | HTMLImageElement): void {
    this.assertNotDisposed();
    this.source = source;
    this.uploadTexture();
  }

  setParams(params: Partial<DitherParams>): void {
    this.assertNotDisposed();
    Object.assign(this.params, params);
  }

  render(): void {
    this.assertNotDisposed();
    if (!this.source) {
      return;
    }

    const { gl } = this;
    const canvas = gl.canvas as HTMLCanvasElement;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    const w = Math.max(1, Math.floor(displayW * dpr));
    const h = Math.max(1, Math.floor(displayH * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    this.draw(w, h, dpr);
  }

  async renderToBlob(width: number, height: number): Promise<Blob> {
    this.assertNotDisposed();
    if (!this.source) {
      throw new Error("No source image loaded");
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;

    const offGl = createWebGL2(offscreen, { preserveDrawingBuffer: true });
    const vs = compileShader(offGl, offGl.VERTEX_SHADER, TEXTURE_DITHER_VERT);
    const fs = compileShader(offGl, offGl.FRAGMENT_SHADER, TEXTURE_DITHER_FRAG);
    const program = linkProgram(offGl, vs, fs);
    bindActiveProgram(offGl, program);
    const buffer = createQuadBuffer(offGl);
    const uniforms = getTextureDitherUniforms(offGl, program);
    const texture = this.createSourceTexture(offGl);

    offGl.activeTexture(offGl.TEXTURE0);
    offGl.bindTexture(offGl.TEXTURE_2D, texture);
    offGl.texImage2D(
      offGl.TEXTURE_2D,
      0,
      offGl.RGBA,
      offGl.RGBA,
      offGl.UNSIGNED_BYTE,
      this.source
    );

    this.setUniforms(offGl, uniforms, width, height, 1);
    offGl.viewport(0, 0, width, height);
    offGl.drawArrays(offGl.TRIANGLES, 0, 6);

    const blob = await new Promise<Blob>((resolve, reject) => {
      offscreen.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
        "image/png"
      );
    });

    offGl.deleteTexture(texture);
    offGl.deleteBuffer(buffer);
    offGl.deleteProgram(program);

    return blob;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    const { gl } = this;
    gl.deleteTexture(this.texture);
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
  }

  // ── Private ──────────────────────────────────────────────────────────

  private createSourceTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const tex = gl.createTexture();
    if (!tex) {
      throw new Error("Failed to create texture");
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return tex;
  }

  private uploadTexture(): void {
    if (!this.source) {
      return;
    }
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.source
    );
  }

  private draw(w: number, h: number, pixelRatio: number): void {
    const { gl, program } = this;
    gl.viewport(0, 0, w, h);
    bindActiveProgram(gl, program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    this.setUniforms(gl, this.uniforms, w, h, pixelRatio);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private setUniforms(
    gl: WebGL2RenderingContext,
    u: TextureDitherUniforms,
    w: number,
    h: number,
    pixelRatio: number
  ): void {
    const p = this.params;
    if (u.source) {
      gl.uniform1i(u.source, 0);
    }
    if (u.resolution) {
      gl.uniform2f(u.resolution, w, h);
    }
    if (u.pixelRatio) {
      gl.uniform1f(u.pixelRatio, pixelRatio);
    }
    if (u.pxSize) {
      gl.uniform1f(u.pxSize, p.pixelSize);
    }
    if (u.dither) {
      gl.uniform1i(u.dither, p.mode === "noise" ? 0 : 1);
    }
    if (u.bayer) {
      gl.uniform1i(u.bayer, BAYER_SIZE_TO_UNIFORM[p.bayerSize]);
    }
    if (u.contrast) {
      gl.uniform1f(u.contrast, p.contrast);
    }
    if (u.brightness) {
      gl.uniform1f(u.brightness, p.brightness);
    }
    if (u.fg) {
      gl.uniform3fv(u.fg, p.fg);
    }
    if (u.bg) {
      gl.uniform3fv(u.bg, p.bg);
    }
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error("DitherRenderer has been disposed");
    }
  }
}
