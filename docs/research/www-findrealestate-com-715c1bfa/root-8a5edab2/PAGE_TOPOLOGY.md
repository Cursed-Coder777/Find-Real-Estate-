# PAGE_TOPOLOGY — findrealestate.com `/`

- **Source URL:** `https://www.findrealestate.com/`
- **Site key:** `www-findrealestate-com-715c1bfa`
- **Page key:** `root-8a5edab2`
- **Destination route:** `/` (`src/app/page.tsx`)
- **Stack of origin:** Next.js App Router + CSS Modules + GSAP/ScrollTrigger + Lenis + Swiper
- **Captured:** desktop 1440×900 (doc height 16289px), tablet 768×1024 (12506px), mobile 390×844 (23308px)

## Page shell

```
html.lenis                                   <- Lenis smooth-scroll added the class
  body.__variable_3d9088.__variable_c1a059   <- next/font CSS vars (--font-primary, --font-secondary)
    header.header_wrapper.header_transparent.header_-fixed.header_-hidden
    main                                     <- flex: 1; position: relative; z-index: 1
      <12 sections, listed below>
    footer.footer_wrapper
```

`body` is `display:flex; flex-direction:column`; `body main` is `flex:1; position:relative; z-index:1`.
The header is a sibling that overlays `main` (it is `position: fixed` once `header_-fixed` is applied).

## Section order (direct children of `main`, desktop 1440)

| # | Section | Module | Height | Notes |
|---|---------|--------|--------|-------|
| 0 | Hero | `hero_root` | 4500px | `height:500vh`, `position:sticky` inner `hero_top`; scroll-driven |
| 1 | Why FIND | `why-us_root` | 1225px | Text grid + looping `video/why-us.mp4` |
| 2 | Listing Discovery | `listing-discovery_home` | 2510px | Three rows (Williamsburg / Astoria / Chelsea) of property cards |
| 3 | Arrows | `arrows-section_root` | 823px | Full-bleed repeated arrow strip + centred copy |
| 4 | Real Estate, Rewired | `rewired_wrapper` + `assymetric-cols_row` | 645px | Two-column asymmetric text |
| 5 | For Agents | `for-agents_wrapper` + `assymetric-image-split` | 1247px | Text + `bg.jpg` image split |
| 6 | Testimonials | `testimonials_root` | 870px | Swiper carousel of client quotes |
| 7 | Services | `services_root` | 1547px | 5 accordion items, each with its own bg image |
| 8 | Features | `features_root` | 815px | "Support Beyond Buying and Selling" grid of 4 |
| 9 | Latest Posts | `latest-posts_root` | 1588px | Blog cards |
| 10 | Outro | `outro_root` | 675px | "Find You. We'll Help You Get There." CTA over `1.f6e8f2e8.jpg` |
| 11 | (JSON-LD `script` only) | — | 0 | Not rendered |

Note: `main` has 12 children but child 11 is a `<script type="application/ld+json">`.

## Header (site-wide, above `main`)

Classes observed on `header`: `header_wrapper`, plus state modifiers
`header_transparent` (rest), `header_-fixed` (after leaving hero), `header_-hidden` (scrolling down),
`header_-opened` (burger open), and `header_dark` (dark-surface routes).

Nav items (desktop): Search, Neighborhoods, Agents, Join, Paperwork, Resources, About, Sign In.
Layout: `.header_wrapper > .header_content`, logo `.header_logo`, nav `.header_nav`, `.header_actions`,
burger control `.header_burger-control`.

## Fixed / sticky layers

- `header` — `position: fixed` after `-fixed` is applied; sits above `main` (z-index stack).
- `.hero_top` — `position: sticky; top: 0; height: 100vh` inside the 500vh `.hero_root`.
- `.burger-menu_backdrop`, `.burger-menu_content` — fixed overlay, `z-index` above everything when open.
- `.navigation-bullets` — fixed right-hand section bullets (desktop only).
- `.loading-line` — fixed top progress line.

## Dependencies between sections

- The hero is `margin-bottom: -100vh` (mobile) with `.hero_overlap` `bottom:100vh`, so the hero's
  smoke/overlay layer visually flows into the Why FIND section. Section 1 must follow immediately.
- `.why-us_root` sits on top of the hero's tail; it is opaque.
- `main` is `z-index: 1` so fixed header/menus (siblings) always paint above content.

## Interaction model per section

| Section | Model |
|---------|-------|
| Header | scroll-driven (direction + threshold) + click (burger, dropdowns) |
| Hero | scroll-driven (GSAP ScrollTrigger, scrubbed) + load-in reveal (words, logo draw) |
| Why FIND | time-driven (`<video autoplay loop muted playsinline>`) |
| Listing Discovery | static layout; card hover |
| Arrows | time-driven marquee (CSS/JS loop) |
| Rewired | static + link |
| For Agents | static + link |
| Testimonials | time/click-driven Swiper carousel with pagination |
| Services | click-driven accordion (one open at a time) |
| Features | static + hover reveal |
| Latest Posts | static + hover |
| Outro | static + click CTA |
