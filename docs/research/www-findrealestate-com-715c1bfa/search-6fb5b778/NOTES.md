# Search page clone — plan and captured facts

Source: `https://www.findrealestate.com/search`
Site key: `www-findrealestate-com-715c1bfa`
Page key: `search-6fb5b778`  (`"search-" + sha256("/search").slice(0,8)`)
Destination route: `/search` (`src/app/search/page.tsx`)
Origin route group: `app/(light)/search/page.tsx`

## Hard constraint: do not touch the homepage stylesheet installer

`scripts/install-clone-css.mjs` does `fs.rmSync("src/styles/find", { recursive: true })`
before writing. Four files in that folder were hand-corrected after it last ran
and are not reproducible from `ported-css/`:

| file            | hand-edits |
|-----------------|-----------:|
| `hero.css`      |        563 |
| `base.css`      |         26 |
| `footer.css`    |         18 |
| `burger-btn.css`|          6 |

Re-running that script would silently delete all of it. This page's CSS is
therefore installed into a **separate** folder (`src/styles/find-search/`) by
`scripts/search/install-search-css.mjs`, which never writes to `src/styles/find/`.

## Measured facts (live, 1440x900)

| | homepage `/` | `/search` |
|---|---|---|
| doc height | 16289 | **2997** |
| root font-size | 7.5px | 7.5px |
| `html` class | `lenis` | `lenis` |
| header | transparent, `header_-fixed` @ 3x vh | **opaque, in-flow, 59px** |
| `<main>` children | 12 | **1** (`.container_container`, h=2178) |
| SSR output | full markup | **skeletons only**; UI is client-rendered |
| images | 50 | 128 (**20 broken on the live site**) |
| buttons / links | 2 / 72 | 32 / 41 |

Because `<main>` has a single child and the markup is client-rendered, the
homepage's `extract-sections.mjs` strategy does not apply here. Captures are
taken post-hydration instead.

## CSS status

`ported-css/` from the homepage capture is **stale for this route**: the origin
was redeployed (`dpl_79uKD8TdRMCxU8WYEYy5JGuK1Q2K` vs the captured
`dpl_9Jktce8AkGLqpGkHe2EtqqzPEGFo`), and `/search` loads 19 stylesheets of which
only some overlap the homepage set.

Modules this page needs that are **absent** from the homepage capture:
`property-listing-page`, `filters-bar`, `listing-card`, `hover-gallery`,
`map-view`, `map`, `map-marker-popup`, `pagination`, `sort-by`,
`filter-selection`, `loading`, `search-listings-skeleton`.

Banked but not yet installed: `list-view.css`, `image-placeholder.css`,
`mobile-filters.css`.

## Scope decisions (agreed)

- **Filters are real.** Price / beds / baths / sort / pagination operate on a
  locally captured listing array. No dependency on the origin's private API.
- **All listings** are captured, not a fixed page count.
- **Map is a placeholder `<div>`** for now, sized to the real pane so the layout
  is correct; real Mapbox slots in behind it later. No token needed yet.
- **Broken images are left as-is.** If a photo repeats, it repeats.
- **Header gets a variant prop** (`"home" | "search"`) rather than a duplicate
  copy, so both routes share one implementation.
---

# Build log — /search clone

Everything below was **measured on the live origin** (1440x900), not inferred.
Several of these contradict what the origin's CSS suggests at first glance, so
they are recorded with the measurement that settled each one.

## Geometry achieved (clone vs origin)

| element | origin | clone |
|---|---|---|
| document height | 2997 | 2996 |
| filters bar | 1290x82 @75,59 | 1290x81 @75,58 |
| filter trigger | 152x43 | 152x42 |
| map pane | 630x761 | 630x761 exact |
| listing column | 630 | 630 |
| card | 306x294 | 306x294 exact |
| card gallery | 306x158 | 306x158 exact |
| pagination container | 630x69 | 630x69 exact |

The residual 1px on the header is **not a layout bug**: the origin's root
`line-height` computes to exactly `8.625px` and the clone's to `8.62499px`
(float artifact of `html{font-size:.5208333333vw}`). Header is 58.5 vs 58.4844 —
a 0.026px difference that only shows because `Math.round(58.5) === 59` while
`Math.round(58.4844) === 58`. `html{line-height:1.15}` and the `font-size`
declarations are byte-identical in both stylesheets; not worth chasing.

## Things the CSS alone would have got wrong

1. **An empty `<div class="property-listing-page_filters-container" />` is
   load-bearing.** `.property-listing-page_controls` is
   `grid-template-rows: auto 1fr`. That zero-height node occupies the `auto`
   row and pushes the map into the `1fr` row, which is what gives the map its
   full `calc(100vh - 18.6rem)` height. Without it the map collapses to 0px.
   Measured: with it, map-container = 630x761; without, 630x0.

2. **The gallery height comes from `image_container`, not the gallery wrapper.**
   `.listing-card_hover-gallery{aspect-ratio:442/260}` is NOT on the origin's
   card (measured `aspect-ratio: auto`). Height is 306x158 because
   `.hover-gallery_gallery-image` declares `--aspect-ratio:388/200` and its
   child `div.image_container` applies `aspect-ratio: var(--aspect-ratio)`.

3. **`.hover-gallery_dots` is a flow element, not an overlay.** It has
   `padding:.65rem 0; margin:auto 0 2rem` and the origin mounts it **only on
   hover**. At rest the wrapper's single child is `div.swiper`. Rendering the
   dots unconditionally made every card 30px taller.

4. **The chevron needs explicit `width="2.4rem" height="2.4rem"`.** Without the
   attributes the SVG falls back to its intrinsic default and the trigger
   renders 54px tall instead of the measured 43px.

5. **`main` has exactly one child**, `div.container_container`. The clone
   originally put two children directly under `main`, which pushed the filter
   bar to x=0 instead of x=75.

## Filter bar — what each panel actually is

Trigger order, measured by opening each one with a real pointer event
(a JS `.click()` does **not** open the Radix popovers):

| # | trigger | shell | body |
|---|---|---|---|
| 0 | Neighborhoods | `select-base_content` | `check-dropdown_checkbox-item[data-state]`, **multi-select** |
| 1 | For Sale | `select-base_content` | `button.radio-dropdown_radio-item[data-state]`, single |
| 2 | Price | `dropdown-base_content` | `price-dropdown_*` **min/max range**, Reset/Done |
| 3 | Residential | `select-base_content` | `button.radio-dropdown_radio-item[data-state]`, single |
| 4 | Beds & Baths | `dropdown-base_content` | `beds-and-baths-dropdown_option[data-state=on]` x2 rows |

Verbatim option lists:

- **Neighborhoods**: Manhattan, Brooklyn, Queens, Bronx, Staten Island, Nassau,
  Suffolk, Westchester, New Jersey, **Out of NYC**
- **For Sale**: For Sale, For Rent
- **Residential**: Residential, Commercial
- **Price**: a range, default `$750` -> `$50,000,000`, with `number-input_input`
  text fields and Reset/Done buttons. **Not** price bands — the banded design in
  the first implementation was wrong.
- **Beds & Baths**: two labelled rows (`Beds`, `Baths`), each `Any 1+ 2+ 3+ 4+ 5+`
- **Sort**: `Newest | Oldest | Price Low to High | Price High to Low` (no colon)

Selection state is carried in `data-state="checked" | "unchecked"` (radio/checkbox)
and `data-state="on" | "off"` (beds/baths) — not in a separate `*-selected` class.

## Active-filter pills

At the default URL `.list-view_filters` contains exactly two
`filter-selection_filter-selection` pills: **`Address: Manhattan`** and
**`Clear All`**. The select-type filters (For Sale / Residential) do **not**
appear as pills. The origin's own base query is `address=Manhattan`.

This matters: `address=Manhattan` is a *geographic* filter, not a text match.
None of the 120 captured addresses contain the word "Manhattan" (they read
`521 West 47th Street, Apt 3B, New York, NY 10036`), so a substring filter
returns zero results. Borough is derived from the address ZIP instead — all 120
are `100xx`/`101xx`, i.e. the capture is entirely Manhattan, which is exactly
why the origin defaults to Manhattan.

## Header

`variant="search"` installs **no scroll listener at all**. Measured at scrollY
0/100/300/600/1200/2000 and after scrolling back up, the class list is always
exactly `header_wrapper` — sticky, white, `transform: none`. Never
`header_transparent`, never `header_-hidden`, never `header_-fixed`.

## The "Beta" pill (added to BOTH routes — decision taken)

The origin renders `a.header_beta` next to Sign In on both routes. The clone
now does too. Measured off the live DOM:

```html
<a class="header_beta" title="Invited agents: try the new FIND platform"
   href="https://find-platform.vercel.app/login">Beta</a>
```

The DOM text is `Beta` but it *renders* as `BETA` — the uppercase is a CSS
`text-transform`, not markup. Two consequences that are easy to miss:

- without `text-transform: uppercase` the pill measures 35px wide, not 41px
- `letter-spacing` is **.06em** (measured 0.54px), which accounts for the rest

Rules live in **`src/styles/_chrome-delta.css`**, imported by `globals.css` — not
inside `find-search/`, because the homepage never loads that file and needs the
badge too. Generated by `scripts/search/install-search-css.mjs`.

Adding it did **not** move the header: still 58.4844px on both routes.

## Still open

Nothing outstanding on /search. The two pre-existing homepage P0s remain
untouched and out of scope for this route:

- `Header.tsx` mobile burger renders 0x0 (missing the `burger-btn_btn` class), so
  the hamburger is unclickable on small viewports
- `ServicesSection.tsx` renders `<a href="/services">` (404s) where the origin has
  a `<button aria-expanded>` accordion
