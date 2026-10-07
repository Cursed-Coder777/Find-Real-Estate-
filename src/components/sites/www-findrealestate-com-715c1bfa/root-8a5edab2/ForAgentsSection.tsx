import Link from "next/link";
import { Fragment } from "react";

import { ASSET_ROOT } from "./data";
import { ArrowRightIcon } from "./shared/icons";
import { HighlightLines } from "./shared/HighlightLines";
import { RevealGroup } from "./shared/RevealGroup";

const IMG = `${ASSET_ROOT}/images`;

/**
 * "For Agents" — asymmetric image split (section 5).
 *
 * Left column (hidden on mobile): caption + narrow portrait image. Right
 * column: big heading, full-bleed-ish image, paragraph and CTA. The origin
 * reveals these blocks with a one-shot GSAP fade-up; `RevealGroup` reproduces
 * that via IntersectionObserver.
 */
export function ForAgentsSection() {
  return (
    <section>
      <div className="for-agents_wrapper">
        <div className="container_container">
          <RevealGroup
            itemSelector="[data-reveal]"
            fromY={40}
            stagger={0.12}
            className="assymetric-cols_row"
          >
            <div className="assymetric-cols_col assymetric-cols_hide-left-col-on-mobile">
              <div className="assymetric-image-split_label" data-reveal="">
                For Agents
              </div>
              <div className="assymetric-image-split_small-img" data-reveal="">
                <img src={`${IMG}/1.f6e8f2e8.jpg`} alt="" loading="lazy" />
              </div>
            </div>

            <div className="assymetric-cols_col">
              <div className="assymetric-image-split_right-col">
                <HighlightLines
                  className="for-agents_above-text"
                  label="Don’t Rent Your Career. Own It."
                  tone="light"
                  lines={[
                    <Fragment key="line-0">
                      Don’t Rent Your Career.{" "}
                      <span className="em">Own It.</span>
                    </Fragment>,
                  ]}
                />

                <div className="assymetric-image-split_image" data-reveal="">
                  <img
                    src={`${IMG}/2.41633fa6.jpg`}
                    alt=""
                    loading="lazy"
                  />
                </div>

                <div data-reveal="">
                  <div className="for-agents_below-text">
                    At FIND, our agents don’t just work for the brand—they own a
                    part of it.{" "}
                    <span className="em">
                      We give top performers real equity, so they’re invested in
                      more than just your transaction—they&apos;re invested in your
                      outcome. Agents are certified, supported, and equipped to
                      deliver five-star service—because their success is tied to
                      yours. You’re not just here to close deals — you’re
                      building a career, a life, a legacy. We help agents find
                      the company that gives them the support, tools, and
                      leadership to thrive.
                    </span>
                  </div>
                  <div className="for-agents_controls">
                    <Link
                      className="button_button-round button_color-primary"
                      href="/join"
                    >
                      <div className="button_content">
                        <div className="button_button-round-text">
                          <span data-text="Join The Movement">
                            Join The Movement
                          </span>
                        </div>
                        <span className="button_icon-after">
                          <ArrowRightIcon />
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

export default ForAgentsSection;
