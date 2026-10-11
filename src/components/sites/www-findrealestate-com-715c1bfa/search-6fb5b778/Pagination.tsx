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

/**
 * The chevron used for both arrows, read off the live origin:
 *
 *   <svg viewBox="0 0 24 24" width="2.4rem" height="2.4rem">
 *     <path fill="currentColor" d="m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061
 *        l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1
 *        1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061"/>
 *   </svg>
 *
 * The prev arrow is the same path with `transform: rotate(180deg)`.
 */
const ARROW_PATH =
  "m20.78 12.531-6.75 6.75a.75.75 0 1 1-1.06-1.061l5.47-5.47H3.75a.75.75 0 1 1 0-1.5h14.69l-5.47-5.469a.75.75 0 1 1 1.06-1.061l6.75 6.75a.75.75 0 0 1 0 1.061";

function ArrowIcon({ prev }: { prev?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="2.4rem"
      height="2.4rem"
      style={prev ? { transform: "rotate(180deg)" } : undefined}
      aria-hidden="true"
    >
      <path fill="currentColor" d={ARROW_PATH} />
    </svg>
  );
}

/**
 * Each arrow button holds TWO stacked copies of the icon. That is what the
 * origin renders, and it is load-bearing: the ported CSS animates the button
 * with `transform: translateY(-100%)` on hover, sliding the lower copy up into
 * place. With a single child the button still translates by its own height but
 * there is nothing below to reveal, so the arrow jumps up and leaves a gap.
 */
function ArrowButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={dir === "prev" ? "pagination_prev" : "pagination_next"}
      aria-label={dir === "prev" ? "Previous page" : "Next page"}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
    >
      <div>
        <ArrowIcon prev={dir === "prev"} />
      </div>
      <div>
        <ArrowIcon prev={dir === "prev"} />
      </div>
    </button>
  );
}

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
        <ArrowButton
          dir="prev"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        />
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
        <ArrowButton
          dir="next"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
        />
      </li>
    </ul>
  );
}

export default Pagination;