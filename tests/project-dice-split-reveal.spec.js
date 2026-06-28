import { expect, test } from "playwright/test";
import sharp from "sharp";

async function openWideBpco(page) {
  await page.setViewportSize({ width: 1970, height: 1118 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector("#main_canvas")?.getAttribute("data-renderer-ready") === "true",
    undefined,
    { timeout: 30000 },
  );
}

async function openInAppLikeBpco(page) {
  await page.setViewportSize({ width: 2048, height: 1170 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
    undefined,
    { timeout: 30000 },
  );
}

async function openDesktopBpco(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
    undefined,
    { timeout: 30000 },
  );
}

async function readProjectReveal(page, y) {
  await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
  await page.waitForTimeout(300);

  return page.evaluate(() => {
    const readRect = (selector) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) {
        return null;
      }

      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      return {
        text: element.textContent?.trim().replace(/\s+/g, " ") ?? "",
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        opacity: Number(style.opacity),
        position: style.position,
        overflow: style.overflow,
        zIndex: style.zIndex,
        backgroundColor: style.backgroundColor,
        transform: style.transform,
        filter: style.filter,
      };
    };

    const diceWrapper = document.querySelector(".m3_dice_section .dice_items");
    const bottomFace = document.querySelector(".m3_dice_section .dice_item:nth-child(5)");
    const business = document.querySelector(".main.m4");
    const split = document.querySelector(".project_split_labels");
    const splitStyle = split instanceof HTMLElement ? getComputedStyle(split) : null;
    const bottomAfterStyle = bottomFace instanceof HTMLElement ? getComputedStyle(bottomFace, "::after") : null;
    const businessBeforeStyle = business instanceof HTMLElement ? getComputedStyle(business, "::before") : null;

    return {
      splitOpacity: splitStyle ? Number(splitStyle.opacity) : -1,
      splitLeft: readRect(".project_split_labels .project_split_left"),
      splitRight: readRect(".project_split_labels .project_split_right"),
      fixedLeftOpacity: Number(getComputedStyle(document.querySelector(".m3_dice_section .project_left_label")).opacity),
      projectInfoOpacity: Number(getComputedStyle(document.querySelector(".project_list .pr_info")).opacity),
      dice: readRect(".m3_dice_section .dice_items"),
      frontFace: readRect(".m3_dice_section .dice_item:nth-child(1)"),
      leftFace: readRect(".m3_dice_section .dice_item:nth-child(2)"),
      rightFace: readRect(".m3_dice_section .dice_item:nth-child(4)"),
      bottom: readRect(".m3_dice_section .dice_item:nth-child(5)"),
      bottomImage: readRect(".m3_dice_section .dice_item:nth-child(5) img"),
      tvNoiseCanvas: readRect(".m3_dice_section .dice_item:nth-child(5) .project_tv_noise canvas"),
      tvOverlay: readRect(".m3_dice_section .project_tv_underside_overlay"),
      tvOverlayNoise: readRect(".m3_dice_section .project_tv_underside_overlay .project_tv_noise"),
      tvOverlayCanvas: readRect(".m3_dice_section .project_tv_underside_overlay canvas"),
      desc: readRect(".m3_dice_section .pr_desc"),
      bottomAfterBackground: bottomAfterStyle?.backgroundColor ?? "",
      bottomAfterZIndex: bottomAfterStyle?.zIndex ?? "",
      bottomBeforeBackground:
        bottomFace instanceof HTMLElement ? getComputedStyle(bottomFace, "::before").backgroundColor : "",
      bottomBeforeOpacity: bottomFace instanceof HTMLElement ? Number(getComputedStyle(bottomFace, "::before").opacity) : -1,
      businessBeforeContent: businessBeforeStyle?.content ?? "",
      tvDimOpacity: Number(getComputedStyle(document.documentElement).getPropertyValue("--project-dice-tv-dim-opacity")),
      diceMatrix:
        diceWrapper instanceof HTMLElement
          ? getComputedStyle(diceWrapper)
              .transform.replace("matrix3d(", "")
              .replace(")", "")
              .split(",")
              .map((value) => Number(value.trim()))
          : [],
    };
  });
}

test("desktop project underside flips into the source rippled TV face", async ({ page }) => {
  await openDesktopBpco(page);
  for (const y of [800, 2400, 4200, 6500, 8500, 10250, 11250, 11680, 12320]) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(120);
  }
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  const state = await page.evaluate(() => {
    const diceWrapper = document.querySelector(".m3_dice_section .dice_items");
    const bottomFace = document.querySelector(".m3_dice_section .dice_item:nth-child(5)");
    const noiseCanvas = document.querySelector(".m3_dice_section .dice_item:nth-child(5) canvas");
    const faces = Array.from(document.querySelectorAll(".m3_dice_section .dice_item")).map((item, index) => {
      const rect = item.getBoundingClientRect();
      return {
        index: index + 1,
        title: item.querySelector(".info_title")?.textContent?.trim() ?? "",
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        area: Math.round(rect.width * rect.height),
      };
    });
    const bottomRect = bottomFace?.getBoundingClientRect();
    const visibleX = Math.max(0, Math.floor(bottomRect?.left ?? 0));
    const visibleY = Math.max(0, Math.floor(bottomRect?.top ?? 0));
    const visibleWidth = Math.max(1, Math.min(Math.ceil(bottomRect?.width ?? 1), window.innerWidth - visibleX));
    const visibleHeight = Math.max(1, Math.min(Math.ceil(bottomRect?.height ?? 1), window.innerHeight - visibleY));
    const clipWidth = Math.min(420, visibleWidth);
    const clipHeight = Math.min(260, visibleHeight);

    return {
      matrix:
        diceWrapper instanceof HTMLElement
          ? getComputedStyle(diceWrapper)
              .transform.replace("matrix3d(", "")
              .replace(")", "")
              .split(",")
              .map((value) => Number(value.trim()))
          : [],
      faces,
      largestFace: faces.reduce((largest, face) => (face.area > largest.area ? face : largest), faces[0]),
      bottomFace: faces[4],
      noiseWidth: noiseCanvas instanceof HTMLCanvasElement ? noiseCanvas.width : 0,
      noiseHeight: noiseCanvas instanceof HTMLCanvasElement ? noiseCanvas.height : 0,
      clip: {
        x: visibleX + Math.max(0, Math.floor((visibleWidth - clipWidth) / 2)),
        y: visibleY + Math.max(0, Math.floor((visibleHeight - clipHeight) / 2)),
        width: clipWidth,
        height: clipHeight,
      },
    };
  });

  expect(state.matrix[0]).toBeGreaterThanOrEqual(0.98);
  expect(state.matrix[0]).toBeLessThanOrEqual(1.02);
  expect(Math.abs(state.matrix[2])).toBeLessThanOrEqual(0.02);
  expect(state.matrix[5]).toBeGreaterThanOrEqual(0.1);
  expect(state.matrix[5]).toBeLessThanOrEqual(0.14);
  expect(state.matrix[6]).toBeGreaterThanOrEqual(0.98);
  expect(state.matrix[6]).toBeLessThanOrEqual(1);
  expect(state.matrix[9]).toBeLessThanOrEqual(-0.96);
  expect(state.matrix[10]).toBeGreaterThanOrEqual(0.1);
  expect(state.matrix[10]).toBeLessThanOrEqual(0.14);
  expect(state.largestFace?.index).toBe(5);
  expect(state.bottomFace?.left).toBeGreaterThanOrEqual(420);
  expect(state.bottomFace?.left).toBeLessThanOrEqual(470);
  expect(state.bottomFace?.top).toBeGreaterThanOrEqual(190);
  expect(state.bottomFace?.top).toBeLessThanOrEqual(235);
  expect(state.bottomFace?.width).toBeGreaterThanOrEqual(520);
  expect(state.bottomFace?.width).toBeLessThanOrEqual(590);
  expect(state.bottomFace?.height).toBeGreaterThanOrEqual(495);
  expect(state.bottomFace?.height).toBeLessThanOrEqual(550);
  expect(state.faces[0]?.height).toBeLessThanOrEqual(30);
  expect(state.noiseWidth).toBeGreaterThanOrEqual(500);
  expect(state.noiseHeight).toBeGreaterThanOrEqual(495);

  const firstFrame = await page.screenshot({ clip: state.clip });
  await page.waitForTimeout(500);
  const secondFrame = await page.screenshot({ clip: state.clip });
  const difference = await meanAbsolutePixelDiff(firstFrame, secondFrame);
  expect(difference).toBeGreaterThan(0.5);
});

test("desktop project description clears before the TV underside flip", async ({ page }) => {
  await openDesktopBpco(page);
  for (const y of [800, 2400, 4200, 6500, 8500, 10250, 11250, 11680]) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(120);
  }

  const description = await page.locator(".m3_dice_section .pr_desc").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      text: element.textContent?.replace(/\s+/g, " ").trim() ?? "",
      top: Math.round(rect.top),
      height: Math.round(rect.height),
    };
  });

  expect(description.text).toBe("");
  expect(description.height).toBe(0);
  expect(description.top).toBeGreaterThanOrEqual(705);
  expect(description.top).toBeLessThanOrEqual(750);
});

test("desktop project dice preserves the source underside through early and late folds", async ({ page }) => {
  await openDesktopBpco(page);

  const firstFold = await readProjectReveal(page, 8500);
  expect(firstFold.diceMatrix[0]).toBeGreaterThanOrEqual(0.76);
  expect(firstFold.diceMatrix[0]).toBeLessThanOrEqual(0.8);
  expect(firstFold.diceMatrix[2]).toBeGreaterThanOrEqual(-0.65);
  expect(firstFold.diceMatrix[2]).toBeLessThanOrEqual(-0.61);
  expect(firstFold.bottom?.width).toBeGreaterThanOrEqual(640);
  expect(firstFold.bottom?.width).toBeLessThanOrEqual(670);
  expect(firstFold.bottom?.height).toBeGreaterThanOrEqual(82);
  expect(firstFold.bottom?.height).toBeLessThanOrEqual(96);
  expect(firstFold.desc?.top).toBeGreaterThanOrEqual(705);
  expect(firstFold.desc?.top).toBeLessThanOrEqual(718);

  const reverseFold = await readProjectReveal(page, 9600);
  expect(reverseFold.diceMatrix[0]).toBeGreaterThanOrEqual(-0.78);
  expect(reverseFold.diceMatrix[0]).toBeLessThanOrEqual(-0.72);
  expect(reverseFold.diceMatrix[2]).toBeGreaterThanOrEqual(-0.69);
  expect(reverseFold.diceMatrix[2]).toBeLessThanOrEqual(-0.63);
  expect(reverseFold.bottom?.width).toBeGreaterThanOrEqual(640);
  expect(reverseFold.bottom?.width).toBeLessThanOrEqual(670);
  expect(reverseFold.bottom?.height).toBeGreaterThanOrEqual(82);
  expect(reverseFold.bottom?.height).toBeLessThanOrEqual(96);
  expect(reverseFold.desc?.top).toBeGreaterThanOrEqual(705);
  expect(reverseFold.desc?.top).toBeLessThanOrEqual(718);

  const tvLift = await readProjectReveal(page, 12320);
  expect(tvLift.diceMatrix[5]).toBeGreaterThanOrEqual(0.1);
  expect(tvLift.diceMatrix[5]).toBeLessThanOrEqual(0.14);
  expect(tvLift.diceMatrix[6]).toBeGreaterThanOrEqual(0.98);
  expect(tvLift.diceMatrix[6]).toBeLessThanOrEqual(1);
  expect(tvLift.bottom?.top).toBeGreaterThanOrEqual(195);
  expect(tvLift.bottom?.top).toBeLessThanOrEqual(210);
  expect(tvLift.bottom?.height).toBeGreaterThanOrEqual(510);
  expect(tvLift.bottom?.height).toBeLessThanOrEqual(540);
});

async function meanAbsolutePixelDiff(first, second) {
  const [{ data: firstPixels }, { data: secondPixels }] = await Promise.all([
    sharp(first).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(second).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);

  let totalDifference = 0;
  for (let index = 0; index < firstPixels.length; index += 1) {
    totalDifference += Math.abs(firstPixels[index] - secondPixels[index]);
  }

  return totalDifference / firstPixels.length;
}

async function meanLuminance(image) {
  const { data } = await sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let totalLuminance = 0;
  let pixelCount = 0;

  for (let index = 0; index < data.length; index += 3) {
    totalLuminance += data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
    pixelCount += 1;
  }

  return totalLuminance / pixelCount;
}

test("project intro words split apart before the rippled underside dice reveal", async ({ page }) => {
  // Given: the wide source project intro stays hidden while the last philosophy image is still on screen.
  await openWideBpco(page);
  const beforeSplit = await readProjectReveal(page, 7200);

  expect(beforeSplit.splitOpacity).toBeLessThanOrEqual(0.05);
  expect(beforeSplit.dice?.width).toBeLessThanOrEqual(4);
  expect(beforeSplit.dice?.height).toBeLessThanOrEqual(4);

  // When: the scroll reaches the pre-dice title split point.
  const splitStart = await readProjectReveal(page, 8600);

  // Then: only the moving split words are visible, and the cube has not appeared yet.
  expect(splitStart.splitOpacity).toBeGreaterThanOrEqual(0.95);
  expect(splitStart.splitLeft?.text.toUpperCase()).toBe("RECENT PROJECT");
  expect(splitStart.splitRight?.text.toUpperCase()).toBe("4P—CREATIVE—CAMPAIGN");
  expect(splitStart.splitLeft?.left).toBeGreaterThanOrEqual(260);
  expect(splitStart.splitLeft?.left).toBeLessThanOrEqual(340);
  expect(splitStart.splitRight?.left).toBeGreaterThanOrEqual(1530);
  expect(splitStart.splitRight?.left).toBeLessThanOrEqual(1610);
  expect(splitStart.fixedLeftOpacity).toBeLessThanOrEqual(0.05);
  expect(splitStart.projectInfoOpacity).toBeLessThanOrEqual(0.05);
  expect(splitStart.dice?.width).toBeLessThanOrEqual(4);
  expect(splitStart.dice?.height).toBeLessThanOrEqual(4);

  // When: the split has opened and the source project card quickly grows through the gap.
  const reveal = await readProjectReveal(page, 9000);

  // Then: the reveal matches the source's measured mid-size card instead of jumping oversized.
  expect(reveal.splitLeft?.left).toBeGreaterThanOrEqual(60);
  expect(reveal.splitLeft?.left).toBeLessThanOrEqual(100);
  expect(reveal.splitRight?.left).toBeGreaterThanOrEqual(1695);
  expect(reveal.splitRight?.left).toBeLessThanOrEqual(1745);
  expect(reveal.diceMatrix[0]).toBeGreaterThanOrEqual(0.9);
  expect(reveal.diceMatrix[0]).toBeLessThanOrEqual(0.98);
  expect(reveal.diceMatrix[2]).toBeGreaterThanOrEqual(-0.04);
  expect(reveal.diceMatrix[2]).toBeLessThanOrEqual(0.04);
  expect(reveal.dice?.width).toBeGreaterThanOrEqual(530);
  expect(reveal.dice?.width).toBeLessThanOrEqual(590);
  expect(reveal.dice?.height).toBeGreaterThanOrEqual(340);
  expect(reveal.dice?.height).toBeLessThanOrEqual(385);
  expect(reveal.bottom?.width).toBeGreaterThanOrEqual(710);
  expect(reveal.bottom?.width).toBeLessThanOrEqual(775);
  expect(reveal.bottom?.top).toBeGreaterThanOrEqual(690);
  expect(reveal.bottom?.top).toBeLessThanOrEqual(720);
  expect(reveal.bottom?.height).toBeGreaterThanOrEqual(80);
  expect(reveal.bottom?.height).toBeLessThanOrEqual(115);
  expect(reveal.desc?.opacity).toBeGreaterThanOrEqual(0.95);
  expect(reveal.desc?.top).toBeGreaterThanOrEqual(875);
  expect(reveal.desc?.top).toBeLessThanOrEqual(895);
  expect(reveal.bottomImage?.filter).toBe("none");
  expect(reveal.tvNoiseCanvas).not.toBeNull();
  expect(reveal.tvOverlay?.opacity).toBeLessThanOrEqual(0.05);
});

test("wide late project frame grows from the underside face like the source", async ({ page }) => {
  await openWideBpco(page);
  const reveal = await readProjectReveal(page, 14500);

  expect(reveal.diceMatrix[0]).toBeGreaterThanOrEqual(3.05);
  expect(reveal.diceMatrix[0]).toBeLessThanOrEqual(3.11);
  expect(Math.abs(reveal.diceMatrix[2])).toBeLessThanOrEqual(0.02);
  expect(reveal.diceMatrix[6]).toBeGreaterThanOrEqual(3.05);
  expect(reveal.diceMatrix[6]).toBeLessThanOrEqual(3.11);
  expect(reveal.diceMatrix[9]).toBeLessThanOrEqual(-0.99);
  expect(Math.abs(reveal.diceMatrix[10])).toBeLessThanOrEqual(0.003);
  expect(reveal.bottom?.left).toBeGreaterThanOrEqual(-850);
  expect(reveal.bottom?.left).toBeLessThanOrEqual(-790);
  expect(reveal.bottom?.top).toBeGreaterThanOrEqual(-45);
  expect(reveal.bottom?.top).toBeLessThanOrEqual(-5);
  expect(reveal.bottom?.width).toBeGreaterThanOrEqual(3570);
  expect(reveal.bottom?.width).toBeLessThanOrEqual(3660);
  expect(reveal.bottom?.height).toBeGreaterThanOrEqual(1150);
  expect(reveal.bottom?.height).toBeLessThanOrEqual(1195);
  expect(reveal.bottomAfterBackground).toBe("rgba(0, 0, 0, 0.2)");
  expect(reveal.bottomAfterZIndex).toBe("1");
  expect(reveal.bottomBeforeBackground).toBe("rgba(0, 0, 0, 0.9)");
  expect(reveal.bottomBeforeOpacity).toBeGreaterThanOrEqual(0.68);
  expect(reveal.bottomBeforeOpacity).toBeLessThanOrEqual(0.76);
  expect(reveal.tvDimOpacity).toBeGreaterThanOrEqual(0.68);
  expect(reveal.tvDimOpacity).toBeLessThanOrEqual(0.76);
  expect(reveal.businessBeforeContent).toBe("none");
  expect(reveal.tvOverlay?.opacity).toBeLessThanOrEqual(0.05);
  expect(reveal.tvNoiseCanvas).not.toBeNull();
});

test("ultrawide project underside reveal keeps the live scroll lag", async ({ page }) => {
  await openInAppLikeBpco(page);
  const reveal = await readProjectReveal(page, 14500);

  expect(reveal.diceMatrix[0]).toBeGreaterThanOrEqual(0.98);
  expect(reveal.diceMatrix[0]).toBeLessThanOrEqual(1.02);
  expect(Math.abs(reveal.diceMatrix[2])).toBeLessThanOrEqual(0.02);
  expect(reveal.diceMatrix[5]).toBeGreaterThanOrEqual(0.26);
  expect(reveal.diceMatrix[5]).toBeLessThanOrEqual(0.38);
  expect(reveal.diceMatrix[6]).toBeGreaterThanOrEqual(0.93);
  expect(reveal.diceMatrix[6]).toBeLessThanOrEqual(0.98);
  expect(reveal.bottom?.left).toBeGreaterThanOrEqual(610);
  expect(reveal.bottom?.left).toBeLessThanOrEqual(645);
  expect(reveal.bottom?.top).toBeGreaterThanOrEqual(270);
  expect(reveal.bottom?.top).toBeLessThanOrEqual(305);
  expect(reveal.bottom?.width).toBeGreaterThanOrEqual(780);
  expect(reveal.bottom?.width).toBeLessThanOrEqual(825);
  expect(reveal.bottom?.height).toBeGreaterThanOrEqual(660);
  expect(reveal.bottom?.height).toBeLessThanOrEqual(705);
  expect(reveal.bottomBeforeOpacity).toBeLessThanOrEqual(0.05);
  expect(reveal.tvDimOpacity).toBeLessThanOrEqual(0.05);
  expect(reveal.desc?.text).toBe("");
  expect(reveal.tvNoiseCanvas).not.toBeNull();

  const bottom = reveal.bottom;
  expect(bottom).not.toBeNull();
  const frame = await page.screenshot({
    clip: {
      x: Math.max(0, bottom?.left ?? 0),
      y: Math.max(0, bottom?.top ?? 0),
      width: Math.min(bottom?.width ?? 1, 2048),
      height: Math.min(bottom?.height ?? 1, 1170),
    },
  });
  expect(await meanLuminance(frame)).toBeGreaterThanOrEqual(145);
});

test("ultrawide project underside keeps the live shallow angle after the hinge", async ({ page }) => {
  await openInAppLikeBpco(page);
  const reveal = await readProjectReveal(page, 14510);

  expect(reveal.diceMatrix[0]).toBeGreaterThanOrEqual(0.98);
  expect(reveal.diceMatrix[0]).toBeLessThanOrEqual(1.02);
  expect(Math.abs(reveal.diceMatrix[2])).toBeLessThanOrEqual(0.02);
  expect(reveal.diceMatrix[5]).toBeGreaterThanOrEqual(0.26);
  expect(reveal.diceMatrix[5]).toBeLessThanOrEqual(0.31);
  expect(reveal.diceMatrix[6]).toBeGreaterThanOrEqual(0.95);
  expect(reveal.diceMatrix[6]).toBeLessThanOrEqual(0.98);
  expect(reveal.bottom?.left).toBeGreaterThanOrEqual(610);
  expect(reveal.bottom?.left).toBeLessThanOrEqual(645);
  expect(reveal.bottom?.top).toBeGreaterThanOrEqual(270);
  expect(reveal.bottom?.top).toBeLessThanOrEqual(285);
  expect(reveal.bottom?.width).toBeGreaterThanOrEqual(790);
  expect(reveal.bottom?.width).toBeLessThanOrEqual(830);
  expect(reveal.bottom?.height).toBeGreaterThanOrEqual(680);
  expect(reveal.bottom?.height).toBeLessThanOrEqual(705);
  expect(reveal.bottomBeforeOpacity).toBeLessThanOrEqual(0.05);
  expect(reveal.tvDimOpacity).toBeLessThanOrEqual(0.05);
});

test("wide project underside reaches the live eased flat wave face", async ({ page }) => {
  await openWideBpco(page);
  const reveal = await readProjectReveal(page, 14323);

  expect(reveal.diceMatrix[0]).toBeGreaterThanOrEqual(0.98);
  expect(reveal.diceMatrix[0]).toBeLessThanOrEqual(1.02);
  expect(Math.abs(reveal.diceMatrix[2])).toBeLessThanOrEqual(0.02);
  expect(reveal.diceMatrix[5]).toBeGreaterThanOrEqual(0.02);
  expect(reveal.diceMatrix[5]).toBeLessThanOrEqual(0.06);
  expect(reveal.diceMatrix[6]).toBeGreaterThanOrEqual(0.998);
  expect(reveal.diceMatrix[6]).toBeLessThanOrEqual(1.001);
  expect(reveal.bottom?.left).toBeGreaterThanOrEqual(620);
  expect(reveal.bottom?.left).toBeLessThanOrEqual(635);
  expect(reveal.bottom?.top).toBeGreaterThanOrEqual(205);
  expect(reveal.bottom?.top).toBeLessThanOrEqual(220);
  expect(reveal.bottom?.width).toBeGreaterThanOrEqual(705);
  expect(reveal.bottom?.width).toBeLessThanOrEqual(725);
  expect(reveal.bottom?.height).toBeGreaterThanOrEqual(695);
  expect(reveal.bottom?.height).toBeLessThanOrEqual(715);
  expect(reveal.frontFace?.opacity).toBeLessThanOrEqual(0.05);
  expect(reveal.leftFace?.opacity).toBeLessThanOrEqual(0.05);
  expect(reveal.rightFace?.opacity).toBeLessThanOrEqual(0.05);
  expect(reveal.bottom?.position).toBe("absolute");
  expect(reveal.bottom?.overflow).toBe("visible");
  expect(reveal.bottom?.zIndex).toBe("5");
  expect(reveal.bottom?.backgroundColor).toBe("rgb(0, 0, 0)");
  expect(reveal.bottomBeforeOpacity).toBeLessThanOrEqual(0.05);
  expect(reveal.tvDimOpacity).toBeLessThanOrEqual(0.05);
  expect(reveal.desc?.text).toBe("");
});

test("ultrawide project card opens at the live scale before the underside lift", async ({ page }) => {
  await openInAppLikeBpco(page);
  const reveal = await readProjectReveal(page, 9000);

  expect(reveal.diceMatrix[0]).toBeGreaterThanOrEqual(0.6);
  expect(reveal.diceMatrix[0]).toBeLessThanOrEqual(0.65);
  expect(reveal.diceMatrix[5]).toBeGreaterThanOrEqual(0.6);
  expect(reveal.diceMatrix[5]).toBeLessThanOrEqual(0.65);
  expect(reveal.diceMatrix[10]).toBeGreaterThanOrEqual(0.98);
  expect(reveal.diceMatrix[10]).toBeLessThanOrEqual(1.02);
  expect(reveal.bottom?.left).toBeGreaterThanOrEqual(745);
  expect(reveal.bottom?.left).toBeLessThanOrEqual(790);
  expect(reveal.bottom?.top).toBeGreaterThanOrEqual(675);
  expect(reveal.bottom?.top).toBeLessThanOrEqual(695);
  expect(reveal.bottom?.width).toBeGreaterThanOrEqual(490);
  expect(reveal.bottom?.width).toBeLessThanOrEqual(530);
  expect(reveal.bottom?.height).toBeGreaterThanOrEqual(55);
  expect(reveal.bottom?.height).toBeLessThanOrEqual(80);
  expect(reveal.desc?.text).toContain("In September 2025");
  expect(reveal.desc?.height).toBeGreaterThanOrEqual(35);
  expect(reveal.desc?.height).toBeLessThanOrEqual(60);
});

test("wide pre-TV project frame starts the shallow underside flip like the source", async ({ page }) => {
  await openWideBpco(page);
  const reveal = await readProjectReveal(page, 14000);

  expect(reveal.diceMatrix[0]).toBeGreaterThanOrEqual(0.92);
  expect(reveal.diceMatrix[0]).toBeLessThanOrEqual(1.05);
  expect(Math.abs(reveal.diceMatrix[2])).toBeLessThanOrEqual(0.18);
  expect(reveal.diceMatrix[6]).toBeGreaterThanOrEqual(0.46);
  expect(reveal.diceMatrix[6]).toBeLessThanOrEqual(0.53);
  expect(reveal.bottom?.top).toBeGreaterThanOrEqual(575);
  expect(reveal.bottom?.top).toBeLessThanOrEqual(615);
  expect(reveal.bottom?.height).toBeGreaterThanOrEqual(220);
  expect(reveal.bottom?.height).toBeLessThanOrEqual(270);
  expect(reveal.tvNoiseCanvas?.left).toBeLessThanOrEqual(reveal.bottom?.left ?? 0);
  expect((reveal.tvNoiseCanvas?.left ?? 0) + (reveal.tvNoiseCanvas?.width ?? 0)).toBeGreaterThanOrEqual(
    (reveal.bottom?.left ?? 0) + (reveal.bottom?.width ?? 0),
  );
  expect(reveal.desc?.text).toBe("");
});

test("wide full-screen TV underside darkens before the business takeover", async ({ page }) => {
  await openWideBpco(page);
  const reveal = await readProjectReveal(page, 15000);

  expect(reveal.diceMatrix[0]).toBeGreaterThanOrEqual(3.98);
  expect(reveal.diceMatrix[0]).toBeLessThanOrEqual(4.02);
  expect(reveal.bottom?.width).toBeGreaterThanOrEqual(6550);
  expect(reveal.bottom?.height).toBeGreaterThanOrEqual(1600);
  expect(reveal.bottomAfterBackground).toBe("rgba(0, 0, 0, 0.2)");
  expect(reveal.bottomBeforeBackground).toBe("rgba(0, 0, 0, 0.9)");
  expect(reveal.bottomBeforeOpacity).toBeGreaterThanOrEqual(0.95);
  expect(reveal.businessBeforeContent).toBe("none");
  expect(reveal.desc?.text).toBe("");
});

test("project underside wave distortion keeps moving while the scroll is fixed", async ({ page }) => {
  // Given: the project underside reaches the live-source X-flip stage.
  await page.setViewportSize({ width: 1970, height: 1118 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
    undefined,
    { timeout: 30000 },
  );
  await page.evaluate(() => window.scrollTo(0, 14500));
  await page.waitForTimeout(1200);

  const state = await page.evaluate(() => {
    const overlay = document.querySelector(".m3_dice_section .project_tv_underside_overlay");
    const bottomFace = document.querySelector(".m3_dice_section .dice_item:nth-child(5)");
    const noiseLayer = document.querySelector(".m3_dice_section .dice_item:nth-child(5) .project_tv_noise");
    const canvas = document.querySelector(".m3_dice_section .dice_item:nth-child(5) canvas");
    const desc = document.querySelector(".m3_dice_section .pr_desc");
    if (
      !(overlay instanceof HTMLElement) ||
      !(bottomFace instanceof HTMLElement) ||
      !(noiseLayer instanceof HTMLElement) ||
      !(canvas instanceof HTMLCanvasElement)
    ) {
      return null;
    }

    const rect = bottomFace.getBoundingClientRect();
    const overlayStyle = getComputedStyle(overlay);
    const layerStyle = getComputedStyle(noiseLayer);
    const visibleX = Math.max(0, Math.floor(rect.left));
    const visibleY = Math.max(0, Math.floor(rect.top));
    const visibleWidth = Math.max(1, Math.min(Math.ceil(rect.width), window.innerWidth - visibleX));
    const visibleHeight = Math.max(1, Math.min(Math.ceil(rect.height), window.innerHeight - visibleY));
    const width = Math.min(720, visibleWidth);
    const height = Math.min(140, visibleHeight);

    return {
      clip: {
        x: visibleX + Math.max(0, Math.floor((visibleWidth - width) / 2)),
        y: visibleY + Math.max(0, Math.floor((visibleHeight - height) / 2)),
        width,
        height,
      },
      overlayOpacity: Number(overlayStyle.opacity),
      bottomFaceOpacity: Number(getComputedStyle(bottomFace).opacity),
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      canvasCssWidth: Number.parseFloat(getComputedStyle(canvas).width),
      canvasTranslateX: new DOMMatrixReadOnly(getComputedStyle(canvas).transform).m41,
      descOpacity: desc instanceof HTMLElement ? Number(getComputedStyle(desc).opacity) : -1,
      layerZIndex: layerStyle.zIndex,
      layerPointerEvents: layerStyle.pointerEvents,
    };
  });

  expect(state).not.toBeNull();
  expect(state?.overlayOpacity).toBeLessThanOrEqual(0.05);
  expect(state?.bottomFaceOpacity).toBeGreaterThanOrEqual(0.95);
  expect(state?.canvasWidth).toBeGreaterThanOrEqual(700);
  expect(state?.canvasHeight).toBeGreaterThanOrEqual(140);
  expect(state?.canvasCssWidth).toBeCloseTo(788, 1);
  expect(state?.canvasTranslateX).toBeCloseTo(0, 1);
  expect(state?.descOpacity).toBeLessThanOrEqual(0.05);
  expect(state?.layerZIndex).toBe("5");
  expect(state?.layerPointerEvents).toBe("none");

  // When: two frames are captured without changing the scroll position.
  const firstFrame = await page.screenshot({ clip: state?.clip });
  await page.waitForTimeout(650);
  const secondFrame = await page.screenshot({ clip: state?.clip });
  const difference = await meanAbsolutePixelDiff(firstFrame, secondFrame);

  // Then: the underside distortion is animated rather than baked into a static image crop.
  expect(difference).toBeGreaterThan(0.75);
});

test("wide project-to-business prelude clears the full-screen TV underside", async ({ page }) => {
  // Given: the user-wide source viewport is just before the business section takeover.
  await openWideBpco(page);
  await page.evaluate(() => window.scrollTo(0, 15800));
  await page.waitForTimeout(600);

  const state = await page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const overlay = document.querySelector(".m3_dice_section .project_tv_underside_overlay");
    const diceSection = document.querySelector(".m3_dice_section");
    const businessItems = Array.from(document.querySelectorAll(".main.m4 .business_items .bs_item"));
    const businessTitle = document.querySelector(".main.m4 .section_title");
    const businessDesc = document.querySelector(".main.m4 .section_desc");
    const titleRect = businessTitle?.getBoundingClientRect();
    const descRect = businessDesc?.getBoundingClientRect();

    return {
      preludeOpacity: Number(rootStyle.getPropertyValue("--m4-prelude-opacity")),
      overlayOpacity: overlay instanceof HTMLElement ? Number(getComputedStyle(overlay).opacity) : -1,
      diceZIndex: diceSection instanceof HTMLElement ? Number(getComputedStyle(diceSection).zIndex) : -1,
      firstWheelOpacity: businessItems[0] instanceof HTMLElement ? Number(getComputedStyle(businessItems[0]).opacity) : -1,
      secondWheelOpacity: businessItems[1] instanceof HTMLElement ? Number(getComputedStyle(businessItems[1]).opacity) : -1,
      titleText: businessTitle?.textContent?.trim() ?? "",
      titleTop: Math.round(titleRect?.top ?? -1),
      descTop: Math.round(descRect?.top ?? -1),
    };
  });

  // Then: the animated project TV face is no longer the top visual layer over the business intro.
  expect(state.preludeOpacity).toBeGreaterThanOrEqual(0.95);
  expect(state.overlayOpacity).toBeLessThanOrEqual(0.1);
  expect(state.diceZIndex).toBeLessThanOrEqual(8);
  expect(state.firstWheelOpacity).toBeGreaterThanOrEqual(0.95);
  expect(state.secondWheelOpacity).toBeLessThanOrEqual(0.1);
  expect(state.titleText).toContain("WHAT WE DO");
  expect(state.titleTop).toBeGreaterThanOrEqual(390);
  expect(state.titleTop).toBeLessThanOrEqual(430);
  expect(state.descTop).toBeGreaterThanOrEqual(665);
  expect(state.descTop).toBeLessThanOrEqual(710);
});
