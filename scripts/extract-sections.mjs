import fs from "node:fs";
import path from "node:path";
import {
  launch,
  settle,
  ensureDir,
  RESEARCH_ROOT,
  TARGET_URL,
} from "./lib/browser.mjs";

const SECTION_LIST = () => {
  const main = document.querySelector("main");
  const out = [];
  [...main.children].forEach((el, i) => {
    const r = el.getBoundingClientRect();
    out.push({
      index: i,
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      classes: el.className?.toString() || "",
      top: Math.round(r.y + window.scrollY),
      height: Math.round(r.height),
      width: Math.round(r.width),
      text: el.textContent?.replace(/\s+/g, " ").trim().slice(0, 3000),
      html: el.outerHTML,
    });
  });
  return out;
};

const HEADER_PROBE = () => {
  const h = document.querySelector("header") || document.querySelector('[class*="header_wrapper"]');
  if (!h) return null;
  return {
    tag: h.tagName.toLowerCase(),
    classes: h.className?.toString(),
    rect: (() => {
      const r = h.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    })(),
  };
};

const STYLE_PROBE = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const cs = getComputedStyle(el);
  const props = [
    "position", "top", "left", "right", "bottom", "zIndex", "width", "height",
    "maxWidth", "minHeight", "opacity", "transform", "translate", "scale", "rotate",
    "backgroundColor", "color", "fontSize", "fontWeight", "lineHeight", "letterSpacing",
    "fontFamily", "padding", "margin", "display", "flexDirection", "justifyContent",
    "alignItems", "gap", "gridTemplateColumns", "borderRadius", "boxShadow", "overflow",
    "visibility", "clipPath", "objectFit", "filter", "backdropFilter", "transition",
  ];
  const out = {};
  props.forEach((p) => (out[p] = cs[p]));
  return out;
};

async function main() {
  ensureDir(RESEARCH_ROOT);
  const { browser, page } = await launch({ width: 1440, height: 900 });
  const report = { scrollStates: {}, header: {}, sections: [] };
  try {
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(page);

    // ---- header + scroll behaviour probes ----
    const scrollPositions = [0, 40, 80, 200, 600, 1200, 3000, 8000, 14000];
    for (const y of scrollPositions) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(700);
      report.scrollStates[y] = {
        header: await page.evaluate(HEADER_PROBE),
        heroRoot: await page.evaluate(STYLE_PROBE, "section[class*='hero_root']"),
        heroContent: await page.evaluate(STYLE_PROBE, "[class*='hero_content']"),
        heroBack: await page.evaluate(STYLE_PROBE, "[class*='hero_back']"),
        heroHouse: await page.evaluate(STYLE_PROBE, "[class*='hero_house']"),
        heroClouds: await page.evaluate(STYLE_PROBE, "[class*='hero_clouds']"),
        heroLogo: await page.evaluate(STYLE_PROBE, "[class*='hero_logo']"),
        heroSmoke: await page.evaluate(STYLE_PROBE, "[class*='hero_smoke']"),
        htmlClasses: await page.evaluate(() => document.documentElement.className),
        bodyClasses: await page.evaluate(() => document.body.className),
      };
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);

    // ---- sections ----
    report.sections = (await page.evaluate(SECTION_LIST)).map((s) => ({
      ...s,
      html: undefined,
    }));
    const raw = await page.evaluate(SECTION_LIST);
    const dir = path.join(RESEARCH_ROOT, "sections");
    ensureDir(dir);
    raw.forEach((s) => {
      const key = String(s.index).padStart(2, "0") + "-" + (s.classes.split(" ")[0] || s.tag).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
      fs.writeFileSync(path.join(dir, key + ".html"), s.html);
      delete s.html;
      s.key = key;
    });
    report.sections = raw;

    // ---- media / fonts assets ----
    report.assets = await page.evaluate(() => ({
      videos: [...document.querySelectorAll("video")].map((v) => ({
        src: v.currentSrc || v.src,
        poster: v.poster,
        parentClasses: v.parentElement?.className?.toString(),
        autoplay: v.autoplay,
        loop: v.loop,
        muted: v.muted,
        playsInline: v.playsInline,
        rect: (() => { const r = v.getBoundingClientRect(); return { y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }; })(),
        preload: v.preload,
        attributes: [...v.attributes].map((a) => a.name + "=" + a.value),
      })),
      images: [...document.querySelectorAll("img")].map((img) => ({
        src: img.currentSrc || img.src,
        srcset: img.getAttribute("srcset"),
        alt: img.alt,
        width: img.getAttribute("width"),
        height: img.getAttribute("height"),
        loading: img.getAttribute("loading"),
        parentClasses: img.parentElement?.className?.toString(),
        rect: (() => { const r = img.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }; })(),
        objectFit: getComputedStyle(img).objectFit,
        objectPosition: getComputedStyle(img).objectPosition,
      })),
    }));

    fs.writeFileSync(path.join(RESEARCH_ROOT, "sections.json"), JSON.stringify(report, null, 2));
    console.log("sections:", report.sections.length);
    report.sections.forEach((s) => console.log(String(s.index).padStart(2), s.key, s.height, "|", s.text.slice(0, 60)));
    console.log("images:", report.assets.images.length, "videos:", report.assets.videos.length);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
