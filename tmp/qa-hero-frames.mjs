import { launch } from "../scripts/lib/browser.mjs";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3001/";

async function probeAt(vp, scrollY) {
  const { browser, page } = await launch({ width: vp.w, height: vp.h });
  await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate((ms) => setTimeout(ms, ms), 2200);
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.evaluate((ms) => setTimeout(ms, ms), 900);    const data = await page.evaluate((vp) => {
    const doc = document.documentElement;
    const sections = [...document.querySelectorAll("section")].map((el) => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), id: el.id, cls: (el.className || "").toString().split(" ")[0], top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), visible: r.height > 0 && r.width > 0 };
    });
    const heroTop = document.querySelector("[data-hero-top]") || document.querySelector("[class*='hero_top']") || document.querySelector("[class*='hero-root']") || document.querySelector("[class*='hero_root']");
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
    const transform = (el) => el ? getComputedStyle(el).transform : null;
    const scale = (el) => el ? (() => { const m = el.getBoundingClientRect(); const s = getComputedStyle(el); const mat = new DOMMatrixReadOnly(s.transform); return { width: m.width, height: m.height, scaleX: +mat.a.toFixed(3), scaleY: +mat.d.toFixed(3) }; })() : null;

    return {
      scrollY: window.scrollY,
      docHeight: Math.round(Math.max(doc.scrollHeight, document.body.scrollHeight)),
      viewport: { w: vp.w, h: vp.h },
      heroTop: heroTop ? { rect: rect(heroTop), opacity: opacity(heroTop), transform: transform(heroTop) } : null,
      heroBg: heroBg ? { rect: rect(heroBg), opacity: opacity(heroBg) } : null,
      heroHouse: heroHouse ? { rect: rect(heroHouse), opacity: opacity(heroHouse), scale: scale(heroHouse), transform: transform(heroHouse) } : null,
      heroComposite: heroComposite ? { rect: rect(heroComposite), opacity: opacity(heroComposite), scale: scale(heroComposite) } : null,
      heroLogo: heroLogo ? { rect: rect(heroLogo), opacity: opacity(heroLogo), scale: scale(heroLogo) } : null,
      heroSmokeTop: heroSmokeTop ? { rect: rect(heroSmokeTop), opacity: opacity(heroSmokeTop), transform: transform(heroSmokeTop) } : null,
      heroContent: heroContent ? { rect: rect(heroContent), opacity: opacity(heroContent), transform: transform(heroContent) } : null,
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

const top = await probeAt({ w: 390, h: 844 }, 0);
const mid = await probeAt({ w: 390, h: 844 }, Math.round((top.docHeight || 3500) * 0.45));
const late = await probeAt({ w: 390, h: 844 }, Math.round((top.docHeight || 3500) * 0.85));

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

// assertions that hero layers exist
const checks = [
  ["heroTop exists at top", !!top.heroTop],
  ["heroBg exists at top", !!top.heroBg],
  ["heroHouse exists at top", !!top.heroHouse],
  ["heroLogo exists at top", !!top.heroLogo],
  ["heroContent exists at top", !!top.heroContent],
  ["heroTitle exists at top", !!top.heroTitle],
  ["heroText exists at top", !!top.heroText],
  ["heroActions exists at top", !!top.heroActions],
  ["heroOverlay exists at top", !!top.heroOverlay],
  ["heroSmokeTop exists at top", !!top.heroSmokeTop],
  ["docHeight > 3000 (tall hero)", (top.docHeight || 0) > 3000],
  ["heroBg opacity ~1 at top", top.heroBg && Math.abs(top.heroBg.opacity - 1) < 0.05],
  ["heroTitle opacity ~1 at top", top.heroTitle && top.heroTitle.opacity > 0.8],
  ["heroText opacity ~1 at top", top.heroText && top.heroText.opacity > 0.8],
  ["heroActions opacity ~1 at top", top.heroActions && top.heroActions.opacity > 0.8],
];
console.log("\n===== checks =====");
checks.forEach(([name, pass]) => console.log(pass ? "PASS" : "FAIL", name));
