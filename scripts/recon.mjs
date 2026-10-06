import fs from "node:fs";
import path from "node:path";
import {
  launch,
  settle,
  ensureDir,
  writeJson,
  RESEARCH_ROOT,
  SHOT_ROOT,
  TARGET_URL,
} from "./lib/browser.mjs";

const GLOBAL_SCRIPT = () => {
  const pick = (el, props) => {
    const cs = getComputedStyle(el);
    const out = {};
    props.forEach((p) => {
      const v = cs.getPropertyValue(p);
      if (v && v !== "none" && v !== "normal" && v !== "auto") out[p] = v;
    });
    return out;
  };

  const all = [...document.querySelectorAll("*")];

  // Font usage census
  const fonts = {};
  for (const el of all.slice(0, 4000)) {
    const cs = getComputedStyle(el);
    const key = `${cs.fontFamily} | ${cs.fontWeight} | ${cs.fontStyle}`;
    fonts[key] = (fonts[key] || 0) + 1;
  }

  // Color census
  const colors = {};
  const bgs = {};
  for (const el of all.slice(0, 4000)) {
    const cs = getComputedStyle(el);
    colors[cs.color] = (colors[cs.color] || 0) + 1;
    if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)")
      bgs[cs.backgroundColor] = (bgs[cs.backgroundColor] || 0) + 1;
  }

  const images = [...document.querySelectorAll("img")].map((img) => ({
    src: img.currentSrc || img.src,
    srcset: img.getAttribute("srcset"),
    sizes: img.getAttribute("sizes"),
    alt: img.alt,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    loading: img.getAttribute("loading"),
    parentClasses: img.parentElement?.className?.toString().slice(0, 200),
    position: getComputedStyle(img).position,
    zIndex: getComputedStyle(img).zIndex,
    rect: (() => {
      const r = img.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    })(),
  }));

  const backgroundImages = all
    .map((el) => ({
      bg: getComputedStyle(el).backgroundImage,
      tag: el.tagName.toLowerCase(),
      classes: el.className?.toString().slice(0, 160),
      rect: (() => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x),
          y: Math.round(r.y + window.scrollY),
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      })(),
    }))
    .filter((x) => x.bg && x.bg !== "none");

  const videos = [...document.querySelectorAll("video")].map((v) => ({
    src: v.currentSrc || v.src,
    sources: [...v.querySelectorAll("source")].map((s) => ({
      src: s.src,
      type: s.type,
    })),
    poster: v.poster,
    autoplay: v.autoplay,
    loop: v.loop,
    muted: v.muted,
    playsInline: v.playsInline,
  }));

  const favicons = [...document.querySelectorAll('link[rel*="icon"]')].map(
    (l) => ({ href: l.href, sizes: l.sizes?.toString(), rel: l.rel }),
  );

  // Top level structure
  const sections = [...document.querySelectorAll("body > *, main > *, body *")]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height > 180 && r.width > 700;
    })
    .slice(0, 80)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        classes: el.className?.toString().slice(0, 240),
        top: Math.round(r.y + window.scrollY),
        height: Math.round(r.height),
        dataset: Object.fromEntries(
          Object.entries(el.dataset).map(([k, v]) => [k, String(v).slice(0, 80)]),
        ),
        childCount: el.children.length,
        firstText: el.textContent?.trim().slice(0, 120),
        bg: getComputedStyle(el).backgroundColor,
      };
    });

  return {
    title: document.title,
    url: location.href,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    docHeight: document.body.scrollHeight,
    bodyClasses: document.body.className,
    htmlClasses: document.documentElement.className,
    htmlStyles: pick(document.documentElement, [
      "--font-sans",
      "--font-heading",
      "font-family",
      "font-size",
      "scroll-behavior",
    ]),
    bodyStyles: pick(document.body, [
      "font-family",
      "font-size",
      "line-height",
      "color",
      "background-color",
      "margin",
    ]),
    fonts,
    colors,
    bgs,
    images,
    backgroundImages,
    videos,
    favicons,
    sections,
    cssVars: (() => {
      const vars = {};
      const rootCS = getComputedStyle(document.documentElement);
      for (const sheet of document.styleSheets) {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of rules) {
          if (rule.style) {
            for (const name of rule.style) {
              if (name.startsWith("--"))
                vars[name] = rootCS.getPropertyValue(name).trim();
            }
          }
        }
      }
      return vars;
    })(),
    scriptSrcs: [...document.querySelectorAll("script[src]")].map((s) => s.src),
    linkHrefs: [...document.querySelectorAll("link[href]")].map((l) => ({
      rel: l.rel,
      href: l.href,
    })),
    headInner: document.head.innerHTML.slice(0, 20000),
    bodyHTML: document.body.innerHTML.length,
  };
};

async function main() {
  ensureDir(RESEARCH_ROOT);
  ensureDir(SHOT_ROOT);

  for (const vp of [
    { name: "desktop-1440", width: 1440, height: 900 },
    { name: "tablet-768", width: 768, height: 1024 },
    { name: "mobile-390", width: 390, height: 844 },
  ]) {
    const { browser, page } = await launch({ width: vp.width, height: vp.height });
    try {
      await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
      await settle(page);
      const full = path.join(SHOT_ROOT, `full-${vp.name}.png`);
      await page.screenshot({ path: full, fullPage: true });
      console.log("shot", full);
      const data = await page.evaluate(GLOBAL_SCRIPT);
      writeJson(path.join(RESEARCH_ROOT, `globals-${vp.name}.json`), data);
      console.log(
        "globals",
        vp.name,
        "height=",
        data.docHeight,
        "images=",
        data.images.length,
        "videos=",
        data.videos.length,
        "bgs=",
        data.backgroundImages.length,
      );
      if (vp.name === "desktop-1440") {
        fs.writeFileSync(
          path.join(RESEARCH_ROOT, "rendered-body.html"),
          await page.content(),
        );
      }
    } finally {
      await browser.close();
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
