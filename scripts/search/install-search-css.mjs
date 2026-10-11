// Installs the /search stylesheets into src/styles/find-search/.
//
// This is deliberately NOT scripts/install-clone-css.mjs. That script does
//   fs.rmSync("src/styles/find", { recursive: true })
// before writing, and four files in src/styles/find were hand-corrected after
// it last ran and are NOT reproducible from ported-css/:
//
//   hero.css        563 lines of hand edits (real mask SVG, nine value
//                   corrections, an invented media block removed)
//   base.css         26
//   footer.css       18  (Tailwind preflight compensation)
//   burger-btn.css    6
//
// This script therefore NEVER writes to src/styles/find/. The homepage route
// keeps loading its own stylesheet through globals.css, exactly as before.
//
// Only the route-specific modules are installed. Modules the two routes share
// (header, footer, button, container, image, loading-line, text-input,
// form-text-input, burger-btn, burger-menu) are already loaded globally by
// globals.css -> find/index.css, so they are not duplicated here.
//
// The one exception is `_chrome-delta.css`: it carries the "Beta" pill rules
// that the origin added AFTER the homepage was captured. It therefore has to be
// visible to BOTH routes, so it is written to src/styles/ (imported by
// globals.css) rather than into src/styles/find-search/ — /search's stylesheet
// is only ever loaded by the /search route.
//
// Usage: node scripts/search/install-search-css.mjs
import fs from "node:fs";
import path from "node:path";

const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "search-6fb5b778";
const ROOT = process.cwd();
const SRC = path.join(
  ROOT,
  "docs/research",
  SITE_KEY,
  PAGE_KEY,
  "ported-css",
);
const OUT = path.join(ROOT, "src/styles/find-search");
// Loaded by globals.css, so both routes see it.
const DELTA_OUT = path.join(ROOT, "src/styles/_chrome-delta.css");

// Route-specific modules for /search. Verified against the live page: the core
// list came from the rendered DOM, and the dropdown/loading entries were
// confirmed by opening every menu (those modules only mount on open).
const MODULES = [
  // layout
  "property-listing-page",
  // filter bar + its dropdowns
  "filters-bar",
  "dropdown-base",
  "select-base",
  "price-dropdown",
  "number-input",
  "beds-and-baths-dropdown",
  "check-dropdown",
  "radio-dropdown",
  "collapsible",
  "mobile-filters",
  "mobile-price-dropdown",
  "mobile-beds-and-baths-filter",
  // results list
  "list-view",
  "listing-card",
  "hover-gallery",
  "image-placeholder",
  "filter-selection",
  "pagination",
  "sort-by",
  // map pane
  "map-view",
  "map",
  // loading states
  "search-listings-skeleton",
  "skeleton",
  "loading",
];

// Shared modules deliberately NOT installed (already global via globals.css).
const SHARED = [
  "header",
  "footer",
  "button",
  "container",
  "image",
  "loading-line",
  "text-input",
  "form-text-input",
  "burger-btn",
  "burger-menu",
];

/**
 * Delta the fresh /search stylesheet revealed that the older homepage copy
 * predates: the BETA badge in the header and burger menu.
 *
 * Verified by diffing the freshly downloaded origin CSS against the installed
 * homepage copy — these were the only rules present in one and not the other
 * for header/burger-menu. footer.css and burger-btn.css also differed, but only
 * by the Tailwind-preflight compensation the previous session added on top, so
 * those are intentionally left to the global copy rather than overwritten.
 */
const CHROME_DELTA = `/* ============================================================
   Site chrome delta — the "Beta" pill

   The origin added a "Beta" badge next to Sign In AFTER the homepage was first
   captured, so the installed header.css / burger-menu.css in src/styles/find/
   predate it and contain no rules for it. This file carries exactly those
   missing rules; it must stay in sync with src/components/.../root-8a5edab2/
   data.ts (BETA_HREF / BETA_TITLE) and with Header.tsx / BurgerMenu.tsx.

   Every value below was read off the live origin with getComputedStyle, not
   guessed:

     a.header_beta        box 41x18 · font-size 9px (1.2rem) · weight 600
                          padding 2.25px/6.75px (.3rem/.9rem)
                          margin-right 9px (1.2rem)
                          border 1px solid rgb(21,23,23) (#151717)
                          border-radius 999px · color #151717
                          letter-spacing .06em (measured 0.54px)
     a.burger-menu_beta   the same link, labelled "Beta: new agent platform",
                          placed under Sign In inside .burger-menu_actions

   Note the origin's DOM text is "Beta" but it *displays* as "BETA" — the
   uppercase is a CSS text-transform, so the markup below matches the origin's
   and the transform reproduces the rendered result (and the 41px pill width;
   without it the pill measures 35px).
   ============================================================ */

.header_actions a.header_beta{
  display:inline-flex;
  align-items:center;
  margin:0 1.2rem 0 0;
  padding:.3rem .9rem;
  border:1px solid #151717;
  border-radius:999px;
  font-size:1.2rem;
  font-weight:600;
  line-height:1.3;
  color:#151717;
  white-space:nowrap;
  text-transform:uppercase;
  letter-spacing:.06em;
}

.header_actions a.header_beta:hover{
  opacity:.6;
}

.burger-menu_actions a.burger-menu_beta{
  margin-top:1.6rem;
  font-size:1.4rem;
  opacity:.7;
  text-decoration:underline;
}
`;

fs.mkdirSync(OUT, { recursive: true });

const installed = [];
const missing = [];
for (const mod of MODULES) {
  const from = path.join(SRC, `${mod}.css`);
  if (!fs.existsSync(from)) {
    missing.push(mod);
    continue;
  }
  fs.writeFileSync(path.join(OUT, `${mod}.css`), fs.readFileSync(from));
  installed.push(mod);
}

fs.writeFileSync(DELTA_OUT, CHROME_DELTA);

// index.css — this file is imported by src/app/search/page.tsx only. It must
// come after the global stylesheet (which Next.js loads via layout.tsx) so the
// delta above wins; CSS modules loaded later in document order take precedence
// at equal specificity.
const header = `/* ============================================================
   /search route stylesheet — imported by src/app/search/page.tsx

   Generated by scripts/search/install-search-css.mjs. Do not edit by hand.

   The shared chrome (header, footer, button, container, image, loading-line,
   text-input, form-text-input, burger-btn, burger-menu) is intentionally NOT
   duplicated here — it is already loaded on every route by
   src/styles/globals.css -> styles/find/index.css.

   This folder is separate from src/styles/find/ on purpose: the homepage
   installer wipes that directory, and it holds hand-corrected CSS.

   The shared "Beta" pill rules are NOT here — they live in
   src/styles/_chrome-delta.css, imported by globals.css, because the homepage
   needs them too and never loads this file.
   ============================================================ */

${MODULES.map((m) => `@import "./${m}.css";`).join("\n")}
`;
fs.writeFileSync(path.join(OUT, "index.css"), header);

console.log(`installed ${installed.length}/${MODULES.length} modules -> ${OUT}`);
if (missing.length) console.log(`MISSING: ${missing.join(", ")}`);
console.log(`+ src/styles/_chrome-delta.css (Beta pill rules, both routes)`);
console.log(`\nnot installed (shared, already global): ${SHARED.join(", ")}`);
console.log(`\nsrc/styles/find/ untouched?`);
for (const f of ["hero.css", "base.css", "footer.css", "burger-btn.css"]) {
  const st = fs.statSync(path.join(ROOT, "src/styles/find", f));
  console.log(`  ${f.padEnd(16)} ${st.size} bytes  mtime ${st.mtime.toISOString().slice(0, 19)}`);
}