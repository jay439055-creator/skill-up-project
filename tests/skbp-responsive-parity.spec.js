import { expect, test } from "playwright/test";

const SKBP_ROUTE = "/a11yway#skbp";
const SKBP_EXPERIENCE_URL = "https://www.plus-ex.com/experience#skbp";
const TUNIVERSE_ROUTE = "/tuniverse";
const TUNIVERSE_DETAIL_URL = "https://www.plus-ex.com/source/iframe/portfolio/tuniverse.html";

async function readExperienceMetrics(frame) {
  return frame.evaluate(() => {
    const firstImage = document.images[0] ?? null;
    const firstImageRect = firstImage?.getBoundingClientRect() ?? null;

    return {
      clientWidth: document.documentElement.clientWidth,
      firstImageWidth: firstImageRect === null ? 0 : Math.round(firstImageRect.width),
      imageCount: document.images.length,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      text: (document.body?.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, 120),
      url: location.href,
    };
  });
}

async function openLocalSkbp(page, viewportSize) {
  await page.setViewportSize(viewportSize);
  await page.goto(SKBP_ROUTE, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("skbp-responsive-page")).toBeVisible();

  const iframe = page.locator("iframe[title='Plus X SKBP responsive reference']");
  await expect(iframe).toHaveAttribute("src", SKBP_EXPERIENCE_URL);

  await expect
    .poll(() => page.frames().some((candidate) => candidate.url().includes("/experience#skbp")), {
      message: "SKBP experience iframe is attached",
      timeout: 15_000,
    })
    .toBe(true);

  const frame = page.frames().find((candidate) => candidate.url().includes("/experience#skbp"));
  expect(frame, "SKBP experience iframe is attached").toBeTruthy();
  await expect
    .poll(() => readExperienceMetrics(frame).then((metrics) => metrics.imageCount), {
      message: "SKBP experience app rendered image content",
      timeout: 20_000,
    })
    .toBeGreaterThan(0);

  return {
    frame,
    top: await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      iframeCount: document.querySelectorAll("iframe").length,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      title: document.title,
    })),
  };
}

async function openReferenceExperience(page, viewportSize) {
  await page.setViewportSize(viewportSize);
  await page.goto(SKBP_EXPERIENCE_URL, { waitUntil: "domcontentloaded" });
  await expect
    .poll(() => readExperienceMetrics(page.mainFrame()).then((metrics) => metrics.imageCount), {
      message: "reference experience app rendered image content",
      timeout: 20_000,
    })
    .toBeGreaterThan(0);
  return readExperienceMetrics(page.mainFrame());
}

async function openLocalTuniverse(page, viewportSize) {
  await page.setViewportSize(viewportSize);
  await page.goto(TUNIVERSE_ROUTE, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("experience-reference-page")).toBeVisible();
  await expect(page.getByTestId("a11yway-hero")).toBeVisible();

  const iframe = page.locator("iframe[title='Plus X T Universe detail page']");
  await expect(iframe).toHaveAttribute("data-source-url", TUNIVERSE_DETAIL_URL);

  await expect
    .poll(
      async () => {
        const iframeHandle = await iframe.elementHandle();
        const frame = await iframeHandle?.contentFrame();
        return frame?.url();
      },
      {
        message: "T Universe detail iframe srcdoc is attached",
        timeout: 15_000,
      },
    )
    .toBe("about:srcdoc");

  const iframeHandle = await iframe.elementHandle();
  const frame = await iframeHandle?.contentFrame();
  expect(frame, "T Universe detail iframe is attached").toBeTruthy();
  await expect
    .poll(() => readExperienceMetrics(frame).then((metrics) => metrics.imageCount), {
      message: "T Universe detail page rendered image content",
      timeout: 15_000,
    })
    .toBeGreaterThan(0);
  await expect
    .poll(
      async () => {
        return iframe.evaluate((element) => Math.round(element.getBoundingClientRect().height));
      },
      {
        message: "T Universe detail iframe expands into the parent document flow",
        timeout: 15_000,
      },
    )
    .toBeGreaterThan(10_000);

  return {
    frame,
    top: await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      iframeCount: document.querySelectorAll("iframe").length,
      scrollWidth: document.documentElement.scrollWidth,
    })),
  };
}

test("SKBP responsive desktop entry matches reference frame metrics", async ({ browser }) => {
  const viewportSize = { width: 1440, height: 900 };
  const context = await browser.newContext({ viewport: viewportSize });
  const localPage = await context.newPage();
  const referencePage = await context.newPage();

  const local = await openLocalSkbp(localPage, viewportSize);
  const localMetrics = await readExperienceMetrics(local.frame);
  const referenceMetrics = await openReferenceExperience(referencePage, viewportSize);

  expect(local.top.iframeCount).toBe(1);
  expect(local.top.scrollWidth).toBe(local.top.clientWidth);
  expect(localMetrics.imageCount).toBeGreaterThanOrEqual(referenceMetrics.imageCount);
  expect(localMetrics.firstImageWidth).toBe(referenceMetrics.firstImageWidth);
  expect(Math.abs(localMetrics.scrollHeight - referenceMetrics.scrollHeight)).toBeLessThanOrEqual(32);

  await context.close();
});

test("SKBP responsive mobile entry avoids raw 1280 overflow", async ({ browser }) => {
  const viewportSize = { width: 390, height: 844 };
  const context = await browser.newContext({ viewport: viewportSize });
  const localPage = await context.newPage();
  const referencePage = await context.newPage();

  const local = await openLocalSkbp(localPage, viewportSize);
  const localMetrics = await readExperienceMetrics(local.frame);
  const referenceMetrics = await openReferenceExperience(referencePage, viewportSize);

  expect(local.top.scrollWidth).toBe(local.top.clientWidth);
  expect(localMetrics.scrollWidth).toBe(referenceMetrics.scrollWidth);
  expect(localMetrics.scrollHeight).toBeGreaterThan(10_000);
  expect(Math.abs(localMetrics.scrollHeight - referenceMetrics.scrollHeight)).toBeLessThanOrEqual(600);
  expect(localMetrics.firstImageWidth).toBe(referenceMetrics.firstImageWidth);

  await context.close();
});

test("SKBP responsive tablet entry preserves detail content without wrapper overflow", async ({ browser }) => {
  const viewportSize = { width: 768, height: 1024 };
  const context = await browser.newContext({ viewport: viewportSize });
  const localPage = await context.newPage();

  const local = await openLocalSkbp(localPage, viewportSize);
  const localMetrics = await readExperienceMetrics(local.frame);

  expect(local.top.scrollWidth).toBe(local.top.clientWidth);
  expect(localMetrics.clientWidth).toBe(viewportSize.width);
  expect(localMetrics.imageCount).toBeGreaterThanOrEqual(100);
  expect(localMetrics.text).toContain("eXperience");

  await context.close();
});

test("BPCO root remains the default route", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await expect(page.getByTestId("skbp-responsive-page")).toHaveCount(0);
  await expect(page.locator("iframe[title='Plus X SKBP responsive reference']")).toHaveCount(0);
});

test("T Universe detail can be opened as a separated local page", async ({ page }) => {
  test.setTimeout(75_000);
  const viewportSize = { width: 1920, height: 1080 };

  await page.route(
    (url) => url.hostname.includes("vimeocdn.com") || url.pathname.endsWith(".mp4"),
    (route) => route.abort(),
  );

  const local = await openLocalTuniverse(page, viewportSize);
  const localMetrics = await readExperienceMetrics(local.frame);
  const originalHeroDisplay = await local.frame.evaluate(() => {
    const originalHero = document.querySelector(".con1");
    return originalHero === null ? null : window.getComputedStyle(originalHero).display;
  });
  const originalIntroDisplay = await local.frame.evaluate(() => {
    const originalIntro = document.querySelector(".con2");
    return originalIntro === null ? null : window.getComputedStyle(originalIntro).display;
  });
  const initialVisibleCopy = await local.frame.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim().slice(0, 80));
  const overviewState = await local.frame.evaluate(() => {
    const overview = document.querySelector(".con3");
    const graphWrap = overview?.querySelector(".graph-wrap");
    const nextSection = document.querySelector(".con4");
    const overviewText = overview?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return {
      descriptionLineCount: overview?.querySelectorAll(".sub span").length ?? 0,
      graphDisplay: graphWrap === undefined || graphWrap === null ? null : window.getComputedStyle(graphWrap).display,
      nextSectionDisplay: nextSection === null ? null : window.getComputedStyle(nextSection).display,
      text: overviewText.slice(0, 1_200),
    };
  });
  const heroDevice = page.getByTestId("a11yway-hero-device");
  const heroCanvas = page.getByTestId("a11yway-quest-hero-canvas");
  const heroMotionName = await heroCanvas.evaluate((element) => getComputedStyle(element).animationName);
  const layerOrder = await page.evaluate(() => {
    const zIndexOf = (testId) => {
      const element = document.querySelector(`[data-testid="${testId}"]`);
      return Number.parseInt(window.getComputedStyle(element).zIndex, 10);
    };

    return {
      canvas: zIndexOf("a11yway-quest-hero-canvas"),
      device: zIndexOf("a11yway-hero-device"),
    };
  });
  const stageWidth = await page.locator(".a11yway-hero__stage").evaluate((element) => {
    return Math.round(element.getBoundingClientRect().width);
  });
  const frameLayout = await page.locator("iframe[title='Plus X T Universe detail page']").evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      height: Math.round(element.getBoundingClientRect().height),
      placement: element.getAttribute("data-frame-placement"),
      position: style.position,
    };
  });
  const heroLayout = await page.evaluate(() => {
    const hero = document.querySelector('[data-testid="a11yway-hero"]');
    const stage = document.querySelector(".a11yway-hero__stage");
    const detail = document.querySelector(".experience-detail-shell");
    const heroRect = hero.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const detailRect = detail.getBoundingClientRect();

    return {
      detailTop: Math.round(detailRect.top),
      heroBottom: Math.round(heroRect.bottom),
      heroHeight: Math.round(heroRect.height),
      stageHeight: Math.round(stageRect.height),
    };
  });
  const naturalScrollLayout = await page.evaluate(async () => {
    const detail = document.querySelector(".experience-detail-shell");
    const detailTop = detail.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, detailTop + 900);
    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));

    const heroRect = document.querySelector('[data-testid="a11yway-hero"]').getBoundingClientRect();
    const detailRect = detail.getBoundingClientRect();
    const iframe = document.querySelector("iframe[title='Plus X T Universe detail page']");
    const iframeRect = iframe.getBoundingClientRect();
    return {
      detailTop: Math.round(detailRect.top),
      frameTop: Math.round(iframeRect.top),
      heroBottom: Math.round(heroRect.bottom),
      scrollY: Math.round(window.scrollY),
    };
  });
  const frameScrollY = await local.frame.evaluate(() => Math.round(window.scrollY));

  expect(local.top.iframeCount).toBe(1);
  expect(local.top.scrollWidth).toBe(local.top.clientWidth);
  expect(stageWidth).toBeGreaterThanOrEqual(viewportSize.width);
  expect(frameLayout.position).toBe("static");
  expect(frameLayout.height).toBeGreaterThan(10_000);
  expect(frameLayout.placement).toBeNull();
  expect(heroLayout.heroHeight).toBeGreaterThanOrEqual(heroLayout.stageHeight - 1);
  expect(heroLayout.detailTop).toBeGreaterThanOrEqual(heroLayout.heroBottom - 1);
  expect(Math.abs(naturalScrollLayout.frameTop - naturalScrollLayout.detailTop)).toBeLessThanOrEqual(1);
  expect(naturalScrollLayout.heroBottom).toBeLessThanOrEqual(0);
  expect(naturalScrollLayout.detailTop).toBeLessThanOrEqual(-800);
  expect(frameScrollY).toBe(0);
  expect(localMetrics.url).toBe("about:srcdoc");
  expect(originalHeroDisplay).toBe("none");
  expect(originalIntroDisplay).toBe("none");
  expect(initialVisibleCopy.toLowerCase()).toContain("overview");
  expect(overviewState.text).toContain("Spatial design, explored through immersive VR user experience.");
  expect(overviewState.text).toContain("VR 기반 사용자 테스트를 통해");
  expect(overviewState.descriptionLineCount).toBe(3);
  expect(overviewState.graphDisplay).toBe("none");
  expect(overviewState.nextSectionDisplay).toBe("none");
  expect(overviewState.text).not.toContain("이동 중 불편함을 자주 경험한다");
  expect(overviewState.text).not.toContain("Client Interview");
  expect(localMetrics.imageCount).toBeGreaterThanOrEqual(50);
  await expect(page.getByTestId("a11yway-hero-background")).toHaveAttribute("src", "/figma/a11yway-hero/background.svg");
  await expect(heroDevice).toHaveAttribute("src", "/figma/a11yway-hero/vr-machine.svg");
  await expect(heroCanvas).toHaveAttribute("data-model-source", "/models/meta-quest3s/Quest3S_A11yway_PBR.glb");
  await expect(page.getByTestId("a11yway-hero-chart")).toHaveCount(0);
  await expect(page.getByTestId("a11yway-hero-dropoff")).toHaveCount(0);
  await expect(page.getByTestId("a11yway-hero-time")).toHaveCount(0);
  expect(layerOrder.canvas).toBeGreaterThan(layerOrder.device);
  expect(heroMotionName).not.toBe("none");
});
