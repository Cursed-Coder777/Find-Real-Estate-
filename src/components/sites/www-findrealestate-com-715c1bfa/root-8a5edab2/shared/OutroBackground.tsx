"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-scrubbed background zoom.
 *
 * The origin ties the outro background image directly to scroll position rather
 * than animating it once: as `.outro_root` travels through the viewport the
 * image scales 1 → 1.1 with `scrub`, so scrolling back up rewinds the zoom.
 * Measured on the live site — the image carries GSAP's `will-change: transform`
 * and its transform tracks scroll continuously (no discrete entrance tween),
 * and the wrapper itself never animates.
 *
 * Trigger range matches the origin: the section enters at `top bottom` and the
 * animation completes at `bottom top`.
 */
export function OutroBackground({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("gsap").then(({ gsap }) => {
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const img = wrap.querySelector("img");
        if (!img) return;

        const tween = gsap.fromTo(
          img,
          { scale: 1 },
          {
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: wrap.closest(".outro_root") ?? wrap,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          },
        );

        teardown = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return (
    <div className="outro_bg" ref={wrapRef}>
      {children}
    </div>
  );
}

export default OutroBackground;