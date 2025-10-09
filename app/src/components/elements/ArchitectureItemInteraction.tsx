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

interface ArchitectureItemInteractionProps {
  children: React.ReactNode;
}

export default function ArchitectureItemInteraction({
  children,
}: ArchitectureItemInteractionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const title = wrapper.querySelector<HTMLElement>(
      "[data-architecture-title]",
    );
    const subtext = wrapper.querySelector<HTMLElement>(
      "[data-architecture-subtext]",
    );

    if (!title || !subtext) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // desktop
      mm.add("(min-width: 768px)", () => {
        const splitTitle = new SplitText(title, {
          type: "words,lines",
          linesClass: "line",
          mask: "lines",
          reduceWhiteSpace: false,
        });
        const splitSubText = new SplitText(subtext, {
          type: "words,lines",
          linesClass: "line",
          mask: "lines",
          reduceWhiteSpace: false,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            toggleActions: "restart none none none",
            markers: false,
          },
        });
        tl.from(
          splitTitle.lines,
          {
            ...splitAnimationDefaults,
          },
          "+0.25",
        );

        tl.from(title, { ...lineAnimationDefaults }, "<=0.2");

        tl.from(
          splitSubText.lines,
          {
            ...splitAnimationDefaults,
          },
          "<=0.2",
        );

        tl.from(
          subtext,
          {
            ...lineAnimationDefaults,
          },
          "<",
        );
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}
