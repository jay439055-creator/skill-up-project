import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { assets } from "./bpcoContent";
import { badTvShader, copyOpacityShader, filmShader, rgbShiftShader, staticShader } from "./bpcoTvShaders";

const CAMERA_DISTANCE = 600;
const PLANE_CAMERA_Z = 260;
const NOISE_TIME_STEP = 0.08;

function readHostSize(host: HTMLDivElement): { readonly width: number; readonly height: number } {
  const rect = host.getBoundingClientRect();
  const width = host.clientWidth || Math.round(rect.width);
  const height = host.clientHeight || Math.round(rect.height);

  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

function setUniform(pass: ShaderPass, name: string, value: boolean | number): void {
  const uniform = pass.uniforms[name];
  if (uniform !== undefined) {
    uniform.value = value;
  }
}

export function BpcoProjectTvNoiseCanvas(): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) {
      return undefined;
    }

    let frameId = 0;
    let disposed = false;
    let elapsed = 0;
    let plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;
    let sourceTexture: THREE.Texture | null = null;
    let composer: EffectComposer | null = null;
    let badTvPass: ShaderPass | null = null;
    let filmPass: ShaderPass | null = null;
    let staticPass: ShaderPass | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 10, 1000);
    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      powerPreference: "low-power",
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(1);
    host.append(renderer.domElement);

    const resize = () => {
      const size = readHostSize(host);
      renderer.setSize(size.width, size.height);
      camera.aspect = size.width / size.height;
      camera.fov = 2 * Math.atan(size.height / 2 / CAMERA_DISTANCE) * (180 / Math.PI);
      camera.position.z = PLANE_CAMERA_Z;
      camera.updateProjectionMatrix();
      composer?.setSize(size.width, size.height);

      if (plane !== null) {
        plane.geometry.dispose();
        plane.geometry = new THREE.PlaneGeometry(size.width, size.height, 1, 1);
      }
    };

    const render = () => {
      if (composer !== null && badTvPass !== null && filmPass !== null && staticPass !== null) {
        elapsed += NOISE_TIME_STEP;
        setUniform(badTvPass, "time", elapsed);
        setUniform(filmPass, "time", elapsed);
        setUniform(staticPass, "time", elapsed);
        composer.render(0.1);
        host.dataset.noiseFrame = elapsed.toFixed(2);
      }

      frameId = window.requestAnimationFrame(render);
    };

    const textureLoader = new THREE.TextureLoader();
    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(host);

    void textureLoader
      .loadAsync(assets.tvBack)
      .then((loadedTexture) => {
        if (disposed) {
          loadedTexture.dispose();
          return;
        }

        sourceTexture = loadedTexture;
        sourceTexture.minFilter = THREE.LinearFilter;
        sourceTexture.magFilter = THREE.LinearFilter;
        sourceTexture.needsUpdate = true;

        const size = readHostSize(host);
        const material = new THREE.MeshBasicMaterial({ map: sourceTexture });
        plane = new THREE.Mesh(new THREE.PlaneGeometry(size.width, size.height, 1, 1), material);
        scene.add(plane);

        const renderPass = new RenderPass(scene, camera);
        filmPass = new ShaderPass(filmShader);
        badTvPass = new ShaderPass(badTvShader);
        const rgbShiftPass = new ShaderPass(rgbShiftShader);
        staticPass = new ShaderPass(staticShader);
        const copyPass = new ShaderPass(copyOpacityShader);

        setUniform(filmPass, "grayscale", false);
        setUniform(filmPass, "sCount", 800);
        setUniform(filmPass, "sIntensity", 0.9);
        setUniform(filmPass, "nIntensity", 0.4);
        setUniform(badTvPass, "distortion", 2);
        setUniform(badTvPass, "distortion2", 1);
        setUniform(badTvPass, "speed", 0.06);
        setUniform(badTvPass, "rollSpeed", 0.001);
        setUniform(rgbShiftPass, "angle", 0.02 * Math.PI);
        setUniform(rgbShiftPass, "amount", 0.004);
        setUniform(staticPass, "amount", 0.01);
        setUniform(staticPass, "size", 4);
        setUniform(copyPass, "opacity", 1);

        composer = new EffectComposer(renderer);
        composer.addPass(renderPass);
        composer.addPass(filmPass);
        composer.addPass(badTvPass);
        composer.addPass(rgbShiftPass);
        composer.addPass(staticPass);
        composer.addPass(copyPass);
        resize();
        host.dataset.noiseRendererReady = "true";
        render();
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          host.dataset.noiseRendererError = error.message;
          return;
        }
        host.dataset.noiseRendererError = "unknown texture load error";
      });

    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      composer?.dispose();
      if (plane !== null) {
        scene.remove(plane);
        plane.geometry.dispose();
        plane.material.dispose();
      }
      sourceTexture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="project_tv_noise" ref={hostRef} data-testid="project-tv-noise" aria-hidden="true">
      <img className="project_tv_noise_source" src={assets.tvBack} alt="" />
    </div>
  );
}
