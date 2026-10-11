// De-hashes the /search stylesheets into per-module CSS files.
//
// Reuses the exact algorithm from scripts/port-css.mjs (same HASH_RE, same
// rule splitter, same module bucketing) so the search page's CSS is bucketed
// identically to the homepage's. Unlike the homepage run it ALSO reports
// module-name collisions: the de-hasher maps `module_local__hash` -> `module_local`
// purely by string prefix, and on the homepage that silently collapsed eight
// distinct origin modules (`hero_wrapper`, `hero_content`, `hero_logo`,
// `hero_title`, `hero_description`, `hero_cta`, `hero_background`, `hero_mask`)
// onto the same un-hashed names. That trap is worth catching here too.
//
// Usage: node scripts/search/port-css.mjs
import fs from "node:fs";
import path from "node:path";

const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "search-6fb5b778";
const BASE = path.join(process.cwd(), "docs/research", SITE_KEY, PAGE_KEY);
const SRC = path.join(BASE, "source-css");
const OUT = path.join(BASE, "ported-css");

const HASH_RE = /([A-Za-z][A-Za-z0-9-]*_[A-Za-z0-9-]+)__[A-Za-z0-9_-]{5,8}/g;
const MODULE_OF = (cls) => {
  const i = cls.indexOf("_");
  return i === -1 ? "base" : cls.slice(0, i);
};

function splitRules(css) {
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
    if (c === "{") depth++;
    else if (c === "}") {
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

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const buckets = new Map(); // module -> [rules]
const multi = [];
// collision tracking: un-hashed class -> Set of distinct origin module prefixes
const originModulesByClass = new Map();

const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".css"));
for (const f of files) {
  const css = fs.readFileSync(path.join(SRC, f), "utf8");

  // record, before rewriting, which origin module each hashed class belonged to
  for (const m of css.matchAll(HASH_RE)) {
    const orig = m[1];
    const bare = orig.replace(/__.*$/, "");
    const originMod = MODULE_OF(bare);
    if (!originModulesByClass.has(bare)) originModulesByClass.set(bare, new Set());
    originModulesByClass.get(bare).add(originMod);
  }

  const rewritten = css.replace(HASH_RE, "$1");
  for (const rule of splitRules(rewritten)) {
    const classes = [...rule.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)]
      .map((m) => m[1])
      .filter((c) => c.includes("_"));
    const modules = [...new Set(classes.map(MODULE_OF))];
    let target;
    if (modules.length === 0) target = "base";
    else if (modules.length === 1) target = modules[0];
    else {
      target = modules[0];
      multi.push({ file: f, modules, rule: rule.slice(0, 200) });
    }
    if (!buckets.has(target)) buckets.set(target, []);
    buckets.get(target).push(rule.trim());
  }
}

for (const [mod, rules] of buckets) {
  fs.writeFileSync(path.join(OUT, `${mod}.css`), rules.join("\n") + "\n");
}
fs.writeFileSync(
  path.join(OUT, "_multi-module-rules.json"),
  JSON.stringify(multi, null, 2),
);

console.log(`modules: ${buckets.size}   multi-module rules: ${multi.length}`);
console.log(`\nwrote ${OUT}`);

// ---- collision report ----
// Two DIFFERENT origin module prefixes ending in the same `_local` would be
// collapsed onto one file. Detect the structural risk: same `_local` stem used
// by >1 origin module.
const collisions = [];
for (const [bare, mods] of originModulesByClass) {
  const local = bare.slice(bare.indexOf("_") + 1);
  const byLocal = collisions.find((c) => c.local === local);
  if (byLocal) {
    for (const m of mods) byLocal.modules.add(m);
  } else {
    collisions.push({ local, modules: new Set(mods) });
  }
}
const risky = collisions.filter((c) => c.modules.size > 1);
if (risky.length) {
  console.log(`\n!! COLLISION RISK — same "_local" across different origin modules:`);
  for (const c of risky)
    console.log(`   ${c.local.padEnd(30)} <- ${[...c.modules].sort().join(", ")}`);
} else {
  console.log(`\nno module-name collisions (${collisions.length} distinct _local stems)`);
}

console.log(`\nmodules written (${buckets.size}):`);
for (const [m, r] of [...buckets].sort((a, b) => b[1].length - a[1].length))
  console.log(`  ${String(r.length).padStart(4)} rules  ${m}`);