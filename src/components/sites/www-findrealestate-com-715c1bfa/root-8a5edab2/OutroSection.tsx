import Link from "next/link";

import { ASSET_ROOT } from "./data";
import { ArrowRightIcon } from "./shared/icons";
import { RevealGroup } from "./shared/RevealGroup";

/**
 * Outro (section 10) — centred CTA over the darkened `bg.jpg` photograph.
 * The origin slowly parallaxes the background with GSAP; the clone keeps the
 * image static (`object-fit: cover`), which matches the captured rest state.
 */
export function OutroSection() {
  return (
    <section className="outro_root">
      <div className="outro_bg">
        <img
          src={`${ASSET_ROOT}/images/bg.ec610793.jpg`}
          alt=""
          width={2880}
          height={1464}
          loading="lazy"
        />
      </div>
      <div className="container_container">
        <RevealGroup itemSelector="[data-reveal]" fromY={24} stagger={0.1}>
          <div className="outro_title" data-reveal="">
            <h2>
              Find You. <span className="em">We’ll Help You Get There.</span>
            </h2>
          </div>
          <div className="outro_actions" data-reveal="">
            <div>
              <Link
                className="button_button-round button_color-primary button_inversed"
                href="/search"
              >
                <div className="button_content">
                  <div className="button_button-round-text">
                    <span data-text="Let’s Get Started">
                      Let’s Get Started
                    </span>
                  </div>
                  <span className="button_icon-after">
                    <ArrowRightIcon />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}

export default OutroSection;
