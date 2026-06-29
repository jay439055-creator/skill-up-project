import { useEffect, useRef, type ReactElement } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createQuestFloorShadow } from "./a11ywayQuestHeroOverlay";
import {
  configureQuestModel,
  createQuestLoadingManager,
  disposeObject,
  normalizeQuestModel,
  QUEST_MODEL_BASE_PATH,
  QUEST_MODEL_FILE,
  QUEST_MODEL_SOURCE,
  QUEST_MOTION_DURATION_MS,
  QUEST_UI_PANEL_TEXTURE_FILE,
  QUEST_UI_PANEL_TEXTURE_SOURCE,
  syncQuestHeroMotion,
} from "./a11ywayQuestHeroScene";

type A11ywayQuestHeroCanvasProps = {
  readonly onError?: () => void;
  readonly onReady?: () => void;
};

export function A11ywayQuestHeroCanvas({ onError, onReady }: A11ywayQuestHeroCanvasProps): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) {
      return undefined;
    }
    const hostElement = host;

    let disposed = false;
    let modelReady = false;
    let motionStartedAt: number | null = null;
    let lastMotionTime = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.18, 6.7);
    camera.lookAt(0, -0.05, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    hostElement.append(renderer.domElement);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmremGenerator.fromScene(environment).texture;
    scene.environment = environmentTexture;

    const modelGroup = new THREE.Group();
    const floorShadow = createQuestFloorShadow();
    floorShadow.renderOrder = 1;
    scene.add(floorShadow);
    scene.add(modelGroup);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe5ec, 0.84));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.48);
    keyLight.position.set(3.4, 4.8, 5.2);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xe9f1ff, 0.72);
    rimLight.position.set(-4.6, 2.4, -2.4);
    scene.add(rimLight);
    const frontFillLight = new THREE.DirectionalLight(0xffffff, 0.34);
    frontFillLight.position.set(-1.4, 1.1, 4.8);
    scene.add(frontFillLight);
    const sensorGlintLight = new THREE.PointLight(0xf7fbff, 0.86, 7.4, 1.4);
    sensorGlintLight.position.set(0.4, 0.6, 3.25);
    scene.add(sensorGlintLight);

    const dracoLoader = new DRACOLoader(createQuestLoadingManager());
    dracoLoader.setDecoderPath("/draco/gltf/");
    const loader = new GLTFLoader(createQuestLoadingManager());
    loader.setDRACOLoader(dracoLoader);
    loader.setPath(QUEST_MODEL_BASE_PATH);
    const textureLoader = new THREE.TextureLoader(createQuestLoadingManager());
    textureLoader.setPath(QUEST_MODEL_BASE_PATH);
    hostElement.dataset.modelSource = QUEST_MODEL_SOURCE;
    hostElement.dataset.uiTextureSource = QUEST_UI_PANEL_TEXTURE_SOURCE;

    function stopRenderLoop(): void {
      renderer.setAnimationLoop(null);
    }

    function handleRendererError(error: unknown): void {
      if (disposed) {
        return;
      }
      hostElement.dataset.rendererReady = "false";
      hostElement.dataset.rendererError = error instanceof Error ? error.message : "Unknown Quest renderer failure";
      stopRenderLoop();
      onError?.();
    }

    loader
      .loadAsync(QUEST_MODEL_FILE)
      .then(async (gltf) => {
        const model = gltf.scene;
        if (disposed) {
          disposeObject(model);
          return;
        }
        let uiPanelTexture: THREE.Texture | null = null;
        try {
          uiPanelTexture = await textureLoader.loadAsync(QUEST_UI_PANEL_TEXTURE_FILE);
          uiPanelTexture.colorSpace = THREE.SRGBColorSpace;
          uiPanelTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
          uiPanelTexture.flipY = false;
          uiPanelTexture.wrapS = THREE.ClampToEdgeWrapping;
          uiPanelTexture.wrapT = THREE.ClampToEdgeWrapping;
          hostElement.dataset.uiTextureReady = "true";
        } catch (error) {
          hostElement.dataset.uiTextureReady = "false";
          hostElement.dataset.uiTextureError = error instanceof Error ? error.message : "Unknown UI panel texture failure";
        }
        if (disposed) {
          disposeObject(model);
          uiPanelTexture?.dispose();
          return;
        }
        normalizeQuestModel(model);
        configureQuestModel(model, uiPanelTexture);
        modelGroup.add(model);
        modelReady = true;
        hostElement.dataset.materialReady = "true";
        hostElement.dataset.rendererReady = "true";
        onReady?.();
      })
      .catch(handleRendererError);

    function renderScene(): void {
      syncQuestHeroMotion(modelGroup, lastMotionTime);
      renderer.render(scene, camera);
    }

    const resize = () => {
      const rect = hostElement.getBoundingClientRect();
      const width = Math.max(Math.round(rect.width), 1);
      const height = Math.max(Math.round(rect.height), 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderScene();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(hostElement);
    resize();

    renderer.setAnimationLoop((time) => {
      if (modelReady && motionStartedAt === null) {
        motionStartedAt = time;
      }
      const runningMotionTime = motionStartedAt === null ? 0 : time - motionStartedAt;
      const motionTime = reducedMotion ? QUEST_MOTION_DURATION_MS : runningMotionTime;
      lastMotionTime = Math.min(motionTime, QUEST_MOTION_DURATION_MS);
      hostElement.dataset.motionTime = String(Math.round(lastMotionTime));
      renderScene();

      if (modelReady && (reducedMotion || lastMotionTime >= QUEST_MOTION_DURATION_MS)) {
        stopRenderLoop();
      }
    });

    return () => {
      disposed = true;
      observer.disconnect();
      stopRenderLoop();
      disposeObject(scene);
      environment.dispose();
      environmentTexture.dispose();
      pmremGenerator.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onError, onReady]);

  return <div className="a11yway-hero__quest-canvas" data-testid="a11yway-quest-hero-canvas" ref={hostRef} />;
}
