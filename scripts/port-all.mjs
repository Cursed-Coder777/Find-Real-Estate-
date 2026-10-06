import fs from "node:fs";
import path from "node:path";
import { htmlToJsx } from "./port-dom.mjs";

const ROOT = process.cwd();
const RES = path.join(ROOT, "docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2");
const OUT = path.join(RES, "ported-jsx");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const jobs = [];
for (const f of fs.readdirSync(path.join(RES, "sections"))) {
  if (!f.endsWith(".html")) continue;
  jobs.push([f.replace(/\.html$/, ""), path.join(RES, "sections", f)]);
}
for (const f of fs.readdirSync(path.join(RES, "chrome"))) {
  if (!f.endsWith(".html")) continue;
  jobs.push(["chrome-" + f.replace(/\.html$/, ""), path.join(RES, "chrome", f)]);
}

for (const [name, file] of jobs) {
  const jsx = htmlToJsx(fs.readFileSync(file, "utf8"));
  fs.writeFileSync(path.join(OUT, name + ".jsx"), jsx + "\n");
  console.log(name, jsx.length);
}
