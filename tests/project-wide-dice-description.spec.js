import { expect, test } from "playwright/test";

test("wide project dice shows the source description under the cube", async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1192 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 9500));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  const metrics = await page.evaluate(() => {
    const desc = document.querySelector(".m3_dice_section .pr_desc");
    const rect = desc?.getBoundingClientRect();
    const style = desc instanceof HTMLElement ? getComputedStyle(desc) : null;

    return {
      text: desc?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      left: Math.round(rect?.left ?? -1),
      top: Math.round(rect?.top ?? -1),
      height: Math.round(rect?.height ?? -1),
      width: Math.round(rect?.width ?? -1),
      color: style?.color ?? "",
      fontFamily: style?.fontFamily ?? "",
      fontSize: style?.fontSize ?? "",
      lineHeight: style?.lineHeight ?? "",
    };
  });

  expect(metrics.text).toContain("In September 2025");
  expect(metrics.text).toContain("commercial district");
  expect(metrics.left).toBeGreaterThanOrEqual(600);
  expect(metrics.left).toBeLessThanOrEqual(630);
  expect(metrics.top).toBeGreaterThanOrEqual(935);
  expect(metrics.top).toBeLessThanOrEqual(960);
  expect(metrics.height).toBeGreaterThanOrEqual(40);
  expect(metrics.height).toBeLessThanOrEqual(48);
  expect(metrics.width).toBeGreaterThanOrEqual(800);
  expect(metrics.width).toBeLessThanOrEqual(835);
  expect(metrics.color).toBe("rgb(18, 18, 18)");
  expect(metrics.fontFamily).toContain("Helvetica Neue");
  expect(metrics.fontSize).toBe("17px");
  expect(metrics.lineHeight).toBe("22px");
});

test("wide project dice description follows the rotating source face", async ({ page }) => {
  await page.setViewportSize({ width: 1970, height: 1118 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();

  for (const y of [9000, 12000]) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(350);
  }

  const description = await page
    .locator(".m3_dice_section .pr_desc")
    .evaluate((element) => element.textContent?.replace(/\s+/g, " ").trim() ?? "");

  expect(description).toContain("Pokémon GO");
  expect(description).toContain("venue sourcing");
  expect(description).not.toContain("In September 2025");
});
