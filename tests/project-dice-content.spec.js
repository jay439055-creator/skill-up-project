import { expect, test } from "playwright/test";
import sharp from "sharp";

async function openBpco(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
}

test("project dice cards use source copy, barcodes, and tv back image", async ({ page }) => {
  const expectedProjects = [
    {
      title: "BAEMIN B OOH Campaign",
      number: "25",
      barcode: "2025Y91025",
      bodySnippet: "In September 2025, Big Picture Company executed Baemin’s “Affordable & Fast” campaign",
      imageToken: "BAEMINB_0main.jpg",
    },
    {
      title: "MARITHÉ an annual OOH Campaign",
      number: "24",
      barcode: "2024Y11024",
      bodySnippet: "Marithé François Girbaud launched a strategic offline communications initiative",
      imageToken: "marihte_0main.png",
    },
    {
      title: "DESCENTE 90th Campagin",
      number: "25",
      barcode: "2025Y11025",
      bodySnippet: "90 Winters, Nothing Untested,” the campaign highlighted the brand’s technical excellence",
      imageToken: "DESCENTE_0m.jpg",
    },
    {
      title: "Pokémon GO an Annual Campaign",
      number: "25",
      barcode: "2025Y11025",
      bodySnippet: "We are the annual lead agency for live events of the global mobile game “Pokémon GO”",
      imageToken: "pokemon_0main.jpg",
    },
  ];

  // Given: the project dice section is at the source mid-rotation checkpoint.
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 10500));
  await page.waitForFunction(
    () =>
      Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95 &&
      getComputedStyle(document.querySelector(".m3_dice_section .dice_items")).transform.includes("-0.758481"),
  );

  // When: the visible dice faces are read from the rendered DOM.
  const diceCards = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".m3_dice_section .dice_item")).map((item) => {
      const image = item.querySelector("img");
      return {
        title: item.querySelector(".info_title")?.textContent?.trim() ?? "",
        number: item.querySelector(".info_number")?.textContent?.trim() ?? "",
        body: item.querySelector(".info_section p")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
        barcode: item.querySelector(".barcode_number")?.textContent?.trim() ?? "",
        imageSrc: image?.getAttribute("src") ?? "",
        currentImageSrc: image?.currentSrc ?? "",
      };
    }),
  );

  // Then: source project copy and assets are preserved face by face.
  expect(diceCards).toHaveLength(5);
  expectedProjects.forEach((expectedProject, index) => {
    expect(diceCards[index]?.title).toBe(expectedProject.title);
    expect(diceCards[index]?.number).toBe(expectedProject.number);
    expect(diceCards[index]?.barcode).toBe(expectedProject.barcode);
    expect(diceCards[index]?.body).toContain(expectedProject.bodySnippet);
    expect(diceCards[index]?.imageSrc).toContain(expectedProject.imageToken);
  });
  expect(diceCards[4]?.title).toBe("");
  expect(diceCards[4]?.barcode).toBe("");
  expect(diceCards[4]?.imageSrc || diceCards[4]?.currentImageSrc).toContain("/img/tv_back.webp");
});

test("project dice grows into the source tv transition before business", async ({ page }) => {
  // Given: the scroll is near the source transition from project dice into business.
  await openBpco(page);
  await page.evaluate(() => window.scrollTo(0, 13000));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  // When: the dice wrapper and largest visible face are measured.
  const metrics = await page.evaluate(() => {
    const diceItems = document.querySelector(".m3_dice_section .dice_items");
    const cards = Array.from(document.querySelectorAll(".m3_dice_section .dice_item")).map((item) => {
      const rect = item.getBoundingClientRect();
      return {
        title: item.querySelector(".info_title")?.textContent?.trim() ?? "",
        imageSrc: item.querySelector("img")?.getAttribute("src") ?? "",
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        area: Math.round(rect.width * rect.height),
      };
    });

    return {
      transform: getComputedStyle(diceItems ?? document.body).transform,
      largestCard: cards.reduce((front, item) => (item.area > front.area ? item : front), cards[0]),
    };
  });

  // Then: the source oversized tv/back face dominates the viewport.
  expect(metrics.transform).toContain("matrix3d(3.999");
  expect(metrics.largestCard?.title).toBe("");
  expect(metrics.largestCard?.imageSrc).toContain("/img/tv_back.webp");
  expect(metrics.largestCard?.left).toBeLessThanOrEqual(-1100);
  expect(metrics.largestCard?.width).toBeGreaterThanOrEqual(3700);

  // Then: the source transition has already dimmed the rippled tv face.
  const transitionFrame = await page.screenshot({ clip: { x: 72, y: 162, width: 1296, height: 648 } });
  const { data, info } = await sharp(transitionFrame).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let luminanceTotal = 0;
  for (let index = 0; index < data.length; index += 3) {
    luminanceTotal += 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
  }
  expect(luminanceTotal / (info.width * info.height)).toBeLessThan(16);
});

test("project dice underside stays visible on a wide desktop project scroll", async ({ page }) => {
  await page.setViewportSize({ width: 2048, height: 1192 });
  await page.goto("/");
  await expect(page.getByTestId("bpco-page")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 9600));
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector(".m3_dice_section")).opacity) > 0.95);

  const metrics = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".m3_dice_section .dice_item")).map((item, index) => {
      const rect = item.getBoundingClientRect();
      return {
        index,
        title: item.querySelector(".info_title")?.textContent?.trim() ?? "",
        imageSrc: item.querySelector("img")?.getAttribute("src") ?? "",
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        area: Math.round(rect.width * rect.height),
      };
    });

    return {
      bottomFace: cards[4],
      largestFace: cards.reduce((front, item) => (item.area > front.area ? item : front), cards[0]),
    };
  });

  expect(metrics.largestFace?.title).toBe("BAEMIN B OOH Campaign");
  expect(metrics.bottomFace?.imageSrc).toContain("/img/tv_back.webp");
  expect(metrics.bottomFace?.width).toBeGreaterThanOrEqual(770);
  expect(metrics.bottomFace?.width).toBeLessThanOrEqual(810);
  expect(metrics.bottomFace?.height).toBeGreaterThanOrEqual(130);
  expect(metrics.bottomFace?.height).toBeLessThanOrEqual(160);
  expect(metrics.bottomFace?.top).toBeGreaterThanOrEqual(735);
  expect(metrics.bottomFace?.top).toBeLessThanOrEqual(765);
});
