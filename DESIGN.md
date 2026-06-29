# BPCO Clone Design System

## 1. Source Intent

This React page is a fidelity clone of `https://www.bpco.kr/`. The visual source of truth is the live BPCO page at the same viewport and scroll position. Do not invent alternate branding, layouts, palettes, motion timing, or placeholder imagery.

## 2. Color Tokens

- `--color-ink`: `#080808` for primary text on pale backgrounds.
- `--color-nav-ink`: `#121212` for nav, project labels, and body copy.
- `--color-paper-top`: `#e5e5e5` for the page background start.
- `--color-paper-mid`: `#f3f3f3` for the page background middle.
- `--color-paper-bottom`: `#e2e2e2` for the page background end.
- `--color-white`: `#ffffff` for active nav text and project-card overlay rules.
- `--color-tv-black`: `#000000` for TV/noise underside surfaces.
- `--color-a11yway-quest-floor`: `#f3f4f6` for the a11yway Quest hero floor.
- `--color-a11yway-quest-visor`: `#050607` for the glossy black Quest visor/screen surface.
- `--color-a11yway-quest-ui-glow`: `#9ddfff` for generated internal card glow and status light.
- `--shadow-a11yway-quest-product`: `drop-shadow(0 54px 58px rgba(25, 33, 48, 0.24)) drop-shadow(0 18px 24px rgba(103, 118, 148, 0.18))` for the floating Quest headset depth.

## 3. Typography

- Primary UI mono: `PPSupplyMono`, fallback monospace.
- Primary UI sans: `PPSupplySans`, fallback `Helvetica Neue`, Pretendard, sans-serif.
- Body/project description: `Helvetica Neue`, Pretendard, sans-serif.
- Header/nav/project labels use 17px text with zero letter spacing.
- Project-card overlay copy uses 12px to 14px mono/sans, uppercase where the source does.

## 4. Layout Rhythm

- Header and nav are fixed, source-aligned, and retain `mix-blend-mode: difference` only where the source uses it.
- Desktop horizontal margins use 40px to 46px.
- The hero canvas, project dice surface, and business wheel are fixed-stage layers over a long scroll document.
- Project dice viewport reference sizes:
  - Standard desktop: 1440 by 900.
  - User Chrome capture parity: 1970 by 1118.
  - Wide QA: 2048 by 1200.

## 5. Components

- `header`: fixed split metadata and source pill navigation.
- `#main_canvas`: fixed Three.js hero and auxiliary character layer.
- `.m2`: horizontal philosophy rail driven by scroll.
- `.m3_dice_section`: fixed 3D project dice with split labels, front project cards, bottom TV/noise face, and animated underside overlay.
- `.project_list`: source-style recent-project list and table.
- `.main.m4`: business wheel and TV transition chapter.
- `footer`: SAY HI canvas and company information layout.
- `A11ywayQuestHeroCanvas`: fixed-format Three.js layer inside the a11yway hero, using the Blender-exported `Quest3S_A11yway_PBR.glb` asset from `scripts/rebuild-quest3s-glb.py` with smoothed normals, softened product edges, warm white polycarbonate, glossy black lenses, brightened woven strap/pad texture derivatives, rubber, satin metal material roles, a generated glossy black visor mesh, generated internal UI card textures, and a real Three.js floor-shadow plane.

## 6. Motion Tokens

- Hero 3D motion follows source scroll checkpoints, not generic easing.
- Project split labels must begin close, move apart, and reveal the dice through the gap.
- The first project card must not jump to an oversized state; wide reveal timing is checked at `1970x1118` and `scrollY=9000`.
- The bottom TV face and underside overlay must use animated shader/noise distortion, not a static distorted image.
- Late project-to-business transition must flatten the underside before the business section takes over.
- A11yway Quest hero motion follows the Meta Quest 3S detail-video cadence: left three-quarter product angle, subtle float, then a front-facing premium close-up with generated visor UI cards. Runtime motion must finish at `4600ms` and stop rather than loop.

## 7. Fidelity Rules

- Every image must match the live page source asset or live-equivalent CDN URL.
- Do not use static screenshots to fake interactive layers.
- Do not hide or remove motion to improve test stability.
- Any raw color, size, or timing added in code must map back to the tokens and checkpoints above.
