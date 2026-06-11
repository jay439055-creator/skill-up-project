import { expect, test } from "playwright/test";

async function readBpcoStructure(page) {
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  return page.evaluate(() => ({
    layerLikeNodes: document.querySelectorAll("section, article, div, canvas, h1, h2, p, span, a, strong").length,
    visualNodes: document.querySelectorAll("#main_canvas, #main_canvas canvas, .led_item, .mp_item, .pr_img, .bs_item").length,
    textNodes: Array.from(document.querySelectorAll("h1, h2, p, span, a, strong"))
      .map((node) => node.textContent?.trim())
      .filter((text) => text !== undefined && text.length > 0),
  }));
}

test("BPCO page exposes many editable visual and text layers", async ({ page }) => {
  const structure = await readBpcoStructure(page);
  expect(structure.layerLikeNodes).toBeGreaterThanOrEqual(100);
  expect(structure.visualNodes).toBeGreaterThanOrEqual(28);
  expect(structure.textNodes.length).toBeGreaterThan(55);
});

test("BPCO structure preserves key editable text entries", async ({ page }) => {
  const structure = await readBpcoStructure(page);
  const allText = structure.textNodes.join("\n");
  expect(allText).toContain("Bigpicture Company");
  expect(allText).toContain("We share Our pleasure");
  expect(allText).toContain("RECENT PROJECT");
  expect(allText).toContain("BAEMIN B OOH CAMPAIGN");
  expect(allText).toContain("We will, as always, seek the answers");
});

test("BPCO artifact is not a single screenshot wrapper", async ({ page }) => {
  const structure = await readBpcoStructure(page);
  expect(structure.layerLikeNodes).toBeGreaterThan(structure.visualNodes);
  expect(await page.locator("iframe").count()).toBe(0);
  expect(await page.locator("main > img").count()).toBe(0);
});
