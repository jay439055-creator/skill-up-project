import { expect, test } from "playwright/test";

async function openBpcoWide(page) {
  await page.setViewportSize({ width: 1970, height: 1118 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector("#main_canvas")?.getAttribute("data-renderer-ready") === "true",
    undefined,
    { timeout: 30000 },
  );
  await page.waitForTimeout(1_000);
}

function readWideM2Checkpoint() {
  const readRect = (selector) => {
    const element = document.querySelector(selector);
    const rect = element?.getBoundingClientRect();

    return rect === undefined
      ? null
      : {
          left: Number(rect.left.toFixed(1)),
          top: Number(rect.top.toFixed(1)),
          width: Number(rect.width.toFixed(1)),
          bottom: Number(rect.bottom.toFixed(1)),
        };
  };

  return {
    scrollY: window.scrollY,
    sticky: readRect(".m2_sticky"),
    row: readRect(".row_container"),
    rs1: readRect(".row_section.rs1"),
    rs5: readRect(".row_section.rs5"),
  };
}

test("wide philosophy row stays pinned until the source project handoff", async ({ page }) => {
  await openBpcoWide(page);

  await page.evaluate(() => {
    document.documentElement.scrollTop = 7800;
    window.scrollTo({ top: 7800, left: 0, behavior: "instant" });
  });
  await page.waitForTimeout(1_200);

  const metrics = await page.evaluate(readWideM2Checkpoint);

  expect(metrics.scrollY).toBe(7800);
  expect(metrics.sticky?.top).toBeGreaterThanOrEqual(-1);
  expect(metrics.sticky?.top).toBeLessThanOrEqual(1);
  expect(metrics.row?.top).toBeGreaterThanOrEqual(-1);
  expect(metrics.row?.top).toBeLessThanOrEqual(1);
  expect(metrics.row?.width).toBeGreaterThanOrEqual(10240);
  expect(metrics.row?.width).toBeLessThanOrEqual(10252);
  expect(metrics.rs1?.left).toBeGreaterThanOrEqual(-7700);
  expect(metrics.rs1?.left).toBeLessThanOrEqual(-7600);
  expect(metrics.rs1?.width).toBeGreaterThanOrEqual(2260);
  expect(metrics.rs1?.width).toBeLessThanOrEqual(2270);
  expect(metrics.rs5?.left).toBeGreaterThanOrEqual(580);
  expect(metrics.rs5?.left).toBeLessThanOrEqual(650);
});
