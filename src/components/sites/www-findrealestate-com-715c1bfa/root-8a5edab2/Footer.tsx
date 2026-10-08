"use client";

import { useEffect, useRef } from "react";

import {
  FOOTER_CONTACTS,
  FOOTER_LINKS,
  FOOTER_NOTICES,
  FOOTER_SOCIALS,
  FOOTER_SUBLINKS,
} from "./data";
import { ArrowRightIcon, LogoIcon } from "./shared/icons";

/**
 * Footer.
 *
 * Captured state: `.footer_content` sits at
 * `opacity: 0; transform: translate(0px, -40%) scale(0.98, 0.98)` and animates
 * to `opacity: 1; translate 0; scale 1` once the footer enters the viewport.
 * The wordmark paths animate in individually from `y +20px, opacity 0`.
 */
export function Footer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            gsap.to(content, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power3.out",
            });
            gsap.to(content.querySelectorAll("path[data-letter]"), {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.05,
            });
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
      );
      observer.observe(wrap);
      teardown = () => observer.disconnect();
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return (
    <div className="footer_wrapper" ref={wrapRef}>
      <div className="container_container">
        <div
          className="footer_content"
          ref={contentRef}
          style={{ opacity: 0, transform: "translate(0px, -40%) scale(0.98, 0.98)" }}
        >
          <div className="footer_newsletter-container">
            <div>
              <div className="footer_newsletter-title">
                Subscribe to our Newsletter!
              </div>
              <div className="footer_newsletter-form">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="footer_input-container">
                    <div className="form-text-input_form-input">
                      <div className="text-input_input-wrapper form-text-input_input-wrapper footer_input-wrapper text-input_dark">
                        <input
                          type="email"
                          className="text-input_input"
                          placeholder="Enter address"
                          autoComplete="on"
                          name="email"
                          aria-label="Email address"
                        />
                      </div>
                    </div>
                    <button
                      id="btn_newsletter_signup_footer"
                      type="submit"
                      className="footer_newsletter-submit-btn"
                      aria-label="Subscribe"
                    >
                      <ArrowRightIcon />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="footer_contacts">
              {FOOTER_CONTACTS.map((contact) => (
                <div key={contact.label} className="footer_contact">
                  <div className="footer_contact-label">{contact.label}</div>
                  <div className="footer_contact-value">
                    <a href={contact.href}>
                      {contact.lines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="footer_links">
            <div className="footer_nav">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  className="footer_nav-link"
                  href={link.href}
                >
                  <span data-text={link.label}>{link.label}</span>
                </a>
              ))}
            </div>
            <div className="footer_socials">
              {FOOTER_SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer_social-link"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="footer_logo">
            <LogoIcon aria-label="FIND" role="img" style={{ color: "#ffffff" }} />
          </div>

          <div className="footer_copyright-container">
            <div className="footer_sublinks">
              {FOOTER_SUBLINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                </a>
              ))}
              {FOOTER_NOTICES.map((notice) => (
                <span key={notice}>{notice}</span>
              ))}
            </div>
            <div>FIND Real Estate</div>
            <div>Copyright © {new Date().getFullYear()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
