import { expect, test } from "playwright/test";

test("wide project dice keeps the source underside during the early rotation", async ({ page }) => {
  // Given: the wide source page has entered the first visible project dice rotation.
  await page.setViewportSize({ width: 2048, height: 1192 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();

  // When: the page is scrolled to the source checkpoint where the TV underside is clearly exposed.
  await page.evaluate(() => window.scrollTo(0, 10000));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  const metrics = await page.evaluate(() => {
    const diceWrapper = document.querySelector(".m3_dice_section .dice_items");
    const bottomFace = document.querySelectorAll(".m3_dice_section .dice_item")[4];
    const bottomRect = bottomFace?.getBoundingClientRect();
    const matrix =
      diceWrapper instanceof HTMLElement
        ? getComputedStyle(diceWrapper)
            .transform.replace("matrix3d(", "")
            .replace(")", "")
            .split(",")
            .map((value) => Number(value.trim()))
        : [];

    return {
      matrix,
      bottomTop: Math.round(bottomRect?.top ?? -1),
      bottomHeight: Math.round(bottomRect?.height ?? -1),
      bottomWidth: Math.round(bottomRect?.width ?? -1),
      bottomSrc: bottomFace?.querySelector("img")?.getAttribute("src") ?? "",
    };
  });

  // Then: the underside matches the live source instead of flattening into a thin strip.
  expect(metrics.matrix[0]).toBeGreaterThanOrEqual(0.58);
  expect(metrics.matrix[0]).toBeLessThanOrEqual(0.66);
  expect(metrics.matrix[2]).toBeGreaterThanOrEqual(-0.82);
  expect(metrics.matrix[2]).toBeLessThanOrEqual(-0.74);
  expect(metrics.bottomSrc).toContain("/img/tv_back.webp");
  expect(metrics.bottomTop).toBeGreaterThanOrEqual(735);
  expect(metrics.bottomTop).toBeLessThanOrEqual(755);
  expect(metrics.bottomWidth).toBeGreaterThanOrEqual(830);
  expect(metrics.bottomWidth).toBeLessThanOrEqual(890);
  expect(metrics.bottomHeight).toBeGreaterThanOrEqual(145);
  expect(metrics.bottomHeight).toBeLessThanOrEqual(180);
});
