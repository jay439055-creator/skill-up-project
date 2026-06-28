import { expect, test } from "playwright/test";

test("wide business wheel keeps the source-sized cylindrical text stage", async ({ page }) => {
  await page.setViewportSize({ width: 1970, height: 1118 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);

  await page.evaluate(() => window.scrollTo(0, 16500));
  await page.waitForTimeout(1200);

  const metrics = await page.evaluate(() => {
    const wheel = document.querySelector(".main.m4 .business_items");
    const items = [...document.querySelectorAll(".main.m4 .business_items .bs_item")];
    const firstItem = items[0]?.querySelector(".bs_label") ?? items[0];
    const proposal = items.find((item) => item.textContent?.trim() === "PROPOSAL")?.querySelector(".bs_label");
    const readRect = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect
        ? {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
        : null;
    };

    return {
      fontSize: wheel instanceof HTMLElement ? getComputedStyle(wheel).fontSize : "",
      lineHeight: wheel instanceof HTMLElement ? getComputedStyle(wheel).lineHeight : "",
      opacity: wheel instanceof HTMLElement ? Number(getComputedStyle(wheel).opacity) : -1,
      wheelRect: readRect(wheel),
      firstRect: readRect(firstItem),
      proposalRect: readRect(proposal),
    };
  });

  expect(metrics.fontSize).toBe("102.44px");
  expect(metrics.lineHeight).toBe("102.44px");
  expect(metrics.opacity).toBeGreaterThan(0.95);
  expect(metrics.wheelRect?.left).toBeGreaterThanOrEqual(120);
  expect(metrics.wheelRect?.left).toBeLessThanOrEqual(145);
  expect(metrics.wheelRect?.top).toBeGreaterThanOrEqual(0);
  expect(metrics.wheelRect?.top).toBeLessThanOrEqual(45);
  expect(metrics.wheelRect?.width).toBeGreaterThanOrEqual(1680);
  expect(metrics.wheelRect?.width).toBeLessThanOrEqual(1735);
  expect(metrics.wheelRect?.height).toBeGreaterThanOrEqual(800);
  expect(metrics.wheelRect?.height).toBeLessThanOrEqual(860);
  expect(metrics.firstRect?.top).toBeGreaterThanOrEqual(220);
  expect(metrics.firstRect?.top).toBeLessThanOrEqual(255);
  expect(metrics.firstRect?.width).toBeGreaterThanOrEqual(185);
  expect(metrics.firstRect?.width).toBeLessThanOrEqual(205);
  expect(metrics.firstRect?.height).toBeGreaterThanOrEqual(65);
  expect(metrics.firstRect?.height).toBeLessThanOrEqual(80);
  expect(metrics.proposalRect?.left).toBeGreaterThanOrEqual(570);
  expect(metrics.proposalRect?.left).toBeLessThanOrEqual(625);
  expect(metrics.proposalRect?.top).toBeGreaterThanOrEqual(165);
  expect(metrics.proposalRect?.top).toBeLessThanOrEqual(185);
  expect(metrics.proposalRect?.width).toBeGreaterThanOrEqual(765);
  expect(metrics.proposalRect?.width).toBeLessThanOrEqual(805);
  expect(metrics.proposalRect?.height).toBeGreaterThanOrEqual(100);
  expect(metrics.proposalRect?.height).toBeLessThanOrEqual(115);
});
