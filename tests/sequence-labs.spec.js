import { expect, test } from "playwright/test";

test("Given /labs When opened Then it renders the Sequence Labs page contract", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });

  await page.goto("/labs");

  await expect(page.getByTestId("sequence-labs-page")).toBeVisible();
  await expect(page.getByTestId("bpco-page")).toHaveCount(0);
  await expect(page.getByTestId("labs-hero")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sequence/LABS" })).toBeVisible();
  await expect(page.getByTestId("labs-about")).toBeVisible();
  await expect(page.getByTestId("labs-how")).toBeVisible();
  await expect(page.getByTestId("labs-prototypes")).toBeVisible();
  await expect(page.getByTestId("labs-hack-day")).toBeVisible();
  await expect(page.getByTestId("labs-cta")).toBeVisible();
  await expect(page.getByTestId("labs-prototype-card")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Customer Knowledge Base" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contract intake agent" })).toBeVisible();
  await expect(page.getByRole("link", { name: "[ Read more ]" }).first()).toHaveAttribute(
    "href",
    "https://www.sequencehq.com/labs/customer-knowledge-base",
  );

  const metrics = await page.evaluate(() => {
    const hero = document.querySelector("[data-testid='labs-hero']");
    const firstCard = document.querySelector("[data-testid='labs-prototype-card']");
    const heroRect = hero?.getBoundingClientRect();
    const cardRect = firstCard?.getBoundingClientRect();
    return {
      heroHeight: Math.round(heroRect?.height ?? 0),
      heroLeft: Math.round(heroRect?.left ?? -1),
      heroWidth: Math.round(heroRect?.width ?? 0),
      cardHeight: Math.round(cardRect?.height ?? 0),
      cardLeft: Math.round(cardRect?.left ?? -1),
      cardWidth: Math.round(cardRect?.width ?? 0),
    };
  });

  expect(metrics.heroLeft).toBe(10);
  expect(metrics.heroWidth).toBe(1420);
  expect(metrics.heroHeight).toBeGreaterThanOrEqual(1160);
  expect(metrics.heroHeight).toBeLessThanOrEqual(1195);
  expect(metrics.cardLeft).toBe(10);
  expect(metrics.cardWidth).toBe(1420);
  expect(metrics.cardHeight).toBeGreaterThanOrEqual(540);
});

test("Given /sequence-labs When opened Then it aliases to the Labs page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/sequence-labs");

  await expect(page.getByTestId("sequence-labs-page")).toBeVisible();
  await expect(page.getByText("About Sequence Labs")).toBeVisible();
  await expect(page.getByTestId("bpco-page")).toHaveCount(0);
});

test("Given mobile Labs route When rendered Then the page has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto("/labs");

  await expect(page.getByTestId("sequence-labs-page")).toBeVisible();
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    cardCount: document.querySelectorAll("[data-testid='labs-prototype-card']").length,
    heroBottom: Math.round(
      document.querySelector("[data-testid='labs-hero']")?.getBoundingClientRect().bottom ?? 0,
    ),
  }));

  expect(metrics.cardCount).toBe(2);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.heroBottom).toBeGreaterThanOrEqual(880);
});
