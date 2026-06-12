import { expect, test } from "playwright/test";

async function openSkillUpNote(page, viewportSize = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewportSize);
  await page.goto("/skill-up-note");
  await expect(page.getByTestId("skill-up-note-page")).toBeVisible();
}

test("skill up note desktop frame matches Figma contract", async ({ page }) => {
  await openSkillUpNote(page, { width: 1440, height: 900 });

  const metrics = await page.evaluate(() => {
    const pageRoot = document.querySelector("[data-testid='skill-up-note-page']");
    const frame = document.querySelector("[data-testid='skill-up-note-frame']");
    const nodes = Array.from(document.querySelectorAll("[data-figma-node]")).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        id: element.getAttribute("data-figma-node"),
        left: Math.round(rect.left + window.scrollX),
        text: element.textContent?.replace(/\s+/g, " ").trim() ?? "",
        top: Math.round(rect.top + window.scrollY),
      };
    });

    return {
      background: pageRoot instanceof HTMLElement ? getComputedStyle(pageRoot).backgroundColor : "",
      bpcoPages: document.querySelectorAll("[data-testid='bpco-page']").length,
      frameHeight: Math.round(frame?.getBoundingClientRect().height ?? 0),
      frameWidth: Math.round(frame?.getBoundingClientRect().width ?? 0),
      imageWrappers: document.querySelectorAll("[data-testid='skill-up-note-screenshot-wrapper']").length,
      nodes,
      ripplePages: document.querySelectorAll("[data-testid='ripple-experience']").length,
      text: document.body.innerText,
    };
  });

  expect(metrics.bpcoPages).toBe(0);
  expect(metrics.ripplePages).toBe(0);
  expect(metrics.imageWrappers).toBe(0);
  expect(metrics.background).toBe("rgb(18, 18, 18)");
  expect(metrics.frameWidth).toBe(1920);
  expect(metrics.frameHeight).toBeGreaterThanOrEqual(33540);
  expect(metrics.frameHeight).toBeLessThanOrEqual(33555);
  expect(metrics.text).toContain("ELiF");
  expect(metrics.text).toContain("Higher Fidelity, Further Possibilties");
  expect(metrics.text).toContain("매일 하는 회의,");
  expect(metrics.text).toContain("더 똑똑하게 할 수는 없을까요?");
  expect(metrics.text).toContain("회의는 아이디어가 생성되고, 의견이 충돌하며");
  expect(metrics.text).toContain("Team Analysis");
  expect(metrics.text).toContain("Back on Track");

  const byId = new Map(metrics.nodes.map((node) => [node.id, node]));
  expect(byId.get("4:9891")?.top).toBeGreaterThanOrEqual(505);
  expect(byId.get("4:9891")?.top).toBeLessThanOrEqual(516);
  expect(byId.get("4:9896")?.top).toBeGreaterThanOrEqual(1310);
  expect(byId.get("4:9896")?.top).toBeLessThanOrEqual(1330);
  expect(byId.get("4:9898")?.top).toBeGreaterThanOrEqual(1790);
  expect(byId.get("4:9898")?.top).toBeLessThanOrEqual(1810);
  expect(byId.get("4:9900")?.top).toBeGreaterThanOrEqual(3870);
  expect(byId.get("4:9900")?.top).toBeLessThanOrEqual(3895);
});

test("skill up note mobile and nested route contract holds", async ({ page }) => {
  await openSkillUpNote(page, { width: 390, height: 844 });

  const metrics = await page.evaluate(() => {
    const frame = document.querySelector("[data-testid='skill-up-note-frame']");
    const pageRoot = document.querySelector("[data-testid='skill-up-note-page']");
    return {
      docWidth: document.documentElement.scrollWidth,
      frameTransform: frame instanceof HTMLElement ? getComputedStyle(frame).transform : "",
      pageOverflowX: pageRoot instanceof HTMLElement ? getComputedStyle(pageRoot).overflowX : "",
      viewportWidth: window.innerWidth,
    };
  });

  expect(metrics.docWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.frameTransform).not.toBe("none");
  expect(metrics.pageOverflowX).toBe("hidden");
  await expect(page.getByTestId("skill-up-note-page")).toHaveAttribute("data-subpage", "skill-up-note");
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
