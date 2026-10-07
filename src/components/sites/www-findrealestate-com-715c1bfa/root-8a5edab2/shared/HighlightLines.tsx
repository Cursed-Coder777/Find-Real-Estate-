"use client";

import { useEffect, useRef, type ReactNode } from "react";

export type HighlightTone = "light" | "muted" | "dark";

const TONE_BACKGROUND: Record<HighlightTone, string> = {
  // rgba(255,255,255,.8) — sections on white
  light: "rgba(255, 255, 255, 0.8)",
  // rgba(241,241,241,.8) — sections on the muted #f1f1f1 surface
  muted: "rgba(241, 241, 241, 0.8)",
  // rgba(21,23,23,.8) — the dark Services / Features surfaces
  dark: "rgba(21, 23, 23, 0.8)",
};

type Props = {
  /** Accessible text of the whole heading (the origin puts it on the wrapper). */
  label: string;
  /** One entry per rendered line; the origin splits headings per visual line. */
  lines: ReactNode[];
  tone?: HighlightTone;
  className?: string;
  /** Extra class applied to each line wrapper. */
  lineClassName?: string;
};

/**
 * Renders a heading whose lines are each covered by a highlighter block.
 *
 * Measured on the origin: each overlay is `position:absolute; inset:10% -1% -10% 0;
 * opacity:.9; z-index:1` and GSAP animates `scaleX` 1 → 0 with
 * `transform-origin: right center`, so the line wipes in from the left. The
 * reveal is one-shot — scrolling back above the section does NOT re-cover the
 * text (verified by sampling the transform while scrolling back up).
 */
export function HighlightLines({
  label,
  lines,
  tone = "light",
  className,
  lineClassName,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wipes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-highlight-wipe]"),
    );
    if (!wipes.length) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            const index = wipes.indexOf(el);
            observer.unobserve(el);
            gsap.to(el, {
              scaleX: 0,
              duration: 0.8,
              ease: "power2.inOut",
              delay: Math.max(index, 0) * 0.08,
            });
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
      );
      wipes.forEach((w) => observer.observe(w));
      teardown = () => observer.disconnect();
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return (
    <div ref={ref} aria-label={label} className={className}>
      {lines.map((line, i) => (
        <div
          key={`line-${i}`}
          aria-hidden="true"
          style={{
            position: "relative",
            display: "block",
            textAlign: "inherit",
            width: "fit-content",
          }}
          className={lineClassName}
        >
          {line}
          <span
            data-highlight-wipe=""
            className="highlight-wipe"
            style={{ background: TONE_BACKGROUND[tone] }}
          />
        </div>
      ))}
    </div>
  );
}

export default HighlightLines;
