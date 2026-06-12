import { expect, test } from "playwright/test";

async function openSkillUpNote(page) {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.goto("/skill-up-note");
  await expect(page.getByTestId("skill-up-note-page")).toBeVisible();
}

test("skill up note Back on Track uses the extracted final UI screen asset", async ({ page }) => {
  await openSkillUpNote(page);
  await page.locator(".note-final-section").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const image = document.querySelector(".note-final-ui-image");

    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  });

  const structure = await page.evaluate(() => {
    const section = document.querySelector(".note-final-section");
    const shell = section?.querySelector(".note-final-shell");
    const image = section?.querySelector(".note-final-ui-image");
    const shellRect = shell?.getBoundingClientRect();

    return {
      abstractCards: section?.querySelectorAll(".note-final-card").length ?? 0,
      imageHeight: image instanceof HTMLImageElement ? image.naturalHeight : 0,
      imageSource: image instanceof HTMLImageElement ? new URL(image.src).pathname : "",
      imageWidth: image instanceof HTMLImageElement ? image.naturalWidth : 0,
      shellHeight: Math.round(shellRect?.height ?? 0),
      shellLeft: Math.round(shellRect?.left ?? 0),
      shellWidth: Math.round(shellRect?.width ?? 0),
      title: section?.querySelector("h2")?.textContent?.trim() ?? "",
    };
  });

  expect(structure.title).toBe("Back on Track");
  expect(structure.abstractCards).toBe(0);
  expect(structure.imageSource).toBe("/figma/skill-up-note/back-on-track-ui-source.jpg");
  expect(structure.imageWidth).toBe(1140);
  expect(structure.imageHeight).toBe(830);
  expect(structure.shellLeft).toBeGreaterThanOrEqual(700);
  expect(structure.shellWidth).toBe(1140);
  expect(structure.shellHeight).toBe(830);
});
