import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "public", "models", "meta-quest3s");
const outputPath = path.join(outputDir, "a11yway-ui-panel.png");

const svg = String.raw`<svg width="2048" height="1024" viewBox="0 0 2048 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#070809"/>
      <stop offset="0.42" stop-color="#101318"/>
      <stop offset="0.72" stop-color="#171b20"/>
      <stop offset="1" stop-color="#030304"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8b9198" stop-opacity="0.42"/>
      <stop offset="0.52" stop-color="#2b3037" stop-opacity="0.48"/>
      <stop offset="1" stop-color="#111317" stop-opacity="0.58"/>
    </linearGradient>
    <linearGradient id="cardTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0.035"/>
    </linearGradient>
    <linearGradient id="centerGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.72" stop-color="#79d8ff" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#bdf1ff" stop-opacity="0.5"/>
    </linearGradient>
    <linearGradient id="reflection" x1="0" y1="0" x2="1" y2="0.55">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="0.2" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
    <filter id="cardBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.8"/>
    </filter>
  </defs>
  <rect width="2048" height="1024" fill="url(#glass)"/>
  <g opacity="0.12">
    <rect x="230" y="108" width="138" height="360" rx="18" fill="#69788d"/>
    <rect x="440" y="92" width="138" height="360" rx="18" fill="#4f6279"/>
    <rect x="650" y="108" width="138" height="360" rx="18" fill="#69788d"/>
    <rect x="860" y="92" width="138" height="360" rx="18" fill="#4f6279"/>
    <rect x="1070" y="108" width="138" height="360" rx="18" fill="#69788d"/>
    <rect x="1280" y="92" width="138" height="360" rx="18" fill="#4f6279"/>
  </g>
  <path d="M238 92 L1780 226 L1710 352 L278 210 Z" fill="url(#reflection)" opacity="0.55"/>
  <path d="M718 36 C930 94 1158 88 1396 34 L1488 138 C1182 202 926 204 626 142 Z" fill="#ffffff" opacity="0.07"/>
  <ellipse cx="1128" cy="486" rx="400" ry="322" fill="#76d7ff" opacity="0.12" filter="url(#softGlow)"/>
  <path d="M650 706 C900 776 1192 772 1484 698" fill="none" stroke="#78cfff" stroke-width="8" opacity="0.24"/>

  <g transform="translate(940 548) scale(0.78) translate(-1024 -552)" opacity="0.76" filter="url(#cardBlur)">
  <g transform="translate(424 216)">
    <rect width="360" height="568" rx="28" fill="url(#card)" stroke="#f3f8ff" stroke-opacity="0.32" stroke-width="3"/>
    <rect width="360" height="124" rx="28" fill="url(#cardTop)"/>
    <text x="34" y="66" fill="#eef6ff" opacity="0.82" font-family="Helvetica Neue, Arial, sans-serif" font-size="34" font-weight="650">Reduce Body Size</text>
    <g transform="translate(180 244)" fill="none" stroke="#eff9ff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" opacity="0.78">
      <circle cx="0" cy="-96" r="38" fill="#eff9ff" stroke="none"/>
      <path d="M0 -42 L0 78 M-18 -12 L-98 -78 M18 -12 L98 -78 M-18 72 L-74 172 M8 74 L82 172"/>
      <path d="M-116 -92 L-156 -132 M-116 -92 L-164 -86 M116 -92 L156 -132 M116 -92 L164 -86" stroke-width="14"/>
    </g>
    <text x="36" y="512" fill="#dbe8f4" opacity="0.68" font-family="Helvetica Neue, Arial, sans-serif" font-size="24" font-weight="550">50% Smaller</text>
  </g>

  <g transform="translate(844 188)">
    <rect width="424" height="656" rx="32" fill="url(#card)" stroke="#f7fbff" stroke-opacity="0.44" stroke-width="4"/>
    <rect width="424" height="138" rx="32" fill="url(#cardTop)"/>
    <rect y="470" width="424" height="186" rx="32" fill="url(#centerGlow)"/>
    <text x="34" y="74" fill="#ffffff" opacity="0.88" font-family="Helvetica Neue, Arial, sans-serif" font-size="36" font-weight="700">Raise Wheelchair</text>
    <g transform="translate(214 302)" fill="none" stroke="#f5fbff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" opacity="0.84">
      <circle cx="-74" cy="74" r="76"/>
      <path d="M-58 -8 L38 14 L72 108 L144 108"/>
      <rect x="-18" y="-88" width="118" height="78" rx="12" fill="#f5fbff" stroke="none"/>
      <path d="M156 -60 L156 -148 M156 -148 L122 -116 M156 -148 L190 -116"/>
    </g>
    <text x="36" y="588" fill="#f3fbff" opacity="0.78" font-family="Helvetica Neue, Arial, sans-serif" font-size="27" font-weight="650">+50 cm Height</text>
  </g>

  <g transform="translate(1346 236)">
    <rect width="334" height="532" rx="26" fill="url(#card)" stroke="#f3f8ff" stroke-opacity="0.28" stroke-width="3"/>
    <rect width="334" height="116" rx="26" fill="url(#cardTop)"/>
    <text x="32" y="64" fill="#f4f9ff" opacity="0.74" font-family="Helvetica Neue, Arial, sans-serif" font-size="32" font-weight="650">Jump Over</text>
    <g transform="translate(168 238)" fill="none" stroke="#eff9ff" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" opacity="0.7">
      <circle cx="0" cy="-92" r="36" fill="#eff9ff" stroke="none"/>
      <path d="M0 -40 L-30 72 M-16 -10 L-92 -48 M18 -8 L96 -50 M-24 70 L-98 170 M-2 72 L104 152"/>
      <path d="M96 152 C152 96 218 106 258 132"/>
    </g>
    <text x="34" y="478" fill="#dbe8f4" opacity="0.62" font-family="Helvetica Neue, Arial, sans-serif" font-size="21" font-weight="550">Up to 30 cm Obstacles</text>
  </g>

  <rect x="838" y="790" width="380" height="96" rx="8" fill="#c8f2ff" opacity="0.58"/>
  <rect x="790" y="888" width="550" height="42" rx="4" fill="#3c4d59" opacity="0.48"/>
  <g transform="translate(1024 890)" opacity="0.6">
    <circle r="62" fill="#ffffff" opacity="0.18"/>
    <circle r="39" fill="none" stroke="#f6fbff" stroke-width="3"/>
    <path d="M-27 -27 L27 27 M-27 27 L27 -27" stroke="#f6fbff" stroke-width="3"/>
  </g>
  </g>
  <path d="M1460 92 C1660 214 1816 456 1794 760" fill="none" stroke="#ffffff" stroke-width="42" opacity="0.035"/>
  <path d="M420 120 L1580 214" stroke="#ffffff" stroke-width="28" opacity="0.045" stroke-linecap="round"/>
</svg>`;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1, viewport: { width: 2048, height: 1024 } });
  const encodedSvg = Buffer.from(svg).toString("base64");
  await page.setContent(
    `<html><body style="margin:0;overflow:hidden;background:#030304"><img alt="" src="data:image/svg+xml;base64,${encodedSvg}" style="display:block;width:2048px;height:1024px" /></body></html>`,
    { waitUntil: "load" },
  );
  await page.locator("img").waitFor({ state: "visible" });
  await page.screenshot({ clip: { x: 0, y: 0, width: 2048, height: 1024 }, path: outputPath, type: "png" });
} finally {
  await browser.close();
}
console.log(outputPath);
