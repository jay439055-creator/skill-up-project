import { expect, test } from "playwright/test";

test("exports BPCO route as editable text, image, and object layers", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  const layerCounts = await page.evaluate(() => ({
    sections: document.querySelectorAll("main .main, .project_list, footer").length,
    projects: document.querySelectorAll(".mp_item").length,
    images: document.querySelectorAll(".pr_img img, .round_img img, footer img").length,
    texts: Array.from(document.querySelectorAll("h1, h2, p, span, a, strong, small, div")).filter((node) => {
      const text = node.textContent?.trim();
      return text !== undefined && text.length > 0;
    }).length,
    heroObject: document.querySelectorAll("[data-testid='hero-object']").length,
  }));
  expect(layerCounts.sections).toBeGreaterThanOrEqual(5);
  expect(layerCounts.projects).toBeGreaterThanOrEqual(4);
  expect(layerCounts.images).toBeGreaterThanOrEqual(7);
  expect(layerCounts.texts).toBeGreaterThan(55);
  expect(layerCounts.heroObject).toBe(1);
});

test("preserves BPCO navigation and footer contact copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  const allText = await page.locator("body").innerText();
  expect(allText).toContain("HOME");
  expect(allText).toContain("PROJECTS");
  expect(allText).toContain("CONTACT");
  expect(allText).toContain("+82)02 798 9248");
  expect(allText).toContain("bpco@bpco.kr");
  expect(await page.locator("main > img").count()).toBe(0);
  expect(await page.locator("iframe").count()).toBe(0);
});
