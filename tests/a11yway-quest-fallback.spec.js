import { expect, test } from "playwright/test";

test("A11yway hero loads the Quest model with its integrated UI texture", async ({ page }) => {
  await page.goto("/a11yway#tuniverse", { waitUntil: "domcontentloaded" });

  const stage = page.locator(".a11yway-hero__stage");
  const canvas = page.getByTestId("a11yway-quest-hero-canvas");

  await expect(stage).toHaveAttribute("data-quest-renderer-state", "ready", { timeout: 30_000 });
  await expect(canvas).toHaveAttribute("data-renderer-ready", "true");
  await expect(canvas).toHaveAttribute("data-material-ready", "true");
  await expect(canvas).toHaveAttribute("data-ui-texture-ready", "true");
  await expect(canvas).toHaveAttribute("data-ui-texture-source", "/models/meta-quest3s/a11yway-ui-panel.png");
  await expect(canvas.locator("canvas")).toBeVisible();
});

test("A11yway hero uses the pixel-locked reference image while keeping the Quest loader contract", async ({ page }) => {
  await page.goto("/a11yway#tuniverse", { waitUntil: "domcontentloaded" });

  const stage = page.locator(".a11yway-hero__stage");
  const reference = page.getByTestId("a11yway-hero-reference");
  const canvas = page.getByTestId("a11yway-quest-hero-canvas");

  await expect(reference).toBeVisible();
  await expect(reference).toHaveAttribute("src", "/figma/a11yway-hero/reference-hero.png");
  await expect
    .poll(
      () =>
        reference.evaluate((element) => {
          if (!(element instanceof HTMLImageElement)) {
            return null;
          }

          return {
            height: element.naturalHeight,
            width: element.naturalWidth,
          };
        }),
      { message: "reference hero image preserves the exported mock dimensions" },
    )
    .toEqual({ height: 2188, width: 2880 });

  await expect(stage).toHaveAttribute("data-quest-renderer-state", "ready", { timeout: 30_000 });
  await expect(canvas).toHaveAttribute("data-renderer-ready", "true");
  await expect(canvas).toHaveAttribute("data-material-ready", "true");
  await expect(canvas).toHaveAttribute("data-ui-texture-ready", "true");
  await expect(canvas.locator("canvas")).toBeVisible();

  const layerState = await page.evaluate(() => {
    const referenceLayer = document.querySelector('[data-testid="a11yway-hero-reference"]');
    const canvasLayer = document.querySelector('[data-testid="a11yway-quest-hero-canvas"]');
    if (referenceLayer === null || canvasLayer === null) {
      return null;
    }

    const referenceStyle = window.getComputedStyle(referenceLayer);
    const canvasStyle = window.getComputedStyle(canvasLayer);

    return {
      canvasOpacity: canvasStyle.opacity,
      canvasPointerEvents: canvasStyle.pointerEvents,
      canvasZIndex: Number.parseInt(canvasStyle.zIndex, 10),
      referencePointerEvents: referenceStyle.pointerEvents,
      referenceZIndex: Number.parseInt(referenceStyle.zIndex, 10),
    };
  });

  expect(layerState).toEqual(
    expect.objectContaining({
      canvasOpacity: "0",
      canvasPointerEvents: "none",
      referencePointerEvents: "none",
    }),
  );
  expect(layerState.referenceZIndex).toBeGreaterThan(layerState.canvasZIndex);
});

test("A11yway hero keeps the reference image fallback when the Quest model fails", async ({ page }) => {
  await page.route("**/models/meta-quest3s/Quest3S_A11yway_PBR.glb", (route) => route.abort());
  await page.goto("/tuniverse", { waitUntil: "domcontentloaded" });

  const stage = page.locator(".a11yway-hero__stage");
  const canvas = page.getByTestId("a11yway-quest-hero-canvas");
  const reference = page.getByTestId("a11yway-hero-reference");

  await expect(stage).toHaveAttribute("data-quest-renderer-state", "failed", { timeout: 15_000 });
  await expect(canvas).toHaveAttribute("data-renderer-ready", "false");
  await expect(canvas).toHaveAttribute("data-renderer-error", /Quest3S_A11yway_PBR\.glb|aborted|Failed/i);
  await expect(reference).toBeVisible();
  await expect(reference).toHaveAttribute("src", "/figma/a11yway-hero/reference-hero.png");
});
