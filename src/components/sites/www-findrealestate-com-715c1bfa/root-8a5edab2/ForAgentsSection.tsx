import Link from "next/link";
import { Fragment } from "react";

import { ASSET_ROOT } from "./data";
import { ArrowRightIcon } from "./shared/icons";
import { ClipReveal } from "./shared/ClipReveal";
import { HighlightLines } from "./shared/HighlightLines";

const IMG = `${ASSET_ROOT}/images`;

/**
 * "For Agents" — asymmetric image split (section 5).
 *
 * Left column (hidden on mobile): caption + narrow portrait image. Right
 * column: big heading, full-bleed-ish image, paragraph and CTA.
 *
 * Entry animation, measured on the live site: neither image fades. Both are
 * held at `visibility: hidden` by the origin's `SlidingImage` until the
 * underlying `<img>` has decoded, then each is wiped open with a clip path —
 * the large right-hand image opens left-to-right, the small portrait opens
 * top-to-bottom (2s, `power4.out`, clip cleared afterwards). The text and CTA
 * blocks around them have no entrance animation at all, so an earlier revision's
 * `RevealGroup` fade-up over `[data-reveal]` has been removed.
 */
export function ForAgentsSection() {
  return (
    <section>
      <div className="for-agents_wrapper">
        <div className="container_container">
          <div className="assymetric-cols_row">
            <div className="assymetric-cols_col assymetric-cols_hide-left-col-on-mobile">
              <div className="assymetric-image-split_label">For Agents</div>
              <ClipReveal
                as="div"
                className="assymetric-image-split_small-img"
                axis="y"
                hideUntilImageLoads
              >
                <img src={`${IMG}/1.f6e8f2e8.jpg`} alt="" loading="lazy" />
              </ClipReveal>
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

                <ClipReveal
                  as="div"
                  className="assymetric-image-split_image"
                  axis="x"
                  hideUntilImageLoads
                >
                  <img
                    src={`${IMG}/2.41633fa6.jpg`}
                    alt=""
                    loading="lazy"
                  />
                </ClipReveal>

                <div>
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
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForAgentsSection;