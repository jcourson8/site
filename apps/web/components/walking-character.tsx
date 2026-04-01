"use client";

import { useEffect, useRef } from "react";
import { tomoStore } from "@/components/tomo-toggle";

const PX = 2;
const W = 7;
const H = 13;
const PAD = 10;

const STAND_A = [
  ".......",
  ".......",
  ".......",
  "..###..",
  ".#####.",
  ".#.#.#.",
  ".#####.",
  "..###..",
  ".#####.",
  "..###..",
  "..#.#..",
  "..#.#..",
  ".##.##.",
];

const STAND_B = [
  ".......",
  ".......",
  ".......",
  "..###..",
  ".#####.",
  ".#.#.#.",
  ".#####.",
  "..###..",
  ".#####.",
  "..###..",
  "..#.#..",
  "...#...",
  "..###..",
];

const WALK = [
  [
    ".......",
    ".......",
    ".......",
    ".......",
    "..###..",
    ".#####.",
    ".#.#.#.",
    ".#####.",
    "..###..",
    ".#####.",
    "..###..",
    ".#...#.",
    ".#.....",
  ],
  [
    ".......",
    ".......",
    ".......",
    ".......",
    "..###..",
    ".#####.",
    ".#.#.#.",
    ".#####.",
    "..###..",
    ".#####.",
    "..###..",
    "..##...",
    ".......",
  ],
  [
    ".......",
    ".......",
    ".......",
    ".......",
    "..###..",
    ".#####.",
    ".#.#.#.",
    ".#####.",
    "..###..",
    ".#####.",
    "..###..",
    ".#...#.",
    ".....#.",
  ],
  [
    ".......",
    ".......",
    ".......",
    ".......",
    "..###..",
    ".#####.",
    ".#.#.#.",
    ".#####.",
    "..###..",
    ".#####.",
    "..###..",
    "...##..",
    ".......",
  ],
];

const LOOK_UP = [
  ".......",
  ".......",
  "..###..",
  ".#####.",
  ".#...#.",
  ".#####.",
  "..###..",
  "...#...",
  ".#####.",
  "..###..",
  "..#.#..",
  "..#.#..",
  ".##.##.",
];

const SIT = [
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  ".......",
  "..###..",
  ".#####.",
  ".#.#.#.",
  ".#####.",
  "..###..",
  ".#...#.",
];

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

const STARTLED = [
  ".......",
  ".......",
  "..###..",
  ".#####.",
  ".#...#.",
  ".#####.",
  "..###..",
  ".#####.",
  "..###..",
  "..#.#..",
  ".......",
  ".......",
  ".......",
];

const HELD_A = [
  ".......",
  ".......",
  "..#.#..",
  "..###..",
  ".#####.",
  ".#.#.#.",
  ".#####.",
  "..###..",
  "..###..",
  "...#...",
  "..#....",
  "....#..",
  ".......",
];

const HELD_B = [
  ".......",
  ".......",
  "..#.#..",
  "..###..",
  ".#####.",
  ".#.#.#.",
  ".#####.",
  "..###..",
  "..###..",
  "...#...",
  "....#..",
  "..#....",
  ".......",
];

const PARACHUTE = [
  ".#####.",
  "#.....#",
  ".#...#.",
  "..#.#..",
  "..###..",
  ".#####.",
  ".#.#.#.",
  ".#####.",
  "..###..",
  "..###..",
  "...#...",
  "..#.#..",
  ".......",
];

const QUIPS = [
  "hey!",
  "...",
  "hmm",
  "*yawn*",
  "hi!",
  "o/",
  ":)",
  "~",
  "!!",
  "hehe",
  "sup",
  "..?",
  "♪",
  "nice",
  ":o",
];

function pickSpeechLine(
  lastIdx: number,
  sessionSeconds: number
): [string, number] {
  const hour = new Date().getHours();
  let contextLine: string | null = null;

  if (hour < 6) {
    contextLine = "so late...";
  } else if (hour < 9) {
    contextLine = "good morning!";
  } else if (hour >= 22) {
    contextLine = "getting late...";
  } else if (hour >= 12 && hour < 14) {
    contextLine = "lunch time?";
  }

  if (!contextLine && window.scrollY > window.innerHeight * 2) {
    contextLine = "long page huh";
  }
  if (!contextLine && sessionSeconds > 60) {
    contextLine = "you still here?";
  }

  if (contextLine && Math.random() > 0.4) {
    return [contextLine, -1];
  }

  let idx = Math.floor(Math.random() * QUIPS.length);
  if (idx === lastIdx) {
    idx = (idx + 1) % QUIPS.length;
  }
  return [QUIPS[idx] ?? "...", idx];
}

type Behavior =
  | "hidden"
  | "entering"
  | "walk"
  | "idle"
  | "look"
  | "sit"
  | "sleep"
  | "startled"
  | "held"
  | "falling"
  | "exiting";

function paint(ctx: CanvasRenderingContext2D, sprite: string[], fill: string) {
  const fw = W * PX + PAD * 2;
  const fh = H * PX + PAD * 2;
  ctx.clearRect(0, 0, fw, fh);
  ctx.fillStyle = fill;
  for (let r = 0; r < sprite.length; r++) {
    const row = sprite[r];
    if (!row) {
      continue;
    }
    for (let c = 0; c < row.length; c++) {
      if (row[c] === "#") {
        ctx.fillRect(PAD + c * PX, PAD + r * PX, PX, PX);
      }
    }
  }
}

interface WalkingCharacterProps {
  active: boolean;
  getAnchorX?: () => number;
}

export function WalkingCharacter({
  active,
  getAnchorX,
}: WalkingCharacterProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const speechRef = useRef<HTMLDivElement>(null);
  const cmdRef = useRef<"enter" | "exit" | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (active) {
        cmdRef.current = "enter";
      }
      return;
    }
    cmdRef.current = active ? "enter" : "exit";
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    const speechEl = speechRef.current;
    if (!(el && speechEl)) {
      return;
    }
    const ctx = el.getContext("2d");
    if (!ctx) {
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let x = 0;
    let dir = 1;
    let behavior: Behavior = "hidden";
    let frame = 0;
    let behaviorT = 0;
    let frameT = 0;
    let idleAccum = 0;
    let nextSwitch = 4 + Math.random() * 4;
    let mx = -9999;
    let my = -9999;
    let prev = 0;
    let raf = 0;
    let color = "";
    let bgColor = "";
    let colorT = 999;
    let jumpY = 0;
    let bottomY = -50;
    let canvasOpacity = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let fallVelocity = 0;
    let fallStartY = 0;
    let parachuteOpen = false;
    let suppressNextClick = false;
    let pendingDown = false;
    let downX = 0;
    let downY = 0;
    let sessionT = 0;
    let speechText = "";
    let speechT = 0;
    let speechVisible = false;
    let lastQuipIdx = -1;
    let saveT = 0;

    try {
      const saved = localStorage.getItem("tomo-state");
      if (saved) {
        const s = JSON.parse(saved);
        x = s.x ?? x;
        dir = s.dir ?? dir;
        bottomY = s.bottomY ?? bottomY;
        fallVelocity = s.fallVelocity ?? 0;
        fallStartY = s.fallStartY ?? 0;
        parachuteOpen = s.parachuteOpen ?? false;
        canvasOpacity = s.canvasOpacity ?? 0;
        const b = s.behavior as Behavior | undefined;
        if (b && b !== "hidden") {
          tomoStore.setOnScreen(true);
          if (b === "held") {
            behavior = "falling";
            canvasOpacity = 1;
          } else if (b === "falling") {
            behavior = "falling";
            fallVelocity = s.fallVelocity ?? 0;
            canvasOpacity = 1;
          } else if (b === "entering" || b === "exiting") {
            behavior = "walk";
            canvasOpacity = 1;
            bottomY = 8;
          } else {
            behavior = b;
            canvasOpacity = 1;
            bottomY = 8;
          }
        }
      }
    } catch {
      // storage unavailable
    }

    function saveState() {
      try {
        localStorage.setItem(
          "tomo-state",
          JSON.stringify({
            x,
            dir,
            behavior,
            bottomY,
            fallVelocity,
            fallStartY,
            parachuteOpen,
            canvasOpacity,
          })
        );
      } catch {
        // storage unavailable
      }
    }

    function showSpeech() {
      const [line, idx] = pickSpeechLine(lastQuipIdx, sessionT);
      lastQuipIdx = idx;
      speechText = line;
      speechT = 0;
      speechVisible = true;
      if (behavior === "sleep" || behavior === "sit") {
        behavior = "idle";
        behaviorT = 0;
        jumpY = -4;
        idleAccum = 0;
      }
    }

    function startDrag(clientX: number, clientY: number) {
      pendingDown = false;
      const ch = H * PX;
      const canvasTop = window.innerHeight - bottomY - ch;
      dragOffsetX = clientX - x;
      dragOffsetY = clientY - canvasTop;
      document.body.style.cursor = "grabbing";
      behavior = "held";
      behaviorT = 0;
      frame = 0;
      jumpY = 0;
      idleAccum = 0;
      speechVisible = false;
      if (speechEl) {
        speechEl.style.opacity = "0";
      }
    }

    function releaseDrag() {
      pendingDown = false;
      document.body.style.cursor = "";
      suppressNextClick = true;
      behavior = "falling";
      behaviorT = 0;
      fallVelocity = 0;
      fallStartY = bottomY;
      parachuteOpen = false;
    }

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (pendingDown && behavior !== "held") {
        const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
        if (moved > 5) {
          startDrag(downX, downY);
        }
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) {
        return;
      }
      mx = t.clientX;
      my = t.clientY;
      if (pendingDown && behavior !== "held") {
        const moved = Math.hypot(t.clientX - downX, t.clientY - downY);
        if (moved > 8) {
          startDrag(downX, downY);
        }
      }
      if (behavior === "held") {
        e.preventDefault();
      }
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    const onMouseUp = () => {
      if (pendingDown && behavior !== "held") {
        pendingDown = false;
        suppressNextClick = true;
        showSpeech();
        return;
      }
      if (behavior !== "held") {
        return;
      }
      releaseDrag();
    };
    window.addEventListener("mouseup", onMouseUp);

    const onTouchEnd = () => {
      if (pendingDown && behavior !== "held") {
        pendingDown = false;
        showSpeech();
        return;
      }
      if (behavior !== "held") {
        return;
      }
      releaseDrag();
    };
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    const onCanvasDown = (e: MouseEvent) => {
      if (
        behavior === "hidden" ||
        behavior === "entering" ||
        behavior === "exiting" ||
        behavior === "falling"
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      pendingDown = true;
      downX = e.clientX;
      downY = e.clientY;
    };
    el.addEventListener("mousedown", onCanvasDown);

    const onCanvasTouchStart = (e: TouchEvent) => {
      if (
        behavior === "hidden" ||
        behavior === "entering" ||
        behavior === "exiting" ||
        behavior === "falling"
      ) {
        return;
      }
      const t = e.touches[0];
      if (!t) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      pendingDown = true;
      downX = t.clientX;
      downY = t.clientY;
    };
    el.addEventListener("touchstart", onCanvasTouchStart, { passive: false });

    const onGrabFromToggle = (clientX: number, clientY: number) => {
      const anchor = getAnchorX?.() ?? window.innerWidth / 2;
      const cw = W * PX;
      const ch = H * PX;
      x = anchor - cw / 2;
      bottomY = 8;
      canvasOpacity = 1;
      tomoStore.setOnScreen(true);
      dragOffsetX = clientX - x;
      dragOffsetY = clientY - (window.innerHeight - bottomY - ch);
      mx = clientX;
      my = clientY;
      document.body.style.cursor = "grabbing";
      behavior = "held";
      behaviorT = 0;
      frame = 0;
      jumpY = 0;
      idleAccum = 0;
      speechVisible = false;
      if (speechEl) {
        speechEl.style.opacity = "0";
      }
    };
    tomoStore.setDragGrabHandler(onGrabFromToggle);

    const onClick = () => {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      if (
        behavior !== "startled" &&
        behavior !== "hidden" &&
        behavior !== "entering" &&
        behavior !== "exiting" &&
        behavior !== "held" &&
        behavior !== "falling"
      ) {
        behavior = "startled";
        behaviorT = 0;
        jumpY = -10;
        idleAccum = 0;
      }
    };
    window.addEventListener("click", onClick, { passive: true });

    const tick = (now: number) => {
      const dt = prev ? Math.min((now - prev) / 1000, 0.1) : 0;
      prev = now;
      behaviorT += dt;
      frameT += dt;
      colorT += dt;
      sessionT += dt;
      if (!color || colorT > 2) {
        color = getComputedStyle(el).color;
        bgColor = getComputedStyle(document.documentElement)
          .getPropertyValue("--background")
          .trim();
        colorT = 0;
      }

      const cmd = cmdRef.current;
      if (cmd) {
        cmdRef.current = null;
        if (
          cmd === "enter" &&
          (behavior === "hidden" || behavior === "exiting")
        ) {
          behavior = "entering";
          behaviorT = 0;
          frameT = 0;
          frame = 0;
          bottomY = 8;
          canvasOpacity = 0;
          jumpY = 0;
          idleAccum = 0;
          tomoStore.setOnScreen(true);
          const anchor = getAnchorX?.() ?? window.innerWidth / 2;
          x = anchor - (W * PX) / 2;
          dir = 1;
        } else if (
          cmd === "exit" &&
          behavior !== "hidden" &&
          behavior !== "exiting"
        ) {
          speechVisible = false;
          speechEl.style.opacity = "0";
          if (behavior === "held" || behavior === "falling") {
            if (behavior === "held") {
              document.body.style.cursor = "";
              pendingDown = false;
              behavior = "falling";
              fallVelocity = 0;
              behaviorT = 0;
            }
            cmdRef.current = "exit";
          } else {
            behavior = "exiting";
            behaviorT = 0;
            frameT = 0;
            frame = 0;
            jumpY = -6;
            const anchorX = getAnchorX?.() ?? window.innerWidth / 2;
            dir = anchorX > x + (W * PX) / 2 ? 1 : -1;
          }
        }
      }

      if (jumpY < 0) {
        jumpY = Math.min(0, jumpY + 50 * dt);
      }

      const cw = W * PX;
      const ch = H * PX;
      const cx = x + cw / 2;
      const cy = window.innerHeight - bottomY - ch / 2;
      const dist = Math.hypot(mx - cx, my - cy);

      if (behavior === "hidden") {
        ctx.clearRect(0, 0, W * PX + PAD * 2, H * PX + PAD * 2);
        el.style.opacity = "0";
        raf = requestAnimationFrame(tick);
        return;
      }

      if (behavior === "entering") {
        canvasOpacity = Math.min(1, behaviorT / 0.15);

        if (behaviorT > 0.4) {
          const runT = behaviorT - 0.4;
          const speed = 70 * Math.max(0.4, 1 - runT * 0.8);
          x += speed * dir * dt;
          if (frameT > 0.1) {
            frame = (frame + 1) % 4;
            frameT = 0;
          }
        }

        if (behaviorT > 1.6) {
          behavior = reduced ? "idle" : "walk";
          behaviorT = 0;
          frame = 0;
          canvasOpacity = 1;
          nextSwitch = 3 + Math.random() * 4;
        }
      } else if (behavior === "exiting") {
        const anchorX = getAnchorX?.() ?? window.innerWidth / 2;
        const target = anchorX - cw / 2;
        const distToTarget = Math.abs(x - target);

        if (distToTarget > 4) {
          dir = target > x ? 1 : -1;
          x += Math.min(distToTarget, 80 * dt) * dir;
          if (frameT > 0.1) {
            frame = (frame + 1) % 4;
            frameT = 0;
          }
        } else {
          behavior = "hidden";
          canvasOpacity = 0;
          tomoStore.setOnScreen(false);
          saveState();
          ctx.clearRect(0, 0, W * PX + PAD * 2, H * PX + PAD * 2);
          el.style.opacity = "0";
          raf = requestAnimationFrame(tick);
          return;
        }
      } else if (!reduced) {
        switch (behavior) {
          case "walk": {
            idleAccum += dt;
            x += 30 * dir * dt;
            const lo = 16;
            const hi = window.innerWidth - cw - 16;
            if (x >= hi) {
              x = hi;
              dir = -1;
            }
            if (x <= lo) {
              x = lo;
              dir = 1;
            }

            if (frameT > 0.15) {
              frame = (frame + 1) % 4;
              frameT = 0;
            }

            if (dist < 90) {
              behavior = "look";
              behaviorT = 0;
              dir = mx > cx ? 1 : -1;
            } else if (behaviorT > nextSwitch) {
              behavior = "idle";
              behaviorT = 0;
              frame = 0;
              nextSwitch = 2 + Math.random() * 3;
            }
            break;
          }
          case "idle": {
            idleAccum += dt;
            if (frameT > 0.6) {
              frame = frame === 0 ? 1 : 0;
              frameT = 0;
            }

            if (dist < 90) {
              behavior = "look";
              behaviorT = 0;
              nextSwitch = 2 + Math.random() * 2;
              dir = mx > cx ? 1 : -1;
              idleAccum = 0;
            } else if (idleAccum > 10) {
              behavior = "sit";
              behaviorT = 0;
              frame = 0;
            } else if (behaviorT > nextSwitch) {
              behavior = "walk";
              behaviorT = 0;
              frame = 0;
              nextSwitch = 6 + Math.random() * 8;
              if (Math.random() > 0.5) {
                dir *= -1;
              }
            }
            break;
          }
          case "look": {
            idleAccum = 0;
            if (Math.abs(mx - cx) > 30) {
              dir = mx > cx ? 1 : -1;
            }
            if (dist > 160) {
              behavior = "walk";
              behaviorT = 0;
              frame = 0;
              nextSwitch = 6 + Math.random() * 8;
              dir = mx > cx ? -1 : 1;
            }
            break;
          }
          case "sit": {
            if (dist < 120) {
              behavior = "startled";
              behaviorT = 0;
              jumpY = -6;
              idleAccum = 0;
            } else if (behaviorT > 6 + Math.random() * 4) {
              behavior = "sleep";
              behaviorT = 0;
              frame = 0;
            }
            break;
          }
          case "sleep": {
            if (frameT > 1.2) {
              frame = frame === 0 ? 1 : 0;
              frameT = 0;
            }
            if (dist < 120) {
              behavior = "startled";
              behaviorT = 0;
              jumpY = -10;
              idleAccum = 0;
            }
            break;
          }
          case "startled": {
            if (behaviorT > 0.4) {
              behavior = "walk";
              behaviorT = 0;
              frame = 0;
              idleAccum = 0;
              nextSwitch = 2 + Math.random() * 3;
            }
            break;
          }
          case "held": {
            const ch = H * PX;
            x = mx - dragOffsetX;
            bottomY = window.innerHeight - (my - dragOffsetY) - ch;
            if (frameT > 0.25) {
              frame = frame === 0 ? 1 : 0;
              frameT = 0;
            }
            break;
          }
          case "falling": {
            const dropDist = fallStartY - bottomY;
            if (!parachuteOpen && dropDist > 120) {
              parachuteOpen = true;
              fallVelocity = 60;
            }
            if (parachuteOpen) {
              fallVelocity = 60;
              x += Math.sin(behaviorT * 2.5) * 20 * dt;
            } else {
              fallVelocity += 1200 * dt;
            }
            bottomY -= fallVelocity * dt;
            if (bottomY <= 8) {
              bottomY = 8;
              behavior = "startled";
              behaviorT = 0;
              jumpY = parachuteOpen ? -2 : -4;
              fallVelocity = 0;
              parachuteOpen = false;
            }
            break;
          }
          default:
            break;
        }
      } else if (frameT > 0.8) {
        frame = frame === 0 ? 1 : 0;
        frameT = 0;
      }

      let sprite: string[];
      switch (behavior) {
        case "entering":
          sprite = behaviorT < 0.4 ? LOOK_UP : (WALK[frame % 4] ?? STAND_A);
          break;
        case "exiting":
          sprite = behaviorT < 0.15 ? STARTLED : (WALK[frame % 4] ?? STAND_A);
          break;
        case "walk":
          sprite = WALK[frame % 4] ?? STAND_A;
          break;
        case "idle":
          sprite = frame === 0 ? STAND_A : STAND_B;
          break;
        case "look":
          sprite = LOOK_UP;
          break;
        case "sit":
          sprite = SIT;
          break;
        case "sleep":
          sprite = frame === 0 ? SLEEP_A : SLEEP_B;
          break;
        case "startled":
          sprite = STARTLED;
          break;
        case "held":
          sprite = frame === 0 ? HELD_A : HELD_B;
          break;
        case "falling":
          sprite = parachuteOpen ? PARACHUTE : STARTLED;
          break;
        default:
          sprite = STAND_A;
          break;
      }

      if (speechVisible) {
        speechT += dt;
        const fadeIn = 0.15;
        const stay = 2.5;
        const fadeOut = 0.3;
        const total = fadeIn + stay + fadeOut;

        if (speechT >= total) {
          speechVisible = false;
          speechEl.style.opacity = "0";
        } else {
          let sOp: number;
          if (speechT < fadeIn) {
            sOp = speechT / fadeIn;
          } else if (speechT < fadeIn + stay) {
            sOp = 1;
          } else {
            sOp = 1 - (speechT - fadeIn - stay) / fadeOut;
          }
          speechEl.textContent = speechText;
          speechEl.style.opacity = String(sOp);
          speechEl.style.left = `${Math.round(x + cw / 2)}px`;
          speechEl.style.bottom = `${Math.round(bottomY + ch + 6)}px`;
          speechEl.style.backgroundColor = color;
          speechEl.style.color = bgColor;
        }
      }

      paint(ctx, sprite, color);
      el.style.left = `${Math.round(x - PAD)}px`;
      el.style.bottom = `${Math.round(bottomY - PAD)}px`;
      el.style.opacity = String(canvasOpacity);
      el.style.transform = `translateY(${jumpY}px)${dir < 0 ? " scaleX(-1)" : ""}`;

      const inTransition =
        behavior === "entering" ||
        behavior === "exiting" ||
        behavior === "falling";
      el.style.pointerEvents = inTransition ? "none" : "auto";
      if (behavior === "held") {
        el.style.cursor = "grabbing";
      } else if (inTransition) {
        el.style.cursor = "default";
      } else {
        el.style.cursor = "grab";
      }

      saveT += dt;
      if (saveT > 0.5) {
        saveT = 0;
        saveState();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      saveState();
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("click", onClick);
      el.removeEventListener("mousedown", onCanvasDown);
      el.removeEventListener("touchstart", onCanvasTouchStart);
      tomoStore.setDragGrabHandler(null);
    };
  }, [getAnchorX]);

  return (
    <>
      <canvas
        className="text-muted-foreground"
        height={H * PX + PAD * 2}
        ref={ref}
        style={{
          position: "fixed",
          bottom: 8,
          left: 0,
          opacity: 0,
          imageRendering: "pixelated",
          zIndex: 50,
        }}
        width={W * PX + PAD * 2}
      />
      <div
        ref={speechRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 50,
          transform: "translateX(-50%)",
          fontSize: "10px",
          lineHeight: 1.2,
          padding: "2px 6px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          fontFamily: "monospace",
        }}
      />
    </>
  );
}
