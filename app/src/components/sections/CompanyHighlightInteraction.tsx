"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import {
  lineAnimationDefaults,
  splitAnimationDefaults,
} from "@/lib/animationHelpers";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface CompanyHighlightInteractionProps {
  children: React.ReactNode;
}

export default function CompanyHighlightInteraction({
  children,
}: CompanyHighlightInteractionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ctx: gsap.Context | null = null;

    const timeoutId = setTimeout(() => {
      ctx = gsap.context(() => {
        const items = Array.from(
          section.querySelectorAll<HTMLElement>(
            '[data-name="highlight-text-wrap"]',
          ),
        );
        if (items.length === 0) return;

        items.forEach((item) => {
          const eyebrow = item.querySelector<HTMLElement>(
            '[data-name="highlight-text-eyebrow"]',
          );
          const line = item.querySelector<HTMLElement>(
            '[data-name="highlight-text"]',
          );
          if (!eyebrow || !line) return;

          line.innerHTML = line.textContent!.replace(/\n\n/g, "<br>&nbsp;<br>");

          const split = new SplitText(line, {
            type: "words,lines",
            linesClass: "line",
            mask: "lines",
            reduceWhiteSpace: false,
          });
          const perLineDuration = 0.95;
          const perLineStagger = 0.15;
          const lineCount = (split.lines as HTMLElement[]).length || 1;
          const splitTotal = (lineCount - 1) * perLineStagger + perLineDuration;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 70%",
              toggleActions: "play none none none",
              scrub: false,
              markers: false,
            },
          });

          tl.set(item, { autoAlpha: 1 });
          tl.addLabel("intro");

          tl.from(
            line,
            {
              ...lineAnimationDefaults,
              duration: splitTotal,
            },
            "intro",
          );

          tl.from(
            split.lines,
            {
              ...splitAnimationDefaults,
              duration: perLineDuration,
              stagger: perLineStagger,
            },
            "intro",
          );

          const staggerTargets: HTMLElement[] = [line, eyebrow].filter(
            Boolean,
          ) as HTMLElement[];
          tl.from(
            staggerTargets,
            {
              opacity: 0,
              duration: 0.1,
              ease: "none",
              stagger: { each: 0.3, from: "start" },
            },
            "intro",
          );
        });
      }, section);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (ctx) ctx.revert();
    };
  }, []);

  return <div ref={sectionRef}>{children}</div>;
}
