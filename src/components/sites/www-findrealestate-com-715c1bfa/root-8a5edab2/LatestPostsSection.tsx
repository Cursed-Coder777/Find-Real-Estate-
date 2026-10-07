import Link from "next/link";
import { Fragment } from "react";

import { POSTS } from "./content";
import { ArrowRightIcon } from "./shared/icons";
import { HighlightLines } from "./shared/HighlightLines";
import { RevealGroup } from "./shared/RevealGroup";

/**
 * Blog & Resources (section 9) — three blog post entries on the muted
 * `#f1f1f1` surface. Dates are rendered verbatim (ISO strings) exactly like
 * the origin.
 */
export function LatestPostsSection() {
  return (
    <section className="latest-posts_root">
      <div className="container_container">
        <div className="latest-posts_grid">
          <div>
            <HighlightLines
              className="latest-posts_title"
              label="Blog & Resources"
              tone="muted"
              lines={[
                <Fragment key="line-0">
                  <h2>
                    <div>
                      Blog <span className="em">&amp;</span>
                    </div>
                    <div>
                      <span className="em">Resources</span>
                    </div>
                  </h2>
                </Fragment>,
              ]}
            />
          </div>
          <div>
            <div className="latest-posts_text">
              <p>
                See how we’ve helped clients achieve their real estate dreams,
                one successful move at a time.
              </p>
            </div>
            <div className="latest-posts_actions">
              <div>
                <Link
                  className="button_button-round button_color-primary"
                  href="/blog"
                >
                  <div className="button_content">
                    <div className="button_button-round-text">
                      <span data-text="Visit Our Blog">Visit Our Blog</span>
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

        <RevealGroup
          itemSelector=".latest-posts_item"
          fromY={32}
          stagger={0.1}
          className="latest-posts_items"
        >
          {POSTS.map((post) => (
            <div key={post.href} className="latest-posts_item">
              <div className="post-entry_root">
                <div className="post-entry_grid">
                  <div className="post-entry_grid-col">
                    <Link
                      className="post-entry_thumbnail"
                      href={post.href}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <div className="image_container image_loaded">
                        <img
                          className="image_image image_lazy"
                          src={post.image}
                          alt={post.alt}
                          loading="lazy"
                          fetchPriority="low"
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="post-entry_grid-col">
                    <div className="post-entry_date">{post.date}</div>
                    <div>
                      <Link className="post-entry_title" href={post.href}>
                        {post.title}
                      </Link>
                      <div className="post-entry_text">
                        <p>{post.excerpt}</p>
                      </div>
                    </div>
                    <div className="post-entry_action">
                      <Link
                        className="button_button-round button_color-secondary"
                        href={post.href}
                      >
                        <div className="button_content">
                          <div className="button_button-round-text">
                            <span data-text="Read More">Read More</span>
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
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export default LatestPostsSection;
