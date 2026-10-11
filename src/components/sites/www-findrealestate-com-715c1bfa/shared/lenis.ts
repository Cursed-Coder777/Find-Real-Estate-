/**
 * Handle for the Lenis instance created by `shared/SmoothScroll.tsx`.
 *
 * Lenis is started with `smoothWheel: true` and `wrapper: window`, which means
 * it intercepts wheel events and animates `window.scrollY` itself. That is
 * correct for the page, but it also swallows wheel events over any inner
 * scrollable element — so with a filter panel open, hovering the panel and
 * scrolling moves the PAGE instead of the panel's rows.
 *
 * The origin solves this the same way it freezes the page for the burger menu:
 * it toggles `html.lenis-stopped` (see clone.css) and stops Lenis. This module
 * is the handle that lets other components do the same without prop-drilling
 * the instance out of the layout.
 *
 * `stopLenis()` is a no-op when Lenis never started — i.e. under
 * `prefers-reduced-motion`, where native scrolling already behaves correctly and
 * no freeze is needed.
 */

type LenisLike = {
  stop: () => void;
  start: () => void;
  destroy: () => void;
  resize: () => void;
};

let instance: LenisLike | null = null;
let running = false;

/**
 * Register the live instance. A registered instance is by definition running,
 * so this also marks it as such.
 */
export function setLenis(next: LenisLike | null): void {
  instance = next;
  running = next !== null;
}

export function lenisIsRunning(): boolean {
  return running;
}

export function stopLenis(): void {
  if (!instance) return;
  instance.stop();
  running = false;
  document.documentElement.classList.add("lenis-stopped");
}

export function startLenis(): void {
  if (!instance) return;
  instance.start();
  running = true;
  document.documentElement.classList.remove("lenis-stopped");
}
