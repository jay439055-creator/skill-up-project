import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { expect, test } from "playwright/test";

async function openBpcoAtMission(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector("#main_canvas")?.getAttribute("data-renderer-ready") === "true",
    undefined,
    { timeout: 30000 },
  );
  await page.evaluate(() => window.scrollTo(0, 5600));
  await page.waitForTimeout(350);
  await page.addStyleTag({
    content: `
      header, nav, .contents_wrap, .scroll_down_info, .intro_company_info { visibility: hidden !important; }
      html, body { background: rgb(238, 238, 238) !important; }
      #main_canvas { visibility: visible !important; background: transparent !important; }
    `,
  });
  await page.waitForTimeout(150);
}

function isObjectPixel(data, width, channels, x, y) {
  if (y < 70 || y > 370 || x < 100 || x > 760) {
    return false;
  }

  const offset = (y * width + x) * channels;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const a = data[offset + 3];
  const brightness = (r + g + b) / 3;
  const saturation = Math.max(r, g, b) - Math.min(r, g, b);
  const backgroundDistance = Math.abs(r - 238) + Math.abs(g - 238) + Math.abs(b - 238);

  return a >= 128 && backgroundDistance > 22 && brightness > 80 && brightness < 252 && saturation < 60;
}

function extractObjectBoxes(data, info) {
  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const boxes = [];

  for (let y = 70; y <= 370; y += 1) {
    for (let x = 100; x <= 760; x += 1) {
      const index = y * width + x;
      if (visited[index] === 1 || !isObjectPixel(data, width, channels, x, y)) {
        continue;
      }

      const stack = [[x, y]];
      visited[index] = 1;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;

      while (stack.length > 0) {
        const point = stack.pop();
        if (point === undefined) {
          continue;
        }
        const [currentX, currentY] = point;
        count += 1;
        minX = Math.min(minX, currentX);
        maxX = Math.max(maxX, currentX);
        minY = Math.min(minY, currentY);
        maxY = Math.max(maxY, currentY);

        for (const [nextX, nextY] of [
          [currentX + 1, currentY],
          [currentX - 1, currentY],
          [currentX, currentY + 1],
          [currentX, currentY - 1],
        ]) {
          if (nextX < 100 || nextX > 760 || nextY < 70 || nextY > 370) {
            continue;
          }
          const nextIndex = nextY * width + nextX;
          if (visited[nextIndex] === 0 && isObjectPixel(data, width, channels, nextX, nextY)) {
            visited[nextIndex] = 1;
            stack.push([nextX, nextY]);
          }
        }
      }

      if (count > 150) {
        boxes.push({ x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1, count });
      }
    }
  }

  return boxes.sort((a, b) => b.count - a.count);
}

function mergeMissionObjectCluster(boxes) {
  const cluster = boxes.filter((box) => box.x >= 240 && box.x <= 360 && box.y >= 250 && box.y <= 380);
  if (cluster.length === 0) {
    return boxes[0];
  }

  const minX = Math.min(...cluster.map((box) => box.x));
  const minY = Math.min(...cluster.map((box) => box.y));
  const maxX = Math.max(...cluster.map((box) => box.x + box.width - 1));
  const maxY = Math.max(...cluster.map((box) => box.y + box.height - 1));
  const count = cluster.reduce((total, box) => total + box.count, 0);
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1, count };
}

test("rs3 canvas object settles at source Mission scale", async ({ page }) => {
  test.setTimeout(60000);
  await openBpcoAtMission(page);
  const screenshot = await page.screenshot();
  const image = await sharp(screenshot).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const boxes = extractObjectBoxes(image.data, image.info);
  const missionObject = mergeMissionObjectCluster(boxes);
  await fs.mkdir(path.resolve(".omo/ulw-loop/evidence/bpco-rs3-canvas-test"), { recursive: true });
  await fs.writeFile(
    path.resolve(".omo/ulw-loop/evidence/bpco-rs3-canvas-test/local-boxes.json"),
    JSON.stringify({ boxes, missionObject }, null, 2),
  );

  expect(boxes.length).toBeGreaterThanOrEqual(1);
  expect(missionObject.width).toBeGreaterThan(50);
  expect(missionObject.width).toBeLessThan(85);
  expect(missionObject.height).toBeGreaterThan(75);
  expect(missionObject.height).toBeLessThan(105);
  expect(missionObject.count).toBeLessThan(3500);
});

test("BPCO m2 uses the source neutral page gradient", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 5600));
  await page.waitForTimeout(250);
  const background = await page.evaluate(() => ({
    htmlColor: getComputedStyle(document.documentElement).backgroundColor,
    htmlImage: getComputedStyle(document.documentElement).backgroundImage,
    bodyImage: getComputedStyle(document.body).backgroundImage,
    pageColor: getComputedStyle(document.querySelector(".bpco-page")).backgroundColor,
    m2Color: getComputedStyle(document.querySelector(".main.m2")).backgroundColor,
  }));

  expect(background.htmlColor).toBe("rgba(0, 0, 0, 0)");
  expect(background.htmlImage).toBe("none");
  expect(background.bodyImage).toContain("linear-gradient");
  expect(background.bodyImage).toContain("rgb(229, 229, 229)");
  expect(background.pageColor).toBe("rgba(0, 0, 0, 0)");
  expect(background.m2Color).toBe("rgba(0, 0, 0, 0)");
});
