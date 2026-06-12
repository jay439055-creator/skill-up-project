import { useEffect, useRef, useState } from "react";

const INTRO_MS = 3200;
const DPR_LIMIT = 2;
const POINTER_SETTLE_MS = 1900;
const GRID_COLUMNS = 78, GRID_ROWS = 48;
const DROP_START_PROGRESS = 0.58;
const DROP_IMPACT_PROGRESS = 0.88;
const RIPPLE_ORIGIN_Z = 0.43;

type Dot = {
  readonly x: number;
  readonly z: number;
  readonly seed: number;
};

type PointerState = {
  active: boolean;
  x: number;
  y: number;
};

type Ripple = {
  readonly startedAt: number;
  readonly strength: number;
  readonly x: number;
  readonly z: number;
};

type StageMetrics = {
  readonly centerX: number;
  readonly floorY: number;
  readonly height: number;
  readonly horizonY: number;
  readonly width: number;
};

type Projection = {
  readonly alpha: number;
  readonly radius: number;
  readonly x: number;
  readonly y: number;
};

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

function createDots(): Dot[] {
  const dots: Dot[] = [];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    const z = (row + 0.5) / GRID_ROWS;
    const rowWidth = Math.sqrt(Math.max(1 - (z * 2 - 1) ** 2, 0));
    const columnsInRow = Math.max(5, Math.round(GRID_COLUMNS * rowWidth));
    for (let column = 0; column < columnsInRow; column += 1) {
      dots.push({
        x: (column / (columnsInRow - 1) * 2 - 1) * rowWidth,
        z,
        seed: row * GRID_COLUMNS + column,
      });
    }
  }

  return dots;
}

function resizeCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): StageMetrics {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
  const width = Math.max(Math.round(rect.width), 1);
  const height = Math.max(Math.round(rect.height), 1);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  return {
    centerX: width / 2,
    floorY: height * 1.2,
    height,
    horizonY: height * 0.29,
    width,
  };
}

function projectDot(dot: Dot, metrics: StageMetrics, lift: number, shimmer: number): Projection {
  const depth = dot.z ** (1.88 + clamp01((720 - metrics.width) / 330) * 0.38);
  const scale = 0.12 + dot.z * 1.48;
  const x = metrics.centerX + dot.x * Math.max(metrics.width, 760) * 0.53 * scale;
  const y = metrics.horizonY + depth * (metrics.floorY - metrics.horizonY) - lift * (0.28 + dot.z) + clamp01((720 - metrics.width) / 330) * (dot.x ** 2 * 84 + Math.sin(dot.seed * 91.7) * 7) * (0.35 + dot.z);
  const radius = (0.34 + dot.z * 1.9 + shimmer * 1.55) * (1 - clamp01((720 - metrics.width) / 330) * 0.32);
  const alpha = clamp01((0.12 + dot.z * 0.6 + shimmer * 0.76) * Math.sin(Math.PI * dot.z) ** 0.44);

  return { alpha, radius, x, y };
}

function rippleAmount(dot: Dot, ripple: Ripple, now: number): number {
  const age = Math.max(now - ripple.startedAt, 0);
  const radius = age / 1360;
  const distance = Math.hypot((dot.x - ripple.x) * 0.78, dot.z - ripple.z);
  const ring = Math.exp(-Math.abs(distance - radius) * 25);
  const fade = clamp01(1 - age / 2700);

  return ring * fade * ripple.strength;
}

function pointerToWorld(pointer: PointerState, metrics: StageMetrics): { readonly x: number; readonly z: number } {
  const yProgress = clamp01((pointer.y - metrics.horizonY) / Math.max(metrics.floorY - metrics.horizonY, 1));
  const z = yProgress ** 0.54;
  const scale = 0.12 + z * 1.48;
  const x = Math.min(Math.max((pointer.x - metrics.centerX) / (Math.max(metrics.width, 760) * 0.53 * scale), -1), 1);

  return { x, z };
}

export function RippleMotionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [motionState, setMotionState] = useState<"intro" | "interactive">("intro");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (context === null) {
      return undefined;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = createDots();
    const pointer: PointerState = { active: false, x: 0, y: 0 };
    const ripples: Ripple[] = [];
    let frameId = 0;
    let introTimerId = 0;
    let lastInteractionAt = 0, lastPointerRippleAt = 0, fieldFade = 0;
    let startedAt = performance.now();
    let metrics = resizeCanvas(canvas, context);

    const addRipple = (ripple: Ripple) => {
      ripples.push(ripple);
      while (ripples.length > 10) {
        ripples.shift();
      }
    };

    const markInteractive = () => {
      canvas.dataset.motionState = "interactive";
      setMotionState("interactive");
    };

    const syncPointerDataset = () => {
      canvas.dataset.pointerActive = pointer.active ? "true" : "false";
      canvas.dataset.pointerX = Math.round(pointer.x).toString();
      canvas.dataset.pointerY = Math.round(pointer.y).toString();
    };

    const drawStage = () => {
      const veil = context.createLinearGradient(0, 0, metrics.width, metrics.height);
      veil.addColorStop(0, "rgb(255 255 255 / 0.04)");
      veil.addColorStop(0.46, "rgb(221 223 249 / 0.06)");
      veil.addColorStop(1, "rgb(105 132 205 / 0.13)");
      context.fillStyle = veil;
      context.fillRect(0, 0, metrics.width, metrics.height);
    };

    const syncIntroDataset = () => {
      const origin = projectDot({ x: 0, z: RIPPLE_ORIGIN_Z, seed: 0 }, metrics, 0, 0);
      canvas.dataset.dropImpactProgress = DROP_IMPACT_PROGRESS.toFixed(2);
      canvas.dataset.dropImpactY = Math.round(origin.y).toString();
      canvas.dataset.rippleOriginY = Math.round(origin.y).toString();
    };

    const drawDrop = (introProgress: number) => {
      if (introProgress <= DROP_START_PROGRESS || introProgress >= DROP_IMPACT_PROGRESS) {
        return;
      }

      const origin = projectDot({ x: 0, z: RIPPLE_ORIGIN_Z, seed: 0 }, metrics, 0, 0);
      const fall = clamp01((introProgress - DROP_START_PROGRESS) / (DROP_IMPACT_PROGRESS - DROP_START_PROGRESS));
      const x = metrics.centerX;
      const y = metrics.height * 0.08 + fall * (origin.y - metrics.height * 0.08);
      const radius = 3.4 + fall * 3.2;
      const drop = context.createRadialGradient(x - radius * 0.3, y - radius * 0.6, 1, x, y, radius * 2.3);
      drop.addColorStop(0, "rgb(246 252 255 / 0.95)");
      drop.addColorStop(1, "rgb(132 180 200 / 0)");
      context.fillStyle = drop;
      context.beginPath();
      context.ellipse(x, y, radius * 0.72, radius * 1.9, 0, 0, Math.PI * 2);
      context.fill();
    };

    const render = (now: number) => {
      frameId = 0;
      const elapsed = now - startedAt;
      const introProgress = reducedMotion ? 1 : clamp01(elapsed / INTRO_MS);
      const impactAt = startedAt + INTRO_MS * DROP_IMPACT_PROGRESS;

      if (introProgress >= 1 && canvas.dataset.motionState !== "interactive") {
        markInteractive();
      }

      context.clearRect(0, 0, metrics.width, metrics.height);
      drawStage();
      if (!reducedMotion && now >= impactAt && !ripples.some((ripple) => ripple.startedAt === impactAt)) {
        addRipple({ startedAt: impactAt, strength: 1.32, x: 0, z: RIPPLE_ORIGIN_Z });
      }

      const ripplesAlive = ripples.some((ripple) => now - ripple.startedAt < 2800), pointerAlive = pointer.active && now - lastInteractionAt < POINTER_SETTLE_MS;
      const activeField = introProgress < 1 ? 1 : Math.max(ripplesAlive ? 0.82 : 0, pointerAlive ? 1 : 0);
      fieldFade = activeField > fieldFade ? activeField : fieldFade * 0.94;
      context.globalCompositeOperation = "screen";
      for (const dot of dots) {
        const reveal = reducedMotion ? 1 : clamp01((introProgress - dot.z * 0.16) / 0.56);
        const wave = ripples.reduce((total, ripple) => total + rippleAmount(dot, ripple, now), 0);
        const glow = clamp01(Math.abs(wave) * 1.8);
        const dotAlpha = reveal * Math.max(fieldFade, glow);
        if (dotAlpha <= 0.01) continue;
        const drift = Math.sin(now / 780 + dot.seed * 0.19) * (0.7 + clamp01((720 - metrics.width) / 330) * 3.2) * dot.z;
        const projection = projectDot(dot, metrics, wave * 52 + drift, Math.abs(wave) * 1.55);
        context.globalAlpha = dotAlpha;
        context.fillStyle = `rgb(224 248 255 / ${clamp01(projection.alpha * (1 + glow * 0.8))})`;
        context.beginPath(); context.arc(projection.x, projection.y, projection.radius * (0.76 + glow * 0.72), 0, Math.PI * 2); context.fill();
      }

      context.globalAlpha = 1; drawDrop(introProgress);

      context.globalCompositeOperation = "source-over";
      if (introProgress < 1 || ripplesAlive || pointerAlive || fieldFade > 0.02) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      lastInteractionAt = performance.now();
      syncPointerDataset();
      if (canvas.dataset.motionState === "interactive" && lastInteractionAt - lastPointerRippleAt > 90) {
        addRipple({ ...pointerToWorld(pointer, metrics), startedAt: lastInteractionAt, strength: 0.82 });
        lastPointerRippleAt = lastInteractionAt;
      }
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      metrics = resizeCanvas(canvas, context);
      syncIntroDataset();
      startedAt = reducedMotion ? performance.now() - INTRO_MS : performance.now();
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    canvas.dataset.motionState = reducedMotion ? "interactive" : "intro";
    syncPointerDataset();
    syncIntroDataset();
    if (reducedMotion) {
      markInteractive();
    } else {
      introTimerId = window.setTimeout(markInteractive, INTRO_MS);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(introTimerId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="ripple_motion_canvas"
      data-motion-state={motionState}
      data-pointer-active="false"
      data-pointer-x="0"
      data-pointer-y="0"
      data-testid="ripple-motion-canvas"
      aria-hidden="true"
    />
  );
}
