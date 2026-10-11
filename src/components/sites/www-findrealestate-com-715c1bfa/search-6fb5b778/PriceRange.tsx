"use client";

import { useState } from "react";

/**
 * Price filter — measured on the live origin, NOT the banded list I first
 * assumed. Opening `.dropdown-base_trigger` labelled "Price" gives:
 *
 *   dropdown-base_content                 413x238
 *     div.price-dropdown_body              (flex column)
 *       div.price-dropdown_label          "Price"
 *       span.price-dropdown_slider-range  (absolutely positioned track)
 *       span.price-dropdown_slider-thumb  x2
 *       div.price-dropdown_price-range    "$750"  "$50M"
 *       div.price-dropdown_inputs
 *         input.number-input_input.price-dropdown_input   val "750"         172x42
 *         input.number-input_input.price-dropdown_input   val "50,000,000"  172x42
 *       div.price-dropdown_actions         (flex, end, gap 1.2rem, mt 3rem)
 *         button "Reset" 89x40   button "Done" 87x40
 *
 * The track and thumbs are positioned against a wrapper that carries
 * `position:relative` inline — the origin's stylesheet declares no such class,
 * so an invented class name would silently get no positioning context and the
 * absolutely-positioned track would collapse.
 *
 * The origin stages edits locally and only commits on "Done"; "Reset" restores
 * the full range. Both are reproduced. The two number inputs are the real
 * controls, so the range can be typed as well as dragged.
 */

/**
 * Half the slider thumb. The origin's `.price-dropdown_slider-thumb` measures
 * 18x18 (2.4rem), so each absolutely-positioned wrapper is offset by -9 to
 * centre it on its percentage stop.
 */
const THUMB_HALF = 9;

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

      {/* The origin's own classes: _slider-root (relative flex) > _slider-track
          (3px, #f1f1f1) > _slider-range (absolute) + _slider-thumb (2.4rem
          rounded rect, white with a 2px #151717 border, radius 10px).
          Measured: root 366x3, track 366x3, thumb 18x18. */}
      <div className="price-dropdown_slider-root">
        <div className="price-dropdown_slider-track">
          <div
            className="price-dropdown_slider-range"
            style={{
              left: `${loPct}%`,
              width: `${Math.max(0, hiPct - loPct)}%`,
            }}
          />
          <span
            style={{
              position: "absolute",
              left: `${loPct}%`,
              marginLeft: -THUMB_HALF,
            }}
          >
            <span className="price-dropdown_slider-thumb" />
          </span>
          <span
            style={{
              position: "absolute",
              left: `${hiPct}%`,
              marginLeft: -THUMB_HALF,
            }}
          >
            <span className="price-dropdown_slider-thumb" />
          </span>
        </div>
        {/* two transparent range inputs stacked on the track: the real controls */}
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: 18,
            margin: 0,
            opacity: 0,
            cursor: "pointer",
          }}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: 18,
            margin: 0,
            opacity: 0,
            cursor: "pointer",
          }}
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