"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { ASSET_ROOT } from "./data";
import { ArrowRightIcon, OutlinedWordmark } from "./shared/icons";

const IMG = `${ASSET_ROOT}/images`;

const TITLE_WORDS = ["Find", "What", "Moves", "You"];

/**
 * Hero — pixel-perfect clone from findrealestate.com
 *
 * The scroll timeline below was reverse-engineered from the live origin by
 * sampling every animated property at 40–150px scroll increments and fitting
 * each curve (see `tmp/probe-hero-timeline.mjs` / `tmp/probe-stroke.mjs`).
 * Every ease is the timeline default `power1.out` (GSAP "Quad.out"), which is
 * what the fitted curves match, so the numbers below are reproducible rather
 * than guessed.
 *
 * ScrollTrigger range: `start:"top top"` → `end:"bottom top"` over the full
 * 4500px hero, so progress runs 0→1 across 4500px of scrolling. (Using
 * `end:"bottom bottom"` shrinks the range to 3600px and makes every mid-scroll
 * value overshoot the origin — that was the main source of the visual diff.)
 *
 *   pos      dur    tween
 *   0        1.0    both house layers   scale 1→1.3, y 0→-40%
 *   0        1.0    .hero_smoke (top)   yPercent 69.5→0
 *   0        1.0    clouds              x 0→∓15%
 *   0        1.0    .hero_content       y 0→20%, scale 1→0.9
 *   0        0.2    .hero_content       opacity 1→0
 *   0.096    0.015  .hero_logo          opacity 0→1
 *   0.098    0.296  .hero_logo path     strokeDashoffset len→0  (the "draw")
 *   0.28     0.185  .hero_logo          opacity 1→0
 *   0.297    0.1    .hero_composite     opacity 0→1   ─┐ same window + ease,
 *   0.297    0.1    main house          opacity 1→0   ─┘ so the colour reveal
 *                                                     fills the letters exactly
 *                                                     as the outline fades
 */
export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const q = <T extends Element>(sel: string) =>
          Array.from(root.querySelectorAll<T>(sel));
        const qs = <T extends Element>(sel: string) =>
          root.querySelector<T>(sel);

        const houseMain = qs<HTMLElement>("[data-hero-house]");
        const houseComposite = qs<HTMLElement>("[data-hero-house-composite]");
        const smokeTop = qs<HTMLElement>("[data-hero-smoke-top]");
        const clouds = q<HTMLElement>("[data-hero-cloud]");
        const logo = qs<HTMLElement>("[data-hero-logo]");
        const composite = qs<HTMLElement>("[data-hero-composite]");
        const content = qs<HTMLElement>("[data-hero-content]");
        const titleWords = q<HTMLElement>("[data-hero-word]");
        const text = q<HTMLElement>("[data-hero-reveal]");
        const logoPaths = q<SVGPathElement>("[data-hero-logo] path");

        // --- load-in: masked word reveal for h1, then subtitle + CTA ---
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(titleWords, { yPercent: 110, duration: 1, stagger: 0.08 })
          .from(text, { opacity: 0, y: 24, duration: 0.8, stagger: 0.1 }, "-=0.5");

        // --- stroke setup: initialize dasharray/dashoffset before timeline ---
        logoPaths.forEach((p) => {
          const len =
            typeof p.getTotalLength === "function" ? p.getTotalLength() : 0;
          if (!len) return;
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
        });

        // --- scroll-scrubbed timeline ---
        // Range is the FULL hero height (top top -> bottom top). scrub: .1 adds
        // the origin's 100ms of lag.
        const scrollTl = gsap.timeline({
          defaults: { ease: "power1.out" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.1,
          },
        });

        const allHouses = [houseMain, houseComposite].filter(
          Boolean,
        ) as HTMLElement[];

        // Both house layers zoom (full scroll range)
        scrollTl.to(allHouses, { y: "-40%", scale: 1.3, duration: 1 }, 0);

        // Smoke rises out of the bottom. The start value has to be handed to
        // GSAP explicitly: `translateY(70%)` lives in the stylesheet, and GSAP
        // reads it as an unknown transform, so tweening `yPercent: 0` on its
        // own is a no-op (0 -> 0) and the smoke never moves. 69.5% is the value
        // measured on the live origin (323.3px of a 465px layer).
        if (smokeTop) {
          gsap.set(smokeTop, { yPercent: 69.5, y: 0 });
          scrollTl.to(smokeTop, { yPercent: 0, duration: 1 }, 0);
        }

        // Clouds drift outward (full scroll range)
        if (clouds[0]) scrollTl.to(clouds[0], { x: "-15%", duration: 1 }, 0);
        if (clouds[1]) scrollTl.to(clouds[1], { x: "15%", duration: 1 }, 0);

        // Content moves down and scales (full range) then fades over the first 20%
        if (content) {
          scrollTl.to(content, { y: "20%", scale: 0.9, duration: 1 }, 0);
          scrollTl.to(content, { opacity: 0, duration: 0.2 }, 0);
        }

        // Outline wordmark: fade in, then the stroke "draw" runs.
        if (logo) {
          scrollTl.fromTo(
            logo,
            { opacity: 0 },
            { opacity: 1, duration: 0.015 },
            0.096,
          );
          // Outline fades back out before the colour reveal takes over
          scrollTl.to(logo, { opacity: 0, duration: 0.185 }, 0.28);
        }

        if (logoPaths.length) {
          scrollTl.to(
            logoPaths,
            { strokeDashoffset: 0, duration: 0.296 },
            0.098,
          );
        }

        // THE CRITICAL DISSOLVE.
        // `.hero_composite` is the house image masked through the same 977x423
        // wordmark geometry that `.hero_logo` strokes, and both layers sit at the
        // same 732.75x317.25px box. Fading the colour reveal in while fading the
        // flat house out over the *same window with the same ease* is what makes
        // the outline appear to fill in with the building rather than cross-fade
        // into a different shape. Keep these two lines in lockstep.
        if (composite) {
          scrollTl.to(composite, { opacity: 1, duration: 0.1 }, 0.297);
        }
        if (houseMain) {
          scrollTl.to(houseMain, { opacity: 0, duration: 0.1 }, 0.297);
        }

        // No explicit end-marker is needed: the house / smoke / cloud / content
        // tweens all run `duration: 1` from position 0, so the timeline's total
        // duration is exactly 1 and ScrollTrigger progress maps 1:1 to scroll.

        teardown = () => {
          scrollTl.scrollTrigger?.kill();
          scrollTl.kill();
          intro.kill();
        };
      },
    );

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return (
    <section className="hero_root" ref={rootRef}>
      <div className="hero_top" data-hero-top="">
        <div className="hero_bg">
          <div className="hero_back">
            <img
              src={`${IMG}/back.f53e9773.jpg`}
              alt=""
              width={3840}
              height={2612}
              loading="lazy"
            />
          </div>

          <div className="hero_house" data-hero-house="">
            <img
              src={`${IMG}/house.8ed9b3db.png`}
              alt=""
              width={3840}
              height={3416}
              loading="eager"
            />
          </div>

          <div className="hero_composite" data-hero-composite="" style={{ opacity: 0 }}>
            <div className="hero_house" data-hero-house-composite="">
              <img
                src={`${IMG}/house.8ed9b3db.png`}
                alt=""
                width={3840}
                height={3416}
                loading="eager"
              />
            </div>
          </div>

          <div className="hero_clouds">
            <div className="hero_cloud" data-hero-cloud="">
              <img
                src={`${IMG}/cloud.c8800fa9.png`}
                alt=""
                width={2248}
                height={954}
                loading="lazy"
              />
            </div>
            <div className="hero_cloud" data-hero-cloud="">
              <img
                src={`${IMG}/cloud.c8800fa9.png`}
                alt=""
                width={2248}
                height={954}
                loading="lazy"
              />
            </div>
          </div>

          <div className="hero_logo" data-hero-logo="" style={{ opacity: 0 }}>
            <OutlinedWordmark />
          </div>

          <div className="hero_smoke" data-hero-smoke-top="">
            <img
              src={`${IMG}/smoke.9f683cb4.png`}
              alt=""
              width={3840}
              height={1240}
            />
          </div>
        </div>

        <div className="hero_content" data-hero-content="">
          <div className="container_container">
            <div className="hero_title" aria-label="Find What Moves You">
              <h1
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  columnGap: "0.17em",
                  // No rowGap: the origin wraps each word in an inline-block
                  // shell with -0.15em margin / 0.15em padding, so consecutive
                  // lines butt together at `line-height: 100%`. A flex rowGap
                  // added 0.05em between wrapped lines, making the mobile h1
                  // 115px tall against the origin's 112px.
                }}
              >
                {TITLE_WORDS.map((word) => (
                  <span
                    key={word}
                    aria-hidden="true"
                    style={{
                      position: "relative",
                      display: "inline-block",
                      margin: "-0.15em",
                      padding: "0.15em",
                      verticalAlign: "top",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      data-hero-word=""
                      aria-hidden="true"
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </h1>
            </div>

            <div className="hero_text" data-hero-reveal="">
              <p>
                Expert agents. Real guidance.{" "}
                <span className="em">
                  A clear path to find what&rsquo;s next.
                </span>
              </p>
            </div>

            <div className="hero_actions" data-hero-reveal="">
              <div>
                <Link
                  className="button_button-round button_color-primary"
                  href="/search"
                >
                  <div className="button_content">
                    <div className="button_button-round-text">
                      <span data-text="Find Properties">Find Properties</span>
                    </div>
                    <span className="button_icon-after">
                      <ArrowRightIcon />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="hero_overlap">
          <div className="hero_smoke">
            <img
              src={`${IMG}/smoke.9f683cb4.png`}
              alt=""
              width={3840}
              height={1240}
            />
          </div>
          <div className="hero_overlay" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
