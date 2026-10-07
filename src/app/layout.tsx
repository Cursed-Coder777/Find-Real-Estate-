import "~/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";

import { SmoothScroll } from "~/components/sites/www-findrealestate-com-715c1bfa/shared/SmoothScroll";
import { TRPCReactProvider } from "~/trpc/react";

/**
 * The origin site self-hosts two variable fonts and declares the CSS variables
 * `--font-primary` / `--font-secondary` on <body>:
 *
 *   .__variable_3d9088 { --font-primary: "Instrument Sans","Instrument Sans Fallback" }
 *   .__variable_c1a059 { --font-secondary: "Lora","Lora Fallback" }
 *
 * `base.css` consumes both via `body { font-family: var(--font-primary) }`.
 * The woff2 files below are the origin's own latin subsets.
 */
const instrumentSans = localFont({
  src: "../fonts/26d0ba92e140f0dc-s.p.woff2",
  variable: "--font-primary",
  weight: "400 700",
  style: "normal",
  display: "swap",
  fallback: ["Arial"],
});

const lora = localFont({
  src: "../fonts/5c0c2bcbaa4149ca-s.p.woff2",
  variable: "--font-secondary",
  weight: "400 700",
  style: "normal",
  display: "swap",
  fallback: ["Times New Roman"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.findrealestate.com"),
  title:
    "FIND Real Estate | Purchase, Rent or Sell Commercial and Residential Real Estate",
  description:
    "FIND is an agent-owned real estate brokerage helping you buy, sell or rent in New York, New Jersey, Philadelphia, Connecticut and Miami.",
  icons: [
    { rel: "icon", url: "/favicon.ico", sizes: "48x48 32x32 16x16" },
    { rel: "icon", url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    { rel: "apple-touch-icon", url: "/apple-icon.png", sizes: "180x180" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} ${lora.variable}`}>
        <TRPCReactProvider>
          <SmoothScroll />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
