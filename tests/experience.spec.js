import { expect, test } from "playwright/test";

async function openBpco(page, viewportSize = { width: 1440, height: 900 }) {
  await page.setViewportSize(viewportSize);
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector("#main_canvas")?.getAttribute("data-renderer-ready") === "true",
    undefined,
    { timeout: 30000 },
  );
}

test("desktop hero matches BPCO runway and fixed object contract", async ({ page }) => {
  await openBpco(page);
  const metrics = await page.evaluate(() => {
    const hero = document.querySelector(".main.m1");
    const object = document.querySelector("#main_canvas[data-testid='hero-object']");
    const objectBox = object?.getBoundingClientRect();
    return {
      heroHeight: hero instanceof HTMLElement ? Math.round(hero.getBoundingClientRect().height) : 0,
      heroTop: hero instanceof HTMLElement ? Math.round(hero.getBoundingClientRect().top + window.scrollY) : -1,
      objectPosition: object ? getComputedStyle(object).position : "",
      objectTop: objectBox ? Math.round(objectBox.top) : 9999,
      objectLeft: objectBox ? Math.round(objectBox.left) : 9999,
      objectWidth: objectBox ? Math.round(objectBox.width) : 0,
      objectHeight: objectBox ? Math.round(objectBox.height) : 0,
      modelSrc: object?.getAttribute("src") ?? "",
      rendererCanvases: object?.querySelectorAll("canvas").length ?? 0,
      canvasFilter: object?.querySelector("canvas") ? getComputedStyle(object.querySelector("canvas")).filter : "",
      modelViewers: document.querySelectorAll("model-viewer").length,
    };
  });
  expect(metrics.heroTop).toBe(0);
  expect(metrics.heroHeight).toBeGreaterThanOrEqual(3300);
  expect(metrics.heroHeight).toBeLessThanOrEqual(3335);
  expect(metrics.objectPosition).toBe("fixed");
  expect(metrics.objectTop).toBeLessThanOrEqual(2);
  expect(metrics.objectLeft).toBeLessThanOrEqual(2);
  expect(metrics.objectWidth).toBeGreaterThanOrEqual(1436);
  expect(metrics.objectWidth).toBeLessThanOrEqual(1444);
  expect(metrics.objectHeight).toBeGreaterThanOrEqual(896);
  expect(metrics.objectHeight).toBeLessThanOrEqual(904);
  expect(metrics.modelSrc).toContain("/three/model/bicpicture.glb");
  expect(metrics.rendererCanvases).toBeGreaterThanOrEqual(1);
  expect(metrics.canvasFilter).toBe("none");
  expect(metrics.modelViewers).toBe(0);
});

test("hero object zooms and stays pinned through the source scroll motion", async ({ page }) => {
  await openBpco(page);
  const checkpoints = [];
  for (const y of [0, 720, 1800]) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(250);
    checkpoints.push(await page.evaluate(() => {
      const object = document.querySelector("[data-testid='hero-object']");
      const rect = object?.getBoundingClientRect();
      const style = object ? getComputedStyle(object) : null;
      return {
        top: rect ? Math.round(rect.top) : 9999,
        left: rect ? Math.round(rect.left) : 9999,
        width: rect ? Math.round(rect.width) : 0,
        height: rect ? Math.round(rect.height) : 0,
        bottom: rect ? Math.round(rect.bottom) : -1,
        opacity: style ? Number(style.opacity) : 0,
        progress: Number(object?.getAttribute("data-model-progress") ?? -1),
        modelTweenProgress: Number(object?.getAttribute("data-model-tween-progress") ?? -1),
      };
    }));
  }
  for (const checkpoint of checkpoints) {
    expect(checkpoint.top).toBeLessThanOrEqual(2);
    expect(checkpoint.left).toBeLessThanOrEqual(2);
    expect(checkpoint.width).toBeGreaterThanOrEqual(1436);
    expect(checkpoint.height).toBeGreaterThanOrEqual(896);
    expect(checkpoint.bottom).toBeGreaterThanOrEqual(898);
  }
  expect(checkpoints[1].progress).toBeGreaterThan(checkpoints[0].progress);
  expect(checkpoints[2].progress).toBeGreaterThan(checkpoints[1].progress);
  expect(checkpoints[1].modelTweenProgress).toBeGreaterThanOrEqual(0.3);
  expect(checkpoints[1].modelTweenProgress).toBeLessThanOrEqual(0.32);
  expect(checkpoints[2].modelTweenProgress).toBeGreaterThanOrEqual(0.77);
  expect(checkpoints[2].modelTweenProgress).toBeLessThanOrEqual(0.79);
  expect(checkpoints[2].opacity).toBeGreaterThan(0.75);
});

test("hero intro renders source LED rails without synthetic particle overlay", async ({ page }) => {
  await openBpco(page);
  const metrics = await page.evaluate(() => ({
    particleFields: document.querySelectorAll("[data-testid='hero-particle-field']").length,
    ledSections: document.querySelectorAll(".led_section").length,
    ledItems: document.querySelectorAll(".led_section .led_item").length,
    ledPartItems: document.querySelectorAll(".led_section .led_item > div").length,
    ledTop: Math.round(document.querySelector(".led_section")?.getBoundingClientRect().top ?? -1),
    ledLeft: Math.round(document.querySelector(".led_section")?.getBoundingClientRect().left ?? -1),
    ledWidth: Math.round(document.querySelector(".led_section")?.getBoundingClientRect().width ?? -1),
    ledHeight: Math.round(document.querySelector(".led_section")?.getBoundingClientRect().height ?? -1),
    captionTop: Math.round(document.querySelector(".hero_caption")?.getBoundingClientRect().top ?? -1),
    captionHeight: Math.round(document.querySelector(".hero_caption")?.getBoundingClientRect().height ?? -1),
    scrollCueText: document.querySelector(".scroll_cue span")?.textContent ?? "",
    scrollCueLeft: Math.round(document.querySelector(".scroll_cue")?.getBoundingClientRect().left ?? -1),
    statementTop: Math.round(document.querySelector(".hero_statement")?.getBoundingClientRect().top ?? -1),
    statementText: document.querySelector(".hero_statement")?.textContent ?? "",
  }));
  expect(metrics.particleFields).toBe(0);
  expect(metrics.ledSections).toBe(1);
  expect(metrics.ledItems).toBe(4);
  expect(metrics.ledPartItems).toBe(12);
  expect(metrics.ledTop).toBeGreaterThanOrEqual(260);
  expect(metrics.ledTop).toBeLessThanOrEqual(310);
  expect(metrics.ledLeft).toBe(0);
  expect(metrics.ledWidth).toBe(1440);
  expect(metrics.ledHeight).toBeGreaterThanOrEqual(45);
  expect(metrics.ledHeight).toBeLessThanOrEqual(52);
  expect(metrics.captionTop).toBeGreaterThanOrEqual(755);
  expect(metrics.captionTop).toBeLessThanOrEqual(775);
  expect(metrics.captionHeight).toBeGreaterThanOrEqual(100);
  expect(metrics.captionHeight).toBeLessThanOrEqual(112);
  expect(metrics.scrollCueText).toBe("PLEASE SCROLL DOWN");
  expect(metrics.scrollCueLeft).toBeGreaterThanOrEqual(620);
  expect(metrics.scrollCueLeft).toBeLessThanOrEqual(720);
  expect(metrics.statementTop).toBeGreaterThanOrEqual(160);
  expect(metrics.statementTop).toBeLessThanOrEqual(190);
  expect(metrics.statementText).toContain("advertising agency specializing in planning");
});

test("hero chrome uses source header typography and scroll arrow structure", async ({ page }) => {
  await openBpco(page);
  const metrics = await page.evaluate(() => {
    const header = document.querySelector(".header");
    const logo = document.querySelector(".logo");
    const nav = document.querySelector(".nav");
    const cue = document.querySelector(".scroll_cue");
    const navBox = nav?.getBoundingClientRect();
    const cueBox = cue?.getBoundingClientRect();
    const metaBoxes = [...document.querySelectorAll(".header_meta span")].map((element) => {
      const rect = element.getBoundingClientRect();
      return { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width) };
    });

    return {
      headerFont: header instanceof HTMLElement ? getComputedStyle(header).fontFamily : "",
      headerFontSize: header instanceof HTMLElement ? getComputedStyle(header).fontSize : "",
      headerLineHeight: header instanceof HTMLElement ? getComputedStyle(header).lineHeight : "",
      logoTop: Math.round(logo?.getBoundingClientRect().top ?? -1),
      logoLeft: Math.round(logo?.getBoundingClientRect().left ?? -1),
      navFont: nav instanceof HTMLElement ? getComputedStyle(nav).fontFamily : "",
      navTop: Math.round(navBox?.top ?? -1),
      navWidth: Math.round(navBox?.width ?? -1),
      navHeight: Math.round(navBox?.height ?? -1),
      scrollCueDisplay: cue instanceof HTMLElement ? getComputedStyle(cue).display : "",
      scrollCueGap: cue instanceof HTMLElement ? getComputedStyle(cue).gap : "",
      scrollCueColor: cue instanceof HTMLElement ? getComputedStyle(cue).color : "",
      scrollCueBottom: Math.round(window.innerHeight - (cueBox?.bottom ?? 0)),
      arrowPixels: document.querySelectorAll(".scroll_cue .ar_items > div").length,
      arrowWidth: Math.round(document.querySelector(".scroll_cue .ar_items")?.getBoundingClientRect().width ?? -1),
      arrowHeight: Math.round(document.querySelector(".scroll_cue .ar_items")?.getBoundingClientRect().height ?? -1),
      metaBoxes,
    };
  });

  expect(metrics.headerFont).toContain("PPSupplyMono");
  expect(metrics.headerFontSize).toBe("17px");
  expect(metrics.headerLineHeight).toBe("17px");
  expect(metrics.logoTop).toBeGreaterThanOrEqual(28);
  expect(metrics.logoTop).toBeLessThanOrEqual(31);
  expect(metrics.logoLeft).toBeGreaterThanOrEqual(39);
  expect(metrics.logoLeft).toBeLessThanOrEqual(42);
  expect(metrics.navFont).toContain("PPSupplySans");
  expect(metrics.navTop).toBe(20);
  expect(metrics.navWidth).toBe(252);
  expect(metrics.navHeight).toBe(40);
  expect(metrics.metaBoxes[0].left).toBeGreaterThanOrEqual(320);
  expect(metrics.metaBoxes[0].left).toBeLessThanOrEqual(332);
  expect(metrics.metaBoxes[1].left).toBeGreaterThanOrEqual(982);
  expect(metrics.metaBoxes[1].left).toBeLessThanOrEqual(996);
  expect(metrics.metaBoxes[2].left).toBeGreaterThanOrEqual(1260);
  expect(metrics.metaBoxes[2].top).toBeGreaterThanOrEqual(28);
  expect(metrics.metaBoxes[2].top).toBeLessThanOrEqual(31);
  expect(metrics.scrollCueDisplay).toBe("flex");
  expect(metrics.scrollCueGap).toBe("13px");
  expect(metrics.scrollCueColor).toBe("rgb(197, 197, 197)");
  expect(metrics.scrollCueBottom).toBe(33);
  expect(metrics.arrowPixels).toBe(18);
  expect(metrics.arrowWidth).toBe(45);
  expect(metrics.arrowHeight).toBe(15);
});

test("hero caption and scroll cue follow source pinned fade motion", async ({ page }) => {
  await openBpco(page);
  const checkpoints = [];
  for (const y of [0, 720, 1800]) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(250);
    checkpoints.push(await page.evaluate(() => {
      const caption = document.querySelector(".hero_caption");
      const cue = document.querySelector(".scroll_cue");
      return {
        y: window.scrollY,
        captionTop: Math.round(caption?.getBoundingClientRect().top ?? -1),
        captionOpacity: Number(caption instanceof HTMLElement ? getComputedStyle(caption).opacity : -1),
        cueTop: Math.round(cue?.getBoundingClientRect().top ?? -1),
        cueHeight: Math.round(cue?.getBoundingClientRect().height ?? -1),
        cueOpacity: Number(cue instanceof HTMLElement ? getComputedStyle(cue).opacity : -1),
      };
    }));
  }

  expect(checkpoints[0].captionTop).toBeGreaterThanOrEqual(755);
  expect(checkpoints[0].captionTop).toBeLessThanOrEqual(775);
  expect(checkpoints[1].captionTop).toBe(checkpoints[0].captionTop);
  expect(checkpoints[2].captionTop).toBe(checkpoints[0].captionTop);
  expect(checkpoints[0].captionOpacity).toBe(1);
  expect(checkpoints[1].captionOpacity).toBe(0);
  expect(checkpoints[2].captionOpacity).toBe(0);
  expect(checkpoints[0].cueTop).toBeGreaterThanOrEqual(790);
  expect(checkpoints[0].cueTop).toBeLessThanOrEqual(805);
  expect(checkpoints[0].cueHeight).toBeGreaterThanOrEqual(68);
  expect(checkpoints[0].cueHeight).toBeLessThanOrEqual(74);
  expect(checkpoints[1].cueTop).toBe(checkpoints[0].cueTop);
  expect(checkpoints[2].cueTop).toBe(checkpoints[0].cueTop);
  expect(checkpoints[0].cueOpacity).toBe(1);
  expect(checkpoints[1].cueOpacity).toBe(0);
  expect(checkpoints[2].cueOpacity).toBe(0);
});

test("scroll checkpoints follow BPCO hero, philosophy, project, business order", async ({ page }) => {
  await openBpco(page);
  const positions = await page.evaluate(() => [".main.m1", ".main.m2", ".project_list", ".main.m4", "footer"].map((selector) => {
    const element = document.querySelector(selector);
    return element instanceof HTMLElement ? Math.round(element.offsetTop) : -1;
  }));
  expect(positions).toEqual([...positions].sort((first, second) => first - second));
  expect(positions[0]).toBe(0);
  expect(positions[1]).toBeGreaterThanOrEqual(3310);
  expect(positions[1]).toBeLessThanOrEqual(3335);
  expect(positions[2]).toBeGreaterThan(4210);
  expect(positions[3]).toBeGreaterThan(13000);
  expect(positions[4]).toBeGreaterThan(16000);
});

test("page exposes the BPCO copy and project layers as editable DOM", async ({ page }) => {
  await openBpco(page);
  const structure = await page.evaluate(() => ({
    iframes: document.querySelectorAll("iframe").length,
    videos: document.querySelectorAll("video").length,
    projectItems: document.querySelectorAll(".mp_item").length,
    businessItems: document.querySelectorAll(".bs_item").length,
    philosophyItems: document.querySelectorAll(".main_desc").length,
    text: document.body.innerText,
  }));
  expect(structure.iframes).toBe(0);
  expect(structure.videos).toBe(0);
  expect(structure.projectItems).toBeGreaterThanOrEqual(4);
  expect(structure.businessItems).toBe(14);
  expect(structure.philosophyItems).toBe(3);
  expect(structure.text).toContain("Bigpicture Company");
  expect(structure.text).toContain("RECENT PROJECT");
  expect(structure.text).toContain("BAEMIN B OOH CAMPAIGN");
  expect(structure.text).toContain("advertising agency specializing in planning");
});

test("mobile BPCO layout keeps content readable without horizontal overflow", async ({ page }) => {
  await openBpco(page, { width: 390, height: 844 });
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    heroHeight: Math.round(document.querySelector(".main.m1")?.getBoundingClientRect().height ?? 0),
    projectItems: document.querySelectorAll(".mp_item").length,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.heroHeight).toBeGreaterThan(600);
  expect(metrics.projectItems).toBeGreaterThanOrEqual(4);
});
