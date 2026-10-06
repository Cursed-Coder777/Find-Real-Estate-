import fs from "node:fs";
import path from "node:path";

const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "root-8a5edab2";
const ORIGIN = "https://www.findrealestate.com";
const OUT = path.join(process.cwd(), "public/sites", SITE_KEY, PAGE_KEY);

const list = fs
  .readFileSync(
    path.join(
      process.cwd(),
      "docs/research",
      SITE_KEY,
      PAGE_KEY,
      "assets.txt",
    ),
    "utf8",
  )
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.startsWith("/"));

function localName(url) {
  // /_next/static/media/back.f53e9773.jpg -> images/back.f53e9773.jpg
  // Hashes are preserved: several source files share a base name (1.jpg, 2.jpg)
  // and would otherwise overwrite each other.
  if (url.startsWith("/videos/")) return path.join("video", path.basename(url));
  return path.join("images", path.basename(url));
}

async function main() {
  fs.mkdirSync(path.join(OUT, "images"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "video"), { recursive: true });
  const manifest = [];
  const queue = [...list];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const url = queue.shift();
      const rel = localName(url);
      const dest = path.join(OUT, rel);
      try {
        const res = await fetch(ORIGIN + url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buf);
        manifest.push({
          source: url,
          local: "/sites/" + SITE_KEY + "/" + PAGE_KEY + "/" + rel.split(path.sep).join("/"),
          bytes: buf.length,
          contentType: res.headers.get("content-type"),
          status: "ok",
        });
        console.log("ok", rel, buf.length);
      } catch (e) {
        manifest.push({ source: url, local: rel, status: "failed", error: String(e) });
        console.log("FAIL", rel, String(e));
      }
    }
  });
  await Promise.all(workers);
  fs.writeFileSync(
    path.join(process.cwd(), "docs/research", SITE_KEY, PAGE_KEY, "ARTIFACT_MANIFEST.json"),
    JSON.stringify({ assets: manifest.sort((a, b) => a.source.localeCompare(b.source)) }, null, 2),
  );
  console.log("downloaded", manifest.filter((m) => m.status === "ok").length, "/", manifest.length);
}

main();
