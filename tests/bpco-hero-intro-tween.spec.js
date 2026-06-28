import { expect, test } from "playwright/test";

async function openBpco(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector("#main_canvas")?.getAttribute("data-renderer-ready") === "true",
    undefined,
    { timeout: 30000 },
  );
}

function readHeroPose() {
  const object = document.querySelector("[data-testid='hero-object']");
  return {
    introProgress: Number(object?.getAttribute("data-model-intro-progress") ?? -1),
    modelX: Number(object?.getAttribute("data-model-x") ?? -9999),
    modelY: Number(object?.getAttribute("data-model-y") ?? -9999),
    modelZ: Number(object?.getAttribute("data-model-z") ?? -9999),
    cameraY: Number(object?.getAttribute("data-camera-y") ?? -9999),
    cameraZ: Number(object?.getAttribute("data-camera-z") ?? -9999),
    rotationY: Number(object?.getAttribute("data-model-rotation-y") ?? -9999),
  };
}

test("hero object performs the source pre-scroll intro tween before the settled scroll pose", async ({ page }) => {
  await openBpco(page);

  const initialPose = await page.evaluate(readHeroPose);
  await page.waitForTimeout(1_250);
  const settledPose = await page.evaluate(readHeroPose);

  expect(initialPose.introProgress).toBeGreaterThanOrEqual(0);
  expect(initialPose.introProgress).toBeLessThan(0.5);
  expect(initialPose.modelX).toBeGreaterThanOrEqual(0);
  expect(initialPose.modelX).toBeLessThan(18);
  expect(initialPose.modelY).toBeGreaterThanOrEqual(-200);
  expect(initialPose.modelY).toBeLessThan(-196);
  expect(initialPose.modelZ).toBeGreaterThanOrEqual(-600);
  expect(initialPose.modelZ).toBeLessThan(-540);
  expect(initialPose.cameraY).toBeGreaterThanOrEqual(-3.3);
  expect(initialPose.cameraY).toBeLessThanOrEqual(-1);
  expect(initialPose.cameraZ).toBeGreaterThan(22);
  expect(initialPose.cameraZ).toBeLessThanOrEqual(26);
  expect(initialPose.rotationY).toBeGreaterThan(-0.45);
  expect(initialPose.rotationY).toBeLessThanOrEqual(0);

  expect(settledPose.introProgress).toBe(1);
  expect(settledPose.modelX).toBeCloseTo(30, 1);
  expect(settledPose.modelY).toBeCloseTo(-194, 1);
  expect(settledPose.modelZ).toBeCloseTo(-500, 1);
  expect(settledPose.cameraY).toBeCloseTo(-5.5, 1);
  expect(settledPose.cameraZ).toBeCloseTo(19, 1);
  expect(settledPose.rotationY).toBeCloseTo(-0.25 * Math.PI, 2);
});
