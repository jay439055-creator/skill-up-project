import { expect, test } from "playwright/test";

async function openBpco(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function scrollDownTo(page, scrollY) {
  for (const y of [800, 2400, 4200, 6500, 8500, 10250, 11250, 11680, 12320, 13000, 13528, 13780, scrollY]) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(140);
  }
}

test("desktop business wheel keeps the source mid-rotation height", async ({ page }) => {
  await openBpco(page);
  await scrollDownTo(page, 14200);

  const metrics = await page.evaluate(() => {
    const readRect = (selector) => {
      const element = document.querySelector(selector);
      const rect = element?.getBoundingClientRect();
      return rect
        ? {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }
        : null;
    };

    return {
      wheelRect: readRect(".main.m4 .business_items"),
      firstItemRect: readRect(".main.m4 .business_items .bs_item:nth-child(1)"),
      secondItemRect: readRect(".main.m4 .business_items .bs_item:nth-child(2)"),
      titleRect: readRect(".main.m4 .section_title"),
      descRect: readRect(".main.m4 .section_desc"),
    };
  });

  expect(metrics.wheelRect?.left).toBeGreaterThanOrEqual(-295);
  expect(metrics.wheelRect?.left).toBeLessThanOrEqual(-270);
  expect(metrics.wheelRect?.top).toBeGreaterThanOrEqual(115);
  expect(metrics.wheelRect?.top).toBeLessThanOrEqual(135);
  expect(metrics.wheelRect?.width).toBeGreaterThanOrEqual(1990);
  expect(metrics.wheelRect?.width).toBeLessThanOrEqual(2020);
  expect(metrics.wheelRect?.height).toBeGreaterThanOrEqual(455);
  expect(metrics.wheelRect?.height).toBeLessThanOrEqual(480);
  expect(metrics.firstItemRect?.top).toBeGreaterThanOrEqual(155);
  expect(metrics.firstItemRect?.top).toBeLessThanOrEqual(175);
  expect(metrics.secondItemRect?.top).toBeGreaterThanOrEqual(125);
  expect(metrics.secondItemRect?.top).toBeLessThanOrEqual(140);
  expect(metrics.titleRect?.top).toBeGreaterThanOrEqual(294);
  expect(metrics.titleRect?.top).toBeLessThanOrEqual(302);
  expect(metrics.descRect?.top).toBeGreaterThanOrEqual(571);
  expect(metrics.descRect?.top).toBeLessThanOrEqual(579);
});
