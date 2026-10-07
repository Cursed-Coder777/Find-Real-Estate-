import fs from "node:fs";
import { parse } from "node-html-parser";
const html = fs.readFileSync("docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2/sections/02-listing-discovery_home__TRCXV.html","utf8");
const root = parse(html);
const rows = [];
for (const sec of root.querySelectorAll("section")) {
  if (!(sec.getAttribute("class")||"").includes("listing-discovery_row")) continue;
  const heading = sec.querySelector("h2")?.textContent.replace(/\s+/g," ").trim();
  const seeAll = sec.querySelector("a[href*='listings']");
  const listings = [];
  for (const card of sec.querySelectorAll("a.listing-discovery_card") || []) {}
  const anchors = [...sec.querySelectorAll("a")].filter(a=>(a.getAttribute("class")||"").includes("listing-discovery_card"));
  for (const a of anchors) {
    const img = a.querySelector("img");
    const body = a.querySelector(".listing-discovery_body") || a;
    const ps = [...body.querySelectorAll("p")].map(p=>p.textContent.replace(/\s+/g," ").trim());
    const h3 = body.querySelector("h3")?.textContent.replace(/\s+/g," ").trim();
    const logo = body.querySelector("img");
    listings.push({
      href: a.getAttribute("href"),
      image: img?.getAttribute("src"),
      alt: img?.getAttribute("alt"),
      price: ps[0], meta: ps[1], address: h3, neighborhood: ps[2],
      logoSrc: logo?.getAttribute("src"),
    });
  }
  rows.push({ heading, seeAll: seeAll?.textContent.replace(/\s+/g," ").trim(), seeAllHref: seeAll?.getAttribute("href"), listings });
}
const disclaimer = root.querySelector(".listings-disclaimer_disclaimer");
const dtext = disclaimer?.textContent.replace(/\s+/g," ").trim();
const dlogos = [...(disclaimer?.querySelectorAll("img")||[])].map(i=>({src:i.getAttribute("src"), alt:i.getAttribute("alt")}));
fs.writeFileSync("tmp/listings.json", JSON.stringify({rows, dtext, dlogos}, null, 2));
console.log(JSON.stringify({rows, dtext, dlogos}, null, 2));
