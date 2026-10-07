import Link from "next/link";

import { DISCLAIMER_LOGOS, DISCLAIMER_PARAGRAPHS, LISTING_ROWS } from "./content";

/**
 * Property discovery: three city rows of listing cards, each row repeating the
 * MLS disclaimer for its data source.
 */
export function ListingDiscoverySection() {
  return (
    <div className="listing-discovery_home">
      <div className="container_container">
        {LISTING_ROWS.map((row) => (
          <section
            key={row.heading}
            className="listing-discovery_row"
            aria-label={row.heading}
          >
            <div className="listing-discovery_heading">
              <h2>{row.heading}</h2>
              <Link href={row.seeAllHref}>{row.seeAll}</Link>
            </div>

            <ul className="listing-discovery_cards">
              {row.listings.map((listing) => (
                <li key={listing.href}>
                  <Link className="listing-discovery_card" href={listing.href}>
                    <div className="listing-discovery_image">
                      <img
                        src={listing.image}
                        alt={listing.alt}
                        loading="lazy"
                      />
                    </div>
                    <div className="listing-discovery_body">
                      <p className="listing-discovery_price">{listing.price}</p>
                      <p>{listing.meta}</p>
                      <h3>{listing.address}</h3>
                      <p>{listing.neighborhood}</p>
                      {listing.logoSrc ? (
                        <img
                          className="listing-discovery_logo"
                          src={listing.logoSrc}
                          alt="Listing data source"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <section
              className="listings-disclaimer_disclaimer"
              aria-label="Listing data disclaimer"
            >
              <div className="listings-disclaimer_logos">
                {DISCLAIMER_LOGOS.map((logo) => (
                  <img
                    key={logo.alt}
                    className="listings-disclaimer_logo"
                    src={logo.src}
                    alt={logo.alt}
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="listings-disclaimer_text">
                {DISCLAIMER_PARAGRAPHS.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </section>
          </section>
        ))}
      </div>
    </div>
  );
}

export default ListingDiscoverySection;
