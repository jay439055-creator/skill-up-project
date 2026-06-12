import { expect, test } from "playwright/test";

const expectedSections = Array.from({ length: 17 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const extension = number === "06" ? "png" : "svg";

  return `/figma/skill-up-note/elif-source/Elif_${number}.${extension}`;
});

const expectedHeights = [
  1107, 545, 2092, 2425, 3157, 1292, 1926, 1467, 2685, 1859, 1410, 1162, 1080, 2036, 2365, 1984, 2332,
];

async function openSkillUpNote(page, viewportSize = { width: 1920, height: 1200 }) {
  await page.setViewportSize(viewportSize);
  await page.goto("/skill-up-note");
  await expect(page.getByTestId("skill-up-note-page")).toBeVisible();
}

async function loadAllSourceSections(page) {
  await page.evaluate(async () => {
    const documentHeight = document.documentElement.scrollHeight;

    for (let y = 0; y <= documentHeight; y += 1200) {
      window.scrollTo(0, y);
      await new Promise((resolve) => {
        window.setTimeout(resolve, 30);
      });
    }

    window.scrollTo(0, 0);
  });
}

test("skill up note renders the ELiF source files in order", async ({ page }) => {
  await openSkillUpNote(page);
  await loadAllSourceSections(page);
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll(".elif-source-section"));

    return images.length === 17 && images.every((element) => element instanceof HTMLImageElement && element.naturalWidth === 1920);
  });

  const metrics = await page.evaluate(() => {
    const frame = document.querySelector("[data-testid='skill-up-note-frame']");
    const frameRect = frame?.getBoundingClientRect();
    const images = Array.from(document.querySelectorAll(".elif-source-section")).map((element) => {
      const image = element instanceof HTMLImageElement ? element : null;
      const rect = image?.getBoundingClientRect();

      return {
        index: image?.dataset["elifIndex"] ?? "",
        naturalHeight: image?.naturalHeight ?? 0,
        naturalWidth: image?.naturalWidth ?? 0,
        renderedHeight: Math.round(rect?.height ?? 0),
        renderedWidth: Math.round(rect?.width ?? 0),
        source: image ? new URL(image.src).pathname : "",
      };
    });

    return {
      frameHeight: Math.round(frameRect?.height ?? 0),
      frameWidth: Math.round(frameRect?.width ?? 0),
      imageSources: images.map((image) => image.source),
      images,
      oldSections: document.querySelectorAll(".note-hero, .note-solution-section, .note-whatif-section, .note-final-section").length,
      screenshotWrappers: document.querySelectorAll("[data-testid='skill-up-note-screenshot-wrapper']").length,
    };
  });

  expect(metrics.frameWidth).toBe(1920);
  expect(metrics.frameHeight).toBe(30_924);
  expect(metrics.imageSources).toEqual(expectedSections);
  expect(metrics.oldSections).toBe(0);
  expect(metrics.screenshotWrappers).toBe(0);

  for (const [index, image] of metrics.images.entries()) {
    expect(image.index).toBe(String(index + 1));
    expect(image.naturalWidth).toBe(1920);
    expect(image.naturalHeight).toBe(expectedHeights[index]);
    expect(image.renderedWidth).toBe(1920);
    expect(image.renderedHeight).toBe(expectedHeights[index]);
  }
});

test("skill up note source stack scales without horizontal overflow on mobile", async ({ page }) => {
  await openSkillUpNote(page, { width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelectorAll(".elif-source-section").length === 17);

  const metrics = await page.evaluate(() => {
    const frame = document.querySelector("[data-testid='skill-up-note-frame']");
    const firstImage = document.querySelector(".elif-source-section");
    const frameRect = frame?.getBoundingClientRect();
    const firstRect = firstImage?.getBoundingClientRect();

    return {
      docWidth: document.documentElement.scrollWidth,
      frameWidth: Math.round(frameRect?.width ?? 0),
      firstImageWidth: Math.round(firstRect?.width ?? 0),
      imageCount: document.querySelectorAll(".elif-source-section").length,
      overflowX: getComputedStyle(document.querySelector("[data-testid='skill-up-note-page']") ?? document.body).overflowX,
      viewportWidth: window.innerWidth,
    };
  });

  expect(metrics.imageCount).toBe(17);
  expect(metrics.docWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.frameWidth).toBe(390);
  expect(metrics.firstImageWidth).toBe(390);
  expect(metrics.overflowX).toBe("hidden");
});

test("adding skill up note preserves existing routes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await expect(page.getByTestId("skill-up-note-page")).toHaveCount(0);

  await page.goto("/ripple");
  await expect(page.getByTestId("ripple-experience")).toBeVisible();
  await expect(page.getByTestId("skill-up-note-page")).toHaveCount(0);

  await page.goto("/not-a-real-page");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await expect(page.getByTestId("skill-up-note-page")).toHaveCount(0);
});
