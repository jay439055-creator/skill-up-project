import { getSourceM2HorizontalDistance, getSourceM2HorizontalRatio, getSourceM2Start } from "./bpcoScrollMetrics";

export type CharacterTarget = {
  readonly x: number;
  readonly y: number;
};

type SpanTarget = {
  readonly selector: string;
  readonly horizontalOffsetRatio: number;
  readonly verticalOffsetRatio: number;
  readonly verticalOffsetPx: number;
  readonly modelOriginOffsetXRatio?: number;
  readonly modelOriginOffsetYRatio?: number;
};

const SPAN_TARGETS: readonly SpanTarget[] = [
  {
    selector: ".rs2 .tspan_2",
    horizontalOffsetRatio: 0,
    verticalOffsetRatio: 0,
    verticalOffsetPx: -50,
    modelOriginOffsetXRatio: 0.16,
    modelOriginOffsetYRatio: 0.4,
  },
  { selector: ".rs2 .tspan_3", horizontalOffsetRatio: 0.54, verticalOffsetRatio: 0.18, verticalOffsetPx: 0 },
  {
    selector: ".rs3 .tspan_4",
    horizontalOffsetRatio: 0,
    verticalOffsetRatio: 0,
    verticalOffsetPx: -50,
    modelOriginOffsetXRatio: -0.24,
    modelOriginOffsetYRatio: -0.36,
  },
  {
    selector: ".rs3 .tspan_5",
    horizontalOffsetRatio: 0.54,
    verticalOffsetRatio: 0.18,
    verticalOffsetPx: 0,
  },
];

export function getSourceHorizontalTarget(index: number, targetScale: number): CharacterTarget | undefined {
  const target = SPAN_TARGETS[index];
  if (target === undefined) {
    return undefined;
  }

  const span = document.querySelector(target.selector);
  const m2 = document.querySelector(".main.m2");
  if (span === null || m2 === null) {
    return undefined;
  }

  const spanRect = span.getBoundingClientRect();
  const m2Rect = m2.getBoundingClientRect();
  const m2Scroll = Math.min(Math.max(window.scrollY - getSourceM2Start(), 0), getSourceM2HorizontalDistance());
  const rowShift = m2Scroll * getSourceM2HorizontalRatio();
  const currentRowX = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--m2-row-x"));
  const expectedRowX = -rowShift;
  const pendingRowX = Number.isFinite(currentRowX) ? expectedRowX - currentRowX : 0;
  const visibleSpanLeft = spanRect.left + pendingRowX;
  const visibleSpanTop = m2Rect.top > 0 ? spanRect.top - m2Rect.top : spanRect.top;
  const horizontalSpanOffset = target.horizontalOffsetRatio * targetScale;
  const verticalSpanOffset = target.verticalOffsetPx + target.verticalOffsetRatio * targetScale;

  return {
    x:
      visibleSpanLeft -
      window.innerWidth +
      horizontalSpanOffset +
      2.7 * targetScale +
      (target.modelOriginOffsetXRatio ?? 0) * targetScale,
    y:
      window.innerHeight / 2 -
      (visibleSpanTop + verticalSpanOffset + 0.55 * targetScale) +
      (target.modelOriginOffsetYRatio ?? 0) * targetScale,
  };
}
