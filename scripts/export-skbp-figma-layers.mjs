import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const DEFAULT_VIEWPORT = { width: 1440, height: 1400 };
const SKBP_IFRAME_MARKER = "/source/iframe/portfolio/skbp.html";

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) {
      continue;
    }
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      args.set(key.slice(2), next);
      index += 1;
    } else {
      args.set(key.slice(2), "true");
    }
  }

  const url = args.get("url");
  const out = args.get("out");
  const manifest = args.get("manifest");
  if (!url || !out || !manifest) {
    throw new Error(
      "Usage: node scripts/export-skbp-figma-layers.mjs --url <url> --out <svg> --manifest <json> [--embed-images]",
    );
  }

  return {
    embedImages: args.has("embed-images"),
    manifestPath: manifest,
    outPath: out,
    url,
  };
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function attrNumber(value) {
  return Number(value).toFixed(3).replace(/\.?0+$/, "");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function safeLayerId(prefix, index, label = "") {
  const suffix = label
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return suffix ? `${prefix}-${index}-${suffix}` : `${prefix}-${index}`;
}

function parseCssColor(color) {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
    return null;
  }
  return color;
}

function textAnchorY(entry) {
  const fontSize = Number.parseFloat(entry.fontSize) || 16;
  return entry.y + fontSize * 0.86;
}

async function imageToDataUri(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return url;
    }
    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return url;
  }
}

async function maybeEmbedImages(images, embedImages) {
  if (!embedImages) {
    return images;
  }

  const embedded = [];
  for (const image of images) {
    embedded.push({
      ...image,
      href: await imageToDataUri(image.src),
    });
  }
  return embedded;
}

async function resolveSkbpFrame(page) {
  const matchingFrame = page.frames().find((frame) => frame.url().includes(SKBP_IFRAME_MARKER));
  if (matchingFrame) {
    return matchingFrame;
  }
  if (page.url().includes(SKBP_IFRAME_MARKER)) {
    return page.mainFrame();
  }
  await page.waitForLoadState("networkidle");
  const lateFrame = page.frames().find((frame) => frame.url().includes(SKBP_IFRAME_MARKER));
  if (lateFrame) {
    return lateFrame;
  }
  throw new Error(`Could not find SKBP iframe in ${page.url()}`);
}

async function extractLayers(frame) {
  await frame.waitForLoadState("domcontentloaded");
  await frame.evaluate(async () => {
    const delay = (duration) => new Promise((resolveDelay) => setTimeout(resolveDelay, duration));
    const maxY = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    for (let y = 0; y <= maxY; y += Math.max(600, window.innerHeight * 0.8)) {
      window.scrollTo(0, y);
      await delay(70);
    }
    window.scrollTo(0, 0);
    await delay(150);
  });
  await frame.waitForFunction(
    () =>
      Array.from(document.images).every(
        (image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
      ),
    null,
    { timeout: 30_000 },
  );

  return frame.evaluate(() => {
    const roundedRect = (rect) => ({
      height: Math.max(0, rect.height),
      width: Math.max(0, rect.width),
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
    });

    const isVisibleElement = (element) => {
      const style = window.getComputedStyle(element);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number.parseFloat(style.opacity || "1") === 0
      ) {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width > 0.5 && rect.height > 0.5;
    };

    const uniqueKey = (entry) =>
      `${Math.round(entry.x)}:${Math.round(entry.y)}:${Math.round(entry.width)}:${Math.round(entry.height)}:${entry.text ?? entry.src ?? entry.fill}`;

    const page = {
      height: Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)),
      width: Math.ceil(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)),
    };

    const elementBackgroundUrl = (element) => {
      const style = window.getComputedStyle(element);
      const image = style.backgroundImage;
      if (!image || image === "none") {
        return null;
      }
      const match = image.match(/url\(["']?([^"')]+)["']?\)/);
      return match ? new URL(match[1], window.location.href).href : null;
    };

    const images = Array.from(document.images)
      .filter((image) => image.currentSrc || image.src)
      .filter(isVisibleElement)
      .map((image) => {
        const rect = roundedRect(image.getBoundingClientRect());
        return {
          alt: image.getAttribute("alt") || "",
          height: rect.height,
          naturalHeight: image.naturalHeight,
          naturalWidth: image.naturalWidth,
          src: image.currentSrc || image.src,
          width: rect.width,
          x: rect.x,
          y: rect.y,
        };
      })
      .filter((image) => image.width > 2 && image.height > 2);

    const backgroundImages = Array.from(document.body.querySelectorAll("*"))
      .filter(isVisibleElement)
      .map((element) => {
        const src = elementBackgroundUrl(element);
        if (!src) {
          return null;
        }
        const rect = roundedRect(element.getBoundingClientRect());
        return {
          alt: "CSS background image",
          height: rect.height,
          naturalHeight: 0,
          naturalWidth: 0,
          src,
          width: rect.width,
          x: rect.x,
          y: rect.y,
        };
      })
      .filter(Boolean)
      .filter((image) => image.width > 2 && image.height > 2);

    const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = node.nodeValue.replace(/\s+/g, " ").trim();
        if (!text) {
          return NodeFilter.FILTER_REJECT;
        }
        const parent = node.parentElement;
        if (!parent || !isVisibleElement(parent)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const texts = [];
    while (textWalker.nextNode()) {
      const node = textWalker.currentNode;
      const parent = node.parentElement;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = roundedRect(range.getBoundingClientRect());
      range.detach();
      if (rect.width < 1 || rect.height < 1) {
        continue;
      }

      const style = window.getComputedStyle(parent);
      texts.push({
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        height: rect.height,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        tagName: parent.tagName.toLowerCase(),
        text: node.nodeValue.replace(/\s+/g, " ").trim(),
        textAlign: style.textAlign,
        width: rect.width,
        x: rect.x,
        y: rect.y,
      });
    }

    const groupedTexts = Array.from(document.body.querySelectorAll("*"))
      .filter(isVisibleElement)
      .map((element) => {
        const rawText = element.innerText || "";
        const lineCount = rawText.split("\n").filter((line) => line.trim()).length;
        const normalized = rawText.replace(/\s+/g, " ").trim();
        if (lineCount < 2 || normalized.length < 6 || normalized.length > 90) {
          return null;
        }
        const directImageCount = element.querySelectorAll("img").length;
        if (directImageCount > 0) {
          return null;
        }
        const style = window.getComputedStyle(element);
        const rect = roundedRect(element.getBoundingClientRect());
        return {
          color: style.color,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontStyle: style.fontStyle,
          fontWeight: style.fontWeight,
          height: rect.height,
          letterSpacing: style.letterSpacing,
          lineHeight: style.lineHeight,
          tagName: element.tagName.toLowerCase(),
          text: normalized,
          textAlign: style.textAlign,
          width: rect.width,
          x: rect.x,
          y: rect.y,
        };
      })
      .filter(Boolean);

    const backgroundCandidates = Array.from(document.body.querySelectorAll("*"))
      .filter(isVisibleElement)
      .map((element) => {
        const style = window.getComputedStyle(element);
        const fill = style.backgroundColor;
        const rect = roundedRect(element.getBoundingClientRect());
        return {
          borderRadius: style.borderRadius,
          fill,
          height: rect.height,
          tagName: element.tagName.toLowerCase(),
          width: rect.width,
          x: rect.x,
          y: rect.y,
        };
      })
      .filter((entry) => entry.width > 20 && entry.height > 20)
      .filter((entry) => entry.fill && entry.fill !== "rgba(0, 0, 0, 0)" && entry.fill !== "transparent")
      .filter((entry) => entry.width < page.width * 1.05 || entry.height < page.height * 0.95);

    const seenBackgrounds = new Set();
    const backgrounds = [];
    for (const entry of backgroundCandidates) {
      const key = uniqueKey(entry);
      if (seenBackgrounds.has(key)) {
        continue;
      }
      seenBackgrounds.add(key);
      backgrounds.push(entry);
    }

    const seenTexts = new Set();
    const dedupedTexts = [];
    for (const entry of [...texts, ...groupedTexts]) {
      const key = uniqueKey(entry);
      if (seenTexts.has(key)) {
        continue;
      }
      seenTexts.add(key);
      dedupedTexts.push(entry);
    }

    return {
      backgrounds,
      images: [...images, ...backgroundImages],
      page,
      sourceUrl: window.location.href,
      texts: dedupedTexts,
      title: document.title,
    };
  });
}

function buildSvg(data, embeddedImages) {
  const width = attrNumber(data.page.width);
  const height = attrNumber(data.page.height);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<title>${xmlEscape(data.title || "SKBP layered Figma transfer")}</title>`,
    `<desc>Generated from live DOM as editable image, text, and background layers. Not a single screenshot.</desc>`,
    `<rect id="page-background" x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`,
    `<g id="background-layers">`,
  ];

  data.backgrounds.forEach((entry, index) => {
    const fill = parseCssColor(entry.fill);
    if (!fill) {
      return;
    }
    parts.push(
      `<rect id="${safeLayerId("background", index, entry.tagName)}" x="${attrNumber(entry.x)}" y="${attrNumber(entry.y)}" width="${attrNumber(entry.width)}" height="${attrNumber(entry.height)}" fill="${xmlEscape(fill)}"/>`,
    );
  });
  parts.push("</g>", `<g id="image-layers">`);

  embeddedImages.forEach((entry, index) => {
    parts.push(
      `<image id="${safeLayerId("image", index, entry.alt || entry.src)}" href="${xmlEscape(entry.href || entry.src)}" x="${attrNumber(entry.x)}" y="${attrNumber(entry.y)}" width="${attrNumber(entry.width)}" height="${attrNumber(entry.height)}" preserveAspectRatio="none"/>`,
    );
  });

  parts.push("</g>", `<g id="text-layers">`);
  data.texts.forEach((entry, index) => {
    const fontSize = Number.parseFloat(entry.fontSize) || 16;
    const fontWeight = Number.parseInt(entry.fontWeight, 10) || 400;
    parts.push(
      `<text id="${safeLayerId("text", index, entry.text)}" x="${attrNumber(entry.x)}" y="${attrNumber(textAnchorY(entry))}" font-family="${xmlEscape(entry.fontFamily)}" font-size="${attrNumber(fontSize)}" font-weight="${fontWeight}" font-style="${xmlEscape(entry.fontStyle)}" fill="${xmlEscape(entry.color)}">${xmlEscape(normalizeWhitespace(entry.text))}</text>`,
    );
  });
  parts.push("</g>", "</svg>");
  return parts.join("\n");
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: DEFAULT_VIEWPORT });
    await page.goto(args.url, { waitUntil: "networkidle" });
    const frame = await resolveSkbpFrame(page);
    const data = await extractLayers(frame);
    const images = await maybeEmbedImages(data.images, args.embedImages);
    const svg = buildSvg(data, images);
    const manifest = {
      generatedAt: new Date().toISOString(),
      layers: {
        backgrounds: data.backgrounds.length,
        images: data.images.length,
        text: data.texts.length,
        total: data.backgrounds.length + data.images.length + data.texts.length + 1,
      },
      page: data.page,
      source: {
        embeddedImages: args.embedImages,
        requestedUrl: args.url,
        title: data.title,
        url: data.sourceUrl,
      },
      texts: data.texts,
      images: data.images,
      backgrounds: data.backgrounds,
    };

    await mkdir(dirname(resolve(args.outPath)), { recursive: true });
    await mkdir(dirname(resolve(args.manifestPath)), { recursive: true });
    await writeFile(args.outPath, svg, "utf8");
    await writeFile(args.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
