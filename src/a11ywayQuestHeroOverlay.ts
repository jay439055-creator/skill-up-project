import * as THREE from "three";

export function createQuestFloorShadow(): THREE.Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("Unable to create Quest floor shadow texture.");
  }
  const gradient = context.createRadialGradient(256, 128, 18, 256, 128, 238);
  gradient.addColorStop(0, "rgba(55, 63, 78, 0.34)");
  gradient.addColorStop(0.48, "rgba(91, 103, 126, 0.16)");
  gradient.addColorStop(1, "rgba(91, 103, 126, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ depthWrite: false, map: texture, opacity: 0.84, transparent: true });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.45), material);
  shadow.position.set(0.06, -1.12, -0.5);
  return shadow;
}
