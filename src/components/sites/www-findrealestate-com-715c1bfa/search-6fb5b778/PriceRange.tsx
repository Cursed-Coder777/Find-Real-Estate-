"use client";

import { useState } from "react";

/**
 * Price filter — measured on the live origin, NOT the banded list I first
 * assumed. Opening `.dropdown-base_trigger` labelled "Price" gives:
 *
 *   dropdown-base_content                 413x238
 *     div.price-dropdown_label            "Price"
 *     span.price-dropdown_slider-range
 *     span.price-dropdown_slider-thumb    x2
 *     div "$750"          div "$50M"     min / max readouts
 *     input.number-input_input            val "750"         172x42
 *     input.number-input_input            val "50,000,000"  172x42
 *     button "Reset" 89x40   button "Done" 87x40
 *
 * So it is a min/max numeric range with a visual slider, and the two numeric
 * fields are `.number-input_input` (hence `number-input.css` is installed).
 *
 * The origin stages edits locally and only commits them on "Done"; "Reset"
 * restores the full range. Both are reproduced.
 *
 * The slider is presentational: the two number inputs are the real controls, so
 * the range can be typed as well as dragged.
 */

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const parse = (s: string) => {
  const digits = String(s).replace(/[^0-9]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
};

type Props = {
  min: number;
  max: number;
  onApply: (min: number, max: number) => void;
};

export function PriceRange({ min, max, onApply }: Props) {
  // staged locally; only pushed to the parent on "Done"
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);

  const span = Math.max(1, max - min);
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((hi - min) / span) * 100;

  return (
    <div className="price-dropdown_body">
      <div className="price-dropdown_label">Price</div>

      <div className="price-dropdown_slider">
        <span
          className="price-dropdown_slider-range"
          style={{ left: `${loPct}%`, width: `${Math.max(0, hiPct - loPct)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
        />
      </div>

      <div className="price-dropdown_price-range">
        <div>{fmt(min)}</div>
        <div>{fmt(max)}</div>
      </div>

      <div className="price-dropdown_inputs">
        <div className="price-dropdown_input-wrapper">
          <input
            className="number-input_input price-dropdown_input"
            type="text"
            inputMode="numeric"
            aria-label="Minimum price"
            value={lo.toLocaleString("en-US")}
            onChange={(e) => {
              const v = parse(e.target.value);
              if (v != null) setLo(Math.min(v, hi));
            }}
          />
        </div>
        <div className="price-dropdown_input-wrapper">
          <input
            className="number-input_input price-dropdown_input"
            type="text"
            inputMode="numeric"
            aria-label="Maximum price"
            value={hi.toLocaleString("en-US")}
            onChange={(e) => {
              const v = parse(e.target.value);
              if (v != null) setHi(Math.max(v, lo));
            }}
          />
        </div>
      </div>

      <div className="price-dropdown_actions">
        <button
          type="button"
          className="button_button-round button_color-secondary"
          onClick={() => {
            setLo(min);
            setHi(max);
          }}
        >
          <div className="button_content">
            <div className="button_button-round-text">
              <span data-text="Reset">Reset</span>
            </div>
          </div>
        </button>
        <button
          type="button"
          className="button_button-round button_color-primary"
          onClick={() => onApply(lo, hi)}
        >
          <div className="button_content">
            <div className="button_button-round-text">
              <span data-text="Done">Done</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default PriceRange;