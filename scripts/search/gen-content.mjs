// Turns the captured listings.json into a typed content module for the clone.
//
// Three jobs:
//  1. rewrite every remote asset URL to its local path using
//     ARTIFACT_MANIFEST.json (the manifest is the authority, because local
//     filenames are collision-hashed rather than derived from the URL)
//  2. parse the human-readable amenity/price strings into numbers, so the
//     filters can be real comparisons instead of string matches
//  3. drop placeholder image references — the capture records `""` for lazy
//     gallery images that had not resolved yet at scrape time
//
// Usage: node scripts/search/gen-content.mjs
import fs from "node:fs";
import path from "node:path";

const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "search-6fb5b778";
const ROOT = process.cwd();
const RES = path.join(ROOT, "docs/research", SITE_KEY, PAGE_KEY);
const OUT_DIR = path.join(ROOT, "src/components/sites", SITE_KEY, PAGE_KEY);
const OUT = path.join(OUT_DIR, "content.ts");

const listings = JSON.parse(fs.readFileSync(path.join(RES, "listings.json"), "utf8"));
const manifest = JSON.parse(
  fs.readFileSync(path.join(RES, "ARTIFACT_MANIFEST.json"), "utf8"),
);

const localOf = new Map(manifest.assets.map((a) => [a.source, a.local]));

/** "1.5 ba" -> 1.5 ; "3 bds" -> 3 ; "1125 sqft" -> 1125 */
function num(s) {
  const m = /([\d.]+)/.exec(s ?? "");
  return m ? Number(m[1]) : null;
}

/**
 * Money -> plain number.
 *
 * Every captured price is comma-grouped ("$1,150,000"), so a plain
 * /([\d.]+)/ match stops at the first comma and yields 1. Strip the separators
 * before parsing.
 */
function money(s) {
  if (!s) return null;
  const digits = String(s).replace(/[^0-9.]/g, "");
  if (!digits || digits === ".") return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

const toLocal = (url) => (url ? (localOf.get(url) ?? null) : null);

/**
 * ZIP prefix -> borough.
 *
 * The origin's /search resolves with `address=Manhattan` already applied and
 * shows it as an active-filter pill, so "Neighborhoods" has to behave as a
 * *geographic* filter, not a text match. None of the 120 captured addresses
 * contain the word "Manhattan" (they read "…, New York, NY 10036"), so a
 * substring filter on the address returns zero results. The ZIP is what
 * actually identifies the borough, so derive it from that.
 *
 * This is a public US ZIP-to-borough lookup, not origin data. It is only
 * correct for the places the captured set can contain; an unknown prefix yields
 * null and such a listing matches no borough filter.
 */
const ZIP_PREFIX_BOROUGH = {
  // New York City
  100: "Manhattan",
  101: "Manhattan",
  102: "Manhattan",
  103: "Manhattan",
  104: "Bronx",
  105: "Queens",
  106: "Staten Island",
  110: "Queens",
  111: "Queens",
  112: "Brooklyn",
  113: "Queens",
  114: "Brooklyn",
  116: "Queens",
  // surrounding counties / states, for the wider dropdown options
  107: "Westchester",
  108: "Westchester",
  109: "Westchester",
  115: "Nassau",
  117: "Suffolk",
  118: "Suffolk",
  119: "Suffolk",
  70: "New Jersey",
  71: "New Jersey",
  72: "New Jersey",
  73: "New Jersey",
  74: "New Jersey",
  75: "New Jersey",
  76: "New Jersey",
  77: "New Jersey",
  78: "New Jersey",
  79: "New Jersey",
  88: "New Jersey",
  89: "New Jersey",
  60: "Connecticut",
  61: "Connecticut",
  62: "Connecticut",
  63: "Connecticut",
  64: "Connecticut",
};

function boroughOf(address) {
  const zip = /\b(\d{5})(?:-\d{4})?\s*$/.exec(address ?? "")?.[1];
  if (!zip) return null;
  return ZIP_PREFIX_BOROUGH[Number(zip.slice(0, 3))] ?? null;
}

const rows = listings.listings.map((l, i) => {
  const beds = l.amenities.find((a) => /\bbds?\b/.test(a));
  const baths = l.amenities.find((a) => /\bba\b/.test(a));
  const sqft = l.amenities.find((a) => /sqft/.test(a));
  const status = l.amenities.find((a) => /^For\s+(Sale|Rent)$/i.test(a));

  // "" entries are lazy gallery images that never resolved during capture
  const usable = l.images.filter((u) => typeof u === "string" && u.length > 0);
  const images = usable.map(toLocal).filter(Boolean);

  return {
    id: `l${String(i).padStart(3, "0")}`,
    href: l.href,
    price: l.price,
    priceValue: money(l.price),
    status: status ?? "For Sale",
    beds: num(beds),
    baths: num(baths),
    sqft: num(sqft),
    bedsLabel: beds ?? null,
    bathsLabel: baths ?? null,
    sqftLabel: sqft ?? null,
    amenities: l.amenities,
    address: l.address,
    borough: boroughOf(l.address),
    images,
    // references that produced no local file: unresolved lazy src, or broken on
    // the origin, or a download failure. Reproduced as-is per agreed scope.
    droppedImages: usable.length - images.length,
    dataSourceLogo: toLocal(l.dataSourceLogo),
  };
});

const uniq = (arr) =>
  [...new Set(arr.filter((v) => v !== null && v !== undefined))].sort(
    (a, b) => a - b,
  );
const bedValues = uniq(rows.map((r) => r.beds));
const bathValues = uniq(rows.map((r) => r.baths));
const prices = rows.map((r) => r.priceValue).filter((v) => v != null);
const priceMin = prices.length ? Math.min(...prices) : 0;
const priceMax = prices.length ? Math.max(...prices) : 0;

const BAND_ORDER = [
  "Under $500K",
  "$500K – $1M",
  "$1M – $2M",
  "$2M – $3M",
  "$3M – $5M",
  "$5M – $10M",
  "$10M+",
];
const bandOf = (n) => {
  if (n == null) return null;
  if (n < 500_000) return "Under $500K";
  if (n < 1_000_000) return "$500K – $1M";
  if (n < 2_000_000) return "$1M – $2M";
  if (n < 3_000_000) return "$2M – $3M";
  if (n < 5_000_000) return "$3M – $5M";
  if (n < 10_000_000) return "$5M – $10M";
  return "$10M+";
};
const bands = BAND_ORDER.filter((b) => rows.some((r) => bandOf(r.priceValue) === b));

const ts = `// AUTO-GENERATED by scripts/search/gen-content.mjs — do not edit by hand.
// Source: ${listings.source}
// Captured: ${listings.capturedAt}
// ${rows.length} listings across ${Math.max(...listings.listings.map((l) => l.page))} pages.
// The origin advertises ${listings.resultCountOnOrigin}; this clone filters and
// paginates over the captured subset only, with no dependency on the origin's
// private API.

export type Listing = {
  id: string;
  href: string;
  price: string;
  priceValue: number | null;
  status: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  bedsLabel: string | null;
  bathsLabel: string | null;
  sqftLabel: string | null;
  amenities: string[];
  address: string;
  /** borough derived from the address ZIP; null when the ZIP is unrecognised */
  borough: string | null;
  images: string[];
  /** references with no local file: broken on the origin, or never resolved */
  droppedImages: number;
  dataSourceLogo: string | null;
};

/** Option labels, matching what the origin shows in its dropdowns. */
export const BED_OPTIONS = ["Any", "1+", "2+", "3+", "4+", "5+"] as const;
export const BATH_OPTIONS = ["Any", "1+", "2+", "3+", "4+", "5+"] as const;

export const PRICE_BANDS = ${JSON.stringify(bands)} as const;
export type PriceBand = (typeof PRICE_BANDS)[number];

export const PRICE_MIN = ${priceMin};
export const PRICE_MAX = ${priceMax};

export const AVAILABLE_BEDS = ${JSON.stringify(bedValues)};
export const AVAILABLE_BATHS = ${JSON.stringify(bathValues)};

/** Boroughs actually present in the capture, in the dropdown's order. */
export const BOROUGHS = ${JSON.stringify(
  [...new Set(rows.map((r) => r.borough))].sort(),
)};
export const LISTING_COUNT = ${rows.length};

/** "3+" -> 3, "Any" -> null */
export function threshold(option: string): number | null {
  if (option === "Any") return null;
  const m = /(\\d+)/.exec(option);
  return m ? Number(m[1]) : null;
}

export function priceBandOf(priceValue: number | null): PriceBand | null {
  if (priceValue == null) return null;
${BAND_ORDER.filter((b) => bands.includes(b))
  .map((b) => {
    const hi = {
      "Under $500K": 500_000,
      "$500K – $1M": 1_000_000,
      "$1M – $2M": 2_000_000,
      "$2M – $3M": 3_000_000,
      "$3M – $5M": 5_000_000,
      "$5M – $10M": 10_000_000,
      "$10M+": "Infinity",
    }[b];
    return `  if (priceValue < ${hi}) return ${JSON.stringify(b)};`;
  })
  .join("\n")}
  return ${JSON.stringify(BAND_ORDER.find((b) => bands.includes(b)) ?? "Under $500K")};
}

export const LISTINGS: Listing[] = ${JSON.stringify(rows, null, 2)};

/** Verbatim result count the origin advertises, shown in the list header. */
export const ORIGIN_RESULT_COUNT = ${JSON.stringify(listings.resultCountOnOrigin)};
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, ts);

const dropped = rows.reduce((s, r) => s + r.droppedImages, 0);
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(`  listings          ${rows.length}`);
console.log(`  with images       ${rows.filter((r) => r.images.length).length}`);
console.log(`  with logo         ${rows.filter((r) => r.dataSourceLogo).length}`);
console.log(`  dropped refs      ${dropped}`);
console.log(
  `  price range       $${priceMin.toLocaleString("en-US")} – $${priceMax.toLocaleString("en-US")}`,
);
console.log(`  boroughs          ${JSON.stringify([...new Set(rows.map((r) => r.borough))].sort())}`);
console.log(`  beds present      ${JSON.stringify(bedValues)}`);
console.log(`  baths present     ${JSON.stringify(bathValues)}`);
console.log(`  price bands       ${JSON.stringify(bands)}`);
console.log(`  images kept       ${rows.reduce((s, r) => s + r.images.length, 0)}`);