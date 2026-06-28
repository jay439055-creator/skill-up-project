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

test("short desktop viewport keeps source responsive m2 scroll start", async ({ page }) => {
  await openBpco(page, { width: 1280, height: 720 });
  const metrics = await page.evaluate(() => {
    const hero = document.querySelector(".main.m1");
    const m2 = document.querySelector(".main.m2");
    return {
      heroHeight: Number(hero?.getBoundingClientRect().height.toFixed(1) ?? -1),
      m2Top: Number(m2?.getBoundingClientRect().top.toFixed(1) ?? -1),
    };
  });

  expect(metrics.heroHeight).toBeGreaterThan(3278);
  expect(metrics.heroHeight).toBeLessThan(3285);
  expect(metrics.m2Top).toBeGreaterThan(3278);
  expect(metrics.m2Top).toBeLessThan(3285);
});

test("short desktop viewport keeps source m2 horizontal row travel", async ({ page }) => {
  await openBpco(page, { width: 1280, height: 720 });
  await page.evaluate(() => window.scrollTo(0, 3600));
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => {
    const row = document.querySelector(".main.m2 .row_container");
    const rs1 = document.querySelector(".main.m2 .rs1");
    const rs2 = document.querySelector(".main.m2 .rs2");
    const rs3 = document.querySelector(".main.m2 .rs3");
    const anchor = document.querySelector(".main.m2 .rs1 .main_title .tspan_w");
    const rowBox = row?.getBoundingClientRect();
    const rs1Box = rs1?.getBoundingClientRect();
    const rs2Box = rs2?.getBoundingClientRect();
    const rs3Box = rs3?.getBoundingClientRect();
    const anchorBox = anchor?.getBoundingClientRect();

    return {
      rowWidth: Number(rowBox?.width.toFixed(1) ?? -1),
      rowHeight: Number(rowBox?.height.toFixed(1) ?? -1),
      rs1Left: Number(rs1Box?.left.toFixed(1) ?? -9999),
      rs1Width: Number(rs1Box?.width.toFixed(1) ?? -1),
      rs2Left: Number(rs2Box?.left.toFixed(1) ?? -9999),
      rs2Width: Number(rs2Box?.width.toFixed(1) ?? -1),
      rs3Left: Number(rs3Box?.left.toFixed(1) ?? -9999),
      rs3Width: Number(rs3Box?.width.toFixed(1) ?? -1),
      anchorLeft: Number(anchorBox?.left.toFixed(1) ?? -9999),
    };
  });

  expect(metrics.rowWidth).toBeGreaterThan(7185);
  expect(metrics.rowWidth).toBeLessThan(7195);
  expect(metrics.rowHeight).toBe(720);
  expect(metrics.rs1Left).toBeGreaterThan(-500);
  expect(metrics.rs1Left).toBeLessThan(-490);
  expect(metrics.rs1Width).toBeGreaterThan(1704);
  expect(metrics.rs1Width).toBeLessThan(1713);
  expect(metrics.rs2Left).toBeGreaterThan(1208);
  expect(metrics.rs2Left).toBeLessThan(1218);
  expect(metrics.rs2Width).toBeGreaterThan(1432);
  expect(metrics.rs2Width).toBeLessThan(1442);
  expect(metrics.rs3Left).toBeGreaterThan(2645);
  expect(metrics.rs3Left).toBeLessThan(2656);
  expect(metrics.rs3Width).toBeGreaterThan(1314);
  expect(metrics.rs3Width).toBeLessThan(1324);
  expect(metrics.anchorLeft).toBeGreaterThan(-460);
  expect(metrics.anchorLeft).toBeLessThan(-451);
});

test("m2 first philosophy card keeps source copy and inline layout", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 3316));
  await page.waitForTimeout(300);

  const metrics = await page.evaluate(() => {
    const desc = document.querySelector(".main.m2 .rs1 .main_desc");
    const contents = document.querySelector(".main.m2 .rs1 .main_desc .de_contents");
    const deco = document.querySelector(".main.m2 .rs1 .copy_deco");
    const title = document.querySelector(".main.m2 .rs1 .main_title");
    const readRect = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect
        ? {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }
        : null;
    };

    return {
      descRect: readRect(desc),
      descDisplay: desc instanceof HTMLElement ? getComputedStyle(desc).display : "",
      contentsFont: contents instanceof HTMLElement ? getComputedStyle(contents).fontFamily : "",
      contentsText: contents?.textContent ?? "",
      contentsPCount: contents?.querySelectorAll("p").length ?? -1,
      contentsSmallCount: contents?.querySelectorAll("small").length ?? -1,
      gapCount: contents?.querySelectorAll(".t_gap").length ?? -1,
      copyKrCount: contents?.querySelectorAll(".copy_kr").length ?? -1,
      titleText: title?.textContent?.trim().replace(/\s+/g, " ") ?? "",
      legacyCopyCount: document.querySelectorAll(".main.m2 .rs1 .m2_legacy_copy").length,
      decoRect: readRect(deco),
      decoTransform: deco instanceof HTMLElement ? getComputedStyle(deco).transform : "",
    };
  });

  expect(metrics.descDisplay).toBe("flex");
  expect(metrics.descRect).toEqual({ left: 288, top: 576, width: 877, height: 136 });
  expect(metrics.contentsFont).toBe('"Helvetica Neue", Pretendard, sans-serif');
  expect(metrics.titleText).toBe("e are");
  expect(metrics.legacyCopyCount).toBe(0);
  expect(metrics.contentsPCount).toBe(0);
  expect(metrics.contentsSmallCount).toBe(0);
  expect(metrics.gapCount).toBe(1);
  expect(metrics.copyKrCount).toBe(1);
  expect(metrics.contentsText).not.toContain("Pleasure is at the core of what we do.");
  expect(metrics.contentsText).toContain("the future direction of our big picture business.");
  expect(metrics.decoRect).toEqual({ left: 1327, top: 572, width: 380, height: 75 });
  expect(metrics.decoTransform).toBe("none");
});

test("hero object zooms and stays pinned through the source scroll motion", async ({ page }) => {
  test.setTimeout(60000);
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
    statementClassName: document.querySelector(".main.m1 .intro_copy")?.className ?? "",
    statementTop: Math.round(document.querySelector(".main.m1 .intro_copy")?.getBoundingClientRect().top ?? -1),
    statementWidth: Math.round(document.querySelector(".main.m1 .intro_copy")?.getBoundingClientRect().width ?? -1),
    statementHeight: Math.round(document.querySelector(".main.m1 .intro_copy")?.getBoundingClientRect().height ?? -1),
    statementTag: document.querySelector(".main.m1 .intro_copy")?.tagName ?? "",
    statementLineHeight: document.querySelector(".main.m1 .intro_copy")
      ? getComputedStyle(document.querySelector(".main.m1 .intro_copy")).lineHeight
      : "",
    statementFont: document.querySelector(".main.m1 .intro_copy")
      ? getComputedStyle(document.querySelector(".main.m1 .intro_copy")).fontFamily
      : "",
    statementColor: document.querySelector(".main.m1 .intro_copy")
      ? getComputedStyle(document.querySelector(".main.m1 .intro_copy")).color
      : "",
    statementBrCount: document.querySelectorAll(".main.m1 .intro_copy br").length,
    statementText: document.querySelector(".main.m1 .intro_copy")?.textContent ?? "",
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
  expect(metrics.statementClassName).toBe("intro_copy");
  expect(metrics.statementTag).toBe("H2");
  expect(metrics.statementWidth).toBe(1440);
  expect(metrics.statementHeight).toBeGreaterThanOrEqual(64);
  expect(metrics.statementHeight).toBeLessThanOrEqual(68);
  expect(metrics.statementLineHeight).toBe("22px");
  expect(metrics.statementFont).toBe('"Helvetica Neue", Pretendard, sans-serif');
  expect(metrics.statementColor).toBe("rgb(18, 18, 18)");
  expect(metrics.statementBrCount).toBe(2);
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
      globeCount: document.querySelectorAll(".header_meta .local_info img").length,
      globeSrc: document.querySelector(".header_meta .local_info img")?.getAttribute("src") ?? "",
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
  expect(metrics.globeCount).toBe(1);
  expect(metrics.globeSrc).toContain("/img/ic_globe.svg");
  expect(metrics.scrollCueDisplay).toBe("flex");
  expect(metrics.scrollCueGap).toBe("13px");
  expect(metrics.scrollCueColor).toBe("rgb(197, 197, 197)");
  expect(metrics.scrollCueBottom).toBe(33);
  expect(metrics.arrowPixels).toBe(18);
  expect(metrics.arrowWidth).toBe(45);
  expect(metrics.arrowHeight).toBe(15);
});

test("short desktop header keeps source responsive metadata spacing", async ({ page }) => {
  await openBpco(page, { width: 1280, height: 720 });
  const metaBoxes = await page.evaluate(() => [...document.querySelectorAll(".header_meta span")].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
    };
  }));

  expect(metaBoxes[0].left).toBeGreaterThanOrEqual(288);
  expect(metaBoxes[0].left).toBeLessThanOrEqual(300);
  expect(metaBoxes[1].left).toBeGreaterThanOrEqual(850);
  expect(metaBoxes[1].left).toBeLessThanOrEqual(866);
  expect(metaBoxes[2].left).toBeGreaterThanOrEqual(1100);
  expect(metaBoxes[2].left).toBeLessThanOrEqual(1120);
  expect(metaBoxes[2].left - metaBoxes[1].right).toBeGreaterThan(70);
});

test("hero caption and scroll cue follow source pinned fade motion", async ({ page }) => {
  await openBpco(page);
  await page.waitForFunction(
    () =>
      Number(getComputedStyle(document.querySelector(".hero_caption")).opacity) > 0.95 &&
      Number(getComputedStyle(document.querySelector(".scroll_cue")).opacity) > 0.95,
  );
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

test("hero intro controls follow the source delayed load reveal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForTimeout(500);
  const early = await page.evaluate(() => ({
    captionOpacity: Number(getComputedStyle(document.querySelector(".hero_caption")).opacity),
    cueOpacity: Number(getComputedStyle(document.querySelector(".scroll_cue")).opacity),
  }));
  expect(early.captionOpacity).toBeLessThan(0.05);
  expect(early.cueOpacity).toBeLessThan(0.05);

  await page.waitForFunction(
    () => Number(getComputedStyle(document.querySelector(".scroll_cue")).opacity) > 0.95,
    undefined,
    { timeout: 8000 },
  );
  const cueReady = await page.evaluate(() => ({
    captionOpacity: Number(getComputedStyle(document.querySelector(".hero_caption")).opacity),
    cueOpacity: Number(getComputedStyle(document.querySelector(".scroll_cue")).opacity),
  }));
  expect(cueReady.cueOpacity).toBeGreaterThan(0.95);
  expect(cueReady.captionOpacity).toBeLessThan(0.05);

  await page.waitForFunction(
    () => Number(getComputedStyle(document.querySelector(".hero_caption")).opacity) > 0.95,
    undefined,
    { timeout: 8000 },
  );
  const captionReady = await page.evaluate(() => ({
    captionOpacity: Number(getComputedStyle(document.querySelector(".hero_caption")).opacity),
    cueOpacity: Number(getComputedStyle(document.querySelector(".scroll_cue")).opacity),
  }));
  expect(captionReady.cueOpacity).toBeGreaterThan(0.95);
  expect(captionReady.captionOpacity).toBeGreaterThan(0.95);
});

test("hero intro caption keeps source typography and box metrics", async ({ page }) => {
  await openBpco(page);
  const metrics = await page.evaluate(() => {
    const caption = document.querySelector(".hero_caption");
    const desc = document.querySelector(".hero_caption .ic_desc");
    const bottom = document.querySelector(".hero_caption .ic_bottom");
    const service = document.querySelector(".hero_caption strong");
    const year = document.querySelector(".hero_caption small");
    const captionBox = caption?.getBoundingClientRect();
    const descBox = desc?.getBoundingClientRect();
    return {
      captionWidth: Number(captionBox?.width.toFixed(1) ?? -1),
      captionHeight: Number(captionBox?.height.toFixed(1) ?? -1),
      descWidth: Number(descBox?.width.toFixed(1) ?? -1),
      descHeight: Number(descBox?.height.toFixed(1) ?? -1),
      captionFont: caption instanceof HTMLElement ? getComputedStyle(caption).fontFamily : "",
      captionTransform: caption instanceof HTMLElement ? getComputedStyle(caption).textTransform : "",
      descFont: desc instanceof HTMLElement ? getComputedStyle(desc).fontFamily : "",
      descWeight: desc instanceof HTMLElement ? getComputedStyle(desc).fontWeight : "",
      bottomWeight: bottom instanceof HTMLElement ? getComputedStyle(bottom).fontWeight : "",
      serviceText: service?.textContent ?? "",
      serviceWeight: service instanceof HTMLElement ? getComputedStyle(service).fontWeight : "",
      yearFontSize: year instanceof HTMLElement ? getComputedStyle(year).fontSize : "",
      yearWeight: year instanceof HTMLElement ? getComputedStyle(year).fontWeight : "",
    };
  });

  expect(metrics.captionWidth).toBeGreaterThan(317);
  expect(metrics.captionWidth).toBeLessThan(319);
  expect(metrics.captionHeight).toBeGreaterThan(105);
  expect(metrics.captionHeight).toBeLessThan(107);
  expect(metrics.descWidth).toBeGreaterThan(281);
  expect(metrics.descWidth).toBeLessThan(283);
  expect(metrics.descHeight).toBe(68);
  expect(metrics.captionFont).toContain("Helvetica Neue");
  expect(metrics.captionTransform).toBe("uppercase");
  expect(metrics.descFont).toContain("Helvetica Neue");
  expect(metrics.descWeight).toBe("400");
  expect(metrics.bottomWeight).toBe("400");
  expect(metrics.serviceText).toBe("BIPICTURE COMPANY");
  expect(metrics.serviceWeight).toBe("400");
  expect(metrics.yearFontSize).toBe("14px");
  expect(metrics.yearWeight).toBe("400");
});

test("scroll checkpoints follow BPCO hero, philosophy, project, business order", async ({ page }) => {
  await openBpco(page);
  const metrics = await page.evaluate(() => {
    const sectionSelectors = [".main.m1", ".main.m2", ".project_list", ".main.m4", "footer"];
    const sections = sectionSelectors.map((selector) => {
      const element = document.querySelector(selector);
      return {
        selector,
        offsetTop: element instanceof HTMLElement ? Math.round(element.offsetTop) : -1,
        offsetHeight: element instanceof HTMLElement ? Math.round(element.offsetHeight) : -1,
      };
    });
    return {
      bodyHeight: document.body.scrollHeight,
      documentHeight: document.documentElement.scrollHeight,
      sections,
    };
  });
  const positions = metrics.sections.map((section) => section.offsetTop);
  expect(positions).toEqual([...positions].sort((first, second) => first - second));
  expect(metrics.bodyHeight).toBe(17828);
  expect(metrics.documentHeight).toBe(17828);
  expect(metrics.sections).toEqual([
    { selector: ".main.m1", offsetTop: 0, offsetHeight: 3316 },
    { selector: ".main.m2", offsetTop: 3316, offsetHeight: 4868 },
    { selector: ".project_list", offsetTop: 8184, offsetHeight: 5344 },
    { selector: ".main.m4", offsetTop: 13528, offsetHeight: 3400 },
    { selector: "footer", offsetTop: 16928, offsetHeight: 900 },
  ]);
});

test("business start renders the source dark quote frame", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 13528));
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    const m4 = document.querySelector(".main.m4");
    const title = document.querySelector(".main.m4 .section_title");
    const desc = document.querySelector(".main.m4 .section_desc");
    const businessItems = document.querySelector(".main.m4 .business_items");
    const titleRect = title?.getBoundingClientRect();
    const descRect = desc?.getBoundingClientRect();
    return {
      m4Top: Math.round(m4?.getBoundingClientRect().top ?? -1),
      m4Height: Math.round(m4?.getBoundingClientRect().height ?? -1),
      m4Background: m4 instanceof HTMLElement ? getComputedStyle(m4).backgroundColor : "",
      titleText: title?.textContent ?? "",
      titleTop: Math.round(titleRect?.top ?? -1),
      titleLeft: Math.round(titleRect?.left ?? -1),
      descText: desc?.textContent ?? "",
      descTop: Math.round(descRect?.top ?? -1),
      descLeft: Math.round(descRect?.left ?? -1),
      descWidth: Math.round(descRect?.width ?? -1),
      businessItems: document.querySelectorAll(".main.m4 .business_items .bs_item").length,
      businessItemsTransform: businessItems instanceof HTMLElement ? getComputedStyle(businessItems).transform : "",
      legacyBusinessGrids: document.querySelectorAll(".main.m4 .business_grid").length,
    };
  });

  expect(metrics.m4Top).toBe(0);
  expect(metrics.m4Height).toBe(3400);
  expect(metrics.m4Background).toBe("rgba(0, 0, 0, 0)");
  expect(metrics.titleText).toBe("(2020 - NOW, WHAT WE DO)");
  expect(metrics.titleTop).toBeGreaterThanOrEqual(295);
  expect(metrics.titleTop).toBeLessThanOrEqual(305);
  expect(metrics.titleLeft).toBeGreaterThanOrEqual(600);
  expect(metrics.titleLeft).toBeLessThanOrEqual(620);
  expect(metrics.descText).toBe('"We will, as always, seek the answers just like we have always done." ');
  expect(metrics.descTop).toBeGreaterThanOrEqual(572);
  expect(metrics.descTop).toBeLessThanOrEqual(582);
  expect(metrics.descLeft).toBeGreaterThanOrEqual(315);
  expect(metrics.descLeft).toBeLessThanOrEqual(325);
  expect(metrics.descWidth).toBe(800);
  expect(metrics.businessItems).toBe(14);
  expect(metrics.businessItemsTransform).toContain("matrix3d");
  expect(metrics.legacyBusinessGrids).toBe(0);
});

test("business wheel follows the source pinned rotation after m4 start", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 14500));
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    const title = document.querySelector(".main.m4 .section_title");
    const desc = document.querySelector(".main.m4 .section_desc");
    const businessItems = document.querySelector(".main.m4 .business_items");
    const firstItem = document.querySelector(".main.m4 .business_items .bs_item");
    const firstLabel = firstItem?.querySelector(".bs_label") ?? firstItem;
    const readRect = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect
        ? {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }
        : null;
    };

    return {
      titleRect: readRect(title),
      descRect: readRect(desc),
      businessRect: readRect(businessItems),
      businessDisplay: businessItems instanceof HTMLElement ? getComputedStyle(businessItems).display : "",
      businessOpacity: businessItems instanceof HTMLElement ? Number(getComputedStyle(businessItems).opacity) : -1,
      businessFontSize: businessItems instanceof HTMLElement ? getComputedStyle(businessItems).fontSize : "",
      businessLineHeight: businessItems instanceof HTMLElement ? getComputedStyle(businessItems).lineHeight : "",
      businessTransform: businessItems instanceof HTMLElement ? getComputedStyle(businessItems).transform : "",
      firstText: firstItem?.textContent ?? "",
      firstRect: readRect(firstLabel),
      firstPosition: firstItem instanceof HTMLElement ? getComputedStyle(firstItem).position : "",
      firstFontSize: firstItem instanceof HTMLElement ? getComputedStyle(firstItem).fontSize : "",
      firstLineHeight: firstItem instanceof HTMLElement ? getComputedStyle(firstItem).lineHeight : "",
    };
  });

  expect(metrics.titleRect?.top).toBeGreaterThanOrEqual(290);
  expect(metrics.titleRect?.top).toBeLessThanOrEqual(310);
  expect(metrics.descRect?.top).toBeGreaterThanOrEqual(565);
  expect(metrics.descRect?.top).toBeLessThanOrEqual(590);
  expect(metrics.descRect?.left).toBeGreaterThanOrEqual(315);
  expect(metrics.descRect?.left).toBeLessThanOrEqual(325);
  expect(metrics.descRect?.width).toBe(800);
  expect(metrics.businessDisplay).toBe("block");
  expect(metrics.businessOpacity).toBeGreaterThan(0.95);
  expect(metrics.businessFontSize).toBe("74.88px");
  expect(metrics.businessLineHeight).toBe("74.88px");
  expect(metrics.businessTransform).toContain("matrix3d");
  expect(metrics.businessRect?.left).toBeGreaterThanOrEqual(95);
  expect(metrics.businessRect?.left).toBeLessThanOrEqual(125);
  expect(metrics.businessRect?.top).toBeGreaterThanOrEqual(-25);
  expect(metrics.businessRect?.top).toBeLessThanOrEqual(10);
  expect(metrics.businessRect?.width).toBeGreaterThanOrEqual(1200);
  expect(metrics.businessRect?.width).toBeLessThanOrEqual(1245);
  expect(metrics.businessRect?.height).toBeGreaterThanOrEqual(870);
  expect(metrics.businessRect?.height).toBeLessThanOrEqual(920);
  expect(metrics.firstText).toBe("OOH");
  expect(metrics.firstPosition).toBe("absolute");
  expect(metrics.firstFontSize).toBe("74.88px");
  expect(metrics.firstLineHeight).toBe("74.88px");
  expect(metrics.firstRect?.left).toBeGreaterThanOrEqual(630);
  expect(metrics.firstRect?.left).toBeLessThanOrEqual(685);
  expect(metrics.firstRect?.top).toBeGreaterThanOrEqual(360);
  expect(metrics.firstRect?.top).toBeLessThanOrEqual(410);
  expect(metrics.firstRect?.width).toBeGreaterThanOrEqual(110);
  expect(metrics.firstRect?.width).toBeLessThanOrEqual(150);
  expect(metrics.firstRect?.height).toBeGreaterThanOrEqual(45);
  expect(metrics.firstRect?.height).toBeLessThanOrEqual(70);
});

test("business wheel distributes items along the source cylindrical ladder", async ({ page }) => {
  await openBpco(page);
  const checkpoints = [];
  const expectWithin = (actual, min, max) => {
    expect(actual).toBeGreaterThanOrEqual(min);
    expect(actual).toBeLessThanOrEqual(max);
  };

  for (const y of [14500, 15000]) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(400);
    checkpoints.push(await page.evaluate(() =>
      [...document.querySelectorAll(".main.m4 .business_items .bs_item")].slice(0, 6).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          text: element.textContent ?? "",
          top: Math.round(rect.top),
          height: Math.round(rect.height),
        };
      }),
    ));
  }

  expect(checkpoints[0].map((item) => item.text)).toEqual(["OOH", "POP-UP", "OUTDOOR", "DIGITAL", "CREATIVE", "EVENT"]);
  const earlyTopRanges = [
    [360, 405],
    [300, 345],
    [250, 305],
    [200, 255],
    [160, 210],
    [125, 175],
  ];
  const earlyHeightRanges = [
    [52, 64],
    [48, 66],
    [42, 66],
    [35, 66],
    [28, 64],
    [24, 62],
  ];
  const middleTopRanges = [
    [625, 685],
    [590, 640],
    [540, 595],
    [490, 545],
    [435, 495],
    [385, 445],
  ];
  const middleHeightRanges = [
    [20, 58],
    [28, 62],
    [34, 64],
    [40, 66],
    [42, 68],
    [42, 68],
  ];
  checkpoints[0].forEach((item, index) => {
    expectWithin(item.top, earlyTopRanges[index][0], earlyTopRanges[index][1]);
    expectWithin(item.height, earlyHeightRanges[index][0], earlyHeightRanges[index][1]);
  });
  checkpoints[1].forEach((item, index) => {
    expectWithin(item.top, middleTopRanges[index][0], middleTopRanges[index][1]);
    expectWithin(item.height, middleHeightRanges[index][0], middleHeightRanges[index][1]);
  });
});

test("business wheel fades out during the late m4 scroll", async ({ page }) => {
  await openBpco(page);
  const checkpoints = [];

  for (const y of [15500, 16500]) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(400);
    checkpoints.push(await page.evaluate(() => {
      const title = document.querySelector(".main.m4 .section_title");
      const desc = document.querySelector(".main.m4 .section_desc");
      const businessItems = document.querySelector(".main.m4 .business_items");
      const firstItem = document.querySelector(".main.m4 .business_items .bs_item");
      const readRect = (element) => {
        const rect = element?.getBoundingClientRect();
        return rect
          ? {
              left: Math.round(rect.left),
              top: Math.round(rect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            }
          : null;
      };

      return {
        scrollY: window.scrollY,
        titleRect: readRect(title),
        descRect: readRect(desc),
        businessRect: readRect(businessItems),
        firstRect: readRect(firstItem),
        businessOpacity: businessItems instanceof HTMLElement ? Number(getComputedStyle(businessItems).opacity) : -1,
        businessTransform: businessItems instanceof HTMLElement ? getComputedStyle(businessItems).transform : "",
      };
    }));
  }

  expect(checkpoints[0].businessTransform).toContain("matrix3d");
  expect(checkpoints[0].businessOpacity).toBeLessThanOrEqual(0.05);
  expect(checkpoints[0].titleRect?.top).toBeGreaterThanOrEqual(290);
  expect(checkpoints[0].titleRect?.top).toBeLessThanOrEqual(310);
  expect(checkpoints[0].descRect?.top).toBeGreaterThanOrEqual(570);
  expect(checkpoints[0].descRect?.top).toBeLessThanOrEqual(590);

  expect(checkpoints[1].businessTransform).toContain("matrix3d");
  expect(checkpoints[1].businessOpacity).toBeLessThanOrEqual(0.05);
  expect(checkpoints[1].titleRect?.top).toBeGreaterThanOrEqual(-185);
  expect(checkpoints[1].titleRect?.top).toBeLessThanOrEqual(-160);
  expect(checkpoints[1].descRect?.top).toBeGreaterThanOrEqual(95);
  expect(checkpoints[1].descRect?.top).toBeLessThanOrEqual(120);
});

test("late business scroll keeps the source tv transition above the parked media collage", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 15500));
  await page.waitForTimeout(400);

  const metrics = await page.evaluate(() => {
    const sticky = document.querySelector(".main.m4 .m4_sticky");
    const collage = document.querySelector(".main.m4 .m4_media_collage");
    const title = document.querySelector(".main.m4 .section_title");
    const collageRect = collage?.getBoundingClientRect();
    const stickyStyle = sticky instanceof HTMLElement ? getComputedStyle(sticky) : null;
    const collageStyle = collage instanceof HTMLElement ? getComputedStyle(collage) : null;
    const titleRect = title?.getBoundingClientRect();
    return {
      stickyBackground: stickyStyle?.backgroundColor ?? "",
      collageCount: document.querySelectorAll(".main.m4 .m4_media_collage img").length,
      collageOpacity: collageStyle ? Number(collageStyle.opacity) : -1,
      collageRect: collageRect
        ? {
            left: Math.round(collageRect.left),
            top: Math.round(collageRect.top),
            width: Math.round(collageRect.width),
            height: Math.round(collageRect.height),
          }
        : null,
      titleTop: Math.round(titleRect?.top ?? -1),
    };
  });

  expect(metrics.stickyBackground).toBe("rgba(0, 0, 0, 0)");
  expect(metrics.collageCount).toBe(4);
  expect(metrics.collageOpacity).toBeLessThanOrEqual(0.05);
  expect(metrics.collageRect?.left).toBeGreaterThanOrEqual(335);
  expect(metrics.collageRect?.left).toBeLessThanOrEqual(375);
  expect(metrics.collageRect?.top).toBeGreaterThanOrEqual(155);
  expect(metrics.collageRect?.top).toBeLessThanOrEqual(190);
  expect(metrics.collageRect?.width).toBeGreaterThanOrEqual(700);
  expect(metrics.collageRect?.width).toBeLessThanOrEqual(760);
  expect(metrics.collageRect?.height).toBeGreaterThanOrEqual(530);
  expect(metrics.collageRect?.height).toBeLessThanOrEqual(590);
  expect(metrics.titleTop).toBeGreaterThanOrEqual(290);
  expect(metrics.titleTop).toBeLessThanOrEqual(310);
});

test("project range renders the source fixed dice project surface", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 12000));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  const metrics = await page.evaluate(() => {
    const diceSection = document.querySelector(".m3_dice_section");
    const prSection = document.querySelector(".m3_dice_section .pr_section");
    const leftLabel = document.querySelector(".m3_dice_section .project_left_label");
    const rightLabel = document.querySelector(".m3_dice_section .project_right_label");
    const firstDiceItem = document.querySelector(".m3_dice_section .dice_item");
    const projectList = document.querySelector(".project_list");
    const readRect = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect
        ? {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }
        : null;
    };
    return {
      dicePosition: diceSection instanceof HTMLElement ? getComputedStyle(diceSection).position : "",
      diceOpacity: diceSection instanceof HTMLElement ? Number(getComputedStyle(diceSection).opacity) : -1,
      diceRect: readRect(diceSection),
      prRect: readRect(prSection),
      firstDiceRect: readRect(firstDiceItem),
      diceItems: document.querySelectorAll(".m3_dice_section .dice_item").length,
      leftLabelText: leftLabel?.textContent ?? "",
      rightLabelText: rightLabel?.textContent ?? "",
      projectListOpacity: projectList instanceof HTMLElement ? Number(getComputedStyle(projectList).opacity) : -1,
    };
  });

  expect(metrics.dicePosition).toBe("fixed");
  expect(metrics.diceOpacity).toBeGreaterThan(0.95);
  expect(metrics.diceRect).toEqual({ left: 0, top: 0, width: 1440, height: 900 });
  expect(metrics.prRect).toEqual({ left: 432, top: 263, width: 576, height: 374 });
  expect(metrics.firstDiceRect?.left).toBeGreaterThanOrEqual(410);
  expect(metrics.firstDiceRect?.left).toBeLessThanOrEqual(435);
  expect(metrics.firstDiceRect?.top).toBeGreaterThanOrEqual(255);
  expect(metrics.firstDiceRect?.top).toBeLessThanOrEqual(270);
  expect(metrics.firstDiceRect?.width).toBeGreaterThanOrEqual(560);
  expect(metrics.firstDiceRect?.width).toBeLessThanOrEqual(590);
  expect(metrics.firstDiceRect?.height).toBeGreaterThanOrEqual(360);
  expect(metrics.firstDiceRect?.height).toBeLessThanOrEqual(390);
  expect(metrics.diceItems).toBe(5);
  expect(metrics.leftLabelText).toBe("RECENT PROJECT");
  expect(metrics.rightLabelText).toBe("4P—CREATIVE—CAMPAIGN");
  expect(metrics.projectListOpacity).toBe(0);
});

test("project split labels hold the pre-reveal gap before the dice surface appears", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 7200));
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => {
    const diceSection = document.querySelector(".m3_dice_section");
    const prSection = document.querySelector(".m3_dice_section .pr_section");
    const firstDiceItem = document.querySelector(".m3_dice_section .dice_item");
    const leftLabel = document.querySelector(".m3_dice_section .project_left_label");
    const rightLabel = document.querySelector(".m3_dice_section .project_right_label");
    const readRect = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect
        ? {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }
        : null;
    };

    return {
      diceOpacity: diceSection instanceof HTMLElement ? Number(getComputedStyle(diceSection).opacity) : -1,
      diceZIndex: diceSection instanceof HTMLElement ? getComputedStyle(diceSection).zIndex : "",
      prRect: readRect(prSection),
      firstDiceRect: readRect(firstDiceItem),
      leftLabelTop: Math.round(leftLabel?.getBoundingClientRect().top ?? -1),
      rightLabelTop: Math.round(rightLabel?.getBoundingClientRect().top ?? -1),
    };
  });

  expect(metrics.diceOpacity).toBeGreaterThanOrEqual(0.95);
  expect(metrics.diceZIndex).toBe("2");
  expect(metrics.prRect).toEqual({ left: 432, top: 263, width: 576, height: 374 });
  expect(metrics.firstDiceRect?.left).toBeGreaterThanOrEqual(718);
  expect(metrics.firstDiceRect?.left).toBeLessThanOrEqual(722);
  expect(metrics.firstDiceRect?.top).toBeGreaterThanOrEqual(448);
  expect(metrics.firstDiceRect?.top).toBeLessThanOrEqual(452);
  expect(metrics.firstDiceRect?.width).toBeLessThanOrEqual(8);
  expect(metrics.firstDiceRect?.height).toBeLessThanOrEqual(8);
  expect(metrics.leftLabelTop).toBeGreaterThanOrEqual(430);
  expect(metrics.leftLabelTop).toBeLessThanOrEqual(445);
  expect(metrics.rightLabelTop).toBeGreaterThanOrEqual(430);
  expect(metrics.rightLabelTop).toBeLessThanOrEqual(445);
});

test("project dice first card folds into the source right-side strip", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 9000));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  const metrics = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".m3_dice_section .dice_item")).map((item) => {
      const rect = item.getBoundingClientRect();
      return {
        opacity: Number(getComputedStyle(item).opacity),
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
  });

  expect(metrics[0]?.left).toBeGreaterThanOrEqual(920);
  expect(metrics[0]?.left).toBeLessThanOrEqual(955);
  expect(metrics[0]?.top).toBeGreaterThanOrEqual(250);
  expect(metrics[0]?.top).toBeLessThanOrEqual(270);
  expect(metrics[0]?.width).toBeGreaterThanOrEqual(35);
  expect(metrics[0]?.width).toBeLessThanOrEqual(65);
  expect(metrics[0]?.height).toBeGreaterThanOrEqual(360);
  expect(metrics[0]?.height).toBeLessThanOrEqual(395);
  expect(metrics[1]?.opacity).toBeGreaterThan(0.95);
  expect(metrics[1]?.left).toBeGreaterThanOrEqual(395);
  expect(metrics[1]?.left).toBeLessThanOrEqual(430);
  expect(metrics[1]?.width).toBeGreaterThanOrEqual(555);
  expect(metrics[1]?.width).toBeLessThanOrEqual(585);
  expect(metrics[2]?.opacity).toBeGreaterThan(0.95);
  expect(metrics[2]?.left).toBeGreaterThanOrEqual(395);
  expect(metrics[2]?.left).toBeLessThanOrEqual(430);
  expect(metrics[2]?.width).toBeGreaterThanOrEqual(120);
  expect(metrics[2]?.width).toBeLessThanOrEqual(155);
  expect(metrics[4]?.opacity).toBeGreaterThan(0.95);
  expect(metrics[4]?.top).toBeGreaterThanOrEqual(565);
  expect(metrics[4]?.top).toBeLessThanOrEqual(590);
  expect(metrics[4]?.height).toBeGreaterThanOrEqual(55);
  expect(metrics[4]?.height).toBeLessThanOrEqual(80);
});

test("project dice stack advances the source front-card sequence", async ({ page }) => {
  await openBpco(page);

  const checkpoints = [
    { y: 8184, title: "BAEMIN B OOH Campaign", left: 470, width: 560, matrix: "0.984023" },
    { y: 9000, title: "MARITHÉ an annual OOH Campaign", left: 405, width: 570, matrix: "0.09767" },
    { y: 10000, title: "DESCENTE 90th Campagin", left: 405, width: 570, matrix: "-0.996557" },
    { y: 10500, title: "DESCENTE 90th Campagin", left: 680, width: 370, matrix: "-0.758481" },
    { y: 11000, title: "Pokémon GO an Annual Campaign", left: 410, width: 570, matrix: "-0.068094" },
    { y: 12000, title: "BAEMIN B OOH Campaign", left: 410, width: 570, matrix: "0.99858" },
  ];

  for (const checkpoint of checkpoints) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), checkpoint.y);
    await page.waitForFunction(
      ({ matrix, scrollY }) =>
        window.scrollY === scrollY &&
        Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95 &&
        getComputedStyle(document.querySelector(".m3_dice_section .dice_items")).transform.includes(matrix),
      { matrix: checkpoint.matrix, scrollY: checkpoint.y },
    );

    const metrics = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll(".m3_dice_section .dice_item")).map((item) => {
        const rect = item.getBoundingClientRect();
        return {
          title: item.querySelector(".info_title")?.textContent?.trim() ?? "",
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          area: Math.round(rect.width * rect.height),
        };
      });
      return items.reduce((front, item) => (item.area > front.area ? item : front), items[0]);
    });

    expect(metrics?.title).toBe(checkpoint.title);
    expect(metrics?.left).toBeGreaterThanOrEqual(checkpoint.left - 12);
    expect(metrics?.left).toBeLessThanOrEqual(checkpoint.left + 22);
    expect(metrics?.width).toBeGreaterThanOrEqual(checkpoint.width - 25);
    expect(metrics?.width).toBeLessThanOrEqual(checkpoint.width + 25);
  }
});

test("project dice stack uses the source perspective cube transforms", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 10500));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  const metrics = await page.evaluate(() => {
    const prSection = document.querySelector(".m3_dice_section .pr_section");
    const diceItems = document.querySelector(".m3_dice_section .dice_items");
    const faces = Array.from(document.querySelectorAll(".m3_dice_section .dice_item")).map((item) => getComputedStyle(item).transform);
    const readStyle = (element) => {
      if (!(element instanceof HTMLElement)) {
        return null;
      }

      const style = getComputedStyle(element);
      return {
        perspective: style.perspective,
        transform: style.transform,
        transformStyle: style.transformStyle,
        transformOrigin: style.transformOrigin,
        overflow: style.overflow,
      };
    };

    return {
      pr: readStyle(prSection),
      items: readStyle(diceItems),
      faces,
    };
  });

  expect(metrics.pr?.perspective).toBe("1200px");
  expect(metrics.items?.transformStyle).toBe("preserve-3d");
  expect(metrics.items?.transform).toContain("matrix3d(-0.758");
  expect(metrics.faces[0]).toBe("matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 288, 1)");
  expect(metrics.faces[1]).toBe("matrix3d(0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, -288, 0, 0, 1)");
  expect(metrics.faces[2]).toBe("matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -288, 1)");
  expect(metrics.faces[3]).toBe("matrix3d(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 288, 0, 0, 1)");
});

test("project list keeps the source horizontal rail and other-project table structure", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, document.querySelector(".project_list")?.offsetTop ?? 0));
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => {
    const readRect = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect
        ? {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }
        : null;
    };
    const firstItem = document.querySelector(".project_list .main_projects .mp_item");
    const firstClient = document.querySelector(".project_list .main_projects .mp_item .pr_client");
    const firstImage = document.querySelector(".project_list .main_projects .mp_item .pr_img");
    const firstImageInner = document.querySelector(".project_list .main_projects .mp_item .pr_img img");
    const otherTitle = document.querySelector(".project_list .main_projects .other_title");
    const secondItem = document.querySelectorAll(".project_list .main_projects .mp_item")[1];
    const nav = document.querySelector(".nav");
    const navLinks = document.querySelectorAll(".nav a");

    return {
      introAniWrapCount: document.querySelectorAll(".project_list .intro_ani_wrap").length,
      mainProjectsCount: document.querySelectorAll(".project_list .main_projects").length,
      projectTrackCount: document.querySelectorAll(".project_list .project_track").length,
      projectHeadCount: document.querySelectorAll(".project_list .project_head").length,
      mainProjectItems: document.querySelectorAll(".project_list .main_projects .mp_item").length,
      projectImages: document.querySelectorAll(".project_list .main_projects .mp_item .pr_img").length,
      projectTitles: document.querySelectorAll(".project_list .main_projects .mp_item .pr_title").length,
      subProjectTables: document.querySelectorAll(".project_list .sub_projects").length,
      subProjectRows: document.querySelectorAll(".project_list .sub_projects .sp_item").length,
      projectInfoCount: document.querySelectorAll(".project_list .pr_info").length,
      firstItemRect: readRect(firstItem),
      firstClientRect: readRect(firstClient),
      firstImageRect: readRect(firstImage),
      otherTitleRect: readRect(otherTitle),
      firstClientText: firstClient?.textContent?.trim().replace(/\s+/g, "") ?? "",
      firstTitleText: firstItem?.querySelector(".pr_title")?.textContent?.trim() ?? "",
      firstNumText: firstItem?.querySelector(".pr_num")?.textContent?.trim() ?? "",
      otherTitleText: otherTitle?.textContent?.trim().toUpperCase() ?? "",
      firstSubRowText: document.querySelector(".project_list .sub_projects .sp_item")?.textContent?.trim().replace(/\s+/g, " ") ?? "",
      firstClientFontSize: firstClient instanceof HTMLElement ? getComputedStyle(firstClient).fontSize : "",
      firstClientLineHeight: firstClient instanceof HTMLElement ? getComputedStyle(firstClient).lineHeight : "",
      firstItemStroke: firstItem instanceof HTMLElement ? getComputedStyle(firstItem).webkitTextStrokeWidth : "",
      secondItemStroke: secondItem instanceof HTMLElement ? getComputedStyle(secondItem).webkitTextStrokeWidth : "",
      firstImageOpacity: firstImageInner instanceof HTMLElement ? Number(getComputedStyle(firstImageInner).opacity) : -1,
      navHomeColor: navLinks[0] instanceof HTMLElement ? getComputedStyle(navLinks[0]).color : "",
      navProjectsColor: navLinks[1] instanceof HTMLElement ? getComputedStyle(navLinks[1]).color : "",
      navBeforeLeft: nav instanceof HTMLElement ? getComputedStyle(nav, "::before").left : "",
      navBeforeWidth: nav instanceof HTMLElement ? getComputedStyle(nav, "::before").width : "",
      projectInfoPosition: document.querySelector(".project_list .pr_info") instanceof HTMLElement
        ? getComputedStyle(document.querySelector(".project_list .pr_info")).position
        : "",
    };
  });

  expect(metrics.introAniWrapCount).toBe(1);
  expect(metrics.mainProjectsCount).toBe(1);
  expect(metrics.projectTrackCount).toBe(0);
  expect(metrics.projectHeadCount).toBe(0);
  expect(metrics.mainProjectItems).toBeGreaterThanOrEqual(4);
  expect(metrics.projectImages).toBe(metrics.mainProjectItems);
  expect(metrics.projectTitles).toBe(metrics.mainProjectItems);
  expect(metrics.subProjectTables).toBe(1);
  expect(metrics.subProjectRows).toBeGreaterThanOrEqual(4);
  expect(metrics.projectInfoCount).toBe(1);
  expect(metrics.firstItemRect).toEqual({ left: 360, top: 0, width: 720, height: 900 });
  expect(metrics.firstClientRect?.height).toBeGreaterThanOrEqual(84);
  expect(metrics.firstClientRect?.height).toBeLessThanOrEqual(88);
  expect(metrics.firstImageRect).toEqual({ left: 540, top: 234, width: 360, height: 432 });
  expect(metrics.otherTitleRect?.width).toBe(1440);
  expect(metrics.otherTitleRect?.height).toBe(900);
  expect(metrics.firstClientText).toBe("(01)BAEMINB");
  expect(metrics.firstTitleText).toBe("BAEMIN B OOH Campaign");
  expect(metrics.firstNumText).toBe("(01)");
  expect(metrics.otherTitleText).toBe("OTHER PROJECTS");
  expect(metrics.firstSubRowText).toContain("YEOGIEOTTAE CORP");
  expect(metrics.firstClientFontSize).toBe("86.4px");
  expect(metrics.firstClientLineHeight).toBe("86.4px");
  expect(metrics.firstItemStroke).toBe("0px");
  expect(metrics.secondItemStroke).toBe("1px");
  expect(metrics.firstImageOpacity).toBe(0);
  expect(metrics.navHomeColor).toBe("rgb(255, 255, 255)");
  expect(metrics.navProjectsColor).toBe("rgb(18, 18, 18)");
  expect(metrics.navBeforeLeft).toBe("7px");
  expect(metrics.navBeforeWidth).toBe("63px");
  expect(metrics.projectInfoPosition).toBe("fixed");
});

test("page exposes the BPCO copy and project layers as editable DOM", async ({ page }) => {
  await openBpco(page);
  const structure = await page.evaluate(() => ({
    iframes: document.querySelectorAll("iframe").length,
    videos: document.querySelectorAll("video").length,
    projectItems: document.querySelectorAll(".mp_item").length,
    businessItems: document.querySelectorAll(".bs_item").length,
    philosophyItems: document.querySelectorAll(".main_desc").length,
    text: document.body.textContent ?? "",
  }));
  expect(structure.iframes).toBe(0);
  expect(structure.videos).toBe(0);
  expect(structure.projectItems).toBeGreaterThanOrEqual(4);
  expect(structure.businessItems).toBe(14);
  expect(structure.philosophyItems).toBe(3);
  expect(structure.text).toContain("Bigpicture Company");
  expect(structure.text).toContain("RECENT PROJECT");
  expect(structure.text).toContain("BAEMIN B OOH Campaign");
  expect(structure.text).toContain("advertising agency specializing in planning");
});

test("footer keeps the source SAY HI canvas and company information layout", async ({ page }) => {
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, document.querySelector("footer")?.offsetTop ?? 0));
  await page.waitForTimeout(300);

  const metrics = await page.evaluate(() => {
    const readRect = (element) => {
      const rect = element?.getBoundingClientRect();
      return rect
        ? {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }
        : null;
    };
    const footer = document.querySelector("footer");
    const sayCanvas = document.querySelector("#say_canvas");
    const bottomSection = document.querySelector("footer .bottom_section");
    const logo = document.querySelector("footer .logo_section img");

    return {
      footerRect: readRect(footer),
      footerDisplay: footer instanceof HTMLElement ? getComputedStyle(footer).display : "",
      sayCanvasRect: readRect(sayCanvas),
      sayCanvasCount: document.querySelectorAll("#say_canvas").length,
      decoContainers: document.querySelectorAll("footer .deco_img").length,
      decoImages: [...document.querySelectorAll("footer .deco_img img")].map((image) => image.getAttribute("src") ?? ""),
      bottomSectionRect: readRect(bottomSection),
      logoRect: readRect(logo),
      companyInfoText: [...document.querySelectorAll("footer .company_info_items .ci_item")].map(
        (element) => element.textContent?.trim().replace(/\s+/g, " ") ?? "",
      ),
      infoCopy: document.querySelector("footer .info_copy")?.textContent?.trim().replace(/\s+/g, " ") ?? "",
      legacyFooterLabelCount: document.querySelectorAll("footer .footer_label").length,
      legacyQrImageCount: document.querySelectorAll("footer .qr_img").length,
    };
  });

  expect(metrics.footerDisplay).toBe("flex");
  expect(metrics.footerRect).toEqual({ left: 0, top: 0, width: 1440, height: 900 });
  expect(metrics.sayCanvasCount).toBe(1);
  expect(metrics.sayCanvasRect).toEqual({ left: 220, top: 270, width: 1000, height: 300 });
  expect(metrics.decoContainers).toBe(2);
  expect(metrics.decoImages).toEqual([
    "https://www.bpco.kr/img/ic_star.svg",
    "https://www.bpco.kr/img/ic_star2.svg",
    "https://www.bpco.kr/img/ic_qrcode.svg",
  ]);
  expect(metrics.bottomSectionRect?.width).toBe(1100);
  expect(metrics.logoRect?.width).toBeGreaterThanOrEqual(140);
  expect(metrics.logoRect?.width).toBeLessThanOrEqual(146);
  expect(metrics.companyInfoText).toEqual(["©BPCO 2023", "+82)02 798 9248", "bpco@bpco.kr", "credential.pdf"]);
  expect(metrics.infoCopy).toContain("We are an advertising agency specializing in planning");
  expect(metrics.legacyFooterLabelCount).toBe(0);
  expect(metrics.legacyQrImageCount).toBe(0);
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
