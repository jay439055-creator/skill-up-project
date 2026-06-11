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

test("hero late-scroll introduces the source secondary 3D character", async ({ page }) => {
  test.setTimeout(60000);
  await openBpco(page);
  const checkpoints = [];

  for (const y of [720, 1800, 2400]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(250);
    checkpoints.push(await page.evaluate(() => {
      const object = document.querySelector("#main_canvas");
      return {
        y: window.scrollY,
        characterSrc: object?.getAttribute("data-secondary-character-src") ?? "",
        characterReady: object?.getAttribute("data-secondary-character-ready") ?? "",
        characterProgress: Number(object?.getAttribute("data-secondary-character-progress") ?? -1),
        characterScaleProgress: Number(object?.getAttribute("data-secondary-character-scale-progress") ?? -1),
        auxiliaryReadyCount: Number(object?.getAttribute("data-auxiliary-character-ready-count") ?? -1),
        auxiliaryProgress: Number(object?.getAttribute("data-auxiliary-character-progress") ?? -1),
        auxiliaryRotationX: Number(object?.getAttribute("data-auxiliary-character-rotation-x") ?? -1),
        auxiliaryScaleProgress2: Number(object?.getAttribute("data-auxiliary-character-2-scale-progress") ?? -1),
      };
    }));
  }

  expect(checkpoints[0].characterSrc).toContain("/three/model/t_0.glb");
  expect(checkpoints[0].characterReady).toBe("true");
  expect(checkpoints[0].characterProgress).toBe(0);
  expect(checkpoints[1].characterProgress).toBeGreaterThan(0.1);
  expect(checkpoints[1].characterProgress).toBeLessThan(0.15);
  expect(checkpoints[1].characterScaleProgress).toBeGreaterThan(0.38);
  expect(checkpoints[1].characterScaleProgress).toBeLessThan(0.43);
  expect(checkpoints[2].characterProgress).toBeGreaterThan(0.45);
  expect(checkpoints[2].characterProgress).toBeLessThan(0.5);
  expect(checkpoints[2].characterScaleProgress).toBeGreaterThan(0.93);
  expect(checkpoints[2].characterScaleProgress).toBeLessThanOrEqual(1);
  expect(checkpoints[1].auxiliaryReadyCount).toBe(4);
  expect(checkpoints[1].auxiliaryProgress).toBeGreaterThan(0.55);
  expect(checkpoints[1].auxiliaryProgress).toBeLessThan(0.6);
  expect(checkpoints[1].auxiliaryRotationX).toBeGreaterThan(83);
  expect(checkpoints[1].auxiliaryRotationX).toBeLessThan(85);
  expect(checkpoints[1].auxiliaryScaleProgress2).toBeGreaterThan(0.91);
  expect(checkpoints[1].auxiliaryScaleProgress2).toBeLessThan(0.93);
});
