# Skill Up Project Design System

## 1. Product And Tone

Skill Up Project is a portfolio and motion-study surface. The `/ripple` route should feel airy, fluid, and precise: blue-violet water light, soft white transition fields, large type, and calm interaction.

## 2. Color Tokens

- `--color-ripple-paper`: `#ffffff`
- `--color-ripple-ink`: `rgb(28 42 72 / 82%)`
- `--color-ripple-ink-soft`: `rgb(28 42 72 / 76%)`
- `--color-ripple-light`: `#f8fbff`
- `--color-ripple-mist`: `#f1f5ff`
- `--color-ripple-lavender`: `#d4ddff`
- `--color-ripple-blue`: `#9fb5f6`
- `--color-ripple-deep-blue`: `#7895ec`
- `--color-ripple-project-surface`: `rgb(255 255 255 / 66%)`
- `--color-ripple-project-border`: `rgb(120 149 236 / 18%)`
- `--color-ripple-project-glow`: `rgb(120 149 236 / 22%)`
- `--color-bpco-paper`: `#f4f2ed`
- `--color-bpco-ink`: `#080808`

## 3. Typography Tokens

- Display font: `"DM Sans", "Inter", "Helvetica Neue", Arial, sans-serif`
- Portfolio nav/body font: `"Helvetica Neue", Pretendard, sans-serif`
- BPCO mono: `"PPSupplyMono", monospace`
- Ripple hero display size: `clamp(66px, 9.6vw, 152px)`
- Ripple about display size: `clamp(44px, 4.82vw, 93px)`
- Ripple nav size: `17px` desktop, `14px` mobile
- Letter spacing defaults to `0` unless a route-specific inherited style already exists.

## 4. Spacing Tokens

- Hero side padding: `42px`
- Ripple nav desktop inset: `48px 65px 0 48px`
- Ripple nav mobile inset: `32px 24px 0 24px`
- About section top padding: `clamp(92px, 14vh, 150px)`
- About section bottom padding: `clamp(120px, 18vh, 190px)`

## 5. Component Patterns

- Ripple hero: one full viewport, canvas-backed, no visible frame corners.
- Ripple transition: starts at the hero boundary and dissolves through blurred gradient pseudo-layers into white. It must not begin as a visible hard band inside the hero.
- Ripple navigation: fixed, text-only, white over hero, dark blue on white lower sections.
- About intro: large uppercase text with subtle scroll-driven spread and blur release.
- Work showcase: Behance-style continuous case stack on the white lower surface. Each work unfolds as a long detail section, then a full-viewport water-drop transition covers the page with circular/dot motion before the next case enters. The URL syncs to `/work/1` and `/work/2`, and each case keeps its own destination link in metadata.

## 6. Motion Tokens

- Use GPU-composited animation only: `transform`, `opacity`, and `filter`.
- Ripple title birth delay stays tied to the intro drop.
- Transition veil animation is slow and ambient, not a discrete shape or pill.

## 7. QA Requirements

- `/ripple` desktop: 1440x900 hero, transition, and white section screenshots.
- `/ripple` mobile: 390x844 screenshot with no horizontal overflow.
- Transition contract: `heroBottom=900`, `transitionTop=899`, `afterTop=1870`, `pillNodes=0`.
