"use client";

import { useEffect, useRef } from "react";

import { ASSET_ROOT } from "./data";

const IMG = `${ASSET_ROOT}/images`;

/**
 * Hero — pixel-perfect scroll-driven cinematic hero matching the reference frames.
 *
 * Three-frame progression:
 *  - Frame 1 (0-20%):  "Find What Moves You" headline, building in lower half,
 *                      bright sky with clouds, navigation at top
 *  - Frame 2 (35-65%): building zooms dramatically, "FIND" giant overlay appears,
 *                      "Real Estate" text below, building fills viewport
 *  - Frame 3 (80-100%): building fades into white/clouds, "Why FIND" text appears
 *                        on left, main copy on right
 *
 * Scroll distance: ~300vh for desktop, providing smooth cinematic scrubbing.
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

        const one = <T extends Element>(sel: string) => root.querySelector<T>(sel);
        const all = <T extends Element>(sel: string) => root.querySelectorAll<T>(sel);

        // --- Frame 1 elements ---
        const headline = one<HTMLElement>("[data-hero-headline]");
        const subtitle = one<HTMLElement>("[data-hero-subtitle]");
        const cta = one<HTMLElement>("[data-hero-cta]");
        const building = one<HTMLElement>("[data-hero-building]");
        const skyBg = one<HTMLElement>("[data-hero-sky]");
        const clouds = all<HTMLElement>("[data-hero-cloud]");

        // --- Frame 2 elements ---
        const giantFind = one<HTMLElement>("[data-hero-giant-find]");
        const realEstateText = one<HTMLElement>("[data-hero-real-estate]");
        const buildingMask = one<HTMLElement>("[data-hero-building-mask]");

        // --- Frame 3 elements ---
        const whyFindLabel = one<HTMLElement>("[data-hero-why-find]");
        const nextSectionDark = one<HTMLElement>("[data-hero-next-dark]");
        const nextSectionLight = one<HTMLElement>("[data-hero-next-light]");
        const whiteOverlay = one<HTMLElement>("[data-hero-white-overlay]");

        // --- Animation timeline ---
        const tl = gsap.timeline({
          defaults: { ease: "power1.out" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        });

        // Clone cloud elements array for GSAP animations
        const cloudElements = Array.from(clouds);

        // FRAME 1 → FRAME 2 transition (0% → ~40%)
        tl.to(headline, { opacity: 0, scale: 1.05, duration: 0.15 }, 0)
          .to(subtitle, { opacity: 0, duration: 0.15 }, 0)
          .to(cta, { opacity: 0, duration: 0.15 }, 0)
          .to(building, { scale: 1.6, y: -200, duration: 0.4 }, 0)
          .to(skyBg, { opacity: 0.7, duration: 0.3 }, 0)
          .to(giantFind, { opacity: 1, duration: 0.2 }, 0.15)
          .to(realEstateText, { opacity: 1, duration: 0.15 }, 0.25)
          .to(cloudElements, { scale: 1.3, opacity: 0.8, duration: 0.3 }, 0.1);

        // FRAME 2 → FRAME 3 transition (40% → 100%)
        tl.to(building, { opacity: 0, scale: 2.2, y: -400, duration: 0.4 }, 0.4)
          .to(buildingMask, { opacity: 0, duration: 0.3 }, 0.5)
          .to(giantFind, { opacity: 0, scale: 0.8, duration: 0.3 }, 0.55)
          .to(realEstateText, { opacity: 0, duration: 0.25 }, 0.6)
          .to(whiteOverlay, { opacity: 0.95, duration: 0.35 }, 0.65)
          .to(skyBg, { opacity: 0.3, duration: 0.3 }, 0.7)
          .to(cloudElements, { opacity: 0.4, scale: 1.6, duration: 0.3 }, 0.65)
          .fromTo(whyFindLabel, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.2 }, 0.75)
          .fromTo(nextSectionDark, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, 0.8)
          .fromTo(nextSectionLight, { opacity: 0, y: 30 }, { opacity: 0.6, y: 0, duration: 0.25 }, 0.85);

        teardown = () => {
          tl.scrollTrigger?.kill();
          tl.kill();
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
      {/* Sticky viewport wrapper */}
      <div className="hero_sticky" data-hero-top="">
        {/* Sky/background layer - FRAME 1 base */}
        <div className="hero_sky" data-hero-sky="" />

        {/* Navigation - always visible */}
        <nav className="hero_nav" data-hero-nav="">
          <div className="hero_nav-left">
            <span className="hero_nav-logo">FIND</span>
          </div>
          <div className="hero_nav-center">
            <a href="/search" className="hero_nav-link">Search</a>
            <a href="/neighborhoods" className="hero_nav-link">Neighborhoods</a>
            <a href="/agents" className="hero_nav-link">Agents</a>
            <div className="hero_nav-dropdown">
              <span className="hero_nav-link hero_nav-dropdown-trigger">
                Join
                <svg className="hero_nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="hero_nav-dropdown">
              <span className="hero_nav-link hero_nav-dropdown-trigger">
                Paperwork
                <svg className="hero_nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="hero_nav-dropdown">
              <span className="hero_nav-link hero_nav-dropdown-trigger">
                Resources
                <svg className="hero_nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="hero_nav-dropdown">
              <span className="hero_nav-link hero_nav-dropdown-trigger">
                About
                <svg className="hero_nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
          <div className="hero_nav-right">
            <a href="/signin" className="hero_nav-signin">Sign In</a>
          </div>
        </nav>

        {/* FRAME 1: Hero content - fades out during scroll */}
        <div className="hero_content-frame1" data-hero-content-frame1="">
          <h1 className="hero_headline" data-hero-headline="">
            Find What Moves You
          </h1>
          <p className="hero_subtitle" data-hero-subtitle="">
            <span className="hero_subtitle-dark">Expert agents. Real guidance.</span>
            <span className="hero_subtitle-light">A clear path to find what&rsquo;s next.</span>
          </p>
          <a href="/search" className="hero_cta" data-hero-cta="">
            Find Properties
            <svg className="hero_cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Building image - main visual element */}
        <div className="hero_building-wrap" data-hero-building-wrap="">
          <img
            className="hero_building"
            data-hero-building=""
            src={`${IMG}/house.8ed9b3db.png`}
            alt=""
            loading="eager"
          />
        </div>

        {/* N badge: bottom-left corner */}
        <div className="hero_n-badge">
          <span>N</span>
        </div>

        {/* FRAME 2: Giant FIND overlay - appears during scroll */}
        <div className="hero_giant-find-wrap" data-hero-giant-find-wrap="">
          <div className="hero_giant-find" data-hero-giant-find="">
            FIND
          </div>
          <div className="hero_real-estate" data-hero-real-estate="">
            Real Estate
          </div>
        </div>

        {/* Building mask for cutout effect */}
        <div className="hero_building-mask" data-hero-building-mask="">
          <img
            src={`${IMG}/house.8ed9b3db.png`}
            alt=""
            loading="eager"
          />
        </div>

        {/* Clouds layer */}
        <div className="hero_clouds" data-hero-clouds="">
          <div className="hero_cloud hero_cloud-left" data-hero-cloud="">
            <svg viewBox="0 0 400 200" fill="rgba(255,255,255,0.9)">
              <ellipse cx="100" cy="100" rx="80" ry="60" />
              <ellipse cx="160" cy="90" rx="70" ry="50" />
              <ellipse cx="220" cy="100" rx="90" ry="65" />
              <ellipse cx="290" cy="110" rx="60" ry="45" />
            </svg>
          </div>
          <div className="hero_cloud hero_cloud-right" data-hero-cloud="">
            <svg viewBox="0 0 400 200" fill="rgba(255,255,255,0.9)">
              <ellipse cx="120" cy="100" rx="90" ry="65" />
              <ellipse cx="200" cy="90" rx="70" ry="50" />
              <ellipse cx="280" cy="105" rx="80" ry="55" />
            </svg>
          </div>
          <div className="hero_cloud hero_cloud-bottom" data-hero-cloud="">
            <svg viewBox="0 0 600 200" fill="rgba(255,255,255,0.95)">
              <ellipse cx="100" cy="100" rx="100" ry="70" />
              <ellipse cx="200" cy="90" rx="120" ry="80" />
              <ellipse cx="350" cy="100" rx="110" ry="75" />
              <ellipse cx="480" cy="95" rx="90" ry="60" />
              <ellipse cx="550" cy="105" rx="70" ry="50" />
            </svg>
          </div>
        </div>

        {/* FRAME 3: Next section content - fades in at end */}
        <div className="hero_next-section" data-hero-next-section="">
          <div className="hero_next-left">
            <span className="hero_why-find" data-hero-why-find="">Why FIND</span>
          </div>
          <div className="hero_next-right">
            <p className="hero_next-copy" data-hero-next-copy="">
              <span className="hero_next-dark" data-hero-next-dark="">
                Your life&rsquo;s changing. Don&rsquo;t just find a place &mdash; find what&rsquo;s next.
              </span>
              <br />
              <span className="hero_next-light" data-hero-next-light="">
                We help you move forward with clarity, confidence, and the right agent by your side.
              </span>
            </p>
          </div>
        </div>

        {/* White overlay for Frame 3 transition */}
        <div className="hero_white-overlay" data-hero-white-overlay="" />
      </div>

      {/* Scroll spacer to provide scroll distance */}
      <div className="hero_spacer" />
    </section>
  );
}

export default HeroSection;
