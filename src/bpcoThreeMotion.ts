import * as THREE from "three";

export const HERO_SCROLL_DISTANCE = 3000;
export const SECONDARY_CHARACTER_SRC = "https://www.bpco.kr/three/model/t_0.glb";
export const AUXILIARY_CHARACTER_SOURCES = [
  "https://www.bpco.kr/three/model/t_1.glb",
  "https://www.bpco.kr/three/model/t_2.glb",
  "https://www.bpco.kr/three/model/t_3.glb",
  "https://www.bpco.kr/three/model/t_4.glb",
] as const;
export const MODEL_SCALE = 23;
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
const AUXILIARY_CHARACTER_START = 1000;
const AUXILIARY_CHARACTER_DISTANCE = 1400;
const FINAL_CAMERA = { y: -370, z: 3 } as const;
const FINAL_MODEL = { x: -8, y: -194, z: -440, rotationY: -0.5 * Math.PI } as const;
export const INITIAL_CHARACTER_ROTATION = { x: 10, y: 8, z: -10 } as const;
export const INITIAL_AUXILIARY_CHARACTER_ROTATION = { x: 89.75, y: 0, z: 0.1 } as const;
const FINAL_CHARACTER_ROTATION = { x: 89.8, y: 0, z: 2.7 } as const;
const FINAL_AUXILIARY_CHARACTER_ROTATION = { x: 82.75, y: 6, z: 0.1 } as const;

const clamp = (value: number, min = 0, max = 1): number => Math.min(Math.max(value, min), max);
const mix = (from: number, to: number, progress: number): number => from + (to - from) * progress;
const easeOut = (progress: number): number => 1 - (1 - progress) * (1 - progress);
const easeOutCubic = (progress: number): number => 1 - (1 - progress) ** 3;

export type AuxiliaryCharacter = {
  readonly index: number;
  readonly mesh: THREE.Object3D;
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
): void {
  const progress = clamp(window.scrollY / HERO_SCROLL_DISTANCE);
  const timelineTime = progress * SOURCE_TIMELINE_DURATION;
  const modelProgress = clamp(timelineTime / SOURCE_MODEL_TWEEN_DURATION);
  const easedModelProgress = easeOut(modelProgress);
  const easedCameraProgress = easeOut(progress);
  const fadeProgress = clamp((timelineTime - SOURCE_MATERIAL_FADE_START) / SOURCE_MATERIAL_FADE_DURATION);
  const opacity = 1 - fadeProgress;

  container.dataset.modelProgress = progress.toFixed(4);
  container.dataset.modelTweenProgress = modelProgress.toFixed(4);
  model.position.set(
    mix(INITIAL_MODEL.x, FINAL_MODEL.x, easedModelProgress),
    INITIAL_MODEL.y,
    mix(INITIAL_MODEL.z, FINAL_MODEL.z, easedModelProgress),
  );
  model.rotation.y = mix(INITIAL_MODEL.rotationY, FINAL_MODEL.rotationY, easedModelProgress);
  camera.position.set(
    0,
    mix(INITIAL_CAMERA.y, FINAL_CAMERA.y, easedCameraProgress),
    mix(INITIAL_CAMERA.z, FINAL_CAMERA.z, easedCameraProgress),
  );
  setObjectOpacity(model, opacity);
}

export function syncSecondaryCharacterState(container: HTMLDivElement, character: THREE.Object3D): void {
  const progress = clamp((window.scrollY - SECONDARY_CHARACTER_START) / SECONDARY_CHARACTER_DISTANCE);
  const timelineTime = progress * SECONDARY_CHARACTER_TIMELINE_DURATION;
  const scaleProgress = easeOutCubic(clamp(timelineTime / SECONDARY_CHARACTER_SCALE_DURATION));
  const positionProgress = easeOut(clamp(timelineTime / SECONDARY_CHARACTER_POSITION_DURATION));
  const rotationProgress = easeOut(clamp(timelineTime / SECONDARY_CHARACTER_TIMELINE_DURATION));
  const targetScale = 0.23 * window.innerWidth;

  container.dataset.secondaryCharacterProgress = progress.toFixed(4);
  container.dataset.secondaryCharacterScaleProgress = scaleProgress.toFixed(4);
  character.scale.setScalar(mix(0, targetScale, scaleProgress));
  character.position.set(
    mix(0, -0.55 * window.innerWidth, positionProgress),
    mix(0, 0.15 * window.innerHeight, positionProgress),
    mix(0, 30, positionProgress),
  );
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
    character.mesh.scale.setScalar(mix(0, targetScale, scaleProgress));
    container.setAttribute(`data-auxiliary-character-${character.index}-scale-progress`, scaleProgress.toFixed(4));
    character.mesh.position.set(mix(0, target.x, motionProgress), mix(0, target.y, motionProgress), 0);
    character.mesh.rotation.set(
      mix(INITIAL_AUXILIARY_CHARACTER_ROTATION.x, FINAL_AUXILIARY_CHARACTER_ROTATION.x, motionProgress),
      mix(INITIAL_AUXILIARY_CHARACTER_ROTATION.y, FINAL_AUXILIARY_CHARACTER_ROTATION.y, motionProgress),
      INITIAL_AUXILIARY_CHARACTER_ROTATION.z,
    );
  }
  container.dataset.auxiliaryCharacterRotationX = characters[0]?.mesh.rotation.x.toFixed(4) ?? "";
}
