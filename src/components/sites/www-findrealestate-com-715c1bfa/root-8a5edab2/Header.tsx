"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { NAV_ITEMS, SIGN_IN_HREF } from "./data";
import { BurgerMenu } from "./BurgerMenu";
import { ChevronDownIcon, LogoIcon } from "./shared/icons";

/**
 * Cloned site header.
 *
 * Measured behaviour (see docs/research/<site-key>/<page-key>/BEHAVIORS.md):
 *  - `.header_wrapper` is `position: sticky; top: 0` (not fixed) and starts with
 *    `header_transparent`, so the hero shows through it.
 *  - `header_-hidden` is added once the user scrolls down past ~100px, and is
 *    removed as soon as they scroll up again (verified down to scrollY 2600).
 *  - `header_-fixed` is added once scrollY passes 3 × viewport height
 *    (measured: absent at 2690, present at 2710 on a 900px viewport) and stops
 *    the wrapper being transparent.
 */
const HIDDEN_THRESHOLD = 100;

export function Header() {
  const [hidden, setHidden] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current;
      lastY.current = y;
      setHidden(goingDown && y > HIDDEN_THRESHOLD);
      setFixed(y > window.innerHeight * 3);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // While the menu is open the origin freezes the page (Lenis is stopped and
    // `html` gets `overflow: hidden`).
    document.documentElement.classList.toggle("menu-open", menuOpen);
    return () => document.documentElement.classList.remove("menu-open");
  }, [menuOpen]);

  const wrapperClass = [
    "header_wrapper",
    "header_transparent",
    fixed ? "header_-fixed" : "",
    hidden ? "header_-hidden" : "",
    menuOpen ? "header_-opened" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={wrapperClass}>
        <div className="container_container">
          <div className="header_content">
            <div className="header_logo">
              <Link href="/" aria-label="FIND Real Estate">
                <LogoIcon />
              </Link>
            </div>

            <nav className="header_nav">
              {NAV_ITEMS.map((item) =>
                item.submenu ? (
                  <div key={item.label}>
                    <Link className="header_nav-item" href={item.href}>
                      <span data-text={item.label}>{item.label}</span>
                      <span className="header_nav-arrow">
                        <ChevronDownIcon />
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div key={item.label} className="header_nav-item">
                    <Link href={item.href}>
                      <span data-text={item.label}>{item.label}</span>
                    </Link>
                  </div>
                ),
              )}
            </nav>

            <div className="header_actions">
              <a
                className="button_button-round button_color-primary"
                href={SIGN_IN_HREF}
              >
                <div className="button_content">
                  <div className="button_button-round-text">
                    <span data-text="Sign In">Sign In</span>
                  </div>
                </div>
              </a>
            </div>

            <button
              type="button"
              className="header_burger-control"
              aria-label="Menu control"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export default Header;
