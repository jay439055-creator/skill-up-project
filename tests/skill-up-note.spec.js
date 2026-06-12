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
    const logo = document.querySelector("[data-testid='figma-elif-logo']");
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
      logoAlt: logo instanceof HTMLImageElement ? logo.alt : "",
      logoSrc: logo instanceof HTMLImageElement ? logo.getAttribute("src") : "",
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
  expect(metrics.logoAlt).toBe("ELiF");
  expect(metrics.logoSrc).toBe("/figma/skill-up-note/elif-logo-source.svg");
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

test("skill up note renders extracted Figma image assets", async ({ page }) => {
  await openSkillUpNote(page, { width: 1920, height: 2200 });
  await page.waitForFunction(() => {
    const images = Array.from(
      document.querySelectorAll(
        "[data-testid='figma-hero-mockup'], [data-testid='figma-elif-logo'], [data-testid='figma-question-photo'], [data-testid='figma-field-photo']",
      ),
    );

    return images.length === 4 && images.every((element) => element instanceof HTMLImageElement && element.naturalWidth > 0);
  });

  const assets = await page.evaluate(() => {
    return [
      ["hero", document.querySelector("[data-testid='figma-hero-mockup']")],
      ["logo", document.querySelector("[data-testid='figma-elif-logo']")],
      ["question", document.querySelector("[data-testid='figma-question-photo']")],
      ["field", document.querySelector("[data-testid='figma-field-photo']")],
    ].map(([name, element]) => {
      const image = element instanceof HTMLImageElement ? element : null;
      const rect = image?.getBoundingClientRect();

      return {
        name,
        src: image?.getAttribute("src") ?? "",
        complete: image?.complete ?? false,
        naturalWidth: image?.naturalWidth ?? 0,
        naturalHeight: image?.naturalHeight ?? 0,
        renderedWidth: Math.round(rect?.width ?? 0),
        renderedHeight: Math.round(rect?.height ?? 0),
      };
    });
  });

  expect(assets).toEqual([
    expect.objectContaining({
      name: "hero",
      naturalHeight: expect.any(Number),
      naturalWidth: expect.any(Number),
      src: "/figma/skill-up-note/hero-macbook-source.png",
    }),
    expect.objectContaining({
      name: "logo",
      naturalHeight: expect.any(Number),
      naturalWidth: expect.any(Number),
      src: "/figma/skill-up-note/elif-logo-source.svg",
    }),
    expect.objectContaining({
      name: "question",
      naturalHeight: expect.any(Number),
      naturalWidth: expect.any(Number),
      src: "/figma/skill-up-note/question-photo-source.png",
    }),
    expect.objectContaining({
      name: "field",
      naturalHeight: expect.any(Number),
      naturalWidth: expect.any(Number),
      src: "/figma/skill-up-note/field-research-photo.png",
    }),
  ]);

  for (const asset of assets) {
    expect(asset.naturalWidth, `${asset.name} natural width`).toBeGreaterThan(0);
    expect(asset.naturalHeight, `${asset.name} natural height`).toBeGreaterThan(0);
    expect(asset.renderedWidth, `${asset.name} rendered width`).toBeGreaterThan(0);
    expect(asset.renderedHeight, `${asset.name} rendered height`).toBeGreaterThan(0);
  }
});

test("skill up note does not paste the full Behance board as a screenshot", async ({ page }) => {
  await openSkillUpNote(page, { width: 1440, height: 900 });

  const implementation = await page.evaluate(() => {
    const allowedImageSources = [
      "/figma/skill-up-note/back-on-track-ui-source.jpg",
      "/figma/skill-up-note/branch-interface-source.jpg",
      "/figma/skill-up-note/elif-logo-source.svg",
      "/figma/skill-up-note/field-research-photo.png",
      "/figma/skill-up-note/hero-macbook-source.png",
      "/figma/skill-up-note/library-history-source.jpg",
      "/figma/skill-up-note/question-photo-source.png",
    ];

    return {
      cards: document.querySelectorAll(
        ".note-stage-card, .note-track-card, .note-team-row, .note-observation-card, .note-library-card, .note-branch-card, .note-whatif-card",
      ).length,
      fullBoardImages: Array.from(document.images).filter((image) => image.naturalHeight > 10_000 || /behance|final|최종/i.test(image.src)),
      imageSources: Array.from(document.images).map((image) => new URL(image.src).pathname),
      screenshotWrappers: document.querySelectorAll("[data-testid='skill-up-note-screenshot-wrapper']").length,
      text: document.body.innerText,
      allowedImageSources,
    };
  });

  expect(implementation.screenshotWrappers).toBe(0);
  expect(implementation.fullBoardImages).toHaveLength(0);
  expect(implementation.imageSources.sort()).toEqual(implementation.allowedImageSources.sort());
  expect(implementation.cards).toBeGreaterThanOrEqual(13);
  expect(implementation.text).toContain("회의 중 AI 개입의 필요성");
  expect(implementation.text).toContain("참여 관찰 개요");
  expect(implementation.text).toContain("여러 팀에서 공통적으로 발생한 어려움");
  expect(implementation.text).toContain("회의 병목의 극복을 도운 참여자들");
  expect(implementation.text).toContain("회의에 만능 헬퍼");
  expect(implementation.text).toContain("누적된 대화들을 해체하고 분석");
});

test("skill up note extracted assets remain responsive on mobile", async ({ page }) => {
  await openSkillUpNote(page, { width: 390, height: 844 });
  await page.waitForFunction(() => {
    const images = Array.from(
      document.querySelectorAll(
        "[data-testid='figma-hero-mockup'], [data-testid='figma-elif-logo'], [data-testid='figma-question-photo'], [data-testid='figma-field-photo']",
      ),
    );

    return images.length === 4 && images.every((element) => element instanceof HTMLImageElement && element.naturalWidth > 0);
  });

  const metrics = await page.evaluate(() => {
    const loadedImages = Array.from(
      document.querySelectorAll(
        "[data-testid='figma-hero-mockup'], [data-testid='figma-elif-logo'], [data-testid='figma-question-photo'], [data-testid='figma-field-photo']",
      ),
    ).map((element) => {
      const image = element instanceof HTMLImageElement ? element : null;

      return {
        src: image?.getAttribute("src") ?? "",
        naturalWidth: image?.naturalWidth ?? 0,
      };
    });

    const questionHeading = document.querySelector(".note-question-band h1");
    const deskHeading = document.querySelector(".note-desk-section h2");

    return {
      docWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      loadedImages,
      questionText: questionHeading?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      deskText: deskHeading?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    };
  });

  expect(metrics.docWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.loadedImages).toHaveLength(4);
  for (const image of metrics.loadedImages) {
    expect(image.src).toContain("/figma/skill-up-note/");
    expect(image.naturalWidth).toBeGreaterThan(0);
  }
  expect(metrics.questionText).toContain("더 똑똑하게 할 수는 없을까요?");
  expect(metrics.deskText).toContain("회의는 아이디어가 생성되고");
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
