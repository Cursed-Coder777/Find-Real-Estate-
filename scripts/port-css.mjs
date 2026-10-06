import fs from "node:fs";
import path from "node:path";

const SRC = path.join(
  process.cwd(),
  "docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2/source-css",
);
const OUT = path.join(process.cwd(), "docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2/ported-css");

// CSS-modules hashes: `module_local__hash` -> `module_local`
const HASH_RE = /([A-Za-z][A-Za-z0-9-]*_[A-Za-z0-9-]+)__[A-Za-z0-9_-]{5,8}/g;
const MODULE_OF = (cls) => {
  const i = cls.indexOf("_");
  return i === -1 ? "base" : cls.slice(0, i);
};

function splitRules(css) {
  // naive but sufficient splitter: walk chars tracking depth + strings
  const rules = [];
  let depth = 0;
  let start = 0;
  let inStr = null;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = c;
      continue;
    }
    if (c === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? css.length : end + 1;
      continue;
    }
    if (c === "{") {
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0) {
        rules.push(css.slice(start, i + 1));
        start = i + 1;
      }
    }
  }
  if (css.slice(start).trim()) rules.push(css.slice(start));
  return rules;
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const buckets = new Map(); // module -> [rules]
  const multi = [];
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".css"));
  for (const f of files) {
    const css = fs.readFileSync(path.join(SRC, f), "utf8");
    const rewritten = css.replace(HASH_RE, "$1");
    for (const rule of splitRules(rewritten)) {
      // Only underscored class names are CSS-module classes; anything else is
      // a global/third-party selector (swiper, lenis, iubenda, ...).
      const classes = [...rule.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)]
        .map((m) => m[1])
        .filter((c) => c.includes("_"));
      const modules = [...new Set(classes.map(MODULE_OF))];
      let target;
      if (modules.length === 0) target = "base";
      else if (modules.length === 1) target = modules[0];
      else {
        target = modules[0];
        multi.push({ file: f, modules, rule: rule.slice(0, 160) });
      }
      if (!buckets.has(target)) buckets.set(target, []);
      buckets.get(target).push(rule.trim());
    }
  }
  for (const [mod, rules] of buckets) {
    fs.writeFileSync(path.join(OUT, `${mod}.css`), rules.join("\n") + "\n");
  }
  console.log(
    "modules:",
    buckets.size,
    "\nmulti-module rules:",
    multi.length,
  );
  fs.writeFileSync(path.join(OUT, "_multi-module-rules.json"), JSON.stringify(multi, null, 2));
  console.log(multi.slice(0, 10).map((m) => m.modules.join("+") + " :: " + m.rule.slice(0, 90)).join("\n"));
}

main();
