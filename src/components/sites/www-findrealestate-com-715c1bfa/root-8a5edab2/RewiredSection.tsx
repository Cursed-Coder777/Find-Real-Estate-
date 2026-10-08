import Link from "next/link";
import { Fragment } from "react";

import { HighlightLines } from "./shared/HighlightLines";
import { ArrowRightIcon } from "./shared/icons";
import { RevealGroup } from "./shared/RevealGroup";

const STEPS = [
  {
    index: "01",
    title: "Talk to a Real Human. ",
    em: "We match you with an expert who actually listens.",
  },
  {
    index: "02",
    title: "Get Clarity. ",
    em: "We define what you really need, not just what’s available.",
  },
  {
    index: "03",
    title: "Move Forward. ",
    em: "We find what fits — and make it happen.",
  },
];

/** Asymmetric two-column copy: heading + CTA on the left, numbered steps right. */
export function RewiredSection() {
  return (
    <section>
      <div className="rewired_wrapper">
        <div className="container_container">
          <div className="assymetric-cols_row">
            <div className="assymetric-cols_col">
              <div className="rewired_left-col">
                <HighlightLines
                  label="Real Estate,Rewired."
                  tone="light"
                  lines={[
                    <Fragment key="line-0">
                      <h2 className="rewired_title">
                        <div>Real Estate,</div>
                        <div className="em">Rewired.</div>
                      </h2>
                    </Fragment>,
                  ]}
                />
                <Link
                  className="button_button-round button_color-primary"
                  href="/search"
                >
                  <div className="button_content">
                    <div className="button_button-round-text">
                      <span data-text="Start Your Search">
                        Start Your Search
                      </span>
                    </div>
                    <span className="button_icon-after">
                      <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="assymetric-cols_col">
              <div>
                <div className="rewired_label">Steps:</div>
                <RevealGroup
                  itemSelector=".rewired_list-item"
                  fromY={70}
                  duration={1.7}
                  opacityDuration={0.1}
                  ease="expo.out"
                >
                  {STEPS.map((step) => (
                    <div
                      key={step.index}
                      className="rewired_list-item"
                      data-index={step.index}
                    >
                      <span>
                        {step.title}
                        <span className="em">{step.em}</span>
                      </span>
                    </div>
                  ))}
                </RevealGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RewiredSection;
