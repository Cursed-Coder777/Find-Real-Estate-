"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { ChevronDownIcon } from "../../root-8a5edab2/shared/icons";

/**
 * The origin's two filter dropdown shells. The ported CSS styles exactly these
 * names and nothing else:
 *
 *   .<ns>_trigger          display:flex; justify-content:space-between;
 *                          width:100%; cursor:pointer; padding:1.5rem 2rem
 *   .<ns>_trigger-label    font-size 1.6rem; white-space:nowrap
 *   .<ns>_content          the panel
 *   .<ns>_outlined         border:1px solid rgba(21,23,23,.1)
 *   .<ns>_has-value        blue tint — appears once a value is chosen
 *
 * The trigger is itself the clickable flex row, so the label is a child of it;
 * there is no `_trigger-inner` and no `_trigger-icon` class for this component.
 *
 * What goes INSIDE the panel is not uniform, and this was measured per-filter
 * rather than assumed:
 *
 *   Neighborhoods  -> select-base_content, rows are check-dropdown_* checkboxes
 *                     (multi-select)
 *   For Sale       -> select-base_content, rows are button.radio-dropdown_radio-item
 *   Residential    -> select-base_content, rows are button.radio-dropdown_radio-item
 *   Price          -> dropdown-base_content, a price-dropdown_* min/max range
 *   Beds & Baths   -> dropdown-base_content, beds-and-baths-dropdown_* options
 *
 * Radio rows carry their selection in `data-state="checked" | "unchecked"`.
 * `children` takes over for the two panels that are not option lists.
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
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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

  return (
    <div className={className} ref={rootRef}>
      <button
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

      {open ? (
        <div className={`${ns}_content`} id={panelId} role="listbox">
          {children ? (
            children(close)
          ) : (
            <div>
              {options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  className="radio-dropdown_radio-item"
                  data-state={o.value === value ? "checked" : "unchecked"}
                  onClick={() => choose(o.value)}
                >
                  <span className="radio-dropdown_radio-indicator" aria-hidden="true" />
                  <span>{o.label}</span>
                  {o.value === value ? (
                    <div className="radio-dropdown_selected-indicator" aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default FilterDropdown;