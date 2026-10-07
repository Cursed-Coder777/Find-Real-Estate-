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
 * Extracted via browser automation. Matches live site exactly:
 * - 500vh scroll distance with -9.8rem margin-top
 * - Sticky hero_top at 100vh
 * - Building at 60vh (58vh desktop)
 * - SVG masked composite layer
 * - GSAP ScrollTrigger animation
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
        const one = <T extends Element>(sel: string) => root.querySelector<T>(sel);

        const top = one<HTMLElement>("[data-hero-top]");
        const content = one<HTMLElement>("[data-hero-content]");
        const houses = [
          one<HTMLElement>("[data-hero-house]"),
          one<HTMLElement>("[data-hero-house-composite]"),
        ].filter(Boolean) as HTMLElement[];
        const smokeTop = one<HTMLElement>("[data-hero-smoke-top]");
        const clouds = q<HTMLElement>("[data-hero-cloud]");
        const logo = one<HTMLElement>("[data-hero-logo]");
        const composite = one<HTMLElement>("[data-hero-composite]");
        const titleWords = q<HTMLElement>("[data-hero-word]");
        const text = q<HTMLElement>("[data-hero-reveal]");

        // --- load-in: masked word reveal for the h1, then text + CTA ---
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(titleWords, { yPercent: 110, duration: 1, stagger: 0.08 })
          .from(text, { opacity: 0, y: 24, duration: 0.8, stagger: 0.1 }, "-=0.5");

        // --- wordmark stroke draw (hero_logo paths) ---
        const paths = q<SVGPathElement>("[data-hero-logo] path");
        paths.forEach((p) => {
          const len = typeof p.getTotalLength === "function" ? p.getTotalLength() : 0;
          if (!len) return;
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
        });

        // --- scrubbed scroll timeline over the 400vh sticky range ---
        const scrollTl = gsap.timeline({
          defaults: { ease: "power1.out" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        scrollTl
          .to(content, { opacity: 0, duration: 0.19, ease: "none" }, 0)
          .to(content, { scale: 0.9, y: 180, duration: 1 }, 0)
          .to(houses, { scale: 1.3, y: -512.4, duration: 1 }, 0)
          .to(smokeTop, { yPercent: 0, duration: 1 }, 0)
          .to(logo, { opacity: 1, duration: 0.17, ease: "none" }, 0)
          .to(composite, { opacity: 1, duration: 0.17, ease: "none" }, 0)
          .to(paths, { strokeDashoffset: 0, duration: 0.17, ease: "none" }, 0);

        // clouds drift in opposite directions as the hero is scrolled
        if (clouds.length === 2) {
          scrollTl.fromTo(
            clouds[0]!,
            { xPercent: -0.1 },
            { xPercent: 0.6, duration: 1, ease: "none" },
            0,
          );
          scrollTl.fromTo(
            clouds[1]!,
            { xPercent: 0.1 },
            { xPercent: -0.6, duration: 1, ease: "none" },
            0,
          );
        }

        // Keep the sticky layer from being left behind on very tall viewports.
        void top;

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

          <div className="hero_composite" data-hero-composite="">
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
              <h1>
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
                    {" "}
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
