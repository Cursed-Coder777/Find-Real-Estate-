"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  /** Selector for the descendants that animate, relative to the wrapper. */
  itemSelector: string;
  /** Animation start values; the elements settle at their natural values. */
  fromOpacity?: number;
  fromY?: number;
  fromX?: number;
  stagger?: number;
  duration?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Runs a one-shot, staggered "reveal on enter" over a group of elements.
 *
 * The origin uses GSAP for these (its bundle contains gsap + ScrollTrigger) and
 * the effects are one-shot: the elements do not re-hide when you scroll back
 * past them.
 */
export function RevealGroup({
  itemSelector,
  fromOpacity = 0,
  fromY = 24,
  fromX = 0,
  stagger = 0.08,
  duration = 0.9,
  className,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    if (!items.length) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      gsap.set(items, { opacity: fromOpacity, x: fromX, y: fromY });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            gsap.to(items, {
              opacity: 1,
              x: 0,
              y: 0,
              duration,
              stagger,
              ease: "power3.out",
            });
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
      );
      observer.observe(root);
      teardown = () => observer.disconnect();
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [itemSelector, stagger, duration, fromOpacity, fromY, fromX]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default RevealGroup;
