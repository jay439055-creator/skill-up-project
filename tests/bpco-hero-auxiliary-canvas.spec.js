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

const findObjectShadowBox = async (screenshot) => {
  const crop = { left: 780, top: 70, width: 380, height: 320 };
  const image = await sharp(screenshot).extract(crop).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width, height } = image.info;
  const seen = new Uint8Array(width * height);
  const boxes = [];

  const isModelShadowPixel = (x, y) => {
    const index = (y * width + x) * 4;
    const r = image.data[index];
    const g = image.data[index + 1];
    const b = image.data[index + 2];
    const a = image.data[index + 3];
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    return a > 200 && brightness > 80 && brightness < 210 && saturation < 55;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x;
      if (seen[startIndex] || !isModelShadowPixel(x, y)) {
        continue;
      }

      const stack = [[x, y]];
      seen[startIndex] = 1;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;

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
            !isModelShadowPixel(nextX, nextY)
          ) {
            continue;
          }

          seen[nextIndex] = 1;
          stack.push([nextX, nextY]);
        }
      }

      const boxWidth = maxX - minX + 1;
      const boxHeight = maxY - minY + 1;
      if (count > 60 && boxWidth > 5 && boxHeight > 5) {
        boxes.push({ x: crop.left + minX, y: crop.top + minY, width: boxWidth, height: boxHeight, count });
      }
    }
  }

  return boxes.sort((a, b) => b.count - a.count)[0] ?? null;
};

const measureLowerRightObject = async (screenshot) => {
  const crop = { left: 1080, top: 610, width: 360, height: 290 };
  const image = await sharp(screenshot).extract(crop).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width, height } = image.info;
  const seen = new Uint8Array(width * height);
  let largestBox = null;

  const isObjectPixel = (x, y) => {
    const index = (y * width + x) * 4;
    const r = image.data[index];
    const g = image.data[index + 1];
    const b = image.data[index + 2];
    const a = image.data[index + 3];
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    return a > 200 && brightness > 65 && brightness < 220 && saturation < 95;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x;
      if (seen[startIndex] || !isObjectPixel(x, y)) {
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
            !isObjectPixel(nextX, nextY)
          ) {
            continue;
          }

          seen[nextIndex] = 1;
          stack.push([nextX, nextY]);
        }
      }

      if (count > 50 && (largestBox === null || count > largestBox.count)) {
        largestBox = {
          count,
          left: crop.left + minX,
          top: crop.top + minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
        };
      }
    }
  }

  return largestBox ?? { count: 0, left: 0, top: 0, width: 0, height: 0 };
};

const measureM2TopRightObject = async (screenshot) => {
  const crop = { left: 1050, top: 150, width: 850, height: 390 };
  const image = await sharp(screenshot).extract(crop).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width, height } = image.info;
  const seen = new Uint8Array(width * height);
  let largestBox = null;

  const isObjectPixel = (x, y) => {
    const index = (y * width + x) * 4;
    const r = image.data[index];
    const g = image.data[index + 1];
    const b = image.data[index + 2];
    const a = image.data[index + 3];
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    return a > 220 && brightness > 170 && brightness < 255 && saturation < 45 && !(r > 238 && g > 238 && b > 238);
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x;
      if (seen[startIndex] || !isObjectPixel(x, y)) {
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
            !isObjectPixel(nextX, nextY)
          ) {
            continue;
          }

          seen[nextIndex] = 1;
          stack.push([nextX, nextY]);
        }
      }

      if (count > 200 && (largestBox === null || count > largestBox.count)) {
        largestBox = {
          count,
          left: crop.left + minX,
          top: crop.top + minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
        };
      }
    }
  }

  return largestBox ?? { count: 0, left: 0, top: 0, width: 0, height: 0 };
};

test("hero auxiliary letter matches the source edge-on pose at 1200px", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await waitForRenderer(page);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(1_500);

  const screenshot = await page.screenshot({ fullPage: false });
  await testInfo.attach("hero-auxiliary-1200", { body: screenshot, contentType: "image/png" });
  const objectBox = await findObjectShadowBox(screenshot);

  expect(objectBox).not.toBeNull();
  expect(objectBox.x).toBeGreaterThan(880);
  expect(objectBox.x).toBeLessThan(910);
  expect(objectBox.y).toBeGreaterThan(230);
  expect(objectBox.y).toBeLessThan(255);
  expect(objectBox.width).toBeGreaterThan(105);
  expect(objectBox.width).toBeLessThan(130);
  expect(objectBox.height).toBeGreaterThan(30);
  expect(objectBox.height).toBeLessThan(50);
});

test("first auxiliary letter turns edge-on during the source 1200px reveal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await waitForRenderer(page);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(1_500);

  const rotation = await page.evaluate(() => {
    const object = document.querySelector("#main_canvas");
    return {
      x: Number(object?.getAttribute("data-auxiliary-character-0-rotation-x") ?? -9999),
      y: Number(object?.getAttribute("data-auxiliary-character-0-rotation-y") ?? -9999),
    };
  });

  expect(rotation.x).toBeGreaterThan(87.7);
  expect(rotation.x).toBeLessThan(88.0);
  expect(rotation.y).toBeGreaterThan(1.45);
  expect(rotation.y).toBeLessThan(1.7);
});

test("m2 auxiliary object stays visible from the lower right at 3600px", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await waitForRenderer(page);
  await page.evaluate(() => window.scrollTo(0, 3600));
  await page.waitForTimeout(1_500);

  const screenshot = await page.screenshot({ fullPage: false });
  await testInfo.attach("hero-auxiliary-lower-right-3600", { body: screenshot, contentType: "image/png" });
  const objectStats = await measureLowerRightObject(screenshot);

  expect(objectStats.count).toBeGreaterThan(1_500);
  expect(objectStats.left).toBeGreaterThanOrEqual(1340);
  expect(objectStats.left).toBeLessThanOrEqual(1370);
  expect(objectStats.top).toBeGreaterThanOrEqual(680);
  expect(objectStats.top).toBeLessThanOrEqual(710);
  expect(objectStats.width).toBeGreaterThanOrEqual(45);
  expect(objectStats.height).toBeGreaterThanOrEqual(75);
});

test("m2 top-right auxiliary object matches the source mid-rail pose at 5200px", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1970, height: 1118 });
  await waitForRenderer(page);
  await page.evaluate(() => window.scrollTo(0, 5200));
  await page.waitForTimeout(1_500);

  const screenshot = await page.screenshot({ fullPage: false });
  await testInfo.attach("m2-top-right-auxiliary-5200", { body: screenshot, contentType: "image/png" });
  const objectStats = await measureM2TopRightObject(screenshot);

  expect(objectStats.count).toBeGreaterThan(30_000);
  expect(objectStats.left).toBeGreaterThanOrEqual(1200);
  expect(objectStats.left).toBeLessThanOrEqual(1290);
  expect(objectStats.top).toBeGreaterThanOrEqual(235);
  expect(objectStats.top).toBeLessThanOrEqual(285);
  expect(objectStats.width).toBeGreaterThanOrEqual(430);
  expect(objectStats.width).toBeLessThanOrEqual(520);
  expect(objectStats.height).toBeGreaterThanOrEqual(210);
  expect(objectStats.height).toBeLessThanOrEqual(270);
});
