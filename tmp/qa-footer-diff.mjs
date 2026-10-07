import { launch } from "../scripts/lib/browser.mjs";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3001/";

const { browser, page } = await launch({ width: 1440, height: 900 });
const failures = [];

page.on("console", (msg) => {
  const t = msg.type();
  if (t === "error") failures.push(`ERR console:${msg.text()}`);
});
page.on("pageerror", (e) => failures.push(`ERR page:${e.message}`));

await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.evaluate(() => new Promise((r) => setTimeout(r, 1200)));
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.8);
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 600));
  try { await new Promise((r) => setTimeout(r, 400)); } catch { /* ignore */ }
});

const rows = await page.evaluate(() => {
  const main = document.querySelector("main");
  const sections = [...(main?.children ?? [])]
    .filter((el) => el.tagName === "SECTION" || el.className?.toString().includes("section"))
    .map((el) => {
      const r = el.getBoundingClientRect();
      const y = r.top + window.scrollY;
      return { cls: (el.className || "").toString().split(" ")[0], top: Math.round(y), h: Math.round(r.height) };
    });    const footer = document.querySelector("footer") || document.querySelector(".footer_wrapper");
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const footerTop = footerRect ? Math.round(footerRect.top + window.scrollY) : null;
    const footerBottom = footerRect ? Math.round(footerRect.bottom + window.scrollY) : null;
  const docBottom = Math.round(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
  const imgs = [...document.querySelectorAll("img")];
  const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src"));
  return { sections, footerTop, footerBottom, docBottom, imgCount: imgs.length, broken };
});

console.log(JSON.stringify({ rows, footerTop: rows.footerTop, footerBottom: rows.footerBottom, docBottom: rows.docBottom, failures }, null, 2));

await browser.close();
