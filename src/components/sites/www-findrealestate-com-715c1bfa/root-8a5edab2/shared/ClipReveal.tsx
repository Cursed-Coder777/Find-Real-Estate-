"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Clip-path wipe reveal — the origin's actual "reveal on enter" for media.
 *
 * Measured on the live site with a fresh page per element (see
 * `tmp/probe-reveals2.mjs`). The origin does NOT fade these in. It parks the
 * element fully clipped and wipes the clip open:
 *
 *   why-us_preview (video)            inset(0 0 0 100%) -> inset(0 0 0 0)   left -> right
 *   assymetric-image-split_image      inset(0 0 0 100%) -> inset(0 0 0 0)   left -> right
 *   testimonials_preview (img)        inset(0 100% 0 0) -> inset(0 0 0 0)   top  -> bottom
 *   assymetric-image-split_small-img  inset(0 100% 0 0) -> inset(0 0 0 0)   top  -> bottom
 *   outro_title                       inset(0 100% 0 0) -> inset(0 0 0 0)   top  -> bottom
 *   post-entry_thumbnail (a)          inset(0 0 0 100%) -> inset(0 0 0 0)   left -> right
 *
 * Fitted from the sampled clip values: duration 2s, ease `power4.out`, and
 * `clearProps: "clipPath"` afterwards — the origin finishes at `clip-path: none`
 * with no inline style, so a completed element is not left inside a clip path
 * (which would otherwise create a containing block and change how descendants
 * position).
 *
 * Opacity stays at 1 throughout the wipe. Two elements additionally cross-fade
 * an inner image (a blog thumbnail's `<img>`, ~1.7s), exposed via `fadeInner`.
 *
 * The hidden state is applied from an effect rather than from inline JSX style
 * so `prefers-reduced-motion` users are never left with a clipped/hidden element.
 */
export const CLIP_HIDDEN = {
  /** wipes open left -> right (the right inset retracts) */
  x: "inset(0px 0px 0px 100%)",
  /** wipes open top -> bottom (the bottom inset retracts) */
  y: "inset(0px 100% 0px 0px)",
} as const;

const CLIP_SHOWN = "inset(0px 0px 0px 0%)";

type Axis = keyof typeof CLIP_HIDDEN;

type Props = {
  /** Tag to render, so the DOM stays identical to the origin markup. */
  as: ElementType;
  className?: string;
  axis?: Axis;
  /** Seconds to wait before the wipe starts (used to stagger siblings). */
  delay?: number;
  /**
   * Selector for a descendant to cross-fade 0 -> 1 alongside the wipe.
   *
   * The origin does exactly this on a blog thumbnail: the `<a>` clip-wipes
   * open while the `<img>` inside it fades up from opacity 0 (~1.7s).
   */
  fadeInner?: string;
  /**
   * Hold the wrapper at `visibility: hidden` until the inner `<img>` has
   * actually decoded, then flip to visible and wipe.
   *
   * The origin's `SlidingImage` ships `style={{position:relative,
   * visibility:"hidden"}}` and only reveals from the image's `onLoad`, so
   * there is no flash of a half-loaded image. Guarded against cached images
   * that never fire `load`.
   */
  hideUntilImageLoads?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>;

export function ClipReveal({
  as,
  className,
  axis = "x",
  delay = 0,
  fadeInner,
  hideUntilImageLoads = false,
  style,
  children,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    // Park it closed before it can ever be seen.
    el.style.clipPath = CLIP_HIDDEN[axis];

    const inner = fadeInner ? el.querySelector<HTMLElement>(fadeInner) : null;
    const img = hideUntilImageLoads
      ? el.querySelector<HTMLImageElement>("img")
      : null;
    if (img) el.style.visibility = "hidden";

    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;

      const play = () => {
        el.style.visibility = "visible";
        gsap.to(el, {
          clipPath: CLIP_SHOWN,
          duration: 2,
          delay,
          ease: "power4.out",
          clearProps: "clipPath",
        });
        if (inner) {
          gsap.fromTo(
            inner,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1.7,
              delay,
              ease: "power4.out",
              clearProps: "opacity",
            },
          );
        }
      };

      const arm = () => {
        // `once` semantics, matching the origin's one-shot triggers: play as
        // soon as any part of the element is on screen, never re-hide on the
        // way back up.
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              observer.disconnect();
              play();
              return;
            }
          },
          // Fire exactly when the element starts entering the viewport, which
          // is what the origin's `start: "top bottom"` ScrollTrigger does. A
          // negative bottom rootMargin would delay the wipe until the element
          // is ~10% further into view than the origin does.
          { threshold: 0 },
        );
        observer.observe(el);
        teardown = () => observer.disconnect();
      };

      if (img) {
        // A cached image can already be complete before React attaches, in
        // which case `load` never fires and we must not stay hidden.
        if (img.complete && img.naturalWidth > 0) arm();
        else {
          const onLoad = () => {
            img.removeEventListener("load", onLoad);
            arm();
          };
          img.addEventListener("load", onLoad);
          const prevTeardown = teardown;
          teardown = () => {
            prevTeardown?.();
            img.removeEventListener("load", onLoad);
          };
        }
      } else {
        arm();
      }
    });

    return () => {
      cancelled = true;
      teardown?.();
      el.style.clipPath = "";
      el.style.visibility = "";
    };
  }, [axis, delay, fadeInner, hideUntilImageLoads]);

  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </Tag>
  );
}

export default ClipReveal;