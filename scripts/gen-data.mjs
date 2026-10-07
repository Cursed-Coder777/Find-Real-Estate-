import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

const ROOT = process.cwd();
const RES = path.join(ROOT, "docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2");
const SEC = path.join(RES, "sections");
const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "root-8a5edab2";

const assetMap = JSON.parse(
  fs.readFileSync(path.join(RES, "content-asset-map.json"), "utf8"),
);

/** Map a remote content URL to its local copy (falls back to the remote URL). */
function local(url) {
  if (!url) return url;
  if (url.startsWith("/sites/")) return url;
  return assetMap[url] ?? url;
}

const load = (file) => parse(fs.readFileSync(path.join(SEC, file), "utf8"));
const txt = (n) => (n ? n.textContent.replace(/\s+/g, " ").trim() : undefined);
/**
 * Match elements by CSS-module identity. Hashed classes look like
 * `module_local__hash`, so an exact local name is `module_local__…`.
 * A plain prefix match would also catch siblings such as
 * `services_item-bg` when looking for `services_item`.
 */
const byClass = (root, moduleName, localName) => {
  const needle = localName === undefined ? moduleName : `${moduleName}_${localName}__`;
  return [...root.querySelectorAll("*")].filter((el) => {
    const c = el.getAttribute("class");
    return c && c.split(/\s+/).some((x) => x.includes(needle));
  });
};

// ---------------------------------------------------------------- listings
const listingRoot = load("02-listing-discovery_home__TRCXV.html");
const rows = [];
for (const sec of listingRoot.querySelectorAll("section")) {
  const cls = sec.getAttribute("class") ?? "";
  if (!cls.includes("listing-discovery_row")) continue;
  const seeAll = byClass(sec, "listing-discovery", "heading")[0]?.querySelector("a");
  const listings = [];
  for (const a of byClass(sec, "listing-discovery", "card")) {
    const body = byClass(a, "listing-discovery", "body")[0] ?? a;
    const ps = body.querySelectorAll("p").map(txt);
    const imgs = a.querySelectorAll("img");
    const logo = imgs.find((i) => (i.getAttribute("class") ?? "").includes("listing-discovery_logo"));
    listings.push({
      href: a.getAttribute("href"),
      image: local(imgs[0]?.getAttribute("src")),
      alt: imgs[0]?.getAttribute("alt") ?? "",
      price: ps[0],
      meta: ps[1],
      address: txt(body.querySelector("h3")),
      neighborhood: ps[ps.length - 1],
      ...(logo ? { logoSrc: local(logo.getAttribute("src")) } : {}),
    });
  }
  rows.push({
    heading: txt(sec.querySelector("h2")),
    seeAll: txt(seeAll),
    seeAllHref: seeAll?.getAttribute("href"),
    listings,
  });
}

const disclaimerEl = [...listingRoot.querySelectorAll("section")].find((s) =>
  (s.getAttribute("aria-label") ?? "").includes("disclaimer"),
);
const disclaimerLogos = (disclaimerEl?.querySelectorAll("img") ?? []).map((i) => ({
  src: local(i.getAttribute("src")),
  alt: i.getAttribute("alt") ?? "",
}));
const disclaimerParagraphs = byClass(disclaimerEl ?? parse(""), "listings-disclaimer", "text")
  .flatMap((el) => el.querySelectorAll("p"))
  .map(txt)
  .filter(Boolean);

// ------------------------------------------------------------ testimonials
const testRoot = load("06-testimonials_root__PiYLZ.html");
const testimonials = byClass(testRoot, "testimonials", "quote").map((q, i) => {
  const slide = q.parentNode;
  const author = byClass(slide, "testimonials", "author")[0];
  return { quote: txt(q.querySelector("p")), author: txt(author) };
});

// ---------------------------------------------------------------- services
const svcRoot = load("07-services_root__Ch_WM.html");
const services = byClass(svcRoot, "services", "item").map((item) => ({
  label: txt(byClass(item, "services", "item-more")[0]?.querySelector("span")),
  text: txt(item.querySelector("h3")),
  image: local(byClass(item, "services", "item-bg")[0]?.querySelector("img")?.getAttribute("src")),
}));
const servicesBrief = (() => {
  const brief = byClass(svcRoot, "services", "brief")[0];
  return brief ? txt(brief) : "";
})();

// ---------------------------------------------------------------- features
const featRoot = load("08-features_root__CCic6.html");
const features = byClass(featRoot, "features", "item").map((item) => ({
  title: txt(item.querySelector("h3")),
  text: txt(byClass(item, "features", "item-text")[0]?.querySelector("p")),
  image: local(byClass(item, "features", "item-bg")[0]?.querySelector("img")?.getAttribute("src")),
}));

// ------------------------------------------------------------------- posts
const postRoot = load("09-latest-posts_root__W0OHF.html");
const posts = byClass(postRoot, "post-entry", "root").map((entry) => {
  const a = entry.querySelector("a");
  const img = entry.querySelector("img");
  return {
    href: a?.getAttribute("href"),
    title: txt(byClass(entry, "post-entry", "title")[0]) ?? img?.getAttribute("alt"),
    date: txt(byClass(entry, "post-entry", "date")[0]),
    excerpt: txt(byClass(entry, "post-entry", "text")[0]?.querySelector("p")),
    image: local(img?.getAttribute("src")),
    alt: img?.getAttribute("alt") ?? "",
  };
});

const out = `// AUTO-GENERATED by scripts/gen-data.mjs from the origin site's rendered markup.
// Content is verbatim; do not hand-edit — regenerate instead.
/* eslint-disable */

export type Listing = {
  href: string;
  image: string;
  alt: string;
  price: string;
  meta: string;
  address: string;
  neighborhood: string;
  logoSrc?: string;
};

export type ListingRow = {
  heading: string;
  seeAll: string;
  seeAllHref: string;
  listings: Listing[];
};

export const LISTING_ROWS: ListingRow[] = ${JSON.stringify(rows, null, 2)};

export const DISCLAIMER_LOGOS = ${JSON.stringify(disclaimerLogos, null, 2)};

export const DISCLAIMER_PARAGRAPHS: string[] = ${JSON.stringify(disclaimerParagraphs, null, 2)};

export type Testimonial = { quote: string; author: string };

export const TESTIMONIALS: Testimonial[] = ${JSON.stringify(testimonials, null, 2)};

export type Service = { label: string; text: string; image: string };

export const SERVICES: Service[] = ${JSON.stringify(services, null, 2)};

export const SERVICES_BRIEF = ${JSON.stringify(servicesBrief)};

export type Feature = { title: string; text: string; image: string };

export const FEATURES: Feature[] = ${JSON.stringify(features, null, 2)};

export type Post = {
  href: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  alt: string;
};

export const POSTS: Post[] = ${JSON.stringify(posts, null, 2)};
`;

const OUT = path.join(
  ROOT,
  "src/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/content.ts",
);
fs.writeFileSync(OUT, out);
console.log("wrote", OUT);
console.log("rows", rows.length, "listings", rows.reduce((a, r) => a + r.listings.length, 0));
console.log("testimonials", testimonials.length, "services", services.length, "features", features.length, "posts", posts.length);
console.log("disclaimer paragraphs:", disclaimerParagraphs.length);
console.log("servicesBrief:", JSON.stringify(servicesBrief.slice(0, 120)));
console.log("sample post:", JSON.stringify(posts[0]));
