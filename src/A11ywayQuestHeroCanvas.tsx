import { useEffect, useRef, type ReactElement } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  configureQuestModel,
  createQuestLoadingManager,
  disposeObject,
  normalizeQuestModel,
  QUEST_MODEL_BASE_PATH,
  QUEST_MODEL_FILE,
  QUEST_MODEL_SOURCE,
  QUEST_MOTION_DURATION_MS,
  syncQuestHeroMotion,
} from "./a11ywayQuestHeroScene";

type A11ywayQuestHeroCanvasProps = {
  readonly onReady?: () => void;
};

export function A11ywayQuestHeroCanvas({ onReady }: A11ywayQuestHeroCanvasProps): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) {
      return undefined;
    }

    let disposed = false;
    let modelReady = false;
    let motionStartedAt: number | null = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.24, 7.05);
    camera.lookAt(0, -0.06, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    host.append(renderer.domElement);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmremGenerator.fromScene(environment).texture;
    scene.environment = environmentTexture;

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd5de, 1.08));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.72);
    keyLight.position.set(3.2, 4.6, 5.4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xe6f0ff, 1.16);
    rimLight.position.set(-4.2, 2.1, -2.7);
    scene.add(rimLight);
    const frontFillLight = new THREE.DirectionalLight(0xffffff, 0.48);
    frontFillLight.position.set(-1.5, 0.8, 4.8);
    scene.add(frontFillLight);
    const visorGlintLight = new THREE.PointLight(0xf7fbff, 2.4, 7.5, 1.35);
    visorGlintLight.position.set(-1.1, 0.7, 3.35);
    scene.add(visorGlintLight);

    const dracoLoader = new DRACOLoader(createQuestLoadingManager());
    dracoLoader.setDecoderPath("/draco/gltf/");
    const loader = new GLTFLoader(createQuestLoadingManager());
    loader.setDRACOLoader(dracoLoader);
    loader.setPath(QUEST_MODEL_BASE_PATH);
    host.dataset.modelSource = QUEST_MODEL_SOURCE;

    loader
      .loadAsync(QUEST_MODEL_FILE)
      .then((gltf) => {
        const model = gltf.scene;
        if (disposed) {
          disposeObject(model);
          return;
        }
        normalizeQuestModel(model);
        configureQuestModel(model);
        modelGroup.add(model);
        modelReady = true;
        host.dataset.materialReady = "true";
        host.dataset.rendererReady = "true";
        onReady?.();
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          host.dataset.rendererError = error.message;
          return;
        }
        throw error;
      });

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(Math.round(rect.width), 1);
      const height = Math.max(Math.round(rect.height), 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    renderer.setAnimationLoop((time) => {
      if (modelReady && motionStartedAt === null) {
        motionStartedAt = time;
      }
      const motionTime = motionStartedAt === null ? 0 : time - motionStartedAt;
      syncQuestHeroMotion(modelGroup, reducedMotion ? QUEST_MOTION_DURATION_MS * 0.72 : motionTime);
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      observer.disconnect();
      renderer.setAnimationLoop(null);
      disposeObject(scene);
      environment.dispose();
      environmentTexture.dispose();
      pmremGenerator.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady]);

  return <div className="a11yway-hero__quest-canvas" data-testid="a11yway-quest-hero-canvas" ref={hostRef} />;
}
