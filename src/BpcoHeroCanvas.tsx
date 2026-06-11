import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import { assets } from "./bpcoContent";
import {
  type AuxiliaryCharacter,
  AUXILIARY_CHARACTER_SOURCES,
  createOverlayCamera,
  INITIAL_AUXILIARY_CHARACTER_ROTATION,
  INITIAL_CAMERA,
  INITIAL_CHARACTER_ROTATION,
  INITIAL_MODEL,
  LIGHT_COLOR,
  MODEL_SCALE,
  SECONDARY_CHARACTER_SRC,
  syncAuxiliaryCharacterStates,
  syncHeroModelState,
  syncSecondaryCharacterState,
  updateOverlayCameraSize,
} from "./bpcoThreeMotion";

export function BpcoHeroCanvas(): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) {
      return undefined;
    }

    let frameId = 0;
    let disposed = false;
    let heroModel: THREE.Object3D | null = null;
    let secondaryCharacter: THREE.Object3D | null = null;
    let auxiliaryCharacters: readonly AuxiliaryCharacter[] = [];
    const scene = new THREE.Scene();
    const overlayScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 10, 1000);
    const overlayCamera = createOverlayCamera();
    camera.position.set(0, INITIAL_CAMERA.y, INITIAL_CAMERA.z);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    host.append(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(LIGHT_COLOR, 1.8);
    keyLight.position.set(-15, 5, 50);
    scene.add(keyLight);
    scene.add(new THREE.DirectionalLight(LIGHT_COLOR, 0.8));
    const overlayLight = new THREE.DirectionalLight(LIGHT_COLOR, 1.8);
    overlayLight.position.set(-15, 5, 50);
    overlayScene.add(overlayLight);
    overlayScene.add(new THREE.DirectionalLight(LIGHT_COLOR, 0.8));
    const rimLight = new THREE.DirectionalLight(LIGHT_COLOR, 1.2);
    rimLight.position.set(7, 13, 20);
    scene.add(rimLight);
    const backLight = new THREE.PointLight(0xaaaaaf, 20_000, 8_000);
    backLight.position.set(-50, -10, -450);
    scene.add(backLight);
    const render = () => {
      renderer.autoClear = true;
      renderer.render(scene, camera);
      renderer.autoClear = false;
      renderer.render(overlayScene, overlayCamera);
      frameId = window.requestAnimationFrame(render);
    };

    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      updateOverlayCameraSize(overlayCamera, width, height);
      renderer.setSize(width, height);
      if (heroModel !== null) {
        syncHeroModelState(host, camera, heroModel);
      }
      if (secondaryCharacter !== null) {
        syncSecondaryCharacterState(host, secondaryCharacter);
      }
      syncAuxiliaryCharacterStates(host, auxiliaryCharacters);
    };

    const updateScroll = () => {
      if (heroModel !== null) {
        syncHeroModelState(host, camera, heroModel);
      }
      if (secondaryCharacter !== null) {
        syncSecondaryCharacterState(host, secondaryCharacter);
      }
      syncAuxiliaryCharacterStates(host, auxiliaryCharacters);
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const rgbeLoader = new RGBELoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    Promise.all([rgbeLoader.loadAsync("https://www.bpco.kr/three/envmap_3.hdr"), gltfLoader.loadAsync(assets.heroModel)])
      .then(([hdrTexture, gltf]) => {
        if (disposed) {
          hdrTexture.dispose();
          return;
        }

        const environment = pmremGenerator.fromEquirectangular(hdrTexture).texture;
        hdrTexture.dispose();
        scene.environment = environment;
        overlayScene.environment = environment;

        heroModel = gltf.scene;
        heroModel.position.set(INITIAL_MODEL.x, INITIAL_MODEL.y, INITIAL_MODEL.z);
        heroModel.rotation.y = INITIAL_MODEL.rotationY;
        heroModel.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
        scene.add(heroModel);
        host.dataset.rendererReady = "true";
        syncHeroModelState(host, camera, heroModel);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          host.dataset.rendererError = error.message;
          return;
        }
        host.dataset.rendererError = "unknown renderer error";
      });

    gltfLoader
      .loadAsync(SECONDARY_CHARACTER_SRC)
      .then((gltf) => {
        if (disposed) {
          return;
        }

        secondaryCharacter = gltf.scene.children[0] ?? gltf.scene;
        secondaryCharacter.rotation.set(
          INITIAL_CHARACTER_ROTATION.x,
          INITIAL_CHARACTER_ROTATION.y,
          INITIAL_CHARACTER_ROTATION.z,
        );
        secondaryCharacter.position.set(0, 0, 0);
        secondaryCharacter.scale.setScalar(0);
        overlayScene.add(secondaryCharacter);
        host.dataset.secondaryCharacterReady = "true";
        syncSecondaryCharacterState(host, secondaryCharacter);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          host.dataset.secondaryCharacterError = error.message;
          return;
        }
        host.dataset.secondaryCharacterError = "unknown secondary character error";
      });

    Promise.all(
      AUXILIARY_CHARACTER_SOURCES.map((source, index) =>
        gltfLoader.loadAsync(source).then((gltf): AuxiliaryCharacter => {
          const mesh = gltf.scene.children[0] ?? gltf.scene;
          mesh.rotation.set(
            INITIAL_AUXILIARY_CHARACTER_ROTATION.x,
            INITIAL_AUXILIARY_CHARACTER_ROTATION.y,
            INITIAL_AUXILIARY_CHARACTER_ROTATION.z,
          );
          mesh.position.set(0, 0, 0);
          mesh.scale.setScalar(0);
          return { index, mesh };
        }),
      ),
    )
      .then((characters) => {
        if (disposed) {
          return;
        }

        auxiliaryCharacters = characters;
        for (const character of characters) {
          overlayScene.add(character.mesh);
        }
        host.dataset.auxiliaryCharacterReadyCount = String(characters.length);
        syncAuxiliaryCharacterStates(host, auxiliaryCharacters);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          host.dataset.auxiliaryCharacterError = error.message;
          return;
        }
        host.dataset.auxiliaryCharacterError = "unknown auxiliary character error";
      });

    host.setAttribute("src", assets.heroModel);
    host.dataset.secondaryCharacterSrc = SECONDARY_CHARACTER_SRC;
    window.addEventListener("resize", updateSize);
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateSize();
    render();

    return () => {
      disposed = true;
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("scroll", updateScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      dracoLoader.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div id="main_canvas" ref={hostRef} data-testid="hero-object" aria-hidden="true" />;
}
