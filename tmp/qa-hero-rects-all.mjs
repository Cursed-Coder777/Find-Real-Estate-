import { launch } from "../scripts/lib/browser.mjs";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3100/";

async function probeAt(vp, scrollY) {
  const { browser, page } = await launch({ width: vp.w, height: vp.h });
  await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate((ms) => setTimeout(ms, ms), 2400);
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.evaluate((ms) => setTimeout(ms, ms), 1000);

  const data = await page.evaluate(() => {
    const doc = document.documentElement;
    const sel = (s) => document.querySelector(s);
    const rect = (el) => el ? { top: Math.round(el.getBoundingClientRect().top), bottom: Math.round(el.getBoundingClientRect().bottom), left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) } : null;
    const opacity = (el) => el ? parseFloat(getComputedStyle(el).opacity) || 0 : null;
    const scale = (el) => el ? (() => { const m = el.getBoundingClientRect(); const mat = new DOMMatrixReadOnly(getComputedStyle(el).transform); return { width: m.width, height: m.height, scaleX: +mat.a.toFixed(3), scaleY: +mat.d.toFixed(3) }; })() : null;
    const text = (el) => el ? el.textContent?.trim().slice(0, 120) ?? null : null;

    const hero = sel("[class*='hero_root'], [class*='hero-root'], section:first-of-type");
    const heroTop = sel("[data-hero-top], [class*='hero_top'], [class*='hero-top']");
    const heroBg = sel("[data-hero-bg], [class*='hero_bg'], [class*='hero-bg']");
    const heroHouse = sel("[data-hero-house], [class*='hero_house'], [class*='hero-house']");
    const heroHouseImg = heroHouse ? heroHouse.querySelector("img") : null;
    const heroComposite = sel("[data-hero-composite], [class*='hero_composite'], [class*='hero-composite']");
    const heroLogo = sel("[data-hero-logo], [class*='hero_logo'], [class*='hero-logo']");
    const heroLogoImg = heroLogo ? heroLogo.querySelector("svg, img") : null;
    const heroSmokeTop = sel("[data-hero-smoke-top], [class*='hero_smoke'][style*='translateY'], [class*='hero-smoke'][style*='translateY']");
    const heroSmokeImg = heroSmokeTop ? heroSmokeTop.querySelector("img") : null;
    const heroContent = sel("[data-hero-content], [class*='hero_content'], [class*='hero-content']");
    const heroTitle = sel("[data-hero-title], h1, [class*='hero_title'], [class*='hero-title']");
    const heroText = sel("[data-hero-text], [class*='hero_text'], [class*='hero-text']");
    const heroActions = sel("[data-hero-actions], [class*='hero_actions'], [class*='hero-actions']");
    const heroOverlay = sel("[data-hero-overlay], [class*='hero_overlay'], [class*='hero-overlay']");
    const heroOverlap = sel("[data-hero-overlap], [class*='hero_overlap'], [class*='hero-overlap']");
    const h1Inner = heroTitle ? heroTitle.querySelector("span, span span, [data-hero-word]") : null;
    const subtitleP = heroText ? heroText.querySelector("p, span, div") : null;

    return {
      scrollY: window.scrollY,
      vp: { w: vp.w, h: vp.h },
      docHeight: Math.round(Math.max(doc.scrollHeight, document.body.scrollHeight)),
      hero: hero ? { rect: rect(hero), opacity: opacity(hero) } : null,
      heroTop: heroTop ? { rect: rect(heroTop), opacity: opacity(heroTop) } : null,
      heroBg: heroBg ? { rect: rect(heroBg), opacity: opacity(heroBg) } : null,
      heroHouse: heroHouse ? { rect: rect(heroHouse), opacity: opacity(heroHouse), scale: scale(heroHouse) } : null,
      heroHouseImg: heroHouseImg ? { src: heroHouseImg.getAttribute("src")?.slice(0, 90), width: heroHouseImg.getAttribute("width"), height: heroHouseImg.getAttribute("height"), rect: rect(heroHouseImg), natural: { w: heroHouseImg.naturalWidth, h: heroHouseImg.naturalHeight } } : null,
      heroComposite: heroComposite ? { rect: rect(heroComposite), opacity: opacity(heroComposite), scale: scale(heroComposite) } : null,
      heroLogo: heroLogo ? { rect: rect(heroLogo), opacity: opacity(heroLogo), scale: scale(heroLogo), target: heroLogoImg ? { tag: heroLogoImg.tagName.toLowerCase(), src: heroLogoImg.getAttribute("src")?.slice(0, 90), viewBox: heroLogoImg.getAttribute("viewBox"), width: heroLogoImg.getAttribute("width"), height: heroLogoImg.getAttribute("height") } : null } : null,
      heroSmokeTop: heroSmokeTop ? { rect: rect(heroSmokeTop), opacity: opacity(heroSmokeTop), transform: getComputedStyle(heroSmokeTop).transform } : null,
      heroSmokeImg: heroSmokeImg ? { src: heroSmokeImg.getAttribute("src")?.slice(0, 90), width: heroSmokeImg.getAttribute("width"), height: heroSmokeImg.getAttribute("height") } : null,
      heroContent: heroContent ? { rect: rect(heroContent), opacity: opacity(heroContent) } : null,
      heroTitle: heroTitle ? { rect: rect(heroTitle), opacity: opacity(heroTitle), text: text(heroTitle), h1InnerText: text(h1Inner), fontSize: getComputedStyle(heroTitle).fontSize, fontWeight: getComputedStyle(heroTitle).fontWeight } : null,
      heroText: heroText ? { rect: rect(heroText), opacity: opacity(heroText), text: text(heroText), subtitleP: subtitleP ? text(subtitleP) : null } : null,
      heroActions: heroActions ? { rect: rect(heroActions), opacity: opacity(heroActions), text: text(heroActions) } : null,
      heroOverlay: heroOverlay ? { rect: rect(heroOverlay), opacity: opacity(heroOverlay) } : null,
      heroOverlap: heroOverlap ? { rect: rect(heroOverlap), opacity: opacity(heroOverlap) } : null,
      h1Text: heroTitle ? text(heroTitle) : null,
      subtitleText: heroText ? (heroText.querySelector("p, span, div")?.textContent?.trim().slice(0, 140) ?? null) : null,
      bodyChildren: [...document.body.children].map((c) => ({ tag: c.tagName.toLowerCase(), id: c.id, cls: (c.className || "").toString().split(" ")[0] })).slice(0, 6),
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
  console.log("docHeight:", d.docHeight, "vp:", d.vp, "bodyChildren:", JSON.stringify(d.bodyChildren));
  console.log("hero:", JSON.stringify(d.hero));
  console.log("heroTop:", JSON.stringify(d.heroTop));
  console.log("heroBg:", JSON.stringify(d.heroBg));
  console.log("heroHouse:", JSON.stringify(d.heroHouse));
  console.log("heroHouseImg:", JSON.stringify(d.heroHouseImg));
  console.log("heroComposite:", JSON.stringify(d.heroComposite));
  console.log("heroLogo:", JSON.stringify(d.heroLogo));
  console.log("heroSmokeTop:", JSON.stringify(d.heroSmokeTop));
  console.log("heroSmokeImg:", JSON.stringify(d.heroSmokeImg));
  console.log("heroContent:", JSON.stringify(d.heroContent));
  console.log("heroTitle:", JSON.stringify(d.heroTitle));
  console.log("heroText:", JSON.stringify(d.heroText));
  console.log("heroActions:", JSON.stringify(d.heroActions));
  console.log("heroOverlay:", JSON.stringify(d.heroOverlay));
  console.log("heroOverlap:", JSON.stringify(d.heroOverlap));
  console.log("h1Text:", JSON.stringify(d.h1Text));
  console.log("subtitleText:", JSON.stringify(d.subtitleText));
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
  ["top heroHouse visible at top", top.heroHouse && top.heroHouse.rect && top.heroHouse.rect.h > 100],
  ["top h1Text starts with Find", top.h1Text && top.h1Text.toUpperCase().startsWith("FIND")],
  ["mid heroHouse scale > 1", mid.heroHouse && (mid.heroHouse.scale?.scaleX ?? 1) > 1],
  ["mid heroLogo opacity > 0.5", mid.heroLogo && mid.heroLogo.opacity > 0.5],
  ["mid heroContent opacity < 0.5", mid.heroContent && mid.heroContent.opacity < 0.5],
  ["late heroBg opacity > 0.8", late.heroBg && late.heroBg.opacity > 0.8],
  ["late heroTitle opacity < 0.2", late.heroTitle && late.heroTitle.opacity < 0.2],
  ["late heroHouse opacity < 0.2", late.heroHouse && late.heroHouse.opacity < 0.2],
  ["late subtitleText mentions Why FIND region", !!late.subtitleText && /why find/i.test(late.subtitleText)],
];
checks.forEach(([name, pass]) => console.log(pass ? "PASS" : "FAIL", name));
