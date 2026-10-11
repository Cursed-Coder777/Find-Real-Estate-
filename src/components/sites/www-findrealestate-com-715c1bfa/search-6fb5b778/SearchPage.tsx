"use client";

import { useMemo, useState } from "react";

import {
  LISTINGS,
  ORIGIN_RESULT_COUNT,
  PRICE_MAX,
  PRICE_MIN,
  threshold,
  type Listing,
} from "./content";
import { EMPTY_FILTERS, FiltersBar, type Filters } from "./FiltersBar";
import { ListingCard } from "./ListingCard";
import { MapPane } from "./MapPane";
import { Pagination } from "./Pagination";
import { ChevronDownIcon } from "../root-8a5edab2/shared/icons";

/**
 * /search — assembled in the origin's structure:
 *
 *   main
 *     div.property-listing-page_filters-container   (sticky, holds FiltersBar)
 *     div.property-listing-page_content             (grid rows: auto 1fr)
 *       div.property-listing-page_bound
 *         div.property-listing-page_controls        (sticky, map + list)
 *           div.property-listing-page_map-container -> MapPane
 *       div.property-listing-page_listing-container
 *         div.list-view_content
 *           div.list-view_list-header   (active filters / count / sort)
 *           div.list-view_list          (.list-view_split when the map is shown)
 *           div.list-view_pagination-container
 *
 * The Map/List toggle in the filter bar is not cosmetic on the origin — it
 * swaps `property-listing-page_split-view` for `property-listing-page_list-view`
 * on `.property-listing-page_content`, which is what hides the map pane and
 * widens the list. Same mechanism here.
 *
 * Filters, sort and pagination are REAL: they run over the captured listing
 * array in the browser. There is no dependency on the origin's private API, so
 * the controls behave correctly but the result set is capped at what was
 * captured (the origin advertises its own larger count in the header, verbatim).
 */

const PER_PAGE = 12;

/**
 * Sort options, read out of the live `sort-by` panel verbatim:
 *   Newest | Oldest | Price Low to High | Price High to Low
 * (My first pass guessed "Price: Low to High" — the origin has no colon.)
 *
 * The capture has no listing date field, so "Newest"/"Oldest" fall back to
 * capture order, which is the order the origin served them in — page 1 first.
 * That is honest about the limit rather than inventing a date.
 */
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price Low to High" },
  { value: "price-desc", label: "Price High to Low" },
] as const;
type SortValue = (typeof SORTS)[number]["value"];

function applyFilters(all: Listing[], f: Filters): Listing[] {
  const bedMin = threshold(f.beds);
  const bathMin = threshold(f.baths);
  return all.filter((l) => {
    if (f.neighborhoods.length) {
      // "Neighborhoods" is a geographic multi-select on the origin, not a text
      // match: it defaults to Manhattan, yet none of the captured addresses
      // contain the word. Match the ZIP-derived borough, and fall back to a text
      // match so an address typed into the search box still finds its card.
      const hit = f.neighborhoods.some(
        (n) =>
          l.borough === n || l.address.toLowerCase().includes(n.toLowerCase()),
      );
      if (!hit) return false;
    }
    if (f.saleType && l.status !== f.saleType) return false;
    if (f.propertyType) {
      // The capture is the origin's default "Residential" result set, so the
      // Commercial branch has no rows to show — filtered out rather than faked.
      if (f.propertyType === "Commercial") return false;
    }
    // Price is a min/max range on the origin, not a set of bands.
    if (l.priceValue == null) return false;
    if (l.priceValue < f.priceMin || l.priceValue > f.priceMax) return false;
    if (bedMin != null && (l.beds ?? 0) < bedMin) return false;
    if (bathMin != null && (l.baths ?? 0) < bathMin) return false;
    return true;
  });
}

function applySort(rows: Listing[], sort: SortValue): Listing[] {
  const out = [...rows];
  if (sort === "price-asc")
    out.sort((a, b) => (a.priceValue ?? 0) - (b.priceValue ?? 0));
  else if (sort === "price-desc")
    out.sort((a, b) => (b.priceValue ?? 0) - (a.priceValue ?? 0));
  return out;
}

export function SearchPage() {
  // The origin's /search resolves with `address=Manhattan` already applied and
  // surfaces it as an active-filter pill. EMPTY_FILTERS already defaults to it.
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"split" | "list">("split");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => applyFilters(LISTINGS, filters), [filters]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const rows = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  // Measured on the live origin at the default URL, `.list-view_filters` holds
  // exactly two `filter-selection_filter-selection` pills: "Address: Manhattan"
  // and "Clear All". Only the location filter appears as a pill there; the
  // select-type filters (For Sale / Residential) do not.
  const fmtPrice = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  const activePills: { key: string; label: string }[] = [];
  if (filters.neighborhoods.length)
    activePills.push({
      key: "neighborhood",
      label: `Address: ${filters.neighborhoods.join(", ")}`,
    });
  if (filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX)
    activePills.push({
      key: "price",
      label: `${fmtPrice(filters.priceMin)} – ${fmtPrice(filters.priceMax)}`,
    });
  if (filters.beds !== "Any")
    activePills.push({ key: "beds", label: `${filters.beds} beds` });
  if (filters.baths !== "Any")
    activePills.push({ key: "baths", label: `${filters.baths} baths` });
  const showClearAll = activePills.length > 0;

  const clearPill = (key: string) => {
    setFilters((f) => {
      if (key === "price") return { ...f, priceMin: PRICE_MIN, priceMax: PRICE_MAX };
      if (key === "neighborhood") return { ...f, neighborhoods: [] };
      return { ...f, [key]: "Any" };
    });
    setPage(1);
  };

  return (
    <main>
      <div className="container_container">
      <div className="property-listing-page_filters-container">
        <FiltersBar
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          view={view}
          onViewChange={setView}
        />
      </div>

      <div
        className={[
          "property-listing-page_content",
          view === "list"
            ? "property-listing-page_list-view"
            : "property-listing-page_split-view",
        ].join(" ")}
      >
        <div className="property-listing-page_bound">
          <div className="property-listing-page_controls">
            {/* The origin renders an EMPTY second
                `.property-listing-page_filters-container` as the first child of
                `.property-listing-page_controls`. It measures 1290x0. That is
                not incidental: the wrapper is `grid-template-rows: auto 1fr`, so
                this zero-height node takes the `auto` row and pushes the map
                into the `1fr` row, which is what gives the map its full
                `calc(100vh - 18.6rem)` height. Without it the map lands in the
                `auto` row and collapses to 0. */}
            <div className="property-listing-page_filters-container" />
            {view === "split" ? (
              <div className="property-listing-page_map-container">
                <MapPane />
              </div>
            ) : null}
          </div>
        </div>

        <div className="property-listing-page_listing-container">
          <div className="list-view_content">
            <div className="list-view_list-header">
              <div className="list-view_filters">
                {activePills.map((p) => (
                  <div key={p.key} className="filter-selection_filter-selection">
                    {p.label}
                    <button
                      type="button"
                      aria-label={`Remove ${p.label} filter`}
                      onClick={() => clearPill(p.key)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {showClearAll ? (
                  <div className="filter-selection_filter-selection">
                    <button
                      type="button"
                      aria-label="Clear all filters"
                      onClick={() => {
                        setFilters({ ...EMPTY_FILTERS });
                        setPage(1);
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="list-view_list-count">
                {ORIGIN_RESULT_COUNT ?? `${sorted.length} Results`}
              </div>

              <div className="sort-by_sort-by">
                {/* Measured origin markup:
                    <span>Sort: </span><div class="sort-by_trigger">
                      <div class="sort-by_trigger-label">Newest</div><span aria-hidden…>chevron */}
                <span>Sort: </span>
                <div
                  className="sort-by_trigger"
                  role="button"
                  tabIndex={0}
                  aria-expanded={sortOpen}
                  aria-haspopup="listbox"
                  onClick={() => setSortOpen((v) => !v)}
                  onKeyDown={(e) => e.key === "Enter" && setSortOpen((v) => !v)}
                >
                  <div className="sort-by_trigger-label">
                    {SORTS.find((s) => s.value === sort)?.label}
                  </div>
                  <span aria-hidden="true">
                    <ChevronDownIcon width="2.4rem" height="2.4rem" />
                  </span>
                </div>
                {sortOpen ? (
                  <div className="sort-by_content">
                    <div>
                      {SORTS.map((s) => (
                        <div
                          key={s.value}
                          className={[
                            "sort-by_item",
                            s.value === sort ? "sort-by_active" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => {
                            setSort(s.value);
                            setSortOpen(false);
                            setPage(1);
                          }}
                        >
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className={
                view === "split" ? "list-view_list list-view_split" : "list-view_list"
              }
            >
              {rows.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>

            {rows.length === 0 ? (
              <div className="list-view_error">
                No properties match these filters.
              </div>
            ) : null}

            <div className="list-view_pagination-container">
              <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}

export default SearchPage;