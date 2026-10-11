"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { ChevronDownIcon } from "../../root-8a5edab2/shared/icons";
import { lenisIsRunning, startLenis, stopLenis } from "../../shared/lenis";

/**
 * The origin's two filter dropdown shells. The ported CSS styles exactly these
 * names and nothing else:
 *
 *   .<ns>_trigger          display:flex; justify-content:space-between;
 *                          width:100%; cursor:pointer; padding:1.5rem 2rem
 *   .<ns>_trigger-label    font-size 1.6rem; white-space:nowrap; flex:1 1
 *   .<ns>_content          the panel
 *   .<ns>_outlined         border:1px solid rgba(21,23,23,.1)
 *   .<ns>_has-value        blue tint — appears once a value is chosen
 *
 * `.<ns>_content` carries `z-index:201` but **no `position`**, so on the origin
 * it only stacks because Radix renders it through a portal at body level with
 * an inline `position:fixed` and a measured offset. Rendering it in place —
 * inside the filter cell — leaves it `position:static`, which means:
 *
 *   - the panel pushes the filter bar from 81px to 157px and the document from
 *     2996px to 3071px every time it opens, and
 *   - `.dropdown-base_content{width:min(100%,55rem)}` resolves against the
 *     152px-wide filter cell instead of the viewport, collapsing the Price
 *     panel from 413px to 232px.
 *
 * So the panel is portalled to `document.body` and positioned against the
 * trigger's rect, flipping above when there is not enough room below.
 *
 * What goes INSIDE the panel is not uniform, and was measured per-filter:
 *
 *   Neighborhoods -> select-base_content, .check-dropdown_group-item rows,
 *                    each holding a .check-dropdown_checkbox-item (multi-select)
 *   For Sale      -> select-base_content, .radio-dropdown_item rows, each
 *   Residential      holding a button.radio-dropdown_radio-item (single-select)
 *   Price         -> dropdown-base_content, a price-dropdown_* min/max range
 *   Beds & Baths  -> dropdown-base_content, beds-and-baths-dropdown_option rows
 *
 * Note `.radio-dropdown_radio-item` is the 2.4rem radio *circle*, not the row —
 * the row is `.radio-dropdown_item`. Selection state lives in
 * `data-state="checked"|"unchecked"` (radio/checkbox) and
 * `data-state="on"|"off"` (beds/baths).
 */
export type DropdownNamespace = "select-base" | "dropdown-base";

export type DropdownOption = {
  value: string;
  label: string;
};

type Props = {
  ns?: DropdownNamespace;
  label: string;
  options: DropdownOption[];
  value: string | null;
  /** optional: the Price and Beds & Baths panels supply `children` instead */
  onChange?: (value: string | null) => void;
  /** custom panel body; receives a close() so the host can dismiss it */
  children?: (close: () => void) => ReactNode;
  className?: string;
};

type Anchor = { top: number; left: number; width: number; height: number };

export function FilterDropdown({
  ns = "select-base",
  label,
  options,
  value,
  onChange,
  children,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [flip, setFlip] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // 1rem, the gap the panel CSS declares as margin-top.
  const gap = 7.5;

  const measure = useCallback(() => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    setAnchor({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  // Anchor to the trigger's live rect, and re-anchor on scroll/resize so the
  // panel tracks the sticky filter bar rather than drifting away from it.
  useEffect(() => {
    if (!open) {
      setAnchor(null);
      return;
    }
    measure();
    const onScrollOrResize = () => measure();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, measure]);

  // Vertical fit: flip above the trigger when the panel would overflow the
  // viewport bottom. Horizontal fit: clamp so the panel never runs off the
  // right edge — the origin's Radix popper does this too, shifting the Beds &
  // Baths panel from its trigger's x=1050 to x=1033 so a 407px panel ends
  // exactly at 1440. Without the clamp that panel overflows to 1462.
  //
  // Run in a layout effect so the first paint is already the correct position.
  useLayoutEffect(() => {
    if (!open || !anchor || !panelRef.current) return;
    const r = panelRef.current.getBoundingClientRect();
    const below = window.innerHeight - (anchor.top + anchor.height) - gap;
    setFlip(r.height > below && anchor.top > r.height + gap);
    const maxLeft = Math.max(8, window.innerWidth - r.width - 8);
    setLeft(Math.min(anchor.left, maxLeft));
  }, [open, anchor]);

  // Freeze the page while the panel is open, for the same reason the origin
  // freezes it for the burger menu (`html.lenis-stopped`). Lenis runs with
  // `smoothWheel: true` and `wrapper: window`, so without this the wheel scrolls
  // the page behind the panel instead of the panel's own rows.
  //
  // Only needed when Lenis is actually running — under prefers-reduced-motion it
  // never starts and native scrolling already behaves correctly.
  useEffect(() => {
    if (!open || !lenisIsRunning()) return;
    stopLenis();
    return () => startLenis();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const inTrigger = rootRef.current?.contains(e.target as Node);
      const inPanel = panelRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const choose = (v: string) => {
    onChange?.(v === value ? null : v);
    close();
  };

  const panel =
    open && anchor ? (
      <div
        ref={panelRef}
        className={`${ns}_content`}
        id={panelId}
        role="listbox"
        style={{
          position: "fixed",
          zIndex: 201,
          left: left ?? anchor.left,
          // The panel CSS declares `margin-top:1rem`; it is neutralised here so
          // the offset is applied exactly once. Leaving both in place put the
          // panel 7.5px too low and, with the flip, 15px off.
          marginTop: 0,
          ...(flip
            ? { bottom: window.innerHeight - anchor.top + gap }
            : { top: anchor.top + anchor.height + gap }),
        }}
      >
        {children ? (
          children(close)
        ) : (
          <div>
            {options.map((o) => {
              const on = o.value === value;
              return (
                <div className="radio-dropdown_item" key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    aria-checked={on}
                    className="radio-dropdown_radio-item"
                    data-state={on ? "checked" : "unchecked"}
                    onClick={() => choose(o.value)}
                  >
                    <span className="radio-dropdown_radio-indicator" aria-hidden="true" />
                  </button>
                  <span>{o.label}</span>
                  {on ? (
                    <div className="radio-dropdown_selected-indicator" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="1.6rem" height="1.6rem" fill="none">
                        <path
                          d="m4 12.5 5 5 11-11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className={className} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={[`${ns}_trigger`, `${ns}_outlined`, value ? `${ns}_has-value` : ""]
          .filter(Boolean)
          .join(" ")}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <div className={`${ns}_trigger-label`}>{value ?? label}</div>
        <span aria-hidden="true">
          {/* The origin's chevron is explicitly 2.4rem square. Without the
              attributes the SVG falls back to its intrinsic default and the
              trigger renders 54px tall instead of the measured 43px. */}
          <ChevronDownIcon width="2.4rem" height="2.4rem" />
        </span>
      </button>

      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </div>
  );
}

export default FilterDropdown;