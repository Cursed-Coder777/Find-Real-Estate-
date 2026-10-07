import { launch } from "../scripts/lib/browser.mjs";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3001/";

async function probeAt(vp, scrollY) {
  const { browser, page } = await launch({ width: vp.w, height: vp.h });
  await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate((ms) => setTimeout(ms, ms), 2400);
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.evaluate((ms) => setTimeout(ms, ms), 1000);    const data = await page.evaluate((vp) => {
    const doc = document.documentElement;
    const sections = [...document.querySelectorAll("section")].map((el) => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), id: el.id, cls: (el.className || "").toString().split(" ")[0], top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
    });
    const heroTop = document.querySelector("[data-hero-top]") || document.querySelector("[class*='hero_top']") || document.querySelector("[class*='hero_root']") || document.querySelector("[class*='hero-root']");
    const heroBg = document.querySelector("[data-hero-bg]") || document.querySelector("[class*='hero_bg']") || document.querySelector("[class*='hero-bg']");
    const heroHouse = document.querySelector("[data-hero-house]") || document.querySelector("[class*='hero_house']") || document.querySelector("[class*='hero-house']");
    const heroComposite = document.querySelector("[data-hero-composite]") || document.querySelector("[class*='hero_composite']") || document.querySelector("[class*='hero-composite']");
    const heroLogo = document.querySelector("[data-hero-logo]") || document.querySelector("[class*='hero_logo']") || document.querySelector("[class*='hero-logo']");
    const heroSmokeTop = document.querySelector("[data-hero-smoke-top]") || document.querySelector("[class*='hero_smoke'][style*='translateY']") || document.querySelector("[class*='hero-smoke'][style*='translateY']");
    const heroContent = document.querySelector("[data-hero-content]") || document.querySelector("[class*='hero_content']") || document.querySelector("[class*='hero-content']");
    const heroTitle = document.querySelector("[data-hero-title]") || document.querySelector("h1") || document.querySelector("[class*='hero_title']") || document.querySelector("[class*='hero-title']");
    const heroText = document.querySelector("[data-hero-text]") || document.querySelector("[class*='hero_text']") || document.querySelector("[class*='hero-text']");
    const heroActions = document.querySelector("[data-hero-actions]") || document.querySelector("[class*='hero_actions']") || document.querySelector("[class*='hero-actions']");
    const heroOverlay = document.querySelector("[data-hero-overlay]") || document.querySelector("[class*='hero_overlay']") || document.querySelector("[class*='hero-overlay']");
    const heroOverlap = document.querySelector("[data-hero-overlap]") || document.querySelector("[class*='hero_overlap']") || document.querySelector("[class*='hero-overlap']");

    const rect = (el) => el ? { top: Math.round(el.getBoundingClientRect().top), bottom: Math.round(el.getBoundingClientRect().bottom), left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) } : null;
    const opacity = (el) => el ? parseFloat(getComputedStyle(el).opacity) || 0 : null;
    const scale = (el) => el ? (() => { const m = el.getBoundingClientRect(); const mat = new DOMMatrixReadOnly(getComputedStyle(el).transform); return { width: m.width, height: m.height, scaleX: +mat.a.toFixed(3), scaleY: +mat.d.toFixed(3) }; })() : null;

    return {
      scrollY: window.scrollY,
      docHeight: Math.round(Math.max(doc.scrollHeight, document.body.scrollHeight)),
      viewport: { w: vp.w, h: vp.h },
      heroTop: heroTop ? { rect: rect(heroTop), opacity: opacity(heroTop) } : null,
      heroBg: heroBg ? { rect: rect(heroBg), opacity: opacity(heroBg) } : null,
      heroHouse: heroHouse ? { rect: rect(heroHouse), opacity: opacity(heroHouse), scale: scale(heroHouse) } : null,
      heroComposite: heroComposite ? { rect: rect(heroComposite), opacity: opacity(heroComposite), scale: scale(heroComposite) } : null,
      heroLogo: heroLogo ? { rect: rect(heroLogo), opacity: opacity(heroLogo), scale: scale(heroLogo) } : null,
      heroSmokeTop: heroSmokeTop ? { rect: rect(heroSmokeTop), opacity: opacity(heroSmokeTop) } : null,
      heroContent: heroContent ? { rect: rect(heroContent), opacity: opacity(heroContent) } : null,
      heroTitle: heroTitle ? { rect: rect(heroTitle), opacity: opacity(heroTitle) } : null,
      heroText: heroText ? { rect: rect(heroText), opacity: opacity(heroText) } : null,
      heroActions: heroActions ? { rect: rect(heroActions), opacity: opacity(heroActions) } : null,
      heroOverlay: heroOverlay ? { rect: rect(heroOverlay), opacity: opacity(heroOverlay) } : null,
      heroOverlap: heroOverlap ? { rect: rect(heroOverlap), opacity: opacity(heroOverlap) } : null,
      sections,
    };
  });

  await browser.close();
  return { vp, scrollY, ...data };
}

const top = await probeAt({ w: 1440, h: 900 }, 0);
const mid = await probeAt({ w: 1440, h: 900 }, Math.round((top.docHeight || 5400) * 0.5));
const late = await probeAt({ w: 1440, h: 900 }, Math.round((top.docHeight || 5400) * 0.9));

function dump(label, d) {
  console.log(`\n===== ${label} (scroll ${d.scrollY}px) =====`);
  console.log("docHeight:", d.docHeight, "viewport:", d.viewport);
  console.log("heroTop:", JSON.stringify(d.heroTop));
  console.log("heroBg:", JSON.stringify(d.heroBg));
  console.log("heroHouse:", JSON.stringify(d.heroHouse));
  console.log("heroComposite:", JSON.stringify(d.heroComposite));
  console.log("heroLogo:", JSON.stringify(d.heroLogo));
  console.log("heroSmokeTop:", JSON.stringify(d.heroSmokeTop));
  console.log("heroContent:", JSON.stringify(d.heroContent));
  console.log("heroTitle:", JSON.stringify(d.heroTitle));
  console.log("heroText:", JSON.stringify(d.heroText));
  console.log("heroActions:", JSON.stringify(d.heroActions));
  console.log("heroOverlay:", JSON.stringify(d.heroOverlay));
  console.log("heroOverlap:", JSON.stringify(d.heroOverlap));
  console.log("sections:");
  d.sections.forEach((s, i) => console.log("  [", i, "]", JSON.stringify(s)));
}

dump("TOP", top);
dump("MID", mid);
dump("LATE", late);

console.log("\n===== checks =====");
const checks = [
  ["top docHeight > 5000", (top.docHeight || 0) > 5000],
  ["top heroBg opacity 1", top.heroBg && Math.abs(top.heroBg.opacity - 1) < 0.05],
  ["top heroTitle opacity > 0.8", top.heroTitle && top.heroTitle.opacity > 0.8],
  ["top heroText opacity > 0.8", top.heroText && top.heroText.opacity > 0.8],
  ["top heroActions opacity > 0.8", top.heroActions && top.heroActions.opacity > 0.8],
  ["mid heroHouse scale > 1", mid.heroHouse && (mid.heroHouse.scale?.scaleX ?? 1) > 1],
  ["mid heroLogo opacity > 0.5", mid.heroLogo && mid.heroLogo.opacity > 0.5],
  ["mid heroContent opacity < 0.5", mid.heroContent && mid.heroContent.opacity < 0.5],
  ["late heroBg opacity > 0.8", late.heroBg && late.heroBg.opacity > 0.8],
  ["late heroTitle opacity < 0.2", late.heroTitle && late.heroTitle.opacity < 0.2],
  ["late heroHouse opacity < 0.2", late.heroHouse && late.heroHouse.opacity < 0.2],
];
checks.forEach(([name, pass]) => console.log(pass ? "PASS" : "FAIL", name));
