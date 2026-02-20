"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lineAnimationDefaults } from "@/lib/animationHelpers";

gsap.registerPlugin(ScrollTrigger);

interface PartnersInteractionProps {
  children: React.ReactNode;
}

export default function PartnersInteraction({
  children,
}: PartnersInteractionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ctx: gsap.Context | null = null;

    const container = wrapper.querySelector<HTMLElement>(
      "[data-partners-container]",
    );

    if (!container) return;

    const timeoutId = setTimeout(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            scrub: 2,
            markers: false,
          },
        });

        tl.to(
          container,
          {
            ...lineAnimationDefaults,
            "--height": "100%",
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
