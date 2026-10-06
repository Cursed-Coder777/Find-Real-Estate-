import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2/ported-css");
const OUT = path.join(ROOT, "src/styles/find");

// Modules actually used by the cloned page (derived from the rendered DOM).
const MODULES = [
  "arrows-section",
  "assymetric-cols",
  "assymetric-image-split",
  "burger-btn",
  "burger-menu",
  "button",
  "container",
  "features",
  "footer",
  "for-agents",
  "form-text-input",
  "header",
  "hero",
  "image",
  "latest-posts",
  "listing-discovery",
  "listings-disclaimer",
  "loading-line",
  "outro",
  "post-entry",
  "rewired",
  "services",
  "testimonials",
  "text-input",
  "why-us",
];

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // base.css = normalize + root font-size + body + swiper + lenis + keyframes.
  // Strip the origin's @font-face blocks: fonts are re-declared through next/font.
  let base = fs.readFileSync(path.join(SRC, "base.css"), "utf8");
  const before = base.length;
  base = base.replace(/@font-face\{[^}]*\}/g, "");
  console.log("base.css: stripped @font-face,", before, "->", base.length);
  fs.writeFileSync(path.join(OUT, "base.css"), base);

  const imported = [];
  for (const mod of MODULES) {
    const from = path.join(SRC, `${mod}.css`);
    if (!fs.existsSync(from)) {
      console.warn("MISSING module css:", mod);
      continue;
    }
    fs.copyFileSync(from, path.join(OUT, `${mod}.css`));
    imported.push(mod);
  }

  const index = imported.map((m) => `@import "./${m}.css";`).join("\n") + "\n";
  fs.writeFileSync(path.join(OUT, "index.css"), index);
  console.log("installed", imported.length, "modules ->", OUT);
}

main();
