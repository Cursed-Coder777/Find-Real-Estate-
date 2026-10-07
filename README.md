# FIND Real Estate — homepage clone

Pixel-perfect clone of [findrealestate.com](https://www.findrealestate.com/) `/`
built on the T3 stack (Next.js 15 App Router, tRPC, Drizzle, Tailwind v4) with
pnpm. Clone working docs: `docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2/`
(topology, behaviors, visual QA) and `docs/design-references/…` (screenshots).

## Commands

```bash
pnpm install        # dependencies
pnpm dev            # dev server
pnpm build          # production build (also runs lint)
pnpm typecheck      # tsc --noEmit
pnpm db:generate    # drizzle-kit generate
```

> Note: port 3000 is occupied by a system service on this machine — use
> `PORT=3100 pnpm start` (or `pnpm dev -- -p 3100`) to run locally.

## How the clone is organized

- `src/app/page.tsx` — assembled homepage (11 sections + header/footer).
- `src/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/` — one
  component per origin section, using the origin's own CSS-module class names.
- `src/components/sites/www-findrealestate-com-715c1bfa/shared/` — Lenis
  provider + page-shared helpers (icon set, highlight-wipe, reveal groups).
- `src/styles/find/` — the origin's vendored stylesheets (fluid `rem` scale,
  tokens, per-module CSS); `src/styles/clone.css` only adds JS-driven glue.
- `public/sites/www-findrealestate-com-715c1bfa/…` — downloaded images, video
  and self-hosted fonts (Instrument Sans, Lora).
- `scripts/gen-data.mjs` / `scripts/gen-icons.mjs` regenerate `content.ts` /
  `icons.tsx` from the captured origin markup — do not hand-edit those two.
- `scripts/lib/browser.mjs` + `tmp/qa-visual.mjs` — Playwright QA harness.

## Fidelity notes

Desktop doc height matches the origin capture within 2 px; every section height
within 1 px (see `VISUAL_QA.md`). Known gaps: single-route clone (nav links
404 by design), header dropdown panels replaced by top-level links, one
listing photo substituted after the origin's CDN rotated it.
