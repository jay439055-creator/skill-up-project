import { expect, test } from "playwright/test";

async function openSkillUpNote(page, viewportSize = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewportSize);
  await page.goto("/skill-up-note");
  await expect(page.getByTestId("skill-up-note-page")).toBeVisible();
}

test("skill up note lower solution sections use only approved extracted assets", async ({ page }) => {
  await openSkillUpNote(page, { width: 1440, height: 900 });
  await page.waitForFunction(() => {
    const image = document.querySelector(".note-library-ui-image");

    return image instanceof HTMLImageElement && image.naturalWidth === 1540 && image.naturalHeight === 980;
  });

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
    const text = document.body.innerText;
    const lowerSection = document.querySelector(".note-solution-section");
    const lowerElements = lowerSection ? Array.from(lowerSection.querySelectorAll("*")) : [];
    const backgroundUrls = lowerElements.flatMap((element) => {
      const style = getComputedStyle(element);
      const urls = [style.backgroundImage, style.maskImage].filter((value) => value.includes("url("));

      return urls.map((value) => ({ className: element.className.toString(), value }));
    });

    const libraryImage = document.querySelector(".note-library-ui-image");

    return {
      allowedImageSources,
      backgroundUrls,
      buttons: Array.from(document.querySelectorAll(".note-whatif-panel button")).map((button) =>
        button.textContent?.trim() ?? "",
      ),
      embeddedMedia: lowerSection?.querySelectorAll("canvas, iframe, img, svg image, video").length ?? 0,
      domCards: document.querySelectorAll(".note-library-card, .note-branch-card, .note-whatif-card").length,
      whatIfStages: document.querySelectorAll(".note-whatif-stage").length,
      fullBoardImages: Array.from(document.images).filter((image) => image.naturalHeight > 10_000 || /behance|final|최종/i.test(image.src)),
      imageSources: Array.from(document.images).map((image) => new URL(image.src).pathname),
      libraryImage: {
        height: libraryImage instanceof HTMLImageElement ? libraryImage.naturalHeight : 0,
        src: libraryImage instanceof HTMLImageElement ? libraryImage.getAttribute("src") ?? "" : "",
        width: libraryImage instanceof HTMLImageElement ? libraryImage.naturalWidth : 0,
      },
      sections: {
        branch: document.querySelectorAll(".note-branch-section").length,
        final: document.querySelectorAll(".note-final-section").length,
        library: document.querySelectorAll(".note-library-section").length,
        whatIf: document.querySelectorAll(".note-whatif-section").length,
      },
      text,
    };
  });

  expect(implementation.fullBoardImages).toHaveLength(0);
  expect(implementation.imageSources.sort()).toEqual(implementation.allowedImageSources.sort());
  expect(implementation.libraryImage).toEqual({
    height: 980,
    src: "/figma/skill-up-note/library-history-source.jpg",
    width: 1540,
  });
  expect(implementation.backgroundUrls).toHaveLength(0);
  expect(implementation.embeddedMedia).toBe(3);
  expect(implementation.sections).toEqual({ branch: 1, final: 1, library: 1, whatIf: 1 });
  expect(implementation.domCards).toBeGreaterThanOrEqual(3);
  expect(implementation.whatIfStages).toBe(2);
  expect(implementation.buttons).toEqual(["적용 기준 보기", "다시 생성하기", "브랜치에 반영하기"]);
  const normalizedText = implementation.text.replace(/\s+/g, " ");
  expect(normalizedText).toContain("Information Architecture");
  expect(normalizedText).toContain("Library for Retrievable History");
  expect(normalizedText).toContain("Branch Interface for Contextual Clarity");
  expect(normalizedText).toContain("Tailored Alternative: What-if");
  expect(normalizedText).toContain("1 Context Aware Suggestion");
  expect(normalizedText).toContain("2 Context Aware Suggestion");
  expect(normalizedText).toContain("3 Option Cards");
  expect(normalizedText).toContain("번거롭다는 인식의 역전");
  expect(normalizedText).toContain("실용 관점에서의 AI 도입");
});

test("skill up note lower solution panels stay inside the 1920 frame", async ({ page }) => {
  await openSkillUpNote(page, { width: 1920, height: 1200 });

  const metrics = await page.evaluate(() => {
    const frame = document.querySelector("[data-testid='skill-up-note-frame']");
    const selectors = [".note-product-shot", ".note-library-panel", ".note-branch-panel", ".note-whatif-panel", ".note-final-product"];

    return {
      frameHeight: Math.round(frame?.getBoundingClientRect().height ?? 0),
      panels: selectors.map((selector) => {
        const element = document.querySelector(selector);
        const rect = element?.getBoundingClientRect();

        return {
          height: Math.round(rect?.height ?? 0),
          left: Math.round(rect?.left ?? 0),
          selector,
          width: Math.round(rect?.width ?? 0),
        };
      }),
    };
  });

  expect(metrics.frameHeight).toBeGreaterThanOrEqual(33540);
  expect(metrics.frameHeight).toBeLessThanOrEqual(33555);

  for (const panel of metrics.panels) {
    expect(panel.left, `${panel.selector} left edge`).toBeGreaterThanOrEqual(0);
    expect(panel.width, `${panel.selector} width`).toBeGreaterThan(300);
    expect(panel.left + panel.width, `${panel.selector} right edge`).toBeLessThanOrEqual(1920);
    expect(panel.height, `${panel.selector} height`).toBeGreaterThan(300);
  }
});

test("skill up note what-if panel follows the Figma final-card structure", async ({ page }) => {
  await openSkillUpNote(page, { width: 1920, height: 1200 });
  await page.locator(".note-whatif-panel").scrollIntoViewIfNeeded();

  const structure = await page.evaluate(() => {
    const panel = document.querySelector(".note-whatif-panel");
    const rect = panel?.getBoundingClientRect();
    const cards = Array.from(panel?.querySelectorAll(".note-whatif-card") ?? []).map((card) => {
      const cardRect = card.getBoundingClientRect();

      return {
        className: card.className,
        height: Math.round(cardRect.height),
        title: card.querySelector("h3")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
        width: Math.round(cardRect.width),
      };
    });

    return {
      abstractMockups: document.querySelectorAll(".note-context-mockup").length,
      buttons: Array.from(panel?.querySelectorAll("button") ?? []).map((button) => button.textContent?.trim() ?? ""),
      cardCount: cards.length,
      cards,
      conditionRows: document.querySelectorAll(".note-condition-row").length,
      branchNodes: document.querySelectorAll(".note-branch-node").length,
      left: Math.round(rect?.left ?? 0),
      pager: panel?.querySelector(".note-whatif-pager strong")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      referenceRows: panel?.querySelectorAll(".note-whatif-source-row").length ?? 0,
      selectedCards: panel?.querySelectorAll(".note-whatif-card.is-selected").length ?? 0,
      suggestionPreviews: document.querySelectorAll(".note-suggestion-preview").length,
      titleLines: Array.from(document.querySelectorAll(".note-whatif-title span")).map((line) => line.textContent?.trim() ?? ""),
      height: Math.round(rect?.height ?? 0),
      width: Math.round(rect?.width ?? 0),
      overflowingCards: Array.from(panel?.querySelectorAll(".note-whatif-card") ?? []).filter((card) => {
        const cardRect = card.getBoundingClientRect();
        const contentRect = card.querySelector(".note-whatif-card-content")?.getBoundingClientRect();

        return contentRect ? contentRect.bottom > cardRect.bottom - 24 : true;
      }).length,
    };
  });

  expect(structure.abstractMockups).toBe(0);
  expect(structure.suggestionPreviews).toBe(2);
  expect(structure.conditionRows).toBeGreaterThanOrEqual(6);
  expect(structure.branchNodes).toBeGreaterThanOrEqual(7);
  expect(structure.titleLines).toEqual(["Tailored Alternative:", "What-if"]);
  expect(structure.left).toBe(299);
  expect(structure.width).toBe(1440);
  expect(structure.height).toBeGreaterThanOrEqual(800);
  expect(structure.height).toBeLessThanOrEqual(830);
  expect(structure.buttons).toEqual(["적용 기준 보기", "다시 생성하기", "브랜치에 반영하기"]);
  expect(structure.pager).toBe("1 / 4");
  expect(structure.cardCount).toBe(3);
  expect(structure.selectedCards).toBe(1);
  expect(structure.referenceRows).toBe(3);
  expect(structure.overflowingCards).toBe(0);
  expect(structure.cards.map((card) => card.title)).toEqual([
    "한번에 스윽 넘기고, 확인하는 보안 만족도",
    "번거롭다는 인식의 역전, 챗봇 퀴즈로 가벼운 보안 점검",
    "AI 기반 리디자인 피드백 시스템 도입 가능성",
  ]);

  for (const card of structure.cards) {
    expect(card.width).toBeGreaterThanOrEqual(350);
    expect(card.width).toBeLessThanOrEqual(410);
    expect(card.height).toBeGreaterThanOrEqual(500);
  }
});
