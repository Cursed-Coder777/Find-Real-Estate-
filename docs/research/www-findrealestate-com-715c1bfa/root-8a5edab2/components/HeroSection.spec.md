# HeroSection Specification

## Overview
- **Target file:** `src/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/HeroSection.tsx`
- **Styles:** `src/styles/find/hero.css`
- **Interaction model:** scroll-driven (GSAP ScrollTrigger)
- **Scroll distance:** 300vh sticky pinned section

## Reference Frames
1. **ezgif-frame-001.jpg** - Initial state: hero with headline, building, sky
2. **ezgif-frame-007.jpg** - Middle: building zoomed, FIND overlay
3. **ezgif-frame-010.jpg** - End: white/clouds, "Why FIND" section

## DOM Structure

```
.hero_root (relative, scroll container)
  .hero_sticky (sticky, 100vh, overflow hidden)
    .hero_sky (z-index 1) - background gradient with clouds
    .hero_nav (z-index 10) - navigation bar
      .hero_nav-left - FIND logo
      .hero_nav-center - nav links
      .hero_nav-right - Sign In button
    .hero_content-frame1 (z-index 5) - headline, subtitle, CTA
    .hero_building-wrap (z-index 3) - building image
    .hero_giant-find-wrap (z-index 6, opacity 0) - FIND overlay
    .hero_clouds (z-index 4) - cloud images
    .hero_next-section (z-index 15, opacity 0) - Frame 3 content
    .hero_white-overlay (z-index 9, opacity 0) - white fade
    .hero_n-badge (z-index 12) - N circle badge
  .hero_spacer (300vh) - scroll distance
```

## Computed Styles (Desktop 1440px)

### .hero_root
- position: relative
- width: 100%

### .hero_sticky
- position: sticky
- top: 0
- height: 100vh
- width: 100%
- overflow: hidden
- background: #CBE3F7

### .hero_sky
- position: absolute
- inset: 0
- z-index: 1
- background: 
  - radial-gradient(ellipse at 15% 85%, rgba(244,211,197,0.65) 0%, transparent 55%)
  - linear-gradient(180deg, #CBE3F7 0%, #D4E8F7 20%, #E8F4FC 50%, #F0F7FC 65%, #F4D3C5 100%)

### .hero_nav
- position: absolute
- top: 0
- left: 0
- right: 0
- z-index: 10
- pointer-events: none

### .hero_nav-left
- position: absolute
- left: 90px
- top: 25px
- display: flex
- align-items: center

### .hero_nav-logo
- font-size: 38px
- font-weight: 900
- letter-spacing: -0.02em
- color: #fff
- line-height: 1
- text-shadow: 0 2px 8px rgba(0,0,0,0.12)
- font-family: inherit (Instrument Sans)

### .hero_nav-center
- position: absolute
- left: 50%
- top: 25px
- transform: translateX(-50%)
- display: flex
- align-items: center
- gap: 40px

### .hero_nav-link
- font-size: 17px
- font-weight: 500
- color: #fff
- text-decoration: none
- letter-spacing: -0.01em
- white-space: nowrap
- text-shadow: 0 1px 3px rgba(0,0,0,0.08)
- transition: opacity 0.2s

### .hero_nav-arrow
- width: 14px
- height: 14px
- transition: transform 0.2s

### .hero_nav-right
- position: absolute
- right: 90px
- top: 10px
- display: flex
- align-items: center

### .hero_nav-signin
- display: inline-flex
- align-items: center
- justify-content: center
- width: 115px
- height: 55px
- background: #111
- color: #fff
- border-radius: 30px
- font-size: 15px
- font-weight: 500
- text-decoration: none
- letter-spacing: -0.01em
- transition: all 0.2s ease
- pointer-events: auto
- box-shadow: 0 2px 10px rgba(0,0,0,0.18)

### .hero_content-frame1
- position: absolute
- top: 195px
- left: 50%
- transform: translateX(-50%)
- z-index: 5
- text-align: center
- width: 100%
- pointer-events: none

### .hero_headline
- font-size: clamp(100px, 12vw, 128px)
- font-weight: 900
- letter-spacing: -0.04em
- line-height: 0.9
- color: #111
- margin: 0
- text-shadow: 0 3px 15px rgba(0,0,0,0.1)

### .hero_subtitle
- margin-top: 20px
- font-size: clamp(15px, 1.6vw, 18px)
- line-height: 1.45
- text-align: center
- max-width: 560px
- font-weight: 400

### .hero_subtitle-dark
- color: #111
- font-weight: 500

### .hero_subtitle-light
- color: rgba(21,23,23,0.45)

### .hero_cta
- display: inline-flex
- align-items: center
- gap: 10px
- margin-top: 38px
- padding: 0 32px
- height: 55px
- background: #111
- color: #fff
- border-radius: 50px
- font-size: 15px
- font-weight: 500
- text-decoration: none
- letter-spacing: -0.01em
- transition: all 0.2s ease
- pointer-events: auto
- box-shadow: 0 4px 16px rgba(0,0,0,0.22)

### .hero_cta-arrow
- width: 18px
- height: 18px
- flex-shrink: 0

### .hero_building-wrap
- position: absolute
- bottom: 0
- left: 0
- right: 0
- height: 56%
- z-index: 3
- overflow: hidden
- transform-origin: bottom center

### .hero_building
- position: absolute
- inset: 0
- width: 100%
- height: 100%
- object-fit: cover
- object-position: center 30%
- filter: blur(0.3px)

### .hero_giant-find-wrap
- position: absolute
- inset: 0
- z-index: 6
- display: flex
- flex-direction: column
- align-items: center
- justify-content: center
- pointer-events: none
- opacity: 0

### .hero_giant-find
- font-size: clamp(180px, 26vw, 360px)
- font-weight: 900
- letter-spacing: -0.025em
- color: rgba(255,255,255,0.75)
- line-height: 0.88
- text-transform: uppercase
- text-shadow: 0 4px 30px rgba(0,0,0,0.2)
- mix-blend-mode: overlay

### .hero_real-estate
- font-size: clamp(28px, 4vw, 52px)
- font-weight: 500
- color: rgba(255,255,255,0.8)
- line-height: 1.1
- margin-top: 6px
- letter-spacing: -0.01em
- text-shadow: 0 2px 12px rgba(0,0,0,0.15)

### .hero_clouds
- position: absolute
- inset: 0
- z-index: 4
- pointer-events: none

### .hero_cloud
- position: absolute
- opacity: 0.85
- object-fit: cover
- filter: blur(1px)

### .hero_cloud-left
- top: 8%
- left: -15%
- width: 60%
- height: 35%
- object-position: center 30%

### .hero_cloud-right
- top: 12%
- right: -15%
- width: 55%
- height: 30%
- object-position: center 40%

### .hero_cloud-bottom
- bottom: 0
- left: 0
- right: 0
- height: 55%
- object-position: center 20%

### .hero_next-section
- position: absolute
- bottom: 0
- left: 0
- right: 0
- z-index: 15
- display: flex
- align-items: flex-start
- justify-content: space-between
- padding: 0 90px
- pointer-events: none
- padding-top: 675px

### .hero_next-left
- width: 150px

### .hero_why-find
- font-size: 18px
- font-weight: 500
- color: #111
- letter-spacing: -0.01em

### .hero_next-right
- width: 50%
- max-width: 540px

### .hero_next-copy
- font-size: clamp(22px, 3vw, 38px)
- line-height: 1.18
- font-weight: 400
- letter-spacing: -0.01em

### .hero_next-dark
- color: #111
- font-weight: 600

### .hero_next-light
- color: rgba(21,23,23,0.45)
- display: block
- margin-top: 12px

### .hero_white-overlay
- position: absolute
- inset: 0
- z-index: 9
- background: #fff
- opacity: 0
- pointer-events: none

### .hero_n-badge
- position: absolute
- bottom: 28px
- left: 28px
- z-index: 12
- width: 40px
- height: 40px
- background: #111
- border-radius: 50%
- display: flex
- align-items: center
- justify-content: center
- color: #fff
- font-size: 15px
- font-weight: 700
- text-transform: uppercase

### .hero_spacer
- height: 300vh

## States & Behaviors

### Scroll Animation Timeline (GSAP ScrollTrigger)
- **Trigger:** hero_root
- **Start:** top top
- **End:** bottom bottom
- **Scrub:** 1.5s

### Frame 1 → Frame 2 (0% → ~40%)
- headline: opacity 1→0, scale 1→1.05
- subtitle: opacity 1→0
- cta: opacity 1→0
- building: scale 1→1.6, y 0→-200px
- skyBg: opacity 1→0.7
- giantFind: opacity 0→1 (at 15%)
- realEstateText: opacity 0→1 (at 25%)
- clouds: scale 1→1.3, opacity 0.85→0.8 (at 10%)

### Frame 2 → Frame 3 (40% → 100%)
- building: opacity 1→0, scale 1.6→2.2, y -200→-400px (at 40%)
- buildingMask: opacity 0→0 (at 50%)
- giantFind: opacity 1→0, scale 1→0.8 (at 55%)
- realEstateText: opacity 1→0 (at 60%)
- whiteOverlay: opacity 0→0.95 (at 65%)
- skyBg: opacity 0.7→0.3 (at 70%)
- clouds: opacity 0.8→0.4, scale 1.3→1.6 (at 65%)
- whyFindLabel: opacity 0→1, y 20→0 (at 75%)
- nextSectionDark: opacity 0→1, y 30→0 (at 80%)
- nextSectionLight: opacity 0→0.6, y 30→0 (at 85%)

### Hover States
- .hero_nav-link: opacity 1→0.8 on hover
- .hero_nav-signin: background #111→#222, transform translateY(-1px), box-shadow increase
- .hero_cta: background #111→#222, transform translateY(-2px), box-shadow increase

## Assets
- Building: `public/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/images/house.8ed9b3db.png`
- Clouds: `public/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/images/cloud.c8800fa9.png`

## Text Content (verbatim)
- Logo: "FIND"
- Nav links: "Search", "Neighborhoods", "Agents", "Join", "Paperwork", "Resources", "About"
- Sign In button: "Sign In"
- Headline: "FindWhatMovesYou" (no spaces)
- Subtitle dark: "Expert agents. Real guidance."
- Subtitle light: "A clear path to find what's next."
- CTA: "Find Properties" + arrow
- Giant overlay: "FIND" + "Real Estate"
- Why FIND label: "Why FIND"
- Next section dark: "Your life's changing. Don't just find a place — find what's next."
- Next section light: "We help you move forward with clarity, confidence, and the right agent by your side."
- N badge: "N"

## Responsive Behavior

### Tablet (1024px)
- Nav padding: 0 40px
- Logo: 32px, left 40px, top 22px
- Nav center: hidden
- Sign In: 100px × 48px, right 40px, top 10px
- Headline: top 140px, clamp(72px, 10vw, 100px)
- Subtitle: top 18px, 14px
- CTA: margin-top 28px, height 48px, padding 0 28px, 14px
- Building: 50% height
- Giant FIND: clamp(130px, 20vw, 240px), rgba(255,255,255,0.6)
- Real Estate: clamp(22px, 3.5vw, 34px), rgba(255,255,255,0.7)
- Next section: padding 0 40px, padding-top 500px
- N badge: 34px, bottom 20px, left 20px, 13px font

### Mobile (768px)
- Nav padding: 0 16px
- Logo: 28px, left 16px, top 16px
- Nav center: hidden
- Sign In: 80px × 40px, right 16px, top 8px
- Headline: top 100px, clamp(48px, 11vw, 68px)
- Subtitle: 13px, margin-top 12px, max-width 340px
- CTA: margin-top 20px, height 42px, padding 0 20px, 13px, gap 6px
- Building: 52% height
- Giant FIND: clamp(80px, 16vw, 140px), rgba(255,255,255,0.5)
- Real Estate: clamp(16px, 3vw, 22px)
- Next section: flex-direction column, gap 12px, padding 0 16px, padding-top 350px
- Next right: width 100%
- N badge: 32px, bottom 16px, left 16px, 12px font
- Clouds left/right: display none

### Small Mobile (480px)
- Nav padding: 12px 15px
- Logo: 26px
- Sign In: 72px × 36px, 12px font
- Headline: top 90px, clamp(40px, 13vw, 56px)
- Subtitle: 12px, max-width 280px
- CTA: height 38px, padding 0 16px, 12px
- Building: 58% height
- Giant FIND: clamp(60px, 14vw, 100px)
- Next copy: clamp(14px, 4vw, 18px)
- Next section: padding-top 280px

## Fonts
- Primary: Instrument Sans (variable, 400-700) - already configured in layout.tsx
- The design uses a neo-grotesk sans-serif aesthetic

## Colors
- Sky primary: #CBE3F7
- Sky mid: #D4E8F7, #E8F4FC, #F0F7FC
- Sky warm glow: #F4D3C5
- Text dark: #111
- Text light gray: rgba(21,23,23,0.45)
- Nav text: #fff
- CTA/nave white text: #fff
- N badge: #111 bg, #fff text
