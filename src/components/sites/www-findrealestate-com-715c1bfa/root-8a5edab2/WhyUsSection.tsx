import { Fragment } from "react";

import { ASSET_ROOT } from "./data";
import { HighlightLines } from "./shared/HighlightLines";

/**
 * "Why FIND" — a text grid plus an autoplaying, looping, muted product video.
 * The video is time-driven; nothing in this section reacts to scroll.
 */
export function WhyUsSection() {
  return (
    <section className="why-us_root">
      <div className="container_container">
        <div className="why-us_grid">
          <div className="why-us_title">
            <h2>Why FIND</h2>
          </div>

          <HighlightLines
            className="why-us_text"
            label="Your life’s changing. Don’t just find a place — find what’s next. We help you move forward with clarity, confidence, and the right agent by your side."
            tone="light"
            lines={[
              <Fragment key="line-0">Your life’s changing. Don’t just find a&nbsp;</Fragment>,
              <Fragment key="line-1">
                place — find what’s next.
                <span className="em">We help you&nbsp;</span>
              </Fragment>,
              <Fragment key="line-2">
                <span className="em">
                  move forward with clarity, confidence,&nbsp;
                </span>
              </Fragment>,
              <Fragment key="line-3">
                <span className="em">and the right agent by your side.</span>
              </Fragment>,
            ]}
          />
        </div>

        <div className="why-us_preview">
          <video
            src={`${ASSET_ROOT}/video/why-us.mp4`}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>
      </div>
    </section>
  );
}

export default WhyUsSection;
