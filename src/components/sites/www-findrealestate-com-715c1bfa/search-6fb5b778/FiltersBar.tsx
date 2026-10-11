"use client";

import { useState } from "react";

import { PRICE_MAX, PRICE_MIN } from "./content";
import { FilterDropdown } from "./shared/FilterDropdown";
import { PriceRange } from "./PriceRange";

/**
 * The origin's filter bar is a 3-column grid at >=768px:
 *
 *   grid-template-columns: minmax(25rem,40rem) 1fr auto
 *                        [ search input ] [filters] [Map|List]
 *
 * so the five filters share the middle cell (`flex: 1 1` each) and the Map/List
 * toggle sits at the right edge. Below 768px `.filters-bar_content` is
 * `display:none` and the mobile sheet takes over.
 *
 * Measured trigger order and panel contents (opening each on the live origin):
 *
 *   0 Neighborhoods  select-base   check-dropdown_* checkboxes, MULTI-select
 *   1 For Sale       select-base   radio-dropdown_radio-item, single-select
 *   2 Price          dropdown-base price-dropdown_* min/max range + Reset/Done
 *   3 Residential    select-base   radio-dropdown_radio-item, single-select
 *   4 Beds & Baths   dropdown-base beds-and-baths-dropdown_option, data-state=on
 */

/** Verbatim from the live Neighborhoods panel. Note "Out of NYC", not Connecticut. */
const NEIGHBORHOODS = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
  "Nassau",
  "Suffolk",
  "Westchester",
  "New Jersey",
  "Out of NYC",
];

const SALE_TYPES = ["For Sale", "For Rent"];
const PROPERTY_TYPES = ["Residential", "Commercial"];

/** Verbatim from the live Beds & Baths panel: two rows, each Any/1+/…/5+. */
const COUNT_OPTIONS = ["Any", "1+", "2+", "3+", "4+", "5+"];

const toOptions = (labels: readonly string[]) =>
  labels.map((l) => ({ value: l, label: l }));

export type Filters = {
  /**
   * The `address` query parameter — the origin's search box. It arrives as
   * `?address=Manhattan` and is surfaced as the "Address: Manhattan" pill. It
   * is NOT the "Neighborhoods" dropdown: on the live origin that trigger still
   * reads "Neighborhoods" (its placeholder) even though address=Manhattan is
   * applied, and its panel opens with nothing checked.
   */
  address: string;
  /** the Neighborhoods multi-select, independent of `address` and empty by default */
  neighborhoods: string[];
  saleType: string | null;
  propertyType: string | null;
  priceMin: number;
  priceMax: number;
  beds: string;
  baths: string;
};

/**
 * Default filter state.
 *
 * The origin's base query is `?Type=sale&PropertyType=residential&address=Manhattan`,
 * so all THREE are already applied when /search loads — which is why the two
 * radio panels show a `data-state="checked"` row and their panels are wider than
 * an unselected one. Only `address` surfaces as a pill; For Sale and Residential
 * do not (see the pills measurement in NOTES.md).
 *
 * Defaults that match: every captured listing is "For Sale" (all 120 ZIPs are
 * 100xx/101xx, i.e. Manhattan), so applying them changes nothing about the
 * result set — it only makes the controls render as the origin's do.
 */
export const EMPTY_FILTERS: Filters = {
  address: "Manhattan",
  neighborhoods: [],
  saleType: "For Sale",
  propertyType: "Residential",
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  beds: "Any",
  baths: "Any",
};

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  view: "split" | "list";
  onViewChange: (view: "split" | "list") => void;
};

export function FiltersBar({ filters, onChange, view, onViewChange }: Props) {
  const [query, setQuery] = useState("");

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const priceActive = filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX;

  /**
   * Neighborhoods: checkbox rows, multi-select.
   *
   * `.check-dropdown_checkbox-item` is the 2.4rem tick BOX, not the row — the
   * row is `.check-dropdown_group-item` (flex, min-height 40px, padding
   * 1.35rem 0 1.35rem 3rem) wrapped in `.check-dropdown_group-row`. The box is
   * a span here because putting a <button> inside the row <button> would be
   * invalid HTML; the styling is element-agnostic.
   */
  const NeighborhoodPanel = (close: () => void) => (
    <>
      {/* `.select-base_content` caps at `max-height:25rem` (187.5px), but ten
          borough rows need ~455px. The origin scrolls them inside a viewport —
          measured 252x156 inside the 254x188 panel — and that viewport is also
          why `.check-dropdown_search` is `position:sticky`, which only does
          anything inside a scroll container. Without it the rows spill past the
          white panel onto the map behind it.

          25rem minus the panel's `padding:2rem 0` (4rem of vertical padding)
          = 21rem = 157.5px, which matches the measured 156px viewport.

          `data-lenis-prevent-wheel` is the attribute Lenis checks for before it
          calls preventDefault() (see its onWheel handler). Without it Lenis
          swallows the wheel and the page scrolls instead of these rows; with
          it, Lenis returns early and the rows scroll natively. */}
      <div
        data-lenis-prevent-wheel
        style={{ overflowY: "auto", maxHeight: "calc(25rem - 4rem)" }}
      >
        <div className="check-dropdown_search">
        <div className="text-input_input-wrapper">
          <input
            className="text-input_input"
            type="text"
            placeholder="Search neighborhoods"
            aria-label="Search neighborhoods"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="text-input_icon-after" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="1.8rem" height="1.8rem" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="m16.5 16.5 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>
      </div>

      {NEIGHBORHOODS.filter((n) =>
        n.toLowerCase().includes(query.trim().toLowerCase()),
      ).map((n) => {
        const on = filters.neighborhoods.includes(n);
        return (
          <div className="check-dropdown_group-row" key={n}>
            <button
              type="button"
              className="check-dropdown_group-item"
              role="option"
              aria-selected={on}
              aria-checked={on}
              onClick={() =>
                set(
                  "neighborhoods",
                  on
                    ? filters.neighborhoods.filter((x) => x !== n)
                    : [...filters.neighborhoods, n],
                )
              }
            >
              <span className="check-dropdown_group-checkbox" aria-hidden="true">
                <span
                  className="check-dropdown_checkbox-item"
                  data-state={on ? "checked" : "unchecked"}
                />
              </span>
              <span className="check-dropdown_group-label">{n}</span>
            </button>
          </div>
        );
      })}
      </div>
      <div className="price-dropdown_actions">
        <button
          type="button"
          className="button_button-round button_color-primary"
          onClick={close}
        >
          <div className="button_content">
            <div className="button_button-round-text">
              <span data-text="Done">Done</span>
            </div>
          </div>
        </button>
      </div>
    </>
  );

  /**
   * Beds & Baths: two labelled rows of data-state=on options + Reset/Done.
   *
   * Measured structure — note the UNCLASSED wrapper div around each
   * label+options pair, and that `.beds-and-baths-dropdown_body` carries
   * `gap:3rem`, which is where most of the panel's height comes from:
   *
   *   div.beds-and-baths-dropdown_body        flex column, gap 3rem  -> 177px
   *     div                                     (unclassed, 360x77)
   *       div.beds-and-baths-dropdown_label    "Beds",  margin-bottom 2rem
   *       div.beds-and-baths-dropdown_options   flex, children flex:1 1
   *         button.beds-and-baths-dropdown_option  x6   (60x42)
   *     div                                     (unclassed, 360x77)  <- Baths
   *   div.beds-and-baths-dropdown_actions      SIBLING of _body, not a child
   *
   * `_actions` carries its own `margin-top:3rem`. Nesting it inside `_body`
   * adds a SECOND 3rem gap on top of that, which made the panel 23px too tall.
   */
  const BedsBathsPanel = (close: () => void) => (
    <>
      <div className="beds-and-baths-dropdown_body">
        {(["beds", "baths"] as const).map((key) => (
          <div key={key}>
            <div className="beds-and-baths-dropdown_label">
              {key === "beds" ? "Beds" : "Baths"}
            </div>
            <div className="beds-and-baths-dropdown_options">
              {COUNT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={filters[key] === opt}
                  className="beds-and-baths-dropdown_option"
                  data-state={filters[key] === opt ? "on" : "off"}
                  onClick={() => set(key, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="beds-and-baths-dropdown_actions">
        <button
          type="button"
          className="button_button-round button_color-secondary"
          onClick={() => onChange({ ...filters, beds: "Any", baths: "Any" })}
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
          onClick={close}
        >
          <div className="button_content">
            <div className="button_button-round-text">
              <span data-text="Done">Done</span>
            </div>
          </div>
        </button>
      </div>
    </>
  );

  // The origin shows the placeholder until a borough is actually picked, so the
  // label must NOT fall back to `address`.
  const neighborhoodLabel: string | null =
    filters.neighborhoods.length === 1
      ? (filters.neighborhoods[0] ?? null)
      : filters.neighborhoods.length > 1
        ? `${filters.neighborhoods.length} Neighborhoods`
        : null;

  return (
    <div className="filters-bar_content">
      <div className="text-input_input-wrapper">
        <input
          className="text-input_input"
          type="text"
          value={filters.address}
          placeholder="Property address or agent name/email"
          aria-label="Search by address"
          onChange={(e) => set("address", e.target.value)}
        />
      </div>

      <div className="filters-bar_filters">
        <FilterDropdown
          ns="select-base"
          label="Neighborhoods"
          options={toOptions(NEIGHBORHOODS)}
          value={neighborhoodLabel}
          onChange={(v) => set("neighborhoods", v ? [v] : [])}
        >
          {NeighborhoodPanel}
        </FilterDropdown>

        <FilterDropdown
          ns="select-base"
          label="For Sale"
          options={toOptions(SALE_TYPES)}
          value={filters.saleType}
          onChange={(v) => set("saleType", v)}
        />

        <FilterDropdown
          ns="dropdown-base"
          label="Price"
          options={[]}
          value={priceActive ? "Price" : null}
        >
          {(close) => (
            <PriceRange
              min={filters.priceMin}
              max={filters.priceMax}
              onApply={(lo, hi) => {
                set("priceMin", lo);
                set("priceMax", hi);
                close();
              }}
            />
          )}
        </FilterDropdown>

        <FilterDropdown
          ns="select-base"
          label="Residential"
          options={toOptions(PROPERTY_TYPES)}
          value={filters.propertyType}
          onChange={(v) => set("propertyType", v)}
        />

        <FilterDropdown
          ns="dropdown-base"
          label="Beds & Baths"
          options={[]}
          value={
            filters.beds !== "Any" || filters.baths !== "Any"
              ? "Beds & Baths"
              : null
          }
        >
          {BedsBathsPanel}
        </FilterDropdown>
      </div>

      <div className="filters-bar_options" role="group" aria-label="View">
        <div
          role="radio"
          aria-checked={view === "split"}
          data-state={view === "split" ? "on" : "off"}
          className="filters-bar_option"
          onClick={() => onViewChange("split")}
        >
          Map
        </div>
        <div
          role="radio"
          aria-checked={view === "list"}
          data-state={view === "list" ? "on" : "off"}
          className="filters-bar_option"
          onClick={() => onViewChange("list")}
        >
          List
        </div>
      </div>
    </div>
  );
}

export default FiltersBar;