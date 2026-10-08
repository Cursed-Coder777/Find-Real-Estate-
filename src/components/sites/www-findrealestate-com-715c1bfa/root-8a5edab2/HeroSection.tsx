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
 * Animation timeline matches origin source JS exactly (decompiled from
 * home_page-1a3b644319932385.js, module 68347):
 *
 *  0.0→1.0  both house images scale 1→1.3, y 0→-40%
 *  0.0→1.0  smoke rises yPercent 70→0
 *  0.0→1.0  clouds drift outward x ±15%
 *  0.0→1.0  content moves y 0→20%, scale 1→0.9
 *  0.0→0.2  content fades opacity 1→0
 *  0.1      outline logo pops in (opacity instant)
 *  0.1→0.4  SVG paths draw (dashoffset len→0)
 *  0.28→0.48 outline logo fades opacity 1→0
 *  0.3→0.4  composite mask fades in opacity 0→1
 *  0.3→0.4  main house fades out opacity 1→0  ← critical dissolve
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
        // Normalized duration 1.0 = full hero scroll (400vh at 900px viewport).
        // scrub: 0.1 adds 100ms lag for cinematic feel (matches origin scrub:.1).
        const scrollTl = gsap.timeline({
          defaults: { ease: "power1.out" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.1,
          },
        });

        const allHouses = [houseMain, houseComposite].filter(
          Boolean,
        ) as HTMLElement[];

        // Both house images zoom (full scroll range)
        scrollTl.to(allHouses, { y: "-40%", scale: 1.3, duration: 1 }, 0);

        // Smoke top rises from translateY(70%) to 0 (full range)
        if (smokeTop) scrollTl.to(smokeTop, { yPercent: 0, duration: 1 }, 0);

        // Clouds drift outward (full range)
        if (clouds[0]) scrollTl.to(clouds[0], { x: "-15%", duration: 1 }, 0);
        if (clouds[1]) scrollTl.to(clouds[1], { x: "15%", duration: 1 }, 0);

        // Content moves down and scales (full range) + fades fast (first 20%)
        if (content) {
          scrollTl.to(content, { y: "20%", scale: 0.9, duration: 1 }, 0);
          scrollTl.to(content, { opacity: 0, duration: 0.2, ease: "none" }, 0);
        }

        // Outline logo pops in at 10%
        if (logo) scrollTl.to(logo, { opacity: 1, duration: 0.01 }, 0.1);

        // Stroke draws 10% → 40%
        if (logoPaths.length) {
          scrollTl.to(
            logoPaths,
            { strokeDashoffset: 0, duration: 0.3, ease: "none" },
            0.1,
          );
        }

        // Logo fades 28% → 48%
        if (logo) scrollTl.to(logo, { opacity: 0, duration: 0.2 }, 0.28);

        // Composite mask reveals 30% → 40%
        if (composite) scrollTl.to(composite, { opacity: 1, duration: 0.1 }, 0.3);

        // Main house dissolves 30% → 40%  ← THE KEY EFFECT
        if (houseMain)
          scrollTl.to(houseMain, { opacity: 0, duration: 0.1 }, 0.3);

        // End-marker ensures timeline total = 1.0
        scrollTl.add(() => {}, 1);

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
                  rowGap: "0.05em",
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
