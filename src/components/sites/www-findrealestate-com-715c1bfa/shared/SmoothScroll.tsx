"use client";

import { useEffect } from "react";

/**
 * Lenis smooth scrolling, matching the origin site.
 *
 * The origin's bundle contains Lenis and the rendered document carries the
 * `lenis` class on <html>; `html.lenis-stopped { overflow: hidden }` is what
 * freezes the page while the burger menu is open. We reproduce both: Lenis
 * adds `lenis` itself and CSS adds `lenis-stopped`.
 *
 * `prefers-reduced-motion` is respected — Lenis is simply not started, so the
 * page falls back to native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: {
      raf: (t: number) => void;
      resize: () => void;
      destroy: () => void;
    } | undefined;
    let frame = 0;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const instance = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        wrapper: window,
        content: document.body,
        autoRaf: false,
      });
      lenis = instance;

      const raf = (time: number) => {
        instance.raf(time);
        frame = requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      // Keep Lenis updated whenever DOM content or images resize
      resizeObserver = new ResizeObserver(() => {
        instance.resize();
      });
      if (document.body) {
        resizeObserver.observe(document.body);
      }

      window.addEventListener("load", () => instance.resize(), { once: true });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      lenis?.destroy();
    };
  }, []);

  return null;
}

export default SmoothScroll;
