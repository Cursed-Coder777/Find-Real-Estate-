import Link from "next/link";
import { Fragment } from "react";

import { SERVICES, SERVICES_BRIEF } from "./content";
import { ArrowSlantIcon } from "./shared/icons";
import { HighlightLines } from "./shared/HighlightLines";
import { RevealGroup } from "./shared/RevealGroup";

/**
 * Services (section 7) — dark full-bleed rows.
 *
 * Each row is a button-sized band with a background image that wipes in on
 * hover (pure CSS: `clip-path` + `opacity` + slow `transform`), a counter
 * number (CSS `counter(item-num)` on `.services_item-num:before`) and an
 * oversized service label with a slanted arrow. The origin opens a contact
 * dialog from each row; the clone routes to `/services` like the other
 * dialog CTAs on the page.
 */
export function ServicesSection() {
  return (
    <section className="services_root">
      <div className="container_container">
        <div className="services_hgrid">
          <div className="services_hgrid-col">
            <div className="services_caption">Services</div>
          </div>
          <div className="services_hgrid-col">
            <HighlightLines
              className="services_title"
              label="How FIND Can Help You"
              tone="dark"
              lines={[
                <Fragment key="line-0">
                  <h2>
                    <div>How FIND</div>
                    <div>
                      <span className="em">Can Help You</span>
                    </div>
                  </h2>
                </Fragment>,
              ]}
            />
          </div>
        </div>
      </div>

      <div className="services_items">
        {SERVICES.map((service) => (
          <Link key={service.label} className="services_item" href="/services">
            <div className="container_container">
              <div className="services_item-bg">
                <img src={service.image} alt="" loading="lazy" />
              </div>
              <div className="services_item-num" />
              <div className="services_item-text">
                <h3>{service.text}</h3>
              </div>
              <div className="services_item-more">
                <span>{service.label}</span>
                <ArrowSlantIcon />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="container_container">
        <HighlightLines
          className="services_brief"
          label={SERVICES_BRIEF}
          tone="dark"
          lines={[
            <Fragment key="line-0">Our certified agents guide you through&nbsp;</Fragment>,
            <Fragment key="line-1">
              every stage of real estate{" "}
              <span className="em">with expert&nbsp;</span>
            </Fragment>,
            <Fragment key="line-2">
              <span className="em">knowledge and reliable support.</span>
            </Fragment>,
          ]}
        />
        <RevealGroup
          itemSelector="[data-reveal]"
          fromY={24}
          className="services_action"
        >
          <div data-reveal="">
            <Link
              className="button_button-round button_color-secondary button_inversed"
              href="/services"
            >
              <div className="button_content">
                <div className="button_button-round-text">
                  <span data-text="Get Started with FIND">
                    Get Started with FIND
                  </span>
                </div>
                <span className="button_icon-after">
                  <ArrowSlantIcon />
                </span>
              </div>
            </Link>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}

export default ServicesSection;
