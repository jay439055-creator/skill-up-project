import { useEffect } from "react";

import {
  getM4ItemOffsetY,
  getM4ItemTilt,
  getM4WheelOffsetY,
  getM4WheelRotation,
  getM4WheelWidth,
  M4_SCROLL_DISTANCE,
} from "./bpcoBusinessMotion";
import { assets } from "./bpcoContent";
import { getProjectDescriptionText } from "./bpcoProjectDescriptions";
import { getProjectDiceWrapperTransform, getSourceWideScaleOutProgress } from "./bpcoProjectDiceMotion";
import {
  getSourceM2HorizontalDistance,
  getSourceM2HorizontalRatio,
  getSourceM2PinnedTravel,
  getSourceM2Start,
  getSourceProjectStart,
  SOURCE_HORIZONTAL_END_PADDING,
} from "./bpcoScrollMetrics";

const clamp = (value: number, min = 0, max = 1): number => Math.min(Math.max(value, min), max);
const PROJECT_SCROLL_DISTANCE = 9312;
const PROJECT_VISIBLE_HEIGHT = 5344;
const PROJECT_DICE_VISIBLE_LEAD = 3000;
const PROJECT_DICE_CARD_LEAD = 3300;
const PROJECT_DICE_WIDE_CARD_DURATION = 400;
const PROJECT_TITLE_SPLIT_START = 3050;
const PROJECT_TITLE_SPLIT_DISTANCE = 465;
const PROJECT_DICE_DESC_START = 3570;
const INTRO_CUE_REVEAL_DELAY_MS = 2000;
const INTRO_CAPTION_REVEAL_GAP_MS = 600;
const PROJECT_TV_OVERLAY_FLIP_THRESHOLD = 0.45;
const PROJECT_TV_OVERLAY_FLIP_DISTANCE = 0.7;
const ULTRAWIDE_DIM_REFERENCE_WIDTH = 1970;
const ULTRAWIDE_DIM_TARGET_WIDTH = 2048;
const ULTRAWIDE_CARD_DURATION = 306;
const ULTRAWIDE_PROJECT_TEXT_LEAD = 180;
const PROJECT_TV_WIDE_DIM_DISTANCE = 690;
const ULTRAWIDE_TV_NOISE_BRIGHTNESS = 1.1;
const PROJECT_TV_CANVAS_LATE_SAMPLE_START = 0.82;
const PROJECT_TV_CANVAS_WIDE_WIDTH = 100;
const PROJECT_TV_CANVAS_WIDE_X = 0;
const mix = (from: number, to: number, progress: number): number => from + (to - from) * progress;

function syncProjectDescriptionText(projectDistance: number): void {
  const projectDescription = document.querySelector<HTMLElement>(".m3_dice_section .pr_desc");
  if (projectDescription === null) {
    return;
  }

  const nextText = getProjectDescriptionText(projectDistance);
  if (projectDescription.dataset.currentText === nextText) {
    return;
  }

  projectDescription.dataset.currentText = nextText;
  projectDescription.textContent = nextText;
}

function getProjectTvOverlayFlipProgress(transform: string): number {
  const match = transform.match(/^matrix3d\((.+)\)$/);
  if (match === null) {
    return 0;
  }

  const matrixBody = match[1];
  if (matrixBody === undefined) {
    return 0;
  }

  const matrix = matrixBody.split(",").map((value) => Number(value.trim()));
  const xFlipLift = Math.abs(matrix[6] ?? 0);
  return clamp((xFlipLift - PROJECT_TV_OVERLAY_FLIP_THRESHOLD) / PROJECT_TV_OVERLAY_FLIP_DISTANCE);
}

export function useBpcoScrollMotion(): void {
  useEffect(() => {
    let frameId = 0;
    const root = document.documentElement;
    root.style.setProperty("--intro-cue-load-opacity", "0");
    root.style.setProperty("--intro-caption-load-opacity", "0");
    let introCaptionTimer = 0;
    const introCueTimer = window.setTimeout(() => {
      root.style.setProperty("--intro-cue-load-opacity", "1");
      introCaptionTimer = window.setTimeout(() => {
        root.style.setProperty("--intro-caption-load-opacity", "1");
      }, INTRO_CAPTION_REVEAL_GAP_MS);
    }, INTRO_CUE_REVEAL_DELAY_MS);

    const sync = () => {
      frameId = 0;
      const y = window.scrollY;
      const heroZoom = clamp(y / 900);
      const m2Start = getSourceM2Start();
      const heroProgress = clamp(y / m2Start);
      const introUiOpacity = y < 360 ? clamp(1 - y / 360) : 0;
      const projectStart = getSourceProjectStart();
      const projectProgress = clamp((y - projectStart) / PROJECT_SCROLL_DISTANCE);
      const projectDistance = y - projectStart;
      const projectDiceIntro = clamp((projectDistance - PROJECT_DICE_VISIBLE_LEAD) / 180);
      const projectDiceSourceZIndex = projectDistance >= 8000 ? "0" : "2";
      const wideViewportProgress = clamp((window.innerWidth - 1440) / (1970 - 1440));
      const ultrawideDimProgress = clamp(
        (window.innerWidth - ULTRAWIDE_DIM_REFERENCE_WIDTH) / (ULTRAWIDE_DIM_TARGET_WIDTH - ULTRAWIDE_DIM_REFERENCE_WIDTH),
      );
      const projectDescriptionDistance = projectDistance + ULTRAWIDE_PROJECT_TEXT_LEAD * ultrawideDimProgress;
      syncProjectDescriptionText(projectDescriptionDistance);
      const projectDiceWideCardDuration = 360 + (PROJECT_DICE_WIDE_CARD_DURATION - 360) * wideViewportProgress;
      const projectDiceCardDuration = mix(projectDiceWideCardDuration, ULTRAWIDE_CARD_DURATION, ultrawideDimProgress);
      const projectDiceCardProgress = clamp((projectDistance - PROJECT_DICE_CARD_LEAD) / projectDiceCardDuration);
      const projectDiceDepth = window.innerWidth * 0.2;
      const projectTimelineDistance = Math.max(y - m2Start, 0);
      const projectTimelineEnd = Math.max(getSourceM2PinnedTravel() + SOURCE_HORIZONTAL_END_PADDING, 1);
      const projectSourceScaleOutProgress = getSourceWideScaleOutProgress(projectTimelineDistance, projectTimelineEnd);
      const projectTitleSplitProgress = clamp((projectDistance - PROJECT_TITLE_SPLIT_START) / PROJECT_TITLE_SPLIT_DISTANCE);
      const projectTitleSettleProgress = clamp((projectDistance - PROJECT_TITLE_SPLIT_START - PROJECT_TITLE_SPLIT_DISTANCE) / 536);
      const projectSplitLeftX =
        window.innerWidth * 0.255 * (1 - projectTitleSplitProgress) +
        (window.innerWidth * 0.0455 * (1 - projectTitleSettleProgress) + 40 * projectTitleSettleProgress) *
          projectTitleSplitProgress;
      const projectSplitRightX =
        window.innerWidth * 0.72 * (1 - projectTitleSplitProgress) + (window.innerWidth - 249) * projectTitleSplitProgress;
      const m4Start = document.querySelector<HTMLElement>(".main.m4")?.offsetTop ?? projectStart + PROJECT_VISIBLE_HEIGHT;
      const m4MotionLead = mix(7, 54, wideViewportProgress);
      const m4MotionStart = m4Start - m4MotionLead;
      const m4Progress = clamp((y - m4MotionStart) / M4_SCROLL_DISTANCE);
      const m4Distance = Math.max(y - m4MotionStart, 0);
      const m4SectionDistance = Math.max(y - m4Start, 0);
      const m4CopySettleProgress = clamp(m4SectionDistance / 672) * (1 - wideViewportProgress);
      const projectDiceWrapperTransform = getProjectDiceWrapperTransform(
        projectDistance,
        projectDiceDepth,
        window.innerWidth,
        y >= m4Start ? m4Distance : -1,
        projectTimelineDistance,
        projectTimelineEnd,
      );
      const projectTvOverlayFlipProgress = getProjectTvOverlayFlipProgress(projectDiceWrapperTransform);
      const projectDiceSecondaryFaceOpacity = 1 - clamp((projectTvOverlayFlipProgress - 0.58) / 0.12);
      const projectTvCanvasSampleProgress =
        clamp(
          (projectTvOverlayFlipProgress - PROJECT_TV_CANVAS_LATE_SAMPLE_START) /
            (1 - PROJECT_TV_CANVAS_LATE_SAMPLE_START),
        ) *
        wideViewportProgress *
        (1 - ultrawideDimProgress);
      const projectTvCanvasWidth = mix(100, PROJECT_TV_CANVAS_WIDE_WIDTH, projectTvCanvasSampleProgress);
      const projectTvCanvasX = mix(0, PROJECT_TV_CANVAS_WIDE_X, projectTvCanvasSampleProgress);
      const projectDiceDescBaseOpacity = y >= m4Start ? 0 : clamp((projectDescriptionDistance - PROJECT_DICE_DESC_START) / 100);
      const m4PreludeLead = 1400 * wideViewportProgress;
      const m4PreludeOpacity =
        m4PreludeLead > 0
          ? y < m4Start
            ? clamp((y - (m4Start - m4PreludeLead)) / 200)
            : 1 - clamp((m4SectionDistance - 220) / 180)
          : 0;
      const projectTvPreludeClearProgress =
        m4PreludeLead > 0
          ? y < m4Start
            ? clamp((y - (m4Start - 260)) / 220)
            : 1 - clamp((m4SectionDistance - 220) / 220)
          : 0;
      const m4MediaProgress = 0;
      const m4LightProgress = clamp((m4Distance - 1650) / 322);
      const m4WheelOpacity = 1 - clamp((m4Distance - 1500) / 300);
      const tvDimStart = mix(mix(8384, 8680, wideViewportProgress), 8990, ultrawideDimProgress);
      const tvDimDistance = mix(mix(320, PROJECT_TV_WIDE_DIM_DISTANCE, wideViewportProgress), 500, ultrawideDimProgress);
      const tvDimMaxOpacity = 1;
      const projectDistanceDimOpacity = clamp((projectDistance - tvDimStart) / tvDimDistance) * tvDimMaxOpacity;
      const projectDiceTvPreDimOpacity = mix(
        projectDistanceDimOpacity,
        projectSourceScaleOutProgress,
        wideViewportProgress,
      );
      const projectTvNoiseBrightness = mix(1, ULTRAWIDE_TV_NOISE_BRIGHTNESS, ultrawideDimProgress * (1 - projectDiceTvPreDimOpacity));
      const projectTvTextOcclusion = clamp((projectDistance - tvDimStart) / 180);
      const projectDiceTvDimOpacity = y >= m4Start ? 1 - clamp((m4Distance - 2500) / 300) : projectDiceTvPreDimOpacity;
      const m4BackgroundOpacity = 1 - clamp((m4Distance - 1500) / 300);
      const m2Scroll = Math.min(Math.max(y - m2Start, 0), getSourceM2HorizontalDistance());
      const heroObject = document.getElementById("main_canvas");

      heroObject?.setAttribute("src", assets.heroModel);
      heroObject?.setAttribute("data-model-progress", clamp(y / 3000).toFixed(4));

      root.dataset.bpcoSection = "home";
      root.style.setProperty("--hero-progress", heroProgress.toFixed(4));
      root.style.setProperty("--hero-zoom", heroZoom.toFixed(4));
      root.style.setProperty("--intro-ui-opacity", introUiOpacity.toFixed(4));
      root.style.setProperty("--hero-object-opacity", "1");
      root.style.setProperty("--m2-row-x", `${(-m2Scroll * getSourceM2HorizontalRatio()).toFixed(2)}px`);
      root.style.setProperty("--project-progress", projectProgress.toFixed(4));
      root.style.setProperty("--m4-progress", m4Progress.toFixed(4));
      root.style.setProperty("--m4-wheel-rotation", `${getM4WheelRotation(y, m4MotionStart, window.innerWidth).toFixed(3)}deg`);
      root.style.setProperty("--m4-item-tilt", `${getM4ItemTilt(y, m4MotionStart).toFixed(3)}deg`);
      root.style.setProperty("--m4-wheel-width", `${getM4WheelWidth(y, m4MotionStart, window.innerWidth).toFixed(2)}px`);
      root.style.setProperty("--m4-wheel-offset-y", `${getM4WheelOffsetY(y, m4MotionStart).toFixed(2)}px`);
      root.style.setProperty("--m4-item-offset-y", `${getM4ItemOffsetY(y, m4MotionStart).toFixed(2)}px`);
      root.style.setProperty("--m4-title-offset-y", `${(-1 * m4CopySettleProgress).toFixed(2)}px`);
      root.style.setProperty("--m4-desc-offset-y", `${(-1 * m4CopySettleProgress).toFixed(2)}px`);
      root.style.setProperty("--m4-prelude-opacity", m4PreludeOpacity.toFixed(4));
      root.style.setProperty("--m4-media-progress", m4MediaProgress.toFixed(4));
      root.style.setProperty("--m4-light-progress", m4LightProgress.toFixed(4));
      root.style.setProperty("--m4-wheel-opacity", m4WheelOpacity.toFixed(4));
      root.style.setProperty("--m4-wheel-prelude-focus", projectTvPreludeClearProgress.toFixed(4));
      root.style.setProperty("--m4-background-opacity", m4BackgroundOpacity.toFixed(4));
      root.style.setProperty("--m4-business-opacity", (1 - clamp((m4Distance - 2500) / 300)).toFixed(4));
      root.style.setProperty("--project-dice-opacity", "1");
      root.style.setProperty("--project-dice-card-progress", projectDiceCardProgress.toFixed(4));
      root.style.setProperty("--project-dice-secondary-face-opacity", projectDiceSecondaryFaceOpacity.toFixed(4));
      root.style.setProperty("--project-dice-z-index", projectDiceSourceZIndex);
      root.style.setProperty("--project-dice-label-opacity", "0");
      root.style.setProperty("--project-dice-tv-dim-opacity", projectDiceTvDimOpacity.toFixed(4));
      root.style.setProperty("--project-tv-noise-brightness", projectTvNoiseBrightness.toFixed(3));
      root.style.setProperty("--project-tv-canvas-width", `${projectTvCanvasWidth.toFixed(3)}%`);
      root.style.setProperty("--project-tv-canvas-x", `${projectTvCanvasX.toFixed(3)}%`);
      root.style.setProperty("--project-dice-wrapper-transform", projectDiceWrapperTransform);
      root.style.setProperty("--project-title-split-opacity", y >= m4Start ? "0" : projectDiceIntro.toFixed(4));
      root.style.setProperty("--project-title-split-left-x", `${projectSplitLeftX.toFixed(2)}px`);
      root.style.setProperty("--project-title-split-right-x", `${projectSplitRightX.toFixed(2)}px`);
      root.style.setProperty("--project-list-info-opacity", projectProgress > 0.7 ? clamp((projectProgress - 0.7) / 0.06).toFixed(4) : "0");

      const tvBackFace = document.querySelector<HTMLElement>(".m3_dice_section .dice_item:nth-child(5)");
      const frontFace = document.querySelector<HTMLElement>(".m3_dice_section .dice_item:nth-child(1)");
      let projectTvOverlayOpacity = 0;
      if (tvBackFace !== null && frontFace !== null) {
        const tvRect = tvBackFace.getBoundingClientRect();
        const frontRect = frontFace.getBoundingClientRect();
        const sideBleed = Math.min(window.innerWidth * 0.03, tvRect.width * 0.08);
        const projectedLeft = tvRect.left - sideBleed;
        const projectedTop = Math.max(0, Math.min(window.innerHeight, frontRect.bottom - Math.min(tvRect.height * 0.08, 12)));
        const projectedWidth = Math.max(1, tvRect.width + sideBleed * 2);
        const projectedHeight = Math.max(1, Math.min(window.innerHeight, tvRect.height * 1.24));
        const overlayFullscreenProgress = clamp((projectTvOverlayFlipProgress - 0.18) / 0.82);

        root.style.setProperty("--project-tv-overlay-left", `${mix(projectedLeft, 0, overlayFullscreenProgress).toFixed(2)}px`);
        root.style.setProperty("--project-tv-overlay-top", `${mix(projectedTop, 0, overlayFullscreenProgress).toFixed(2)}px`);
        root.style.setProperty(
          "--project-tv-overlay-width",
          `${mix(projectedWidth, window.innerWidth, overlayFullscreenProgress).toFixed(2)}px`,
        );
        root.style.setProperty(
          "--project-tv-overlay-height",
          `${mix(projectedHeight, window.innerHeight, overlayFullscreenProgress).toFixed(2)}px`,
        );
        root.style.setProperty("--project-tv-noise-left", `${mix(projectedLeft, tvRect.left, overlayFullscreenProgress).toFixed(2)}px`);
        root.style.setProperty("--project-tv-noise-top", `${mix(projectedTop, 0, overlayFullscreenProgress).toFixed(2)}px`);
        root.style.setProperty(
          "--project-tv-noise-width",
          `${mix(projectedWidth, tvRect.width, overlayFullscreenProgress).toFixed(2)}px`,
        );
        root.style.setProperty(
          "--project-tv-noise-height",
          `${mix(projectedHeight, tvRect.height, overlayFullscreenProgress).toFixed(2)}px`,
        );
        root.style.setProperty(
          "--project-tv-overlay-clip",
          `polygon(0% 0%, 100% 0%, ${(88 + overlayFullscreenProgress * 12).toFixed(2)}% 100%, ${(
            12 -
            overlayFullscreenProgress * 12
          ).toFixed(2)}% 100%)`,
        );
        root.style.setProperty("--project-tv-overlay-opacity", projectTvOverlayOpacity.toFixed(4));
        root.style.setProperty("--project-tv-overlay-brightness", mix(0.24, 0.42, wideViewportProgress).toFixed(3));
      } else {
        root.style.setProperty("--project-tv-overlay-opacity", "0");
      }
      root.style.setProperty(
        "--project-dice-desc-opacity",
        (projectDiceDescBaseOpacity * (1 - Math.max(projectTvOverlayOpacity, projectTvTextOcclusion))).toFixed(4),
      );
    };

    const requestSync = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(sync);
      }
    };

    sync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      window.clearTimeout(introCueTimer);
      window.clearTimeout(introCaptionTimer);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);
}
