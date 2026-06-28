import { expect, test } from "playwright/test";
import sharp from "sharp";

const waitForRenderer = async (page) => {
  await page.goto("/");
  await page.waitForFunction(
    () => document.querySelector("#main_canvas")?.getAttribute("data-renderer-ready") === "true",
    null,
    { timeout: 15_000 },
  );
  await page.waitForTimeout(1_000);
};

const measureWideFirstAuxiliaryGlyph = async (screenshot) => {
  const crop = { left: 1120, top: 50, width: 640, height: 330 };
  const image = await sharp(screenshot).extract(crop).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width, height } = image.info;
  const seen = new Uint8Array(width * height);
  let largestBox = null;

  const isAuxiliaryPixel = (x, y) => {
    const index = (y * width + x) * 4;
    const r = image.data[index];
    const g = image.data[index + 1];
    const b = image.data[index + 2];
    const a = image.data[index + 3];
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    return a > 200 && brightness > 72 && brightness < 232 && saturation < 72;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x;
      if (seen[startIndex] || !isAuxiliaryPixel(x, y)) {
        continue;
      }

      const stack = [[x, y]];
      seen[startIndex] = 1;
      let count = 0;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;

      while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();
        count += 1;
        minX = Math.min(minX, currentX);
        maxX = Math.max(maxX, currentX);
        minY = Math.min(minY, currentY);
        maxY = Math.max(maxY, currentY);

        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nextX = currentX + dx;
          const nextY = currentY + dy;
          const nextIndex = nextY * width + nextX;

          if (
            nextX < 0 ||
            nextX >= width ||
            nextY < 0 ||
            nextY >= height ||
            seen[nextIndex] ||
            !isAuxiliaryPixel(nextX, nextY)
          ) {
            continue;
          }

          seen[nextIndex] = 1;
          stack.push([nextX, nextY]);
        }
      }

      const boxWidth = maxX - minX + 1;
      const boxHeight = maxY - minY + 1;
      if (count > 100 && boxWidth > 8 && boxHeight > 8) {
        const box = {
          count,
          left: crop.left + minX,
          top: crop.top + minY,
          width: boxWidth,
          height: boxHeight,
        };
        if (largestBox === null || box.count > largestBox.count) {
          largestBox = box;
        }
      }
    }
  }

  return largestBox ?? { count: 0, left: 0, top: 0, width: 0, height: 0 };
};

test("wide hero auxiliary glyph keeps the source edge-on reveal at 1200px", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 2048, height: 1170 });
  await waitForRenderer(page);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(1_500);

  const screenshot = await page.screenshot({ fullPage: false });
  await testInfo.attach("wide-hero-auxiliary-1200", { body: screenshot, contentType: "image/png" });
  const objectBox = await measureWideFirstAuxiliaryGlyph(screenshot);

  expect(objectBox.left).toBeGreaterThanOrEqual(1260);
  expect(objectBox.left).toBeLessThanOrEqual(1295);
  expect(objectBox.top).toBeGreaterThanOrEqual(295);
  expect(objectBox.top).toBeLessThanOrEqual(320);
  expect(objectBox.width).toBeGreaterThanOrEqual(170);
  expect(objectBox.width).toBeLessThanOrEqual(200);
  expect(objectBox.height).toBeGreaterThanOrEqual(65);
  expect(objectBox.height).toBeLessThanOrEqual(90);
});
