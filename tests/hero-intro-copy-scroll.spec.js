import { expect, test } from "playwright/test";

async function openBpco(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector("#main_canvas")?.getAttribute("data-renderer-ready") === "true",
    undefined,
    { timeout: 30000 },
  );
}

test("hero intro copy keeps the source full opacity while it scrolls away", async ({ page }) => {
  // Given: the BPCO hero is loaded at the source desktop viewport.
  await openBpco(page);

  const samples = [];
  for (const scrollY of [0, 180, 360, 720, 1200, 1800]) {
    // When: the page is scrubbed through the hero object choreography.
    await page.evaluate((targetY) => window.scrollTo(0, targetY), scrollY);
    await page.waitForTimeout(180);
    samples.push(await page.evaluate(() => {
      const introCopy = document.querySelector(".main.m1 .intro_copy");
      const rect = introCopy?.getBoundingClientRect();

      return {
        opacity: Number(introCopy instanceof HTMLElement ? getComputedStyle(introCopy).opacity : -1),
        top: Math.round(rect?.top ?? 9999),
      };
    }));
  }

  // Then: matching the live source, the copy moves with scroll but does not fade independently.
  expect(samples.map((sample) => sample.top)).toEqual([171, -9, -189, -549, -1029, -1629]);
  for (const sample of samples) {
    expect(sample.opacity).toBeGreaterThan(0.99);
  }
});
