import * as THREE from "three";

export const QUEST_MODEL_BASE_PATH = "/models/meta-quest3s/";
export const QUEST_MODEL_FILE = "Quest3S_A11yway_PBR.glb";
export const QUEST_MODEL_SOURCE = `${QUEST_MODEL_BASE_PATH}${QUEST_MODEL_FILE}`;
export const QUEST_MOTION_DURATION_MS = 4_600;

function easeInOut(value: number): number {
  return value * value * (3 - 2 * value);
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function rangeProgress(value: number, start: number, end: number): number {
  return clamp01((value - start) / (end - start));
}

export function createQuestLoadingManager(): THREE.LoadingManager {
  return new THREE.LoadingManager();
}

function disposeMaterial(material: THREE.Material, disposedTextures: Set<THREE.Texture>): void {
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture && !disposedTextures.has(value)) {
      disposedTextures.add(value);
      value.dispose();
    }
  }
  material.dispose();
}

export function disposeObject(object: THREE.Object3D): void {
  const disposedTextures = new Set<THREE.Texture>();
  object.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry.dispose();
      if (Array.isArray(node.material)) {
        for (const material of node.material) {
          disposeMaterial(material, disposedTextures);
        }
        return;
      }
      disposeMaterial(node.material, disposedTextures);
    }
  });
}

export function normalizeQuestModel(object: THREE.Object3D): void {
  const bounds = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  const maxDimension = Math.max(size.x, size.y, size.z);
  if (maxDimension <= 0) {
    throw new Error("Quest model has no measurable bounds.");
  }
  const scale = 3.86 / maxDimension;
  object.scale.setScalar(scale);
  object.position.copy(center).multiplyScalar(-scale);
}

export function configureQuestModel(object: THREE.Object3D): void {
  object.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) {
      return;
    }
    node.frustumCulled = false;
    node.geometry.computeVertexNormals();
  });
}

export function syncQuestHeroMotion(modelGroup: THREE.Group, time: number): void {
  const cycle = (time % QUEST_MOTION_DURATION_MS) / QUEST_MOTION_DURATION_MS;
  const reveal = cycle < 0.82 ? easeInOut(rangeProgress(cycle, 0.04, 0.66)) : 1 - easeInOut(rangeProgress(cycle, 0.9, 1));
  const floatY = Math.sin(cycle * Math.PI * 2) * 0.014;

  modelGroup.rotation.set(-0.085 + reveal * 0.07, 0.74 - reveal * 0.74, 0.03 - reveal * 0.028);
  modelGroup.position.set(0.18 - reveal * 0.18, -0.1 + floatY, -0.2 + reveal * 0.12);
  modelGroup.scale.setScalar(0.72 + reveal * 0.18);
}
