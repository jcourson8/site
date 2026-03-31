"use client";

import * as React from "react";
import {
  DEFAULT_PARAMS,
  type DitherParams,
  DitherRenderer,
} from "@/lib/webgl/dither-renderer";
import { resolveThemeColors } from "@/lib/webgl/theme-colors";

type Source = ImageBitmap | HTMLImageElement;

interface UseDitherRendererReturn {
  canvasRef: (node: HTMLCanvasElement | null) => void;
  error: string | null;
  params: DitherParams;
  renderToBlob: (width: number, height: number) => Promise<Blob>;
  setSource: (source: Source) => void;
  sourceSize: { width: number; height: number } | null;
  themeRef: (node: HTMLElement | null) => void;
  updateParams: (next: Partial<DitherParams>) => void;
}

/**
 * React lifecycle bridge for DitherRenderer.
 *
 * Uses callback refs so the renderer is created exactly when the canvas
 * mounts in the DOM (not before). Disposes on unmount. Resolves theme
 * colors from CSS and re-renders a single frame whenever params or
 * source change (no animation loop — static image).
 */
export function useDitherRenderer(): UseDitherRendererReturn {
  const rendererRef = React.useRef<DitherRenderer | null>(null);
  const themeElRef = React.useRef<HTMLElement | null>(null);
  const sourceRef = React.useRef<Source | null>(null);

  const [params, setParams] = React.useState<DitherParams>({
    ...DEFAULT_PARAMS,
  });
  const [sourceSize, setSourceSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const paramsRef = React.useRef(params);
  paramsRef.current = params;

  const requestRender = React.useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer?.ready) {
      return;
    }

    let { fg, bg } = resolveThemeColors(themeElRef.current);
    if (paramsRef.current.invert) {
      [fg, bg] = [bg, fg];
    }
    renderer.setParams({ ...paramsRef.current, fg, bg });
    renderer.render();
  }, []);

  const applySource = React.useCallback(
    (source: Source) => {
      sourceRef.current = source;
      const renderer = rendererRef.current;
      if (!renderer) {
        return;
      }
      try {
        renderer.setSource(source);
        setSourceSize(renderer.sourceSize);
        setError(null);
        requestRender();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load source");
      }
    },
    [requestRender]
  );

  const canvasRef = React.useCallback(
    (node: HTMLCanvasElement | null) => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      if (!node) {
        return;
      }

      try {
        rendererRef.current = new DitherRenderer(node);
        setError(null);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to initialize WebGL2"
        );
        return;
      }

      if (sourceRef.current) {
        applySource(sourceRef.current);
      }
    },
    [applySource]
  );

  const themeRef = React.useCallback((node: HTMLElement | null) => {
    themeElRef.current = node;
  }, []);

  const updateParams = React.useCallback(
    (next: Partial<DitherParams>) => {
      const merged = { ...paramsRef.current, ...next };
      paramsRef.current = merged;
      setParams(merged);
      requestAnimationFrame(() => requestRender());
    },
    [requestRender]
  );

  const renderToBlob = React.useCallback(
    (width: number, height: number): Promise<Blob> => {
      const renderer = rendererRef.current;
      if (!renderer) {
        throw new Error("Renderer not initialized");
      }

      let { fg, bg } = resolveThemeColors(themeElRef.current);
      if (paramsRef.current.invert) {
        [fg, bg] = [bg, fg];
      }
      renderer.setParams({ ...paramsRef.current, fg, bg });
      return renderer.renderToBlob(width, height);
    },
    []
  );

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => requestRender());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    return () => observer.disconnect();
  }, [requestRender]);

  return {
    canvasRef,
    themeRef,
    setSource: applySource,
    params,
    updateParams,
    renderToBlob,
    sourceSize,
    error,
  };
}
