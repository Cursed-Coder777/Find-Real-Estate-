import fs from "node:fs";
import path from "node:path";
import { parse } from "node-html-parser";

export const SITE_KEY = "www-findrealestate-com-715c1bfa";
export const PAGE_KEY = "root-8a5edab2";
const ASSET_BASE = `/sites/${SITE_KEY}/${PAGE_KEY}`;

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// Attributes renamed for JSX.
const ATTR_MAP = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  minlength: "minLength",
  crossorigin: "crossOrigin",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  charset: "charSet",
  colspan: "colSpan",
  rowspan: "rowSpan",
  contenteditable: "contentEditable",
  enctype: "encType",
  formaction: "formAction",
  frameborder: "frameBorder",
  hreflang: "hrefLang",
  novalidate: "noValidate",
  playsinline: "playsInline",
  srcset: "srcSet",
  tabindex: "tabIndex",
  usemap: "useMap",
  allowfullscreen: "allowFullScreen",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "viewbox": "viewBox",
  "mask-image": "maskImage",
  "mask-size": "maskSize",
  "mask-repeat": "maskRepeat",
  "mask-position": "maskPosition",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "stroke-miterlimit": "strokeMiterlimit",
  "xlink:href": "xlinkHref",
  "clip-path": "clipPath",
};

// Attributes dropped entirely: build/runtime artifacts we re-create ourselves.
const DROP_ATTRS = new Set([
  "data-nimg",
  "data-svg-origin",
  "decoding",
  "fetchpriority",
  "data-state",
  "aria-controls",
  "id", // radix ids are unstable; re-created where needed
]);

// Inline-style properties emitted by GSAP at runtime — not part of the design.
const GSAP_STYLE_PROPS = new Set([
  "translate",
  "rotate",
  "scale",
  "transform",
  "transform-origin",
  "will-change",
  "translate3d",
  "visibility",
]);

export function rewriteClass(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((c) => c.replace(/^([A-Za-z][A-Za-z0-9-]*_[A-Za-z0-9-]+)__[A-Za-z0-9_-]{5,8}$/, "$1"))
    .join(" ");
}

/** Map an origin image URL (next/image wrapper or raw path) to the local asset path. */
export function localImage(raw) {
  if (!raw) return raw;
  let url = raw;
  if (url.includes("/_next/image")) {
    const q = url.slice(url.indexOf("?") + 1);
    const params = new URLSearchParams(q);
    const inner = params.get("url");
    if (inner) url = inner;
  }
  if (url.startsWith("/_next/static/media/")) {
    return `${ASSET_BASE}/images/${path.basename(url)}`;
  }
  if (url.startsWith("/videos/")) {
    return `${ASSET_BASE}/video/${path.basename(url)}`;
  }
  if (url.startsWith("/")) return url;
  return url;
}

function styleAttrToObject(style) {
  const entries = style
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const i = s.indexOf(":");
      return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
    })
    .filter(([k]) => !GSAP_STYLE_PROPS.has(k));
  if (!entries.length) return null;
  const body = entries
    .map(([k, v]) => {
      const key = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      return `${key}: ${JSON.stringify(v)}`;
    })
    .join(", ");
  return `{{ ${body} }}`;
}

function attrToString(node, name, value) {
  if (DROP_ATTRS.has(name)) return null;
  if (name.startsWith("data-") && name !== "data-text" && name !== "data-selected" && name !== "data-letter") {
    // keep data-contact / data-letter, drop the rest of the runtime noise
  }
  if (name === "style") {
    const obj = styleAttrToObject(value);
    return obj ? `style=${obj}` : null;
  }
  if (name === "class") return `className=${JSON.stringify(rewriteClass(value))}`;
  if (name === "srcset" || name === "srcSet") return null;
  if (name === "src" || name === "poster") {
    return `${ATTR_MAP[name] ?? name}=${JSON.stringify(localImage(value))}`;
  }
  if (name === "sizes") return null;
  if (name === "value" && value === "") return null;
  if (name === "loading" && value === "lazy") return null;
  const jsxName = ATTR_MAP[name] ?? name;
  // Attributes that must stay strings even when empty (React renders a bare
  // `alt` as alt="true", which is not the same as an empty alt).
  const STRINGY = new Set(["alt", "value", "placeholder", "title", "name", "id", "href", "src", "type", "role"]);
  if (value === "") return STRINGY.has(jsxName) ? `${jsxName}=""` : jsxName;
  if (value === name) return jsxName;
  if (value.includes('"') || value.includes("\n")) {
    return `${jsxName}={${JSON.stringify(value)}}`;
  }
  return `${jsxName}=${JSON.stringify(value)}`;
}

function render(node, depth) {
  const pad = "  ".repeat(depth);
  if (node.nodeType === 3) {
    const text = node.rawText.replace(/\s+/g, " ");
    if (!text.trim()) return "";
    return pad + text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
  }
  if (node.nodeType === 8) return "";
  if (node.rawTagName === "script" || node.rawTagName === "style") return "";

  const tag = node.rawTagName;
  const attrs = [];
  for (const [name, value] of Object.entries(node.attributes ?? {})) {
    const s = attrToString(node, name, String(value));
    if (s) attrs.push(s);
  }
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";
  const isVoid = VOID_TAGS.has(tag);

  // Render children
  const kids = (node.childNodes ?? []).map((c) => render(c, depth + 1)).filter(Boolean);
  const innerText = node.childNodes?.length === 1 && node.childNodes[0].nodeType === 3;
  if (innerText) {
    const only = render(node.childNodes[0], 0).trimStart();
    const multiline = only.includes("\n");
    return `${pad}<${tag}${attrStr}>${multiline ? "\n" + only + "\n" + pad : only}</${tag}>`;
  }
  if (isVoid) {
    return `${pad}<${tag}${attrStr} />`;
  }
  if (kids.length === 0) {
    return `${pad}<${tag}${attrStr}></${tag}>`;
  }
  return `${pad}<${tag}${attrStr}>\n${kids.join("\n")}\n${pad}</${tag}>`;
}

export function htmlToJsx(html) {
  const root = parse(html, { lowerCaseTagName: false, comment: true });
  return root.childNodes.map((n) => render(n, 0)).filter(Boolean).join("\n");
}

export { parse };
