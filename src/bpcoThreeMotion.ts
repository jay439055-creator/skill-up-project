import * as THREE from "three";
import { getSourceHorizontalTarget } from "./bpcoHorizontalTargets";
import { getSourceM2HorizontalDistance, getSourceM2HorizontalRatio, getSourceM2Start } from "./bpcoScrollMetrics";

export const HERO_SCROLL_DISTANCE = 3000;
export const SECONDARY_CHARACTER_SRC = "https://www.bpco.kr/three/model/t_0.glb";
export const AUXILIARY_CHARACTER_SOURCES = [
  "https://www.bpco.kr/three/model/t_1.glb",
  "https://www.bpco.kr/three/model/t_2.glb",
  "https://www.bpco.kr/three/model/t_3.glb",
  "https://www.bpco.kr/three/model/t_4.glb",
] as const;
export const MODEL_SCALE = 23;
export const INTRO_TWEEN_DURATION_MS = 1_000;
export const PRE_INTRO_CAMERA = { y: -1, z: 26 } as const;
export const PRE_INTRO_MODEL = { x: 0, y: -200, z: -600, rotationY: 0 } as const;
export const INITIAL_CAMERA = { y: -5.5, z: 19 } as const;
export const INITIAL_MODEL = { x: 30, y: -194, z: -500, rotationY: -0.25 * Math.PI } as const;
export const LIGHT_COLOR = 0xffffff;

const SOURCE_TIMELINE_DURATION = 1.3;
const SOURCE_MODEL_TWEEN_DURATION = 1;
const SOURCE_MATERIAL_FADE_START = 1;
const SOURCE_MATERIAL_FADE_DURATION = 0.2;
const SECONDARY_CHARACTER_START = 1600;
const SECONDARY_CHARACTER_DISTANCE = 1700;
const SECONDARY_CHARACTER_TIMELINE_DURATION = 2;
const SECONDARY_CHARACTER_SCALE_DURATION = 1.5;
const SECONDARY_CHARACTER_POSITION_DURATION = 1.3;
const SECONDARY_CHARACTER_FINAL_MOVE_START = 1;
const SECONDARY_CHARACTER_FINAL_MOVE_DURATION = 0.7;
const AUXILIARY_CHARACTER_START = 1000;
const AUXILIARY_CHARACTER_DISTANCE = 1400;
const HORIZONTAL_TIMELINE_DURATION = 10;
const FINAL_CAMERA = { y: -370, z: 3 } as const;
const FINAL_MODEL = { x: -8, y: -194, z: -440, rotationY: -0.5 * Math.PI } as const;
export const INITIAL_CHARACTER_ROTATION = { x: 10, y: 8, z: -10 } as const;
export const INITIAL_AUXILIARY_CHARACTER_ROTATION = { x: 89.75, y: 0, z: 0.1 } as const;
const FINAL_CHARACTER_ROTATION = { x: 89.8, y: 0, z: 2.7 } as const;

const clamp = (value: number, min = 0, max = 1): number => Math.min(Math.max(value, min), max);
const mix = (from: number, to: number, progress: number): number => from + (to - from) * progress;
const easeOut = (progress: number): number => 1 - (1 - progress) * (1 - progress);

export type AuxiliaryCharacter = {
  readonly index: number;
  readonly mesh: THREE.Object3D;
  readonly sourceRotation: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
};

function setObjectOpacity(root: THREE.Object3D, opacity: number): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      material.transparent = true;
      material.opacity = opacity;
      material.needsUpdate = true;
    }
  });
}

function getSecondaryFinalTarget(targetScale: number): { readonly x: number; readonly y: number; readonly z: 0 } {
  const rs1 = document.querySelector(".rs1");
  const anchor = document.querySelector(".rs1 .main_title .tspan_w");
  if (rs1 === null || anchor === null) {
    return {
      x: 40 - 0.385 * window.innerWidth,
      y: 0.5 * window.innerHeight - 189 - 0.0805 * window.innerWidth,
      z: 0,
    };
  }

  const rs1Rect = rs1.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  return {
    x: -0.5 * window.innerWidth + anchorRect.left + 0.5 * targetScale,
    y: 0.5 * window.innerHeight - (anchorRect.top - rs1Rect.top + 0.35 * targetScale),
    z: 0,
  };
}

export function createOverlayCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    2 * Math.atan(window.innerHeight / 2 / 1300) * (180 / Math.PI),
    window.innerWidth / window.innerHeight,
    100,
    10_000,
  );
  camera.position.z = 1300;
  return camera;
}

export function updateOverlayCameraSize(camera: THREE.PerspectiveCamera, width: number, height: number): void {
  camera.fov = 2 * Math.atan(height / 2 / 1300) * (180 / Math.PI);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

export function syncHeroModelState(
  container: HTMLDivElement,
  camera: THREE.PerspectiveCamera,
  model: THREE.Object3D,
  introProgress = 1,
): void {
  const progress = clamp(window.scrollY / HERO_SCROLL_DISTANCE);
  const introPoseProgress = window.scrollY > 0 ? 1 : clamp(introProgress);
  const timelineTime = progress * SOURCE_TIMELINE_DURATION;
  const modelProgress = clamp(timelineTime / SOURCE_MODEL_TWEEN_DURATION);
  const easedModelProgress = easeOut(modelProgress);
  const easedCameraProgress = easeOut(progress);
  const fadeProgress = clamp((timelineTime - SOURCE_MATERIAL_FADE_START) / SOURCE_MATERIAL_FADE_DURATION);
  const opacity = 1 - easeOut(fadeProgress);
  const modelX = mix(PRE_INTRO_MODEL.x, mix(INITIAL_MODEL.x, FINAL_MODEL.x, easedModelProgress), introPoseProgress);
  const modelY = mix(PRE_INTRO_MODEL.y, INITIAL_MODEL.y, introPoseProgress);
  const modelZ = mix(PRE_INTRO_MODEL.z, mix(INITIAL_MODEL.z, FINAL_MODEL.z, easedModelProgress), introPoseProgress);
  const rotationY = mix(
    PRE_INTRO_MODEL.rotationY,
    mix(INITIAL_MODEL.rotationY, FINAL_MODEL.rotationY, easedModelProgress),
    introPoseProgress,
  );
  const cameraY = mix(PRE_INTRO_CAMERA.y, mix(INITIAL_CAMERA.y, FINAL_CAMERA.y, easedCameraProgress), introPoseProgress);
  const cameraZ = mix(PRE_INTRO_CAMERA.z, mix(INITIAL_CAMERA.z, FINAL_CAMERA.z, easedCameraProgress), introPoseProgress);

  container.dataset.modelIntroProgress = introPoseProgress.toFixed(4);
  container.dataset.modelProgress = progress.toFixed(4);
  container.dataset.modelTweenProgress = modelProgress.toFixed(4);
  container.dataset.modelOpacity = opacity.toFixed(4);
  container.dataset.modelX = modelX.toFixed(4);
  container.dataset.modelY = modelY.toFixed(4);
  container.dataset.modelZ = modelZ.toFixed(4);
  container.dataset.modelRotationY = rotationY.toFixed(4);
  container.dataset.cameraY = cameraY.toFixed(4);
  container.dataset.cameraZ = cameraZ.toFixed(4);
  model.position.set(modelX, modelY, modelZ);
  model.rotation.y = rotationY;
  camera.position.set(0, cameraY, cameraZ);
  setObjectOpacity(model, opacity);
}

export function syncSecondaryCharacterState(container: HTMLDivElement, character: THREE.Object3D): void {
  const progress = clamp((window.scrollY - SECONDARY_CHARACTER_START) / SECONDARY_CHARACTER_DISTANCE);
  const timelineTime = progress * SECONDARY_CHARACTER_TIMELINE_DURATION;
  const scaleProgress = easeOut(clamp(timelineTime / SECONDARY_CHARACTER_SCALE_DURATION));
  const positionProgress = easeOut(clamp(timelineTime / SECONDARY_CHARACTER_POSITION_DURATION));
  const finalPositionProgress = easeOut(
    clamp((timelineTime - SECONDARY_CHARACTER_FINAL_MOVE_START) / SECONDARY_CHARACTER_FINAL_MOVE_DURATION),
  );
  const rotationProgress = easeOut(clamp(timelineTime / SECONDARY_CHARACTER_TIMELINE_DURATION));
  const targetScale = 0.23 * window.innerWidth;
  const firstTarget = {
    x: -0.55 * window.innerWidth,
    y: 0.15 * window.innerHeight,
    z: 30,
  } as const;
  const finalTarget = getSecondaryFinalTarget(targetScale);
  const firstX = mix(0, firstTarget.x, positionProgress);
  const firstY = mix(0, firstTarget.y, positionProgress);
  const firstZ = mix(0, firstTarget.z, positionProgress);
  const m2Scroll = Math.min(Math.max(window.scrollY - getSourceM2Start(), 0), getSourceM2HorizontalDistance());
  const horizontalRowOffset = -m2Scroll * getSourceM2HorizontalRatio();
  const currentX = mix(firstX, finalTarget.x, finalPositionProgress) + horizontalRowOffset;
  const currentY = mix(firstY, finalTarget.y, finalPositionProgress);
  const currentZ = mix(firstZ, finalTarget.z, finalPositionProgress);

  container.dataset.secondaryCharacterProgress = progress.toFixed(4);
  container.dataset.secondaryCharacterScaleProgress = scaleProgress.toFixed(4);
  container.dataset.secondaryCharacterX = currentX.toFixed(4);
  container.dataset.secondaryCharacterY = currentY.toFixed(4);
  container.dataset.secondaryCharacterZ = currentZ.toFixed(4);
  character.scale.setScalar(mix(0, targetScale, scaleProgress));
  character.position.set(currentX, currentY, currentZ);
  character.rotation.set(
    mix(INITIAL_CHARACTER_ROTATION.x, FINAL_CHARACTER_ROTATION.x, rotationProgress),
    mix(INITIAL_CHARACTER_ROTATION.y, FINAL_CHARACTER_ROTATION.y, rotationProgress),
    mix(INITIAL_CHARACTER_ROTATION.z, FINAL_CHARACTER_ROTATION.z, rotationProgress),
  );
}

export function syncAuxiliaryCharacterStates(
  container: HTMLDivElement,
  characters: readonly AuxiliaryCharacter[],
): void {
  const progress = clamp((window.scrollY - AUXILIARY_CHARACTER_START) / AUXILIARY_CHARACTER_DISTANCE);
  const width = window.innerWidth;
  const height = window.innerHeight;
  const targets = [
    { x: 0.6 * width, y: 0.8 * height },
    { x: -0.6 * width, y: -0.7 * height },
    { x: -0.65 * width, y: 0.95 * height },
    { x: 0.65 * width, y: -0.7 * height },
  ] as const;

  container.dataset.auxiliaryCharacterProgress = progress.toFixed(4);
  for (const character of characters) {
    const target = targets[character.index];
    if (target === undefined) {
      continue;
    }

    const delay = 0.25 * character.index;
    const timelineTime = progress * (delay + 1);
    const scaleProgress = easeOut(clamp((timelineTime - delay) / 0.5));
    const motionProgress = easeOut(clamp(timelineTime - delay));
    const targetScale = (character.index === 0 || character.index === 2 ? 0.24 : 0.17) * width;
    const m2Progress = clamp((window.scrollY - getSourceM2Start()) / getSourceM2HorizontalDistance());
    const horizontalTime = m2Progress * HORIZONTAL_TIMELINE_DURATION;
    const horizontalStart = [0.6, 1.2, 3.4, 3.9][character.index];
    const horizontalOffset = horizontalStart === undefined ? undefined : horizontalTime - horizontalStart;
    const horizontalProgress = horizontalOffset === undefined ? undefined : easeOut(clamp(horizontalOffset));
    const horizontalTarget =
      horizontalOffset === undefined || m2Progress <= 0 ? undefined : getSourceHorizontalTarget(character.index, targetScale);
    const baseX = mix(0, target.x, motionProgress);
    const baseY = mix(0, target.y, motionProgress);
    const extraSign = character.index === 0 || character.index === 1 ? -1 : 1;
    const currentX =
      horizontalTarget === undefined || horizontalProgress === undefined
        ? baseX
        : horizontalTarget.x + extraSign * 0.2 * width * (1 - horizontalProgress);
    const currentY =
      horizontalTarget === undefined || horizontalProgress === undefined
        ? baseY
        : horizontalTarget.y + extraSign * 0.3 * width * (1 - horizontalProgress);
    const currentScale = mix(0, targetScale, scaleProgress);
    const visualScale = horizontalProgress === undefined ? currentScale : mix(currentScale, targetScale, horizontalProgress);
    character.mesh.scale.setScalar(visualScale);
    container.setAttribute(`data-auxiliary-character-${character.index}-scale-progress`, scaleProgress.toFixed(4));
    container.setAttribute(`data-auxiliary-character-${character.index}-x`, currentX.toFixed(4));
    container.setAttribute(`data-auxiliary-character-${character.index}-y`, currentY.toFixed(4));
    character.mesh.position.set(currentX, currentY, 0);
    const rotationProgress = easeOut(clamp(timelineTime - delay));
    const baseRotationX = mix(character.sourceRotation.x, character.sourceRotation.x - 7, rotationProgress);
    const baseRotationY = mix(character.sourceRotation.y, character.sourceRotation.y + 6, rotationProgress);
    const currentRotationX =
      horizontalProgress === undefined
        ? baseRotationX
        : mix(baseRotationX, character.sourceRotation.x, horizontalProgress);
    const currentRotationY =
      horizontalProgress === undefined
        ? baseRotationY
        : mix(baseRotationY, character.sourceRotation.y, horizontalProgress);
    container.setAttribute(`data-auxiliary-character-${character.index}-rotation-x`, currentRotationX.toFixed(4));
    container.setAttribute(`data-auxiliary-character-${character.index}-rotation-y`, currentRotationY.toFixed(4));
    container.setAttribute(`data-auxiliary-character-${character.index}-rotation-z`, character.sourceRotation.z.toFixed(4));
    character.mesh.rotation.set(
      currentRotationX,
      currentRotationY,
      character.sourceRotation.z,
    );
  }
  container.dataset.auxiliaryCharacterRotationX = characters[0]?.mesh.rotation.x.toFixed(4) ?? "";
}
