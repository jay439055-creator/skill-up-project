import { expect, test } from "playwright/test";

async function openBpco(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.waitForFunction(
    () => document.querySelector("#main_canvas")?.getAttribute("data-renderer-ready") === "true",
    undefined,
    { timeout: 30000 },
  );
}

test("hero late-scroll introduces the source secondary 3D character", async ({ page }) => {
  test.setTimeout(60000);
  await openBpco(page);
  const checkpoints = [];

  for (const y of [720, 1800, 2400, 3200, 4500, 5600]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(250);
    checkpoints.push(await page.evaluate(() => {
      const object = document.querySelector("#main_canvas");
      return {
        y: window.scrollY,
        characterSrc: object?.getAttribute("data-secondary-character-src") ?? "",
        characterReady: object?.getAttribute("data-secondary-character-ready") ?? "",
        characterProgress: Number(object?.getAttribute("data-secondary-character-progress") ?? -1),
        characterScaleProgress: Number(object?.getAttribute("data-secondary-character-scale-progress") ?? -1),
        characterX: Number(object?.getAttribute("data-secondary-character-x") ?? -9999),
        characterZ: Number(object?.getAttribute("data-secondary-character-z") ?? -9999),
        auxiliaryReadyCount: Number(object?.getAttribute("data-auxiliary-character-ready-count") ?? -1),
        auxiliaryProgress: Number(object?.getAttribute("data-auxiliary-character-progress") ?? -1),
        auxiliaryRotationX: Number(object?.getAttribute("data-auxiliary-character-rotation-x") ?? -1),
        auxiliaryScaleProgress2: Number(object?.getAttribute("data-auxiliary-character-2-scale-progress") ?? -1),
        auxiliaryCharacter0X: Number(object?.getAttribute("data-auxiliary-character-0-x") ?? -9999),
        auxiliaryCharacter0Y: Number(object?.getAttribute("data-auxiliary-character-0-y") ?? -9999),
        auxiliaryCharacter0RotationX: Number(object?.getAttribute("data-auxiliary-character-0-rotation-x") ?? -9999),
        auxiliaryCharacter0RotationY: Number(object?.getAttribute("data-auxiliary-character-0-rotation-y") ?? -9999),
        auxiliaryCharacter1X: Number(object?.getAttribute("data-auxiliary-character-1-x") ?? -9999),
        auxiliaryCharacter1Y: Number(object?.getAttribute("data-auxiliary-character-1-y") ?? -9999),
        auxiliaryCharacter1RotationX: Number(object?.getAttribute("data-auxiliary-character-1-rotation-x") ?? -9999),
        auxiliaryCharacter1RotationY: Number(object?.getAttribute("data-auxiliary-character-1-rotation-y") ?? -9999),
        auxiliaryCharacter2X: Number(object?.getAttribute("data-auxiliary-character-2-x") ?? -9999),
        auxiliaryCharacter2Y: Number(object?.getAttribute("data-auxiliary-character-2-y") ?? -9999),
        auxiliaryCharacter2RotationX: Number(object?.getAttribute("data-auxiliary-character-2-rotation-x") ?? -9999),
        auxiliaryCharacter2RotationY: Number(object?.getAttribute("data-auxiliary-character-2-rotation-y") ?? -9999),
        auxiliaryCharacter3X: Number(object?.getAttribute("data-auxiliary-character-3-x") ?? -9999),
        auxiliaryCharacter3Y: Number(object?.getAttribute("data-auxiliary-character-3-y") ?? -9999),
        auxiliaryCharacter3RotationX: Number(object?.getAttribute("data-auxiliary-character-3-rotation-x") ?? -9999),
        auxiliaryCharacter3RotationY: Number(object?.getAttribute("data-auxiliary-character-3-rotation-y") ?? -9999),
        toneMapping: Number(object?.getAttribute("data-renderer-tone-mapping") ?? -1),
        environmentKind: object?.getAttribute("data-environment-kind") ?? "",
        mainDirectionalLights: Number(object?.getAttribute("data-main-directional-lights") ?? -1),
        mainDirectionalIntensity: Number(object?.getAttribute("data-main-directional-intensity") ?? -1),
        overlayDirectionalLights: Number(object?.getAttribute("data-overlay-directional-lights") ?? -1),
        overlayDirectionalIntensity: Number(object?.getAttribute("data-overlay-directional-intensity") ?? -1),
        canvasOpacity: Number(getComputedStyle(object).opacity),
        modelOpacity: Number(object?.getAttribute("data-model-opacity") ?? -1),
        rs1SourceAnchorLeft: Number(
          document.querySelector(".rs1 .main_title .tspan_w")?.getBoundingClientRect().left.toFixed(1) ?? -9999,
        ),
        rs1SourceAnchorWidth: Number(
          document.querySelector(".rs1 .main_title .tspan_w")?.getBoundingClientRect().width.toFixed(1) ?? -9999,
        ),
        rs1TitleTop: Number(document.querySelector(".rs1 .main_title")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        logoText: document.querySelector(".logo")?.textContent?.trim().replace(/\s+/g, " ") ?? "",
        logoHeight: Number(document.querySelector(".logo")?.getBoundingClientRect().height.toFixed(1) ?? -1),
        logoFontSize: getComputedStyle(document.querySelector(".logo")).fontSize,
        logoLineHeight: getComputedStyle(document.querySelector(".logo")).lineHeight,
        bodyTextRendering: getComputedStyle(document.body).textRendering,
        bodyFontSmoothing: getComputedStyle(document.body).webkitFontSmoothing,
        navHomeColor: getComputedStyle(document.querySelector(".nav a:first-child")).color,
        navActiveBackground: getComputedStyle(document.querySelector(".nav"), "::before").backgroundColor,
        canvasZIndex: getComputedStyle(object).zIndex,
        contentsWrapZIndex: getComputedStyle(document.querySelector(".contents_wrap")).zIndex,
        m2Background: getComputedStyle(document.querySelector(".main.m2")).backgroundColor,
        m2TitleFontWeight: getComputedStyle(document.querySelector(".m2_title")).fontWeight,
        m2TitleText: document.querySelector(".m2_title")?.textContent?.trim().replace(/\s+/g, " ") ?? "",
        copyDecoFontFamily: getComputedStyle(document.querySelector(".copy_deco")).fontFamily,
        copyDecoText: document.querySelector(".copy_deco")?.textContent?.trim() ?? "",
        headerBlendMode: getComputedStyle(document.querySelector(".header")).mixBlendMode,
        logoBlendMode: getComputedStyle(document.querySelector(".logo")).mixBlendMode,
        navBlendMode: getComputedStyle(document.querySelector(".nav")).mixBlendMode,
        m2StickyTop: Number(document.querySelector(".m2_sticky")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        projectTop: Number(document.querySelector(".project_list")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rowLeft: Number(document.querySelector(".row_container")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs2Display: getComputedStyle(document.querySelector(".row_section.rs2")).display,
        rs2Left: Number(document.querySelector(".row_section.rs2")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs2TitleDisplay: getComputedStyle(document.querySelector(".rs2 .m2_title")).display,
        rs2TitleLeft: Number(document.querySelector(".rs2 .m2_title")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs2TitleText: document.querySelector(".rs2 .m2_title")?.textContent?.trim().replace(/\s+/g, " ") ?? "",
        rs2DescDisplay: getComputedStyle(document.querySelector(".rs2 .m2_desc")).display,
        rs2DescLeft: Number(document.querySelector(".rs2 .m2_desc")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs2DescTop: Number(document.querySelector(".rs2 .m2_desc")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rs2TspanCount: document.querySelectorAll(".rs2 .tspan").length,
        rs2Tspan2ImageCount: document.querySelectorAll(".rs2 .tspan_2 img").length,
        rs2Tspan2Top: Number(document.querySelector(".rs2 .tspan_2")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rs2Tspan2Height: Number(document.querySelector(".rs2 .tspan_2")?.getBoundingClientRect().height.toFixed(1) ?? -9999),
        rs2Tspan3ImageDisplay: document.querySelector(".rs2 .tspan_3 img")
          ? getComputedStyle(document.querySelector(".rs2 .tspan_3 img")).display
          : "",
        rs3Display: document.querySelector(".row_section.rs3")
          ? getComputedStyle(document.querySelector(".row_section.rs3")).display
          : "",
        rs3Left: Number(document.querySelector(".row_section.rs3")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs3Width: Number(document.querySelector(".row_section.rs3")?.getBoundingClientRect().width.toFixed(1) ?? -9999),
        rs3TitleDisplay: document.querySelector(".rs3 .m2_title")
          ? getComputedStyle(document.querySelector(".rs3 .m2_title")).display
          : "",
        rs3TitleLeft: Number(document.querySelector(".rs3 .m2_title")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs3TitleTop: Number(document.querySelector(".rs3 .m2_title")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rs3TitleText: document.querySelector(".rs3 .m2_title")?.textContent?.trim().replace(/\s+/g, " ") ?? "",
        rs3DescDisplay: document.querySelector(".rs3 .m2_desc")
          ? getComputedStyle(document.querySelector(".rs3 .m2_desc")).display
          : "",
        rs3DescLeft: Number(document.querySelector(".rs3 .m2_desc")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs3DescTop: Number(document.querySelector(".rs3 .m2_desc")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rs3CopyDecoText: document.querySelector(".rs3 .copy_deco")?.textContent?.trim().replace(/\s+/g, " ") ?? "",
        rs3CopyDecoLeft: Number(document.querySelector(".rs3 .copy_deco")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs3CopyDecoTop: Number(document.querySelector(".rs3 .copy_deco")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rs3TspanCount: document.querySelectorAll(".rs3 .tspan").length,
        rs3Tspan4ImageCount: document.querySelectorAll(".rs3 .tspan_4 img").length,
        rs3Tspan4Left: Number(document.querySelector(".rs3 .tspan_4")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs3Tspan4Top: Number(document.querySelector(".rs3 .tspan_4")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rs3Tspan4Width: Number(document.querySelector(".rs3 .tspan_4")?.getBoundingClientRect().width.toFixed(1) ?? -9999),
        rs3Tspan5ImageDisplay: document.querySelector(".rs3 .tspan_5 img")
          ? getComputedStyle(document.querySelector(".rs3 .tspan_5 img")).display
          : "",
        rs3Tspan5Left: Number(document.querySelector(".rs3 .tspan_5")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs3Tspan5Top: Number(document.querySelector(".rs3 .tspan_5")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rs3Tspan5Width: Number(document.querySelector(".rs3 .tspan_5")?.getBoundingClientRect().width.toFixed(1) ?? -9999),
        rs4Left: Number(document.querySelector(".row_section.rs4")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs4ImageLeft: Number(document.querySelector(".rs4 .back_img")?.getBoundingClientRect().left.toFixed(1) ?? -9999),
        rs4ImageTop: Number(document.querySelector(".rs4 .back_img")?.getBoundingClientRect().top.toFixed(1) ?? -9999),
        rs4ImageWidth: Number(document.querySelector(".rs4 .back_img")?.getBoundingClientRect().width.toFixed(1) ?? -9999),
        rs4ImageHeight: Number(document.querySelector(".rs4 .back_img")?.getBoundingClientRect().height.toFixed(1) ?? -9999),
        rs4ImageRadius: getComputedStyle(document.querySelector(".rs4 .back_img")).borderRadius,
      };
    }));
  }

  expect(checkpoints[0].toneMapping).toBe(1);
  expect(checkpoints[0].environmentKind).toBe("direct-equirectangular-hdr");
  expect(checkpoints[0].mainDirectionalLights).toBe(1);
  expect(checkpoints[0].mainDirectionalIntensity).toBeCloseTo(1.2, 3);
  expect(checkpoints[0].overlayDirectionalLights).toBe(2);
  expect(checkpoints[0].overlayDirectionalIntensity).toBeCloseTo(2.6, 3);
  expect(checkpoints[0].characterSrc).toContain("/three/model/t_0.glb");
  expect(checkpoints[0].characterReady).toBe("true");
  expect(checkpoints[0].characterProgress).toBe(0);
  expect(checkpoints[1].characterProgress).toBeGreaterThan(0.1);
  expect(checkpoints[1].characterProgress).toBeLessThan(0.15);
  expect(checkpoints[1].characterScaleProgress).toBeGreaterThan(0.27);
  expect(checkpoints[1].characterScaleProgress).toBeLessThan(0.31);
  expect(checkpoints[2].characterProgress).toBeGreaterThan(0.45);
  expect(checkpoints[2].characterProgress).toBeLessThan(0.5);
  expect(checkpoints[2].characterScaleProgress).toBeGreaterThan(0.85);
  expect(checkpoints[2].characterScaleProgress).toBeLessThan(0.88);
  expect(checkpoints[2].modelOpacity).toBeGreaterThan(0.62);
  expect(checkpoints[2].modelOpacity).toBeLessThan(0.66);
  expect(checkpoints[2].rs1SourceAnchorLeft).toBe(40);
  expect(checkpoints[2].rs1SourceAnchorWidth).toBeGreaterThan(270);
  expect(checkpoints[2].rs1SourceAnchorWidth).toBeLessThan(276);
  expect(checkpoints[2].rs1TitleTop).toBeGreaterThan(1100);
  expect(checkpoints[2].rs1TitleTop).toBeLessThan(1110);
  expect(checkpoints[3].characterX).toBeGreaterThan(-530);
  expect(checkpoints[3].characterX).toBeLessThan(-500);
  expect(checkpoints[3].characterZ).toBeGreaterThanOrEqual(0);
  expect(checkpoints[3].characterZ).toBeLessThan(1);
  expect(checkpoints[3].canvasOpacity).toBe(1);
  expect(checkpoints[3].logoText).toContain("Bigpicture CompanyWe shareOur pleasure");
  expect(checkpoints[3].logoHeight).toBeGreaterThan(45);
  expect(checkpoints[3].logoHeight).toBeLessThan(60);
  expect(checkpoints[3].logoFontSize).toBe("17px");
  expect(checkpoints[3].logoLineHeight).toBe("17px");
  expect(checkpoints[3].bodyTextRendering).toBe("optimizelegibility");
  expect(checkpoints[3].bodyFontSmoothing).toBe("antialiased");
  expect(checkpoints[3].navHomeColor).toBe("rgb(255, 255, 255)");
  expect(checkpoints[3].navActiveBackground).toBe("rgba(0, 0, 0, 0.1)");
  expect(checkpoints[3].canvasZIndex).toBe("5");
  expect(checkpoints[3].contentsWrapZIndex).toBe("auto");
  expect(checkpoints[3].m2Background).toBe("rgba(0, 0, 0, 0)");
  expect(checkpoints[3].m2TitleFontWeight).toBe("700");
  expect(checkpoints[3].m2TitleText).toContain("e are");
  expect(checkpoints[3].copyDecoFontFamily).toContain("Rock Salt");
  expect(checkpoints[3].copyDecoText).toBe(
    "We highly value joy and discover it in various aspects of life. Pleasure is at the core of what we do",
  );
  expect(checkpoints[3].headerBlendMode).toBe("difference");
  expect(checkpoints[3].logoBlendMode).toBe("normal");
  expect(checkpoints[3].navBlendMode).toBe("normal");
  expect(checkpoints[4].m2StickyTop).toBe(0);
  expect(checkpoints[4].projectTop).toBeGreaterThan(3500);
  expect(checkpoints[4].rowLeft).toBe(0);
  expect(checkpoints[4].rs2Display).toBe("flex");
  expect(checkpoints[4].rs2Left).toBeGreaterThan(-80);
  expect(checkpoints[4].rs2Left).toBeLessThan(80);
  expect(checkpoints[4].characterX).toBeLessThan(-2300);
  expect(checkpoints[4].rs2TitleDisplay).toBe("block");
  expect(checkpoints[4].rs2TitleLeft).toBeGreaterThan(-40);
  expect(checkpoints[4].rs2TitleLeft).toBeLessThan(80);
  expect(checkpoints[4].rs2TitleText).toContain("riniple");
  expect(checkpoints[4].rs2DescDisplay).toBe("flex");
  expect(checkpoints[4].rs2DescLeft).toBeGreaterThan(550);
  expect(checkpoints[4].rs2DescLeft).toBeLessThan(600);
  expect(checkpoints[4].rs2DescTop).toBeGreaterThan(210);
  expect(checkpoints[4].rs2DescTop).toBeLessThan(240);
  expect(checkpoints[4].rs2TspanCount).toBe(2);
  expect(checkpoints[4].rs2Tspan2ImageCount).toBe(0);
  expect(checkpoints[4].rs2Tspan2Top).toBeGreaterThan(390);
  expect(checkpoints[4].rs2Tspan2Top).toBeLessThan(420);
  expect(checkpoints[4].rs2Tspan2Height).toBe(10);
  expect(checkpoints[4].rs2Tspan3ImageDisplay).toBe("none");
  expect(checkpoints[4].auxiliaryCharacter0X).toBeGreaterThan(-530);
  expect(checkpoints[4].auxiliaryCharacter0X).toBeLessThan(-490);
  expect(checkpoints[4].auxiliaryCharacter0Y).toBeGreaterThan(-170);
  expect(checkpoints[4].auxiliaryCharacter0Y).toBeLessThan(-40);
  expect(checkpoints[4].auxiliaryCharacter0RotationX).toBeGreaterThan(89);
  expect(checkpoints[4].auxiliaryCharacter0RotationX).toBeLessThan(90.5);
  expect(checkpoints[4].auxiliaryCharacter0RotationY).toBeGreaterThan(-0.5);
  expect(checkpoints[4].auxiliaryCharacter0RotationY).toBeLessThan(0.5);
  expect(checkpoints[4].auxiliaryCharacter1X).toBeGreaterThan(-130);
  expect(checkpoints[4].auxiliaryCharacter1X).toBeLessThan(-50);
  expect(checkpoints[4].auxiliaryCharacter1Y).toBeGreaterThan(-180);
  expect(checkpoints[4].auxiliaryCharacter1Y).toBeLessThan(-60);
  expect(checkpoints[4].auxiliaryCharacter1RotationX).toBeGreaterThan(89);
  expect(checkpoints[4].auxiliaryCharacter1RotationX).toBeLessThan(90.5);
  expect(checkpoints[4].auxiliaryCharacter1RotationY).toBeGreaterThan(-0.5);
  expect(checkpoints[4].auxiliaryCharacter1RotationY).toBeLessThan(0.5);
  expect(checkpoints[5].rs3Display).toBe("flex");
  expect(checkpoints[5].rs3Left).toBeGreaterThan(-340);
  expect(checkpoints[5].rs3Left).toBeLessThan(-280);
  expect(checkpoints[5].rs3Width).toBeGreaterThan(1360);
  expect(checkpoints[5].rs3Width).toBeLessThan(1390);
  expect(checkpoints[5].rs3TitleDisplay).toBe("block");
  expect(checkpoints[5].rs3TitleLeft).toBeGreaterThan(-340);
  expect(checkpoints[5].rs3TitleLeft).toBeLessThan(-280);
  expect(checkpoints[5].rs3TitleTop).toBeGreaterThan(135);
  expect(checkpoints[5].rs3TitleTop).toBeLessThan(155);
  expect(checkpoints[5].rs3TitleText).toContain("ision");
  expect(checkpoints[5].rs3DescDisplay).toBe("flex");
  expect(checkpoints[5].rs3DescLeft).toBeGreaterThan(30);
  expect(checkpoints[5].rs3DescLeft).toBeLessThan(70);
  expect(checkpoints[5].rs3DescTop).toBeGreaterThan(525);
  expect(checkpoints[5].rs3DescTop).toBeLessThan(555);
  expect(checkpoints[5].rs3CopyDecoText).toContain("We prove the power of BPCO");
  expect(checkpoints[5].rs3CopyDecoLeft).toBeGreaterThan(-450);
  expect(checkpoints[5].rs3CopyDecoLeft).toBeLessThan(-410);
  expect(checkpoints[5].rs3CopyDecoTop).toBeGreaterThan(650);
  expect(checkpoints[5].rs3CopyDecoTop).toBeLessThan(675);
  expect(checkpoints[5].rs3TspanCount).toBe(2);
  expect(checkpoints[5].rs3Tspan4ImageCount).toBe(0);
  expect(checkpoints[5].rs3Tspan4Left).toBeGreaterThan(-340);
  expect(checkpoints[5].rs3Tspan4Left).toBeLessThan(-280);
  expect(checkpoints[5].rs3Tspan4Top).toBeGreaterThan(135);
  expect(checkpoints[5].rs3Tspan4Top).toBeLessThan(155);
  expect(checkpoints[5].rs3Tspan4Width).toBeGreaterThan(340);
  expect(checkpoints[5].rs3Tspan4Width).toBeLessThan(350);
  expect(checkpoints[5].rs3Tspan5ImageDisplay).toBe("none");
  expect(checkpoints[5].rs3Tspan5Left).toBeGreaterThan(210);
  expect(checkpoints[5].rs3Tspan5Left).toBeLessThan(235);
  expect(checkpoints[5].rs3Tspan5Top).toBeGreaterThan(135);
  expect(checkpoints[5].rs3Tspan5Top).toBeLessThan(155);
  expect(checkpoints[5].rs3Tspan5Width).toBeGreaterThan(110);
  expect(checkpoints[5].rs3Tspan5Width).toBeLessThan(125);
  expect(checkpoints[5].rs4Left).toBeGreaterThan(1120);
  expect(checkpoints[5].rs4Left).toBeLessThan(1155);
  expect(checkpoints[5].rs4ImageLeft).toBeGreaterThan(1120);
  expect(checkpoints[5].rs4ImageLeft).toBeLessThan(1155);
  expect(checkpoints[5].rs4ImageTop).toBe(0);
  expect(checkpoints[5].rs4ImageWidth).toBe(1440);
  expect(checkpoints[5].rs4ImageHeight).toBe(900);
  expect(checkpoints[5].rs4ImageRadius).toBe("0px");
  expect(checkpoints[5].auxiliaryCharacter2X).toBeGreaterThan(-850);
  expect(checkpoints[5].auxiliaryCharacter2X).toBeLessThan(-790);
  expect(checkpoints[5].auxiliaryCharacter2Y).toBeGreaterThan(130);
  expect(checkpoints[5].auxiliaryCharacter2Y).toBeLessThan(200);
  expect(checkpoints[5].auxiliaryCharacter2RotationX).toBeGreaterThan(89);
  expect(checkpoints[5].auxiliaryCharacter2RotationX).toBeLessThan(90.5);
  expect(checkpoints[5].auxiliaryCharacter2RotationY).toBeGreaterThan(-0.5);
  expect(checkpoints[5].auxiliaryCharacter2RotationY).toBeLessThan(0.5);
  expect(checkpoints[5].auxiliaryCharacter3X).toBeGreaterThan(-450);
  expect(checkpoints[5].auxiliaryCharacter3X).toBeLessThan(-390);
  expect(checkpoints[5].auxiliaryCharacter3Y).toBeGreaterThan(90);
  expect(checkpoints[5].auxiliaryCharacter3Y).toBeLessThan(160);
  expect(checkpoints[5].auxiliaryCharacter3RotationX).toBeGreaterThan(89);
  expect(checkpoints[5].auxiliaryCharacter3RotationX).toBeLessThan(90.5);
  expect(checkpoints[5].auxiliaryCharacter3RotationY).toBeGreaterThan(-0.5);
  expect(checkpoints[5].auxiliaryCharacter3RotationY).toBeLessThan(0.5);
  expect(checkpoints[1].auxiliaryReadyCount).toBe(4);
  expect(checkpoints[1].auxiliaryProgress).toBeGreaterThan(0.55);
  expect(checkpoints[1].auxiliaryProgress).toBeLessThan(0.6);
  expect(checkpoints[1].auxiliaryRotationX).toBeGreaterThan(82.5);
  expect(checkpoints[1].auxiliaryRotationX).toBeLessThan(85);
  expect(checkpoints[1].auxiliaryScaleProgress2).toBeGreaterThan(0.91);
  expect(checkpoints[1].auxiliaryScaleProgress2).toBeLessThan(0.93);
});

test("m2 auxiliary characters keep source horizontal reset timing", async ({ page }) => {
  test.setTimeout(60000);
  await openBpco(page);

  const checkpoints = [];
  for (const y of [4610, 4824]) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(250);
    checkpoints.push(await page.evaluate(() => {
      const object = document.querySelector("#main_canvas");
      return {
        y: window.scrollY,
        auxiliaryCharacter2RotationX: Number(object?.getAttribute("data-auxiliary-character-2-rotation-x") ?? -9999),
        auxiliaryCharacter2RotationY: Number(object?.getAttribute("data-auxiliary-character-2-rotation-y") ?? -9999),
        auxiliaryCharacter3RotationX: Number(object?.getAttribute("data-auxiliary-character-3-rotation-x") ?? -9999),
        auxiliaryCharacter3RotationY: Number(object?.getAttribute("data-auxiliary-character-3-rotation-y") ?? -9999),
      };
    }));
  }

  expect(checkpoints[0].y).toBe(4610);
  expect(checkpoints[0].auxiliaryCharacter2RotationX).toBeLessThan(83.5);
  expect(checkpoints[0].auxiliaryCharacter2RotationY).toBeGreaterThan(5.5);
  expect(checkpoints[1].y).toBe(4824);
  expect(checkpoints[1].auxiliaryCharacter3RotationX).toBeLessThan(83.5);
  expect(checkpoints[1].auxiliaryCharacter3RotationY).toBeGreaterThan(5.5);
});
