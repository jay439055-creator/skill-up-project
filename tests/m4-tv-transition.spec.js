import { expect, test } from "playwright/test";

test("business transition keeps the source tv-back dice frame instead of the media collage", async ({ page }) => {
  // Given: the page is in the late business transition range reached by normal downward scrolling.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  for (const scrollY of [13000, 13528, 14700, 15500]) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(160);
  }

  // When: the rendered transition layers are measured.
  const metrics = await page.evaluate(() => {
    const diceSection = document.querySelector(".m3_dice_section");
    const diceWrapper = document.querySelector(".m3_dice_section .dice_items");
    const tvBackFace = document.querySelectorAll(".m3_dice_section .dice_item")[4];
    const collage = document.querySelector(".main.m4 .m4_media_collage");
    const businessWheel = document.querySelector(".main.m4 .business_items");
    const leftLabel = document.querySelector(".m3_dice_section .project_left_label");
    const projectDesc = document.querySelector(".m3_dice_section .pr_desc");
    const readRect = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect === undefined
        ? null
        : {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
    };
    const matrix =
      diceWrapper instanceof HTMLElement
        ? getComputedStyle(diceWrapper)
            .transform.replace("matrix3d(", "")
            .replace(")", "")
            .split(",")
            .map((value) => Number(value.trim()))
        : [];

    return {
      collageOpacity: collage instanceof HTMLElement ? Number(getComputedStyle(collage).opacity) : -1,
      businessWheelOpacity: businessWheel instanceof HTMLElement ? Number(getComputedStyle(businessWheel).opacity) : -1,
      diceOpacity: diceSection instanceof HTMLElement ? Number(getComputedStyle(diceSection).opacity) : -1,
      leftLabelOpacity: leftLabel instanceof HTMLElement ? Number(getComputedStyle(leftLabel).opacity) : -1,
      projectDescOpacity: projectDesc instanceof HTMLElement ? Number(getComputedStyle(projectDesc).opacity) : -1,
      matrix,
      tvBackRect: readRect(tvBackFace),
      tvBackSrc: tvBackFace?.querySelector("img")?.getAttribute("src") ?? "",
    };
  });

  // Then: the live source tv-back frame is visible and the local-only collage is not covering it.
  expect(metrics.collageOpacity).toBeLessThanOrEqual(0.05);
  expect(metrics.businessWheelOpacity).toBeLessThanOrEqual(0.05);
  expect(metrics.diceOpacity).toBeGreaterThanOrEqual(0.95);
  expect(metrics.leftLabelOpacity).toBeLessThanOrEqual(0.05);
  expect(metrics.matrix[0]).toBeGreaterThanOrEqual(1);
  expect(metrics.matrix[0]).toBeLessThanOrEqual(1.15);
  expect(metrics.matrix[6]).toBeGreaterThanOrEqual(1);
  expect(metrics.matrix[6]).toBeLessThanOrEqual(1.15);
  expect(metrics.projectDescOpacity).toBeLessThanOrEqual(0.05);
  expect(metrics.tvBackSrc).toContain("/img/tv_back.webp");
  expect(metrics.tvBackRect?.left).toBeGreaterThanOrEqual(400);
  expect(metrics.tvBackRect?.left).toBeLessThanOrEqual(440);
  expect(metrics.tvBackRect?.top).toBeGreaterThanOrEqual(175);
  expect(metrics.tvBackRect?.top).toBeLessThanOrEqual(190);
  expect(metrics.tvBackRect?.width).toBeGreaterThanOrEqual(590);
  expect(metrics.tvBackRect?.width).toBeLessThanOrEqual(625);
  expect(metrics.tvBackRect?.height).toBeGreaterThanOrEqual(535);
  expect(metrics.tvBackRect?.height).toBeLessThanOrEqual(550);
});

test("wide business entry keeps the full-screen TV underside visible behind the wheel", async ({ page }) => {
  await page.setViewportSize({ width: 1970, height: 1118 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();

  for (const scrollY of [14500, 15800, 17000]) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(220);
  }

  const metrics = await page.evaluate(() => {
    const diceWrapper = document.querySelector(".m3_dice_section .dice_items");
    const tvBackFace = document.querySelector(".m3_dice_section .dice_item:nth-child(5)");
    const m4 = document.querySelector(".main.m4");
    const sticky = document.querySelector(".main.m4 .m4_sticky");
    const businessWheel = document.querySelector(".main.m4 .business_items");
    const businessRect = businessWheel?.getBoundingClientRect();
    const matrix =
      diceWrapper instanceof HTMLElement
        ? getComputedStyle(diceWrapper)
            .transform.replace("matrix3d(", "")
            .replace(")", "")
            .split(",")
            .map((value) => Number(value.trim()))
        : [];
    const tvBackRect = tvBackFace?.getBoundingClientRect();
    const stickyRect = sticky?.getBoundingClientRect();

    return {
      matrix,
      tvBackRect: {
        left: Math.round(tvBackRect?.left ?? -1),
        top: Math.round(tvBackRect?.top ?? -1),
        width: Math.round(tvBackRect?.width ?? -1),
        height: Math.round(tvBackRect?.height ?? -1),
      },
      m4Background: m4 instanceof HTMLElement ? getComputedStyle(m4).backgroundColor : "",
      stickyTop: Math.round(stickyRect?.top ?? -1),
      businessRect: {
        left: Math.round(businessRect?.left ?? -1),
        top: Math.round(businessRect?.top ?? -1),
        width: Math.round(businessRect?.width ?? -1),
        height: Math.round(businessRect?.height ?? -1),
      },
      businessTransform: businessWheel instanceof HTMLElement ? getComputedStyle(businessWheel).transform : "",
    };
  });

  expect(metrics.matrix[0]).toBeGreaterThanOrEqual(3.98);
  expect(metrics.matrix[0]).toBeLessThanOrEqual(4.02);
  expect(metrics.matrix[6]).toBeGreaterThanOrEqual(3.98);
  expect(metrics.matrix[6]).toBeLessThanOrEqual(4.02);
  expect(metrics.tvBackRect.left).toBeGreaterThanOrEqual(-2360);
  expect(metrics.tvBackRect.left).toBeLessThanOrEqual(-2310);
  expect(metrics.tvBackRect.top).toBeGreaterThanOrEqual(-285);
  expect(metrics.tvBackRect.top).toBeLessThanOrEqual(-245);
  expect(metrics.tvBackRect.width).toBeGreaterThanOrEqual(6620);
  expect(metrics.tvBackRect.width).toBeLessThanOrEqual(6680);
  expect(metrics.tvBackRect.height).toBeGreaterThanOrEqual(1640);
  expect(metrics.tvBackRect.height).toBeLessThanOrEqual(1680);
  expect(metrics.m4Background).toBe("rgba(0, 0, 0, 0)");
  expect(metrics.stickyTop).toBe(0);
  expect(metrics.businessRect.left).toBeGreaterThanOrEqual(155);
  expect(metrics.businessRect.left).toBeLessThanOrEqual(185);
  expect(metrics.businessRect.top).toBeGreaterThanOrEqual(210);
  expect(metrics.businessRect.top).toBeLessThanOrEqual(240);
  expect(metrics.businessRect.width).toBeGreaterThanOrEqual(1610);
  expect(metrics.businessRect.width).toBeLessThanOrEqual(1650);
  expect(metrics.businessRect.height).toBeGreaterThanOrEqual(895);
  expect(metrics.businessRect.height).toBeLessThanOrEqual(930);
  expect(metrics.businessTransform).toContain("matrix3d");
});
