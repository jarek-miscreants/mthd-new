"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitAnimationDefaults } from "@/lib/animationHelpers";

gsap.registerPlugin(ScrollTrigger);

/**
 * Global reveal for the page's vertical rules and their headers.
 *
 * As each `[data-vline]` rule scrolls into view it grows top→bottom, and each
 * `[data-reveal]` header slides up + fades in (the homepage's
 * `splitAnimationDefaults`). Triggering is per-element via `ScrollTrigger.batch`
 * so a rule animates when *it* reaches the viewport — not when its section top
 * does. (A single per-section trigger fired indicators that sit below a tall
 * visual while they were still off screen, so they looked static on arrival.)
 * Elements that enter together still stagger as a batch.
 *
 * A MutationObserver picks up elements added after mount (e.g. switching
 * toolkit tabs) while ignoring text-only mutations like the honeycomb
 * typewriter. Respects prefers-reduced-motion.
 */
export default function ReaperLineReveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();
    const triggers: ScrollTrigger[] = [];

    // Bastion sections trigger a touch earlier than the Reaper default so
    // indicators/headers don't feel like they arrive late.
    const defaultStart = root.closest("[data-bastion-page]")
      ? "top 90%"
      : "top 85%";

    const collect = (selector: string) =>
      Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => {
        if (seen.has(el)) return false;
        seen.add(el);
        return true;
      });

    const reveal = () => {
      const lines = collect("[data-vline]");
      const heads = collect("[data-reveal]");
      if (!lines.length && !heads.length) return;

      if (reduce) {
        gsap.set(lines, { scaleY: 1 });
        return; // headers already render in their natural state
      }

      // Per-element triggers: each rule / header animates as it enters the
      // viewport. batch() staggers any that come in together (e.g. a 3-up row).
      if (lines.length) {
        gsap.set(lines, { scaleY: 0, transformOrigin: "top" });
        triggers.push(
          ...ScrollTrigger.batch(lines, {
            start: defaultStart,
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                scaleY: 1,
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.18,
              }),
          }),
        );
      }

      if (heads.length) {
        gsap.set(heads, { yPercent: 100, opacity: 0 });
        // Most headers share the default start; a section can fire earlier/later
        // by setting `data-reveal-start` (e.g. tab headers sitting below a tall
        // visual). Group by start so each value batches/staggers together.
        const headGroups = new Map<string, HTMLElement[]>();
        for (const el of heads) {
          const start = el.dataset.revealStart || defaultStart;
          (headGroups.get(start) ?? headGroups.set(start, []).get(start)!).push(
            el,
          );
        }
        for (const [start, els] of headGroups) {
          triggers.push(
            ...ScrollTrigger.batch(els, {
              start,
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  yPercent: 0,
                  opacity: 1,
                  duration: splitAnimationDefaults.duration,
                  ease: splitAnimationDefaults.ease,
                  stagger: splitAnimationDefaults.stagger,
                }),
            }),
          );
        }
      }
    };

    reveal();

    // React only to element insertions (tab switches, etc.) — ignore the
    // honeycomb typewriter's text-node churn.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            reveal();
            return;
          }
        }
      }
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={rootRef} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
