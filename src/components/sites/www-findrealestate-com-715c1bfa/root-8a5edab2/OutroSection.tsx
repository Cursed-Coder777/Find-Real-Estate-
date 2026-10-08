import Link from "next/link";

import { ASSET_ROOT } from "./data";
import { ArrowRightIcon } from "./shared/icons";
import { ClipReveal } from "./shared/ClipReveal";
import { OutroBackground } from "./shared/OutroBackground";

/**
 * Outro (section 10) — centred CTA over the darkened `bg.jpg` photograph.
 *
 * Entry animation, measured on the live site:
 *  - `.outro_bg img` is scroll-*scrubbed*, not one-shot: it scales 1 → 1.1 as
 *    the section travels through the viewport, so the parallax is tied to
 *    scroll position rather than firing once. Handled by `OutroBackground`.
 *  - `.outro_title` is a clip-path wipe opening top-to-bottom
 *    (`inset(0 100% 0 0)` → `inset(0 0 0 0)`, 2s, `power4.out`).
 *    See `shared/ClipReveal`.
 *  - The CTA button has no entrance animation of its own.
 */
export function OutroSection() {
  return (
    <section className="outro_root">
      <OutroBackground>
        <img
          src={`${ASSET_ROOT}/images/bg.ec610793.jpg`}
          alt=""
          width={2880}
          height={1464}
          loading="lazy"
        />
      </OutroBackground>

      <div className="container_container">
        <ClipReveal as="div" className="outro_title" axis="y">
          <h2>
            Find You. <span className="em">We’ll Help You Get There.</span>
          </h2>
        </ClipReveal>

        <div className="outro_actions">
          <div>
            <Link
              className="button_button-round button_color-primary button_inversed"
              href="/search"
            >
              <div className="button_content">
                <div className="button_button-round-text">
                  <span data-text="Let’s Get Started">Let’s Get Started</span>
                </div>
                <span className="button_icon-after">
                  <ArrowRightIcon />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OutroSection;