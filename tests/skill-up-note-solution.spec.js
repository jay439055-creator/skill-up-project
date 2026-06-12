import { expect, test } from "playwright/test";

async function openSkillUpNote(page, viewportSize = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewportSize);
  await page.goto("/skill-up-note");
  await expect(page.getByTestId("skill-up-note-page")).toBeVisible();
}

test("skill up note lower solution sections are DOM-built instead of screenshots", async ({ page }) => {
  await openSkillUpNote(page, { width: 1440, height: 900 });

  const implementation = await page.evaluate(() => {
    const allowedImageSources = [
      "/figma/skill-up-note/elif-logo-source.svg",
      "/figma/skill-up-note/field-research-photo.png",
      "/figma/skill-up-note/hero-macbook-source.png",
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

    return {
      allowedImageSources,
      backgroundUrls,
      buttons: Array.from(document.querySelectorAll(".note-whatif-header button")).map((button) =>
        button.textContent?.trim() ?? "",
      ),
      embeddedMedia: lowerSection?.querySelectorAll("canvas, iframe, img, svg image, video").length ?? 0,
      domCards: document.querySelectorAll(".note-library-card, .note-branch-card, .note-whatif-card").length,
      whatIfStages: document.querySelectorAll(".note-whatif-stage").length,
      fullBoardImages: Array.from(document.images).filter((image) => image.naturalHeight > 10_000 || /behance|final|최종/i.test(image.src)),
      imageSources: Array.from(document.images).map((image) => new URL(image.src).pathname),
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
  expect(implementation.backgroundUrls).toHaveLength(0);
  expect(implementation.embeddedMedia).toBe(0);
  expect(implementation.sections).toEqual({ branch: 1, final: 1, library: 1, whatIf: 1 });
  expect(implementation.domCards).toBeGreaterThanOrEqual(10);
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
