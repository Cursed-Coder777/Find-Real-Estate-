"use client";

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
  neighborhoods: string[];
  saleType: string | null;
  propertyType: string | null;
  priceMin: number;
  priceMax: number;
  beds: string;
  baths: string;
};

export const EMPTY_FILTERS: Filters = {
  neighborhoods: ["Manhattan"],
  saleType: null,
  propertyType: null,
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
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const priceActive = filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX;

  /** Neighborhoods: checkbox rows, multi-select. */
  const NeighborhoodPanel = (close: () => void) => (
    <div className="check-dropdown_dropdown-content">
      {NEIGHBORHOODS.map((n) => {
        const on = filters.neighborhoods.includes(n);
        return (
          <button
            key={n}
            type="button"
            className="check-dropdown_checkbox-item"
            data-state={on ? "checked" : "unchecked"}
            aria-pressed={on}
            onClick={() =>
              set(
                "neighborhoods",
                on
                  ? filters.neighborhoods.filter((x) => x !== n)
                  : [...filters.neighborhoods, n],
              )
            }
          >
            <span className="check-dropdown_group-checkbox" aria-hidden="true" />
            <span className="check-dropdown_group-label">{n}</span>
          </button>
        );
      })}
      <button
        type="button"
        className="button_button-round button_color-primary check-dropdown_group-toggle"
        onClick={close}
      >
        <div className="button_content">
          <div className="button_button-round-text">
            <span data-text="Done">Done</span>
          </div>
        </div>
      </button>
    </div>
  );

  /** Beds & Baths: two labelled rows of data-state=on options + Reset/Done. */
  const BedsBathsPanel = (close: () => void) => {
    const stage = (key: "beds" | "baths", v: string) => set(key, v);
    return (
      <div className="beds-and-baths-dropdown_body">
        {(["beds", "baths"] as const).map((key) => (
          <div key={key} className="beds-and-baths-dropdown_options">
            <div className="beds-and-baths-dropdown_label">
              {key === "beds" ? "Beds" : "Baths"}
            </div>
            <div className="beds-and-baths-dropdown_options">
              {COUNT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="beds-and-baths-dropdown_option"
                  data-state={filters[key] === opt ? "on" : "off"}
                  aria-pressed={filters[key] === opt}
                  onClick={() => stage(key, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
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
      </div>
    );
  };

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
          placeholder="Search by address"
          aria-label="Search by address"
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