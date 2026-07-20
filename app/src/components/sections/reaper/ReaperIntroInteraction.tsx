"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Scroll-driven "highlight text" reveal.
 *
 * Splits any descendant `[data-highlight-text]` into chars and scrubs each
 * from a faded opacity to full as the element scrolls through the viewport.
 * Behaviour mirrors the project's Webflow highlight-text script; per-element
 * tuning via data attributes:
 *   data-highlight-scroll-start (default "top 90%")
 *   data-highlight-scroll-end   (default "center 40%")
 *   data-highlight-fade         (default 0.2)
 *   data-highlight-stagger      (default 0.1)
 */
export default function ReaperIntroInteraction({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let ctx: gsap.Context | null = null;

    // Let fonts/layout settle before splitting (matches MissionInteraction).
    const timeoutId = setTimeout(() => {
      ctx = gsap.context(() => {
        const targets = root.querySelectorAll<HTMLElement>(
          "[data-highlight-text]",
        );

        targets.forEach((heading) => {
          const scrollStart =
            heading.dataset.highlightScrollStart || "top 90%";
          const scrollEnd = heading.dataset.highlightScrollEnd || "center 40%";
          const fadedValue = parseFloat(heading.dataset.highlightFade || "0.2");
          const staggerValue = parseFloat(
            heading.dataset.highlightStagger || "0.1",
          );

          const split = new SplitText(heading, { type: "words,chars" });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: heading,
              start: scrollStart,
              end: scrollEnd,
              scrub: true,
            },
          });

          tl.from(
            split.chars,
            {
              autoAlpha: fadedValue,
              stagger: staggerValue,
              ease: "linear",
            },
            0,
          );

          // Side rule fills top→bottom in sync with the text reveal,
          // acting as a progress indicator for the line being animated.
          const fill = heading
            .closest("[data-highlight-group]")
            ?.querySelector<HTMLElement>("[data-highlight-line]");

          if (fill) {
            tl.fromTo(
              fill,
              { scaleY: 0 },
              { scaleY: 1, ease: "linear", duration: tl.duration() },
              0,
            );
          }
        });
      }, root);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (ctx) ctx.revert();
    };
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
