import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "root-8a5edab2";
const ROOT = process.cwd();
const RES = path.join(ROOT, "docs/research", SITE_KEY, PAGE_KEY);
const OUT = path.join(ROOT, "public/sites", SITE_KEY, PAGE_KEY, "content");

const urls = fs
  .readFileSync(path.join(RES, "external-assets.txt"), "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.startsWith("http"));

function slugFor(u) {
  const base = path.basename(new URL(u).pathname);
  const ext = path.extname(base) || ".jpg";
  const stem = path.basename(base, ext).replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 48);
  const hash = crypto.createHash("sha1").update(u).digest("hex").slice(0, 6);
  return `${stem}-${hash}${ext}`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const mapping = {};
  let ok = 0;
  await Promise.all(
    urls.map(async (u) => {
      const name = slugFor(u);
      const dest = path.join(OUT, name);
      try {
        const res = await fetch(u, { headers: { "user-agent": "Mozilla/5.0" } });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buf);
        mapping[u] = `/sites/${SITE_KEY}/${PAGE_KEY}/content/${name}`;
        ok++;
        console.log("ok", name, buf.length);
      } catch (e) {
        mapping[u] = u; // fall back to the remote URL
        console.log("FAIL", u, String(e));
      }
    }),
  );
  fs.writeFileSync(path.join(RES, "content-asset-map.json"), JSON.stringify(mapping, null, 2));
  console.log("downloaded", ok, "/", urls.length);
}

main();
