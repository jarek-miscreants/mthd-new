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

interface MissionInteractionProps {
  children: React.ReactNode;
}

export default function MissionInteraction({
  children,
}: MissionInteractionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ctx: gsap.Context | null = null;

    const container = wrapper.querySelector<HTMLElement>(
      "[data-mission-container]",
    );

    const title = wrapper.querySelector<HTMLElement>("[data-mission-title]");

    const paragraph = wrapper.querySelector<HTMLElement>(
      "[data-mission-paragraph]",
    );

    if (!title || !paragraph) return;

    const timeoutId = setTimeout(() => {
      paragraph.innerHTML = paragraph.textContent!.replace(
        /\n\n/g,
        "<br>&nbsp;<br>",
      );

      ctx = gsap.context(() => {
        const splitParagraph = new SplitText(paragraph, {
          type: "words,lines",
          linesClass: "line",
          mask: "lines",
          reduceWhiteSpace: false,
        });

        const tl1 = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            scrub: 2,
            markers: false,
          },
        });
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: paragraph,
            start: "top 100%",
            toggleActions: "restart none none none",
            markers: false,
          },
        });

        tl1.to(
          container,
          {
            ...lineAnimationDefaults,
            "--height": "100%",
          },
          "<",
        );

        tl1.from(
          paragraph,
          {
            ...lineAnimationDefaults,
          },
          "<",
        );

        tl2.from(
          splitParagraph.lines,
          {
            ...splitAnimationDefaults,
          },
          "<",
        );
      }, wrapper);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (ctx) ctx.revert();
    };
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}
