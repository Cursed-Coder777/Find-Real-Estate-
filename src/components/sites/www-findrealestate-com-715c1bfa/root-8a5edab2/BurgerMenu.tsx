"use client";

import Link from "next/link";

import { NAV_ITEMS, SIGN_IN_HREF } from "./data";
import { ChevronDownIcon } from "./shared/icons";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Full-screen mobile navigation.
 *
 * `.burger-menu_wrapper` is `position: fixed; z-index: 49; opacity: 0;
 * pointer-events: none` in the origin's stylesheet — the reveal is done from
 * JS. `clone.css` drives it from `data-open`, and `clone.css` also stops the
 * backdrop from scaling in at the same time as the fade.
 *
 * The origin pins the wrapper below the header with `padding-top: 59px`,
 * i.e. the header's measured height.
 */
export function BurgerMenu({ open, onClose }: Props) {
  return (
    <div
      className="burger-menu_wrapper"
      data-open={open ? "true" : "false"}
      data-lenis-prevent="true"
      style={{ paddingTop: "59px" }}
      aria-hidden={!open}
    >
      <div className="burger-menu_backdrop" onClick={onClose} />
      <div className="burger-menu_content">
        <nav className="burger-menu_nav">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="burger-menu_nav-item">
              <Link href={item.href} onClick={onClose}>
                <span data-text={item.label}>{item.label}</span>
              </Link>
              {item.submenu ? (
                <span className="header_nav-arrow">
                  <ChevronDownIcon />
                </span>
              ) : null}
            </div>
          ))}
        </nav>
      </div>
      <div className="burger-menu_actions">
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
    </div>
  );
}

export default BurgerMenu;
