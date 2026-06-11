import { expect, test } from "playwright/test";

test("ripple route renders an independent pointer-reactive wave field", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ripple");
  await expect(page.getByTestId("ripple-experience")).toBeVisible();
  await expect(page.getByText("Wave field study")).toBeVisible();
  await expect(page.getByText("Bigpicture Company")).toHaveCount(0);

  const canvas = page.getByTestId("ripple-motion-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-motion-state", "interactive", { timeout: 15_000 });

  await page.mouse.move(760, 620);
  await expect(canvas).toHaveAttribute("data-pointer-active", "true");

  const pointer = await canvas.evaluate((element) => ({
    x: Number(element.getAttribute("data-pointer-x") ?? 0),
    y: Number(element.getAttribute("data-pointer-y") ?? 0),
  }));
  expect(pointer.x).toBeGreaterThan(700);
  expect(pointer.y).toBeGreaterThan(580);
});

test("intro drop lands on the same point where the first ripple starts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ripple");

  const canvas = page.getByTestId("ripple-motion-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-drop-impact-progress", "0.88");

  const timing = await canvas.evaluate((element) => ({
    dropY: Number(element.getAttribute("data-drop-impact-y") ?? Number.NaN),
    rippleY: Number(element.getAttribute("data-ripple-origin-y") ?? Number.NaN),
  }));

  expect(Math.abs(timing.dropY - timing.rippleY)).toBeLessThanOrEqual(1);
});

test("ripple route stays full-screen on mobile without BPCO layers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ripple");

  const metrics = await page.evaluate(() => ({
    bpcoPages: document.querySelectorAll("[data-testid='bpco-page']").length,
    canvas: document.querySelector("[data-testid='ripple-motion-canvas']")?.getBoundingClientRect().toJSON(),
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(metrics.bpcoPages).toBe(0);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.canvas?.width).toBe(390);
  expect(metrics.canvas?.height).toBe(844);
});
