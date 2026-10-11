"use client";

import Link from "next/link";
import { useState } from "react";

import type { Listing } from "./content";

/**
 * Listing card, matching the origin's markup contract:
 *
 *   div.listing-card_container
 *     a                                  <- the whole card links to /properties/:id
 *       div.hover-gallery_hover-gallery
 *         div.swiper > div.swiper-wrapper.hover-gallery_slider-wrapper
 *           div.swiper-slide.hover-gallery_slide
 *             div.hover-gallery_gallery-image > div.image_container > img.image_image
 *       div.listing-card_body
 *         h2.listing-card_title
 *         div.listing-card_amenities > span...
 *         div.listing-card_address
 *     div.listing-card_actions > button.button_icon-button x2
 *
 * Three details that are easy to get wrong, all measured against the live
 * origin rather than assumed:
 *
 * 1. The gallery is a real Swiper. `swiper`'s CSS already ships in
 *    src/styles/find/base.css, and the origin renders EVERY photo as a slide
 *    (12 cards x ~6 photos + logos = the 102 <img> the origin carries). This
 *    reproduces that with a transform on `.swiper-wrapper` instead of pulling
 *    in @swiper/react, which is not a dependency.
 *
 * 2. `.hover-gallery_dots` is NOT absolutely positioned — it is a flow element
 *    (`padding:.65rem 0; margin:auto 0 2rem`) that sits *below* the slider. The
 *    origin mounts it only on hover: at rest the wrapper's only child is the
 *    single `div.swiper`, and the wrapper measures 306x158. Rendering the dots
 *    unconditionally makes the card 30px taller than the origin.
 *
 * 3. The gallery's height comes from `.hover-gallery_gallery-image > div` with
 *    `aspect-ratio: var(--aspect-ratio)`, and `--aspect-ratio: 388/200` is
 *    declared on the *parent*. `.listing-card_hover-gallery`'s own
 *    `aspect-ratio: 442/260` is not on the origin's card (measured
 *    `aspect-ratio: auto`), so it must not be applied here.
 */

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="2rem" height="2rem" fill="none" aria-hidden="true">
      <path
        d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 1 1 19.4 13Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="2rem" height="2rem" fill="none" aria-hidden="true">
      <path
        d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const images = listing.images;
  const rest = images.length - 1;

  return (
    <div className="listing-card_container">
      <Link href={listing.href} aria-label={listing.address}>
        <div
          className="hover-gallery_hover-gallery"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="swiper swiper-initialized swiper-horizontal">
            <div
              className="swiper-wrapper hover-gallery_slider-wrapper"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {images.map((src, i) => (
                <div
                  key={src}
                  className={
                    i === active
                      ? "swiper-slide swiper-slide-active hover-gallery_slide"
                      : "swiper-slide hover-gallery_slide"
                  }
                >
                  <div className="hover-gallery_gallery-image">
                    <div className="image_container image_loaded">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="image_image"
                        src={src}
                        alt={listing.address}
                        loading="lazy"
                        width={388}
                        height={200}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {listing.dataSourceLogo ? (
              <div className="hover-gallery_data-source-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="hover-gallery_data-source-logo-image"
                  src={listing.dataSourceLogo}
                  alt=""
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* Measured: absent until the card is hovered. */}
            {hovered && images.length > 1 ? (
              <div className="hover-gallery_dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show photo ${i + 1}`}
                    className={
                      i === active
                        ? "hover-gallery_dot hover-gallery_active"
                        : "hover-gallery_dot"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      setActive(i);
                    }}
                  />
                ))}
                <div className="hover-gallery_show-more">
                  <div className="hover-gallery_show-more-content">
                    <span className="hover-gallery_rest-count">+{rest} more</span>
                    <span>View gallery</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="listing-card_body">
          <h2 className="listing-card_title">{listing.price}</h2>
          <div className="listing-card_amenities">
            {listing.amenities.map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
          <div className="listing-card_address">{listing.address}</div>
        </div>
      </Link>

      <div className="listing-card_actions">
        <button
          type="button"
          className="button_icon-button button_color-secondary button_inversed"
          aria-label={`Save ${listing.address}`}
        >
          <div className="button_content">
            <div className="button_content-icon">
              <HeartIcon />
            </div>
          </div>
        </button>
        <button
          type="button"
          className="button_icon-button button_color-secondary button_inversed"
          aria-label={`Share ${listing.address}`}
        >
          <div className="button_content">
            <div className="button_content-icon">
              <ShareIcon />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default ListingCard;