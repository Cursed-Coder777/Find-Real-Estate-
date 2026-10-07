import { Fragment } from "react";

import { ASSET_ROOT } from "./data";
import { HighlightLines } from "./shared/HighlightLines";
import { RevealGroup } from "./shared/RevealGroup";

const IMG = `${ASSET_ROOT}/images`;

const ARROW_IMAGES = [
  "1.e7a1ff18.jpg",
  "2.58bf2fb8.jpg",
  "3.483e04ae.jpg",
  "4.ea5fa732.jpg",
];

/**
 * Full-bleed ribbon of four masked arrow images.
 *
 * Each `.arrows-section_arrow` is masked into an arrow silhouette by the
 * origin's CSS and revealed left-to-right: measured inline opacities were
 * 1 / 0.506 / 0.1 / 0.1 with the first arrow already fully in, i.e. a
 * staggered fade along the row.
 */
export function ArrowsSection() {
  return (
    <section className="arrows-section_root">
      <div className="container_container">
        <HighlightLines
          className="arrows-section_title"
          label="This isn’t just about real estate."
          tone="light"
          lines={[
            <Fragment key="line-0">
              <h2>This isn’t just <span className="em">about real estate.</span></h2>
            </Fragment>,
          ]}
        />

        <RevealGroup
          className="arrows-section_arrows"
          itemSelector=".arrows-section_arrow"
          fromOpacity={0.1}
          fromY={0}
          stagger={0.12}
          duration={0.9}
        >
          {ARROW_IMAGES.map((file) => (
            <div key={file} className="arrows-section_arrow">
              <img src={`${IMG}/${file}`} alt="" width={692} height={880} loading="lazy" />
            </div>
          ))}
        </RevealGroup>

        <div className="arrows-section_text">
          <p>
            It’s about identity. Progress. Getting unstuck. You’re not just
            looking for a place.{" "}
            <span className="em">
              You’re looking for alignment. That’s what we help you find.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default ArrowsSection;
