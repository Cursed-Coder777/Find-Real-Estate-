# BEHAVIORS — findrealestate.com `/`

Measured with Playwright (system Chromium 153) at 1440×900, `deviceScaleFactor: 1`.
Computed styles read with `getComputedStyle()` at a series of scroll positions, then diffed.

## Global foundation

### Root font-size (fluid — drives every `rem` in the design)

From the origin's globals stylesheet (`e2782cd3e79a266b.css`):

```css
:root { --full-width: calc(100vw + var(--scrollbar-width, 0px)); }
html { font-size: 2.6666666667vw; }                    /* < 768px */
@media (min-width: 768px)  { html { font-size: .5208333333vw; } }
@media (min-width: 1920px) { html { font-size: 10px; } }
html { height: 100%; }
html.lenis-stopped { overflow: hidden; }
```

Verified computed values: 1440px → `7.5px`, 768px → `4px`, 390px → `10.4px`.
**This is load-bearing:** every size in the cloned CSS is in `rem`, so the whole page scales with
viewport width. The clone must reproduce these three rules exactly.

### Body / element resets

```css
body {
  font-family: var(--font-primary);          /* "Instrument Sans", "Instrument Sans Fallback" */
  color: var(--color-text);
  background-color: var(--color-bg);
  -webkit-tap-highlight-color: transparent;
  display: flex; flex-direction: column;
}
body main { flex: 1 1; position: relative; z-index: 1; }
/* normalize.css v8.0.1 is bundled ahead of the above */
```

### Typography

| Role | Family | Weights seen |
|------|--------|--------------|
| Primary | Instrument Sans (`--font-primary`) | 400 (481 els), 500 (339), 600 (31), 700 (9) |
| Secondary | Lora (`--font-secondary`) | 400, 500 (10 els) |
| Fallback | Times New Roman | only for elements inheriting `html` before body rules |

Both families are self-hosted variable fonts (`font-weight: 400 700`) served from
`/_next/static/media/*.woff2` with `Instrument Sans Fallback` / `Lora Fallback` metric-override
faces (`local("Arial")`, size-adjust 102.74% / `local("Times New Roman")`, size-adjust 115.20%).

### Colour tokens (computed census over the whole page)

| Colour | Uses | Where |
|--------|------|-------|
| `#000` `rgb(0,0,0)` | 437 | default text |
| `#151717` `rgb(21,23,23)` | 238 | brand ink (headings, dark surfaces) |
| `#fff` | 222 | light text on dark surfaces |
| `#b3b3b3` | 24 | `.em` muted spans |
| `rgba(255,255,255,.4)` | 22 | muted on dark |
| `#9c9c9c` | 9 | form placeholders |
| `#0496ff` | 1 | links / map markers |
| `#f1f1f1` | 14 bg | muted surface |
| `#ededed` | — | dropdown hover |
| `rgba(21,23,23,.8)` | 8 bg | translucent dark |
| `rgba(255,255,255,.8)` | 7 bg | translucent light |
| `rgba(21,23,23,.1)` | — | hairline borders |

Swatch set used across modules: `#151717`, `#1a1c1c`, `#b3b3b3`, `#ededed`, `#f1f1f1`, `#efefef`,
`#9c9c9c`, `#0496ff`, `#fff`, `#000`.

### Smooth scrolling — Lenis

`html` gains the class `lenis` from the Lenis library (the origin's bundle contains Lenis, GSAP and
Swiper). Native scrolling is intercepted; `html.lenis-stopped{overflow:hidden}` freezes the page
(used while the burger menu is open). The clone reproduces this with a Lenis provider that adds
`.lenis` to `<html>` and drives `requestAnimationFrame`.

### Animation libraries confirmed in the origin bundle

`gsap` (7 chunks), `ScrollTrigger` (2), `lenis` (3), `swiper` (2), `IntersectionObserver` (2).
No Framer Motion. Hero reveal inline styles (`translate: none; rotate: none; scale: none;`) are
GSAP-set, which is how the scroll-driven transforms below were identified.

---

## Header behaviour

Trigger sequence measured while scrolling down from 0:

| Scroll Y | Classes |
|----------|---------|
| 0–~150 | `header_wrapper header_transparent` |
| ≥ 200 | `+ header_-hidden` (slides out of view) |
| ≥ ~3000 | `+ header_-fixed` |

- **`header_-hidden`** is applied when the user scrolls **down** and removed when scrolling **up**
  (classic hide-on-scroll-down / reveal-on-scroll-up). It is still present at 14000 because the
  probe only ever scrolled downward.
- **`header_-fixed`** appears once the header has left the hero region; it switches the wrapper from
  an overlay to `position: fixed` with its own background.
- **`header_transparent`** is present from load: the header starts transparent over the hero.
- **Implementation:** a scroll listener that diffs `scrollY` against the previous value to derive
  direction for `-hidden`, plus a threshold check for `-fixed`.

## Hero — scroll-driven (GSAP + ScrollTrigger, scrubbed)

Structure:

```
section.hero_root                 height:500vh; margin-top:-9.8rem; margin-bottom:-100vh
  div.hero_top                    position:sticky; top:0; height:100vh
    div.hero_bg
      div.hero_back   > img back.f53e9773.jpg
      div.hero_house  > img house.8ed9b3db.png
      div.hero_composite (mask = FIND wordmark svg, mask-size:97.7rem 42.3rem)
        div.hero_house > img house.8ed9b3db.png
      div.hero_clouds
        div.hero_cloud > img cloud.c8800fa9.png     (top:25%; left:-33.72rem)
        div.hero_cloud > img cloud.c8800fa9.png     (top:20%; right:-33.72rem)
      div.hero_logo  > svg FIND wordmark, paths fill:transparent stroke:#fff
      div.hero_smoke > img smoke.9f683cb4.png
    div.hero_content  > .container > .hero_title(h1) + .hero_text + .hero_actions
  div                       > div.hero_overlap > .hero_smoke + .hero_overlay
```

Measured state as a function of scroll Y (all values from `getComputedStyle`):

| Element | Y=0 | Y=600 | Y=1200 | Y≥3000 (end) |
|---------|-----|-------|--------|--------------|
| `.hero_content` | `opacity 1`, `scale 1`, `translateY 1.2px` | `opacity .10`, `scale .9745`, `y 45.8` | `opacity 0`, `scale .9533`, `y 84.1` | `opacity 0`, `scale .9`, `y 180px` |
| `.hero_house` | `scale 1.002`, `y -3.4` | `scale 1.0764`, `y -130.5` | `scale 1.1401`, `y -239.3` | `scale 1.3`, `y -512.4` |
| `.hero_smoke` | `y 323.3px` (i.e. `translateY(69.5%)`, matching `.hero_top .hero_smoke{transform:translateY(70%)}`) | `y 242.6` | `y 173.5` | `y 0` |
| `.hero_logo` | `opacity 0` | `opacity 1` | `opacity 1` | `opacity 1` |
| `.hero_cloud`s | `translate3d(∓0.1%, 0, 0)` — counter-scrolling pair | | | |
| `.hero_composite` | `opacity 0` | — | — | `opacity 1` (masked colour reveal) |

Progression is **scrubbed to scroll**, not time-based: the values land at intermediate numbers
between the sampled positions (e.g. content opacity 0.9669 → 0.8815 → 0.8 across 0/40/80px), which is
the signature of a linear scroll-linked tween rather than a one-shot reveal.

- **`.hero_logo` reveals the outline wordmark** as the content fades: opacity 0 → 1 by ~Y=600.
  `mask-image`/`mask-size: 97.7rem 42.3rem` on `.hero_composite` uses the same wordmark geometry to
  wipe the colour house image through the letterforms.
- **`.hero_logo path`** are `fill:transparent; stroke:#fff; stroke-width:2px` (3px mobile) and carry
  `stroke-dasharray`/`stroke-dashoffset` inline styles → the wordmark is **drawn** (dash-offset tween).
- **Hero title words** are wrapped in `overflow:hidden` shells with the inner word translated
  `translate(0px, 0%)` from below on load — a masked line-reveal.
- **`.hero_smoke`** lives twice: once inside `.hero_top` (offset `translateY(70%)`, rising to 0) and
  once inside `.hero_overlap` (static), giving the illusion of the hero melting into the next section.

### Hero load-in states

Elements carry inline `opacity`/`transform` set by GSAP on mount (`hero_content` starts at
`opacity:.9669` mid-tween); the `.hero_composite` starts `opacity: 0` and is driven by scroll.

## Section-specific behaviours

- **Why FIND (section 1):** `video` (`videos/why-us.mp4`) with `autoplay loop muted playsinline`,
  no poster. Purely time-driven; nothing scroll-reactive.
- **Arrows (section 3):** `.arrows-section_arrows` holds a track of repeated `.arrows-section_arrow`
  glyphs (`9.3rem × 11.8rem`, `margin-left:-1.8rem`) that scrolls continuously.
- **Services (section 7):** click-driven accordion. `.services_item` is a `<button>`; each item has a
  `.services_item-bg` layer holding that service's image. Heights measured: collapsed 300px each,
  and the section grows to fit the open item.
- **Testimonials (section 6):** Swiper carousel — `.testimonials_carousel` contains
  `.swiper-pagination` (absolutely positioned, `top:0; z-index:4`) with custom pagination bullets,
  plus `.testimonials_divider`/`.testimonials_separator` between the stat column and the quotes.
- **Listing discovery (section 2):** three independent rows; each row is
  `section.listing-discovery_row > ul.listing-discovery_cards` with property cards
  (`.listing-discovery_card` with `.listing-discovery_image`, `.listing-discovery_body`,
  `.listing-discovery_price`, `.listing-discovery_heading`).

## Responsive behaviour

| | Desktop 1440 | Tablet 768 | Mobile 390 |
|---|---|---|---|
| root font-size | 7.5px | 4px | 10.4px |
| Breakpoints in CSS | — | `min-width:768px` and `max-width:767px` throughout | — |
| Primary layout switch | ≥768px: two-column asymmetric rows, desktop nav | ≤767px: single column, burger menu, `.mobile-only` shown, `.desktop-only` hidden | same as tablet, different `rem` scale |
| Doc height | 16289px | 12506px | 23308px |

Only two breakpoints exist in the origin CSS: `768px` (desktop/tablet) and `1920px`
(root font-size clamp). The `.desktop-only` / `.mobile-only` utility pair is used pervasively:
`display:none !important` on one side, `display:initial !important` on the other.
