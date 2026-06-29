import * as THREE from "three";

export const QUEST_MODEL_BASE_PATH = "/models/meta-quest3s/";
export const QUEST_MODEL_FILE = "Quest3S_A11yway_PBR.glb";
export const QUEST_MODEL_SOURCE = `${QUEST_MODEL_BASE_PATH}${QUEST_MODEL_FILE}`;
export const QUEST_UI_PANEL_TEXTURE_FILE = "a11yway-ui-panel.png";
export const QUEST_UI_PANEL_TEXTURE_SOURCE = `${QUEST_MODEL_BASE_PATH}${QUEST_UI_PANEL_TEXTURE_FILE}`;
export const QUEST_MOTION_DURATION_MS = 4_600;

const QUEST_UI_PANEL_NODE = "A11yway_UI_Panel";

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

function disposeObjectMaterial(material: THREE.Material | THREE.Material[], disposedTextures: Set<THREE.Texture>): void {
  if (Array.isArray(material)) {
    for (const item of material) {
      disposeMaterial(item, disposedTextures);
    }
    return;
  }
  disposeMaterial(material, disposedTextures);
}

export function disposeObject(object: THREE.Object3D): void {
  const disposedTextures = new Set<THREE.Texture>();
  object.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry.dispose();
      disposeObjectMaterial(node.material, disposedTextures);
      return;
    }
    if (node instanceof THREE.Line) {
      node.geometry.dispose();
      disposeObjectMaterial(node.material, disposedTextures);
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

export function configureQuestModel(object: THREE.Object3D, uiPanelTexture: THREE.Texture | null): void {
  object.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) {
      return;
    }
    node.frustumCulled = false;
    node.geometry.computeVertexNormals();
    if (node.name === QUEST_UI_PANEL_NODE) {
      node.renderOrder = 12;
      if (uiPanelTexture !== null) {
        disposeObjectMaterial(node.material, new Set<THREE.Texture>());
        node.material = new THREE.MeshPhysicalMaterial({
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          map: uiPanelTexture,
          metalness: 0.08,
          roughness: 0.1,
          side: THREE.DoubleSide,
          toneMapped: true,
        });
      }
    }
  });
}

export function syncQuestHeroMotion(modelGroup: THREE.Group, time: number): void {
  const progress = clamp01(time / QUEST_MOTION_DURATION_MS);
  const rotationProgress = easeInOut(rangeProgress(progress, 0.075, 0.31));
  const approachProgress = easeInOut(rangeProgress(progress, 0.1, 0.38));
  const settleLift = Math.sin(progress * Math.PI) * 0.006;

  modelGroup.rotation.set(
    -0.12 - rotationProgress * 0.105,
    0.82 - rotationProgress * 0.16,
    0.03 - rotationProgress * 0.014,
  );
  modelGroup.position.set(
    0.02 - rotationProgress * 0.25,
    -0.49 + approachProgress * 0.008 + settleLift,
    -0.22 + approachProgress * 0.06,
  );
  const finalScale = 0.58 + approachProgress * 0.205;
  modelGroup.scale.set(finalScale * 0.93, finalScale * 1.06, finalScale);
}
