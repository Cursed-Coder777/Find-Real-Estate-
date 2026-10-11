"use client";

import { useEffect, useState } from "react";

/**
 * Pagination is `react-paginate` on the origin, and the ported CSS targets its
 * class names directly, so the clone emits the same markup rather than a
 * lookalike:
 *
 *   .pagination_pagination            <- visibility:hidden; opacity:0 until
 *                                       .pagination_initialized is also present
 *     .rc-pagination-prev             <- margin-right:auto (pushed to the left)
 *     .rc-pagination-item
 *     .rc-pagination-item-active
 *     .rc-pagination-item-before-jump-next
 *     .rc-pagination-jump-next        <- the "..." between pages
 *     .rc-pagination-next             <- margin-left:auto (pushed to the right)
 *
 * Read off the live origin at page 1 of 534:
 *   prev(disabled) · 1(active) · 2 · 3(before-jump-next) · "..." · 533 · next
 *
 * so the page window is +/-2 around the current page, the item immediately
 * before the jump carries `rc-pagination-item-before-jump-next`, and the jump
 * glyph is three dots. The origin's last visible item was 533 against a
 * pageCount of 534.
 *
 * `.rc-pagination-disabled` is `visibility:hidden`, so prev/next disappear
 * entirely on the first/last page rather than dimming.
 */

type Props = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

function itemsFor(page: number, pageCount: number) {
  const out: number[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 2) out.push(p);
  }
  return out;
}

export function Pagination({ page, pageCount, onPageChange }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (pageCount <= 1) return null;

  const items = itemsFor(page, pageCount);

  return (
    <ul
      className={["pagination_pagination", ready ? "pagination_initialized" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <li
        className={
          page === 1
            ? "rc-pagination-prev rc-pagination-disabled"
            : "rc-pagination-prev"
        }
      >
        <button
          type="button"
          className="pagination_prev"
          aria-label="Previous page"
          aria-disabled={page === 1}
          tabIndex={page === 1 ? -1 : 0}
          onClick={() => page > 1 && onPageChange(page - 1)}
        >
          <div>←</div>
        </button>
      </li>

      {items.map((it, i) => {
        const isLast = i === items.length - 1;
        const next = items[i + 1];
        const beforeJump = !isLast && next !== undefined && next - it > 1;
        return (
          <span key={it} style={{ display: "contents" }}>
            {beforeJump ? (
              <li className="rc-pagination-jump-next rc-pagination-jump-next-custom-icon">
                <div>...</div>
              </li>
            ) : null}
            <li
              className={[
                "rc-pagination-item",
                `rc-pagination-item-${it}`,
                it === page ? "rc-pagination-item-active" : "",
                beforeJump ? "rc-pagination-item-before-jump-next" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                aria-label={`Page ${it}`}
                aria-current={it === page ? "page" : undefined}
                onClick={() => onPageChange(it)}
              >
                {it}
              </button>
            </li>
          </span>
        );
      })}

      <li
        className={
          page === pageCount
            ? "rc-pagination-next rc-pagination-disabled"
            : "rc-pagination-next"
        }
      >
        <button
          type="button"
          className="pagination_next"
          aria-label="Next page"
          aria-disabled={page === pageCount}
          tabIndex={page === pageCount ? -1 : 0}
          onClick={() => page < pageCount && onPageChange(page + 1)}
        >
          <div>→</div>
        </button>
      </li>
    </ul>
  );
}

export default Pagination;