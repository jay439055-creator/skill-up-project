import { expect, test } from "playwright/test";

test("wide project scroll keeps the source cube stage before business", async ({ page }) => {
  // Given: the source at 2048px wide still shows the project cube on a light stage at this scroll point.
  await page.setViewportSize({ width: 2048, height: 1192 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();

  // When: the page is scrolled to the source late-project checkpoint.
  await page.evaluate(() => window.scrollTo(0, 13528));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  const metrics = await page.evaluate(() => {
    const diceWrapper = document.querySelector(".m3_dice_section .dice_items");
    const business = document.querySelector(".main.m4");
    const bottomFace = document.querySelectorAll(".m3_dice_section .dice_item")[4];
    const wrapperRect = diceWrapper?.getBoundingClientRect();
    const businessRect = business?.getBoundingClientRect();
    const bottomRect = bottomFace?.getBoundingClientRect();

    return {
      background: getComputedStyle(document.body).background,
      businessTop: Math.round(businessRect?.top ?? -1),
      diceTransform: diceWrapper instanceof HTMLElement ? getComputedStyle(diceWrapper).transform : "",
      diceMatrix:
        diceWrapper instanceof HTMLElement
          ? getComputedStyle(diceWrapper)
              .transform.replace("matrix3d(", "")
              .replace(")", "")
              .split(",")
              .map((value) => Number(value.trim()))
          : [],
      diceWidth: Math.round(wrapperRect?.width ?? -1),
      diceTop: Math.round(wrapperRect?.top ?? -1),
      bottomTop: Math.round(bottomRect?.top ?? -1),
      bottomHeight: Math.round(bottomRect?.height ?? -1),
    };
  });

  // Then: it matches the live reference timing instead of entering the black business scene early.
  expect(metrics.businessTop).toBeGreaterThanOrEqual(2500);
  expect(metrics.businessTop).toBeLessThanOrEqual(2750);
  expect(metrics.diceTransform).toContain("matrix3d");
  expect(metrics.diceMatrix[0]).toBeGreaterThanOrEqual(0.62);
  expect(metrics.diceMatrix[0]).toBeLessThanOrEqual(0.64);
  expect(metrics.diceMatrix[2]).toBeGreaterThanOrEqual(0.77);
  expect(metrics.diceMatrix[2]).toBeLessThanOrEqual(0.79);
  expect(metrics.diceWidth).toBeGreaterThanOrEqual(380);
  expect(metrics.diceWidth).toBeLessThanOrEqual(430);
  expect(metrics.diceTop).toBeGreaterThanOrEqual(335);
  expect(metrics.diceTop).toBeLessThanOrEqual(360);
  expect(metrics.bottomTop).toBeGreaterThanOrEqual(735);
  expect(metrics.bottomTop).toBeLessThanOrEqual(755);
  expect(metrics.bottomHeight).toBeGreaterThanOrEqual(145);
  expect(metrics.bottomHeight).toBeLessThanOrEqual(180);

  await page.evaluate(() => window.scrollTo(0, 15000));
  await page.waitForTimeout(250);

  const preludeMetrics = await page.evaluate(() => {
    const business = document.querySelector(".main.m4");
    const businessRect = business?.getBoundingClientRect();

    return {
      businessTop: Math.round(businessRect?.top ?? -1),
      preludeContent: business instanceof HTMLElement ? getComputedStyle(business, "::before").content : "",
    };
  });

  expect(preludeMetrics.businessTop).toBeGreaterThanOrEqual(1100);
  expect(preludeMetrics.businessTop).toBeLessThanOrEqual(1250);
  expect(preludeMetrics.preludeContent).toBe("none");
});

test("wide lower sections keep the source handoff offsets", async ({ page }) => {
  await page.setViewportSize({ width: 1970, height: 1118 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();

  const metrics = await page.evaluate(() => {
    const read = (selector) => {
      const element = document.querySelector(selector);
      return element instanceof HTMLElement
        ? {
            offsetTop: Math.round(element.offsetTop),
            offsetHeight: Math.round(element.offsetHeight),
          }
        : null;
    };

    return {
      project: read(".project_list"),
      business: read(".main.m4"),
      footer: read("footer"),
    };
  });

  expect(metrics.project).toEqual({ offsetTop: 8225, offsetHeight: 7526 });
  expect(metrics.business).toEqual({ offsetTop: 15751, offsetHeight: 3618 });
  expect(metrics.footer).toEqual({ offsetTop: 19369, offsetHeight: 1118 });
});

test("wide project pre-card stage keeps the fixed source dice layer alive", async ({ page }) => {
  await page.setViewportSize({ width: 1970, height: 1118 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 7200));
  await page.waitForTimeout(300);

  const metrics = await page.evaluate(() => {
    const section = document.querySelector(".m3_dice_section");
    const dice = document.querySelector(".m3_dice_section .dice_items");
    const sectionStyle = section instanceof HTMLElement ? getComputedStyle(section) : null;
    const diceRect = dice?.getBoundingClientRect();

    return {
      sectionOpacity: sectionStyle === null ? -1 : Number(sectionStyle.opacity),
      sectionZIndex: sectionStyle?.zIndex ?? "",
      diceWidth: Math.round(diceRect?.width ?? -1),
      diceHeight: Math.round(diceRect?.height ?? -1),
      diceTransform: dice instanceof HTMLElement ? getComputedStyle(dice).transform : "",
    };
  });

  expect(metrics.sectionOpacity).toBeGreaterThanOrEqual(0.95);
  expect(metrics.sectionZIndex).toBe("2");
  expect(metrics.diceWidth).toBe(0);
  expect(metrics.diceHeight).toBe(0);
  expect(metrics.diceTransform).toContain("matrix3d");
});
