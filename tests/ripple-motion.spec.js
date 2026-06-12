import { expect, test } from "playwright/test";

test("ripple route renders an independent pointer-reactive wave field", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ripple");
  await expect(page.getByTestId("ripple-experience")).toBeVisible();
  await expect(page.getByText("Current Archive")).toBeVisible();
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

test("ripple hero dissolves through a gradient veil into white after the first viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ripple");

  await expect(page.getByTestId("ripple-experience")).toBeVisible();
  await expect(page.getByTestId("ripple-transition")).toBeVisible();

  const transition = await page.evaluate(() => {
    const hero = document.querySelector(".ripple_hero");
    const band = document.querySelector("[data-testid='ripple-transition']");
    const after = document.querySelector(".ripple_after");

    if (!(hero instanceof HTMLElement) || !(band instanceof HTMLElement) || !(after instanceof HTMLElement)) {
      throw new Error("ripple transition structure was not found");
    }

    const heroRect = hero.getBoundingClientRect();
    const bandRect = band.getBoundingClientRect();
    const afterRect = after.getBoundingClientRect();
    const bandStyle = window.getComputedStyle(band);
    const beforeStyle = window.getComputedStyle(band, "::before");
    const afterStyle = window.getComputedStyle(band, "::after");

    return {
      afterBackground: window.getComputedStyle(after).backgroundColor,
      afterTop: Math.round(afterRect.top + window.scrollY),
      bandBackground: bandStyle.backgroundImage,
      bandHeight: Math.round(bandRect.height),
      bandTop: Math.round(bandRect.top + window.scrollY),
      curtainFilter: afterStyle.filter,
      experienceBackground: window.getComputedStyle(document.querySelector(".ripple_experience") ?? document.body).backgroundColor,
      experienceField: window.getComputedStyle(document.querySelector(".ripple_experience") ?? document.body, "::before")
        .backgroundImage,
      heroBackground: window.getComputedStyle(hero).backgroundImage,
      heroBottom: Math.round(heroRect.bottom + window.scrollY),
      marker: band.getAttribute("data-transition-surface"),
      pillNodes: document.querySelectorAll(".ripple_transition_wave").length,
      shapeLayer: beforeStyle.backgroundImage,
      viewportHeight: window.innerHeight,
      veilFilter: beforeStyle.filter,
      waveLayer: afterStyle.backgroundImage,
    };
  });

  expect(transition.marker).toBe("white-gradient-veil");
  expect(transition.bandTop).toBeLessThanOrEqual(transition.heroBottom);
  expect(transition.bandTop).toBeGreaterThanOrEqual(transition.heroBottom - transition.viewportHeight * 0.32);
  expect(transition.bandHeight).toBeGreaterThanOrEqual(760);
  expect(transition.afterTop).toBeGreaterThan(transition.bandTop + 620);
  expect(transition.experienceBackground).toBe("rgb(255, 255, 255)");
  expect(["rgb(255, 255, 255)", "rgba(0, 0, 0, 0)"]).toContain(transition.afterBackground);
  expect(transition.pillNodes).toBe(0);
  expect(transition.heroBackground).toBe("none");
  expect(transition.experienceField).toContain("radial-gradient");
  expect(transition.bandBackground).toBe("none");
  expect(transition.shapeLayer).toContain("radial-gradient");
  expect(transition.shapeLayer).toContain("linear-gradient");
  expect(transition.waveLayer).toContain("radial-gradient");
  expect(transition.veilFilter).toContain("blur");
  expect(transition.curtainFilter).toContain("blur");
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

test("dot field scales the oval footprint beyond the lower viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ripple");

  const canvas = page.getByTestId("ripple-motion-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-motion-state", "interactive", { timeout: 15_000 });
  await page.waitForTimeout(450);

  const widths = await canvas.evaluate((element) => {
    const canvasElement = element instanceof HTMLCanvasElement ? element : null;
    const context = canvasElement?.getContext("2d");
    if (canvasElement === null || context === undefined || context === null) {
      return { far: 0, lower: 0, middle: 0, near: 0, viewport: 0 };
    }

    const rect = canvasElement.getBoundingClientRect();
    const dpr = canvasElement.width / rect.width;
    const rowWidth = (ratio) => {
      let widest = 0;
      for (let offset = -14; offset <= 14; offset += 2) {
        const row = Math.round((rect.height * ratio + offset) * dpr);
        const data = context.getImageData(0, row, canvasElement.width, 1).data;
        let minX = canvasElement.width;
        let maxX = 0;
        for (let x = 0; x < canvasElement.width; x += 1) {
          const index = x * 4;
          if (data[index + 3] > 80 && data[index] + data[index + 1] + data[index + 2] > 80) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
          }
        }
        widest = Math.max(widest, (maxX - minX) / dpr);
      }
      return widest;
    };

    return { far: rowWidth(0.34), lower: rowWidth(0.82), middle: rowWidth(0.66), near: rowWidth(0.9), viewport: rect.width };
  });

  expect(widths.far).toBeLessThan(widths.middle * 0.53);
  expect(widths.lower).toBeGreaterThan(widths.viewport * 0.98);
  expect(widths.near).toBeGreaterThan(widths.viewport * 0.97);
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
