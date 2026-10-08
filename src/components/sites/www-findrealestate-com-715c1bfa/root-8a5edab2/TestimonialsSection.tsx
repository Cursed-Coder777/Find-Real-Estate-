"use client";

import { Fragment } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { TESTIMONIALS } from "./content";
import { ASSET_ROOT } from "./data";
import { ClipReveal } from "./shared/ClipReveal";
import { HighlightLines } from "./shared/HighlightLines";

const IMG = `${ASSET_ROOT}/images`;

/**
 * Testimonials (section 6) — Swiper carousel of client quotes with numbered
 * pagination bullets (the numbers come from CSS counters on the bullets) plus
 * a preview image column that sits first on desktop (`order: -1`).
 *
 * Interaction model: click-driven pagination; no autoplay in the origin.
 *
 * The preview image reveals with a clip-path wipe *top to bottom*
 * (`inset(0 100% 0 0)` -> `inset(0 0 0 0)`, 2s, `power4.out`) rather than a
 * fade — measured on the live site, see `shared/ClipReveal`.
 */
export function TestimonialsSection() {
  return (
    <section className="testimonials_root">
      <div className="container_container">
        <HighlightLines
          className="testimonials_title"
          label="Don’t Take Our Word for It."
          tone="muted"
          lines={[
            <Fragment key="line-0">
              <h2>
                Don’t Take <span className="em">Our Word for It.</span>
              </h2>
            </Fragment>,
          ]}
        />

        <div className="testimonials_grid">
          <div className="testimonials_grid-col">
            <div className="testimonials_divider" />

            <div className="testimonials_carousel">
              <Swiper
                modules={[Pagination]}
                slidesPerView={1}
                pagination={{ clickable: true }}
                a11y
              >
                {TESTIMONIALS.map((testimonial) => (
                  <SwiperSlide key={testimonial.author}>
                    <div className="testimonials_quote">
                      <p>{testimonial.quote}</p>
                    </div>
                    <div className="testimonials_info">
                      <div className="testimonials_author">
                        {testimonial.author}
                      </div>
                      <div className="testimonials_separator">/</div>
                      <div className="testimonials_rating" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <div className="testimonials_grid-col">
          <ClipReveal as="div" className="testimonials_preview" axis="y">
            <img
              src={`${IMG}/1.52131ac7.jpg`}
              alt=""
              width={976}
              height={688}
              loading="lazy"
            />
          </ClipReveal>
        </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
