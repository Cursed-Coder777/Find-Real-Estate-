# Visual QA — findrealestate.com clone vs origin

Verified with Playwright (system Chromium 153) against `pnpm start` on
2026-10-07, in two passes (layout metrics, then interaction sweep). Clone screenshots:
`docs/design-references/<site-key>/<page-key>/clone-full-desktop-1440.png`
and `clone-full-mobile-390.png`. Raw metrics: `visual-qa-desktop.json`,
`visual-qa-mobile.json`, `visual-qa-summary.json` in this folder.

## Document height vs captured origin

| Viewport | Captured origin | Clone | Δ |
|---|---|---|---|
| 1440×900 | 16289 | 16287 | −2 px (−0.01%) |
| 390×844 | 23308 | 23406 | +98 px (+0.42%) |

The live origin has since rotated its content (its own doc height at re-check
was 23162 at 390×844 — the homepage listings changed after our capture). The
remaining mobile delta is consistent with that drift (see per-section note
below), not with a structural defect: on desktop every section height matches
the captured topology within 1 px.

## Desktop section offsets (clone, 1440×900)

| # | Section | top | height | Captured origin height |
|---|---------|-----|--------|------------------------|
| 0 | hero_root | −15 | 4500 | 4500 |
| 1 | why-us_root | 3585 | 1225 | 1225 |
| 2 | listing-discovery_home | 4810 | 2509 | 2510 |
| 3 | arrows-section_root | 7319 | 823 | 823 |
| 4 | rewired | 8141 | 645 | 645 |
| 5 | for-agents | 8787 | 1246 | 1247 |
| 6 | testimonials_root | 10033 | 870 | 870 |
| 7 | services_root | 10903 | 1547 | 1547 |
| 8 | features_root | 12450 | 814 | 815 |
| 9 | latest-posts_root | 13265 | 1588 | 1588 |
| 10 | outro_root | 14852 | 675 | 675 |

## Behaviour probes (desktop)

- **Header**: `header_-hidden` on scroll-down (600 px), removed on scroll-up,
  `header_-fixed` past 3× viewport height — all match BEHAVIORS.md. ✓
- **Lenis**: `html.lenis` present, smooth scroll active. ✓
- **Testimonials carousel**: 5 numbered pagination bullets; clicking bullet 3
  switches to the "Johanna Nieto" slide and marks the bullet active. ✓
- **Services hover**: `.services_item-bg` opacity 0 → 0.4 on hover (wipes in
  via `clip-path`, per module CSS). ✓
- **No horizontal overflow** at either viewport. ✓
- **No broken images** (50 `<img>` on desktop, 0 with `naturalWidth === 0`). ✓

## Per-section mobile probe (live origin vs clone, 390×844)

Sections 0, 3, 4, 5, 6, 8, 10 match the live origin exactly (Δ 0). Deltas:
listing-discovery +173 px and services +60 px (live origin's listing/blog
content has rotated since the capture), latest-posts −26 px, why-us +36 px
(text-wrap differences against rotated live copy). The clone reproduces the
*captured* reference (23308 px) to within 98 px.

## Interaction sweep (second pass)

- **Hero scroll scrub** (1440×900, values vs BEHAVIORS.md):

  | Element | Y=0 | Y=600 | Y=3000 |
  |---|---|---|---|
  | `.hero_content` opacity | 1 | 0.10 (origin 0.10) | 0 (origin 0) |
  | `.hero_house` scale / y | 1.0025 / −4px | 1.0937 / −160px | 1.2921 / −499px (→ 1.3 / −512 at range end) |
  | `.hero_logo` opacity | 0 | 1 | 1 |
  | `.hero_smoke` (top) | translateY 325px (origin 323px) | rising | 0 at end |
  | `.hero_composite` opacity | 0 (seeded) | — | 1 (masked colour reveal) |

- **Arrows marquee**: track transform advances over time (time-driven). ✓
- **Burger menu (390×844)**: opens — `data-open="true"`, wrapper `opacity: 1`,
  backdrop scaled in, `html.menu-open` + `lenis` page freeze; closes —
  `data-open="false"`, `menu-open` removed. ✓ (burger is desktop-hidden, as in
  the origin — only rendered ≤767px)
- **Console**: no JS errors; the only failed requests are `<Link>` prefetch
  RSC payloads to unbuilt routes (single-route clone, by scope).

### Repair during QA: `clone.css` was never imported

The first interaction sweep caught the burger menu rendering `data-open="true"`
while `opacity: 0` — `src/styles/clone.css` (which owns the open-state rules,
the `.hero_composite` seed and the `html.menu-open` freeze) existed but was
not imported by any stylesheet. Fixed by importing it from `globals.css` after
the origin CSS; rebuilt and re-probed: burger, hero seed and page freeze all
verified above.

## Known gaps

- Only the homepage (`/`) is implemented, per scope. `<Link>` prefetches to
  unbuilt routes (`/search`, `/agents`, `/blog`, …) return 404 for the RSC
  payload; links render fine, navigation targets are out of scope.
- The origin's "405 West 23rd Street" listing photo 404s on its own CDN
  (listings rotated); the clone substitutes another Chelsea photo from the
  same capture (`content-asset-map.json` records the mapping).
- Header dropdown submenus (Join/Paperwork/Resources/About) link to their
  top-level routes instead of opening the lazily-hydrated panels.
