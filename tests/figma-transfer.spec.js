import { expect, test } from "playwright/test";

async function openBpco(page, viewportSize = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewportSize);
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
}

test("BPCO hero uses the source 3D object instead of the stale Lumio surface", async ({ page }) => {
  await openBpco(page);
  await expect(page.getByLabel("Bigpicture Company navigation")).toBeVisible();
  await expect(page.getByLabel("BPCO hero").getByRole("heading", { name: /We share Our pleasure/i })).toBeVisible();
  await expect(page.getByTestId("hero-object")).toBeVisible();
  await expect(page.getByText("Lumio")).toHaveCount(0);

  const source = await page.getByTestId("hero-object").evaluate((element) => element.getAttribute("src") ?? "");
  expect(source).toContain("/three/model/bicpicture.glb");
});

test("BPCO scroll scene exposes editable project and business DOM layers", async ({ page }) => {
  await openBpco(page);
  const counts = await page.evaluate(() => ({
    iframes: document.querySelectorAll("iframe").length,
    videos: document.querySelectorAll("video").length,
    projects: document.querySelectorAll(".mp_item").length,
    businessItems: document.querySelectorAll(".bs_item").length,
    descriptions: document.querySelectorAll(".main_desc").length,
    text: document.body.innerText,
  }));

  expect(counts.iframes).toBe(0);
  expect(counts.videos).toBe(0);
  expect(counts.projects).toBe(4);
  expect(counts.businessItems).toBe(14);
  expect(counts.descriptions).toBe(3);
  expect(counts.text).toContain("BAEMIN B OOH CAMPAIGN");
  expect(counts.text).toContain("We will, as always, seek the answers");
});
