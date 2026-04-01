"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const PX = 2;
const SLEEP_A = [
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  "....#..",
  ".......",
  "..###..",
  ".#####.",
  ".#####.",
  "..###..",
  ".#...#.",
];

const SLEEP_B = [
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  ".....#.",
  ".......",
  ".......",
  "..###..",
  ".#####.",
  ".#####.",
  "..###..",
  ".#...#.",
];

function paintMini(
  ctx: CanvasRenderingContext2D,
  sprite: string[],
  fill: string
) {
  ctx.clearRect(0, 0, 7 * PX, 13 * PX);
  ctx.fillStyle = fill;
  for (let r = 0; r < sprite.length; r++) {
    const row = sprite[r];
    if (!row) {
      continue;
    }
    for (let c = 0; c < row.length; c++) {
      if (row[c] === "#") {
        ctx.fillRect(c * PX, r * PX, PX, PX);
      }
    }
  }
}

type TomoListener = () => void;
type DragGrabHandler = (clientX: number, clientY: number) => void;
let tomoActive = (() => {
  try {
    return (
      typeof window !== "undefined" && localStorage.getItem("tomo") === "1"
    );
  } catch {
    return false;
  }
})();
let tomoAnchorEl: HTMLElement | null = null;
let tomoOnScreen = false;
let dragGrabHandler: DragGrabHandler | null = null;
const listeners = new Set<TomoListener>();

export const tomoStore = {
  toggle() {
    tomoActive = !tomoActive;
    try {
      localStorage.setItem("tomo", tomoActive ? "1" : "0");
    } catch {
      // storage unavailable
    }
    for (const fn of listeners) {
      fn();
    }
  },
  getActive() {
    return tomoActive;
  },
  setOnScreen(val: boolean) {
    if (tomoOnScreen === val) {
      return;
    }
    tomoOnScreen = val;
    for (const fn of listeners) {
      fn();
    }
  },
  getOnScreen() {
    return tomoOnScreen;
  },
  setAnchor(el: HTMLElement | null) {
    tomoAnchorEl = el;
  },
  getAnchorX() {
    const rect = tomoAnchorEl?.getBoundingClientRect();
    return rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  },
  setDragGrabHandler(handler: DragGrabHandler | null) {
    dragGrabHandler = handler;
  },
  grabFromToggle(clientX: number, clientY: number) {
    if (!tomoActive) {
      tomoActive = true;
      try {
        localStorage.setItem("tomo", "1");
      } catch {
        // storage unavailable
      }
      for (const fn of listeners) {
        fn();
      }
    }
    dragGrabHandler?.(clientX, clientY);
  },
  subscribe(fn: TomoListener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export function useTomoOnScreen() {
  return useSyncExternalStore(
    tomoStore.subscribe,
    tomoStore.getOnScreen,
    () => false
  );
}

export function useTomoActive() {
  return useSyncExternalStore(
    tomoStore.subscribe,
    tomoStore.getActive,
    () => false
  );
}

export function TomoToggle() {
  const active = useTomoActive();
  const onScreen = useTomoOnScreen();
  const returning = !active && onScreen;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLButtonElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    dragging: boolean;
  } | null>(null);

  useEffect(() => {
    tomoStore.setAnchor(wrapRef.current);
    return () => tomoStore.setAnchor(null);
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) {
      return;
    }
    const ctx = cvs.getContext("2d");
    if (!ctx) {
      return;
    }

    let frame = 0;
    let t = 0;
    let raf = 0;
    let prev = 0;

    const tick = (now: number) => {
      const dt = prev ? (now - prev) / 1000 : 0;
      prev = now;
      t += dt;

      if (t > 1.2) {
        frame = frame === 0 ? 1 : 0;
        t = 0;
      }

      const color = getComputedStyle(cvs).color;
      paintMini(ctx, frame === 0 ? SLEEP_A : SLEEP_B, color);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }

    const onPointerDown = (e: PointerEvent) => {
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        dragging: false,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const ds = dragState.current;
      if (!ds || ds.dragging) {
        return;
      }
      const moved = Math.hypot(e.clientX - ds.startX, e.clientY - ds.startY);
      if (moved > 8) {
        ds.dragging = true;
        tomoStore.grabFromToggle(e.clientX, e.clientY);
        dragState.current = null;
      }
    };

    const onPointerUp = () => {
      const ds = dragState.current;
      if (ds && !ds.dragging) {
        tomoStore.toggle();
      }
      dragState.current = null;
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <button
      className="inline-flex cursor-pointer touch-none items-center transition-opacity duration-150 hover:opacity-60"
      ref={wrapRef}
      type="button"
    >
      <span
        className="text-[9px] text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
        style={{
          display: onScreen && !returning ? "inline" : "none",
        }}
      >
        zzz
      </span>
      <canvas
        className="text-muted-foreground"
        height={13 * PX}
        ref={canvasRef}
        style={{
          imageRendering: "pixelated",
          verticalAlign: "bottom",
          marginBottom: "14px",
          display: onScreen ? "none" : "inline-block",
        }}
        width={7 * PX}
      />
    </button>
  );
}
