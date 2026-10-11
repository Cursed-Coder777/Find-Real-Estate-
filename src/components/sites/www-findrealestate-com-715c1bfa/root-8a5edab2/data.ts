/**
 * Site-chrome content captured verbatim from https://www.findrealestate.com/
 * (header navigation, footer). Page body content lives in `./content.ts`,
 * which is generated straight from the origin's rendered markup.
 */

export const SIGN_IN_HREF =
  "https://app.findrealestate.com/authentication/sign-in";

/**
 * The "Beta" pill next to Sign In. Present on BOTH cloned routes — it was added
 * by the origin after the homepage was first captured, which is why the older
 * homepage stylesheet has no rules for it. Values read off the live DOM:
 *
 *   <a class="header_beta" title="Invited agents: try the new FIND platform"
 *      href="https://find-platform.vercel.app/login">Beta</a>
 *
 * Measured box 41x18, font-size 9px (=1.2rem), weight 600, padding 2.25px/6.75px
 * (=.3rem/.9rem), margin-right 9px (=1.2rem), border 1px solid #151717,
 * radius 999px.
 */
export const BETA_HREF = "https://find-platform.vercel.app/login";
export const BETA_TITLE = "Invited agents: try the new FIND platform";

/**
 * Desktop header navigation. The origin renders Join / Paperwork / Resources /
 * About as buttons that open lazily-hydrated submenu panels; the clone links
 * each to its top-level route instead (see the project README's gaps section).
 */
export const NAV_ITEMS: { label: string; href: string; submenu?: boolean }[] = [
  { label: "Search", href: "/search" },
  { label: "Neighborhoods", href: "/neighborhoods" },
  { label: "Agents", href: "/agents" },
  { label: "Join", href: "/join", submenu: true },
  { label: "Paperwork", href: "/paperwork", submenu: true },
  { label: "Resources", href: "/blog", submenu: true },
  { label: "About", href: "/about", submenu: true },
];

export const FOOTER_CONTACTS = [
  {
    label: "Head Office",
    lines: ["5 West 37th Street, 12th Floor,", "New York, NY 10018"],
    href: "geo:40.75104385252497,-73.98395637414475",
  },
  {
    label: "Email Us",
    lines: ["hello@findrealestate.com"],
    href: "mailto:hello@findrealestate.com",
  },
  { label: "Call Us", lines: ["+1 212 994 9965"], href: "tel:+12129949965" },
];

export const FOOTER_LINKS = [
  { label: "Search", href: "/search" },
  { label: "Agents", href: "/agents" },
  { label: "Join", href: "/join" },
  { label: "About Us", href: "/about" },
  { label: "Agent Portal", href: SIGN_IN_HREF },
];

export const FOOTER_SOCIALS = [
  { label: "Facebook", href: "https://facebook.com/findrealestate.hq" },
  { label: "Instagram", href: "https://www.instagram.com/findrealestate.hq" },
  { label: "Youtube", href: "https://www.youtube.com/@findrealestate_hq" },
  {
    label: "Linkedin",
    href: "https://www.linkedin.com/company/findrealestate-hq",
  },
];

export const FOOTER_SUBLINKS = [
  { label: "Terms", href: "/terms-of-service" },
  { label: "Privacy policy", href: "/privacy-policy" },
  {
    label: "Fair Housing Notice",
    href: "https://dos.ny.gov/system/files/documents/2025/03/nys-housing-and-anti-discrimination-notice_02.2025.pdf",
  },
  {
    label: "Reasonable Accommodation Notice",
    href: "/disabilities-disclosure",
  },
  { label: "Operating Procedure", href: "/operating-procedure" },
  { label: "Press", href: "/press-and-media" },
];

export const FOOTER_NOTICES = [
  "Housing Choice Vouchers Welcome",
  "Se Aceptan Vales de Elección de Vivienda",
];

export const ASSET_ROOT = "/sites/www-findrealestate-com-715c1bfa/root-8a5edab2";
