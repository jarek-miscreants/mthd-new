"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
        // Fade out backdrop on scroll
        const backdrop = document.querySelector('[data-backdrop="company"]');
        if (backdrop) {
          gsap.to(backdrop, {
            opacity: 0,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=300",
              scrub: true,
            },
          });
        }
      }, section);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (ctx) ctx.revert();
    };
  }, []);

  return <div ref={sectionRef}>{children}</div>;
}
