import Link from "next/link";
import { Fragment } from "react";

import { FEATURES } from "./content";
import { ArrowRightIcon } from "./shared/icons";
import { HighlightLines } from "./shared/HighlightLines";
import { RevealGroup } from "./shared/RevealGroup";

/**
 * "Support Beyond Buying and Selling" (section 8) — dark grid of three image
 * cards. On fine pointers the grid columns flex toward the hovered card and
 * the description fades in (pure CSS `:hover` rules ported with the module).
 */
export function FeaturesSection() {
  return (
    <section className="features_root">
      <div className="container_container">
        <div className="features_grid">
          <div>
            <HighlightLines
              className="features_title"
              label="Support Beyond Buying and Selling"
              tone="dark"
              lines={[
                <Fragment key="line-0">
                  <h2>
                    <div>Support</div>
                    <div>
                      Beyond <span className="em">Buying</span>
                    </div>
                    <div>
                      <span className="em">and Selling</span>
                    </div>
                  </h2>
                </Fragment>,
              ]}
            />
          </div>
          <div>
            <div className="features_text">
              <p>
                The real estate market never stands still — and neither do we.{" "}
                <span className="em">
                  Our experts offer continued support beyond the sale, helping
                  you maximize your investment.
                </span>
              </p>
            </div>
            <div className="features_actions">
              <div>
                <Link
                  className="button_button-round button_color-primary button_inversed"
                  href="/services"
                >
                  <div className="button_content">
                    <div className="button_button-round-text">
                      <span data-text="Discover Our Services">
                        Discover Our Services
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

        <RevealGroup
          itemSelector=".features_item"
          fromY={32}
          stagger={0.1}
          className="features_items"
        >
          {FEATURES.map((feature) => (
            <div key={feature.title} className="features_item">
              <div className="features_item-bg">
                <img
                  src={feature.image}
                  alt={feature.title}
                  width={1107}
                  height={940}
                  loading="lazy"
                />
              </div>
              <div className="features_item-title">
                <h3>{feature.title}</h3>
              </div>
              <div className="features_item-text">
                <p>{feature.text}</p>
              </div>
              <div className="features_item-more">
                <Link
                  className="button_button-round button_color-secondary button_inversed"
                  href="/services"
                >
                  <div className="button_content">
                    <div className="button_button-round-text">
                      <span data-text="Learn More">Learn More</span>
                    </div>
                    <span className="button_icon-after">
                      <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export default FeaturesSection;
