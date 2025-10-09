"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SectionClipperProps {
  initialPath?: string;
  targetPath?: string;
}

export default function SectionClipper({
  initialPath = "M0.2947 0.0000518L0 0.0000518L0 1L1 1L1 0.0000002L0.4156 0.0000502C0.4035 0.0000507 0.3921 0.0000512 0.3842 0.0000516L0.3262 0.0000517C0.3183 0.0000517 0.3069 0.0000518 0.2947 0.0000518Z",
  targetPath = "M0.2947 0.1094L0 0.1094L0 1L1 1L1 0.0000002L0.4156 0.0000502C0.4035 0.0000512 0.3921 0.0060 0.3842 0.0165L0.3262 0.0929C0.3183 0.1034 0.3069 0.1094 0.2947 0.1094Z",
}: SectionClipperProps) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(max-width: 991px)", () => {
        if (pathRef.current) {
          gsap.set(pathRef.current, { attr: { d: initialPath } });
        }
      });

      mm.add("(min-width: 992px)", () => {
        gsap.to(pathRef.current, {
          attr: { d: targetPath },
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: ".clip-section",
            start: "top 200%",
            end: "top -50%",
            scrub: 1.6,
            markers: false,
          },
        });
      });
    });

    return () => ctx.revert();
  }, [initialPath, targetPath]);

  return (
    <svg
      className="absolute inset-[0] z-[2] pointer-events-none"
      width="100%"
      height="100%"
      viewBox="0 0 950 857"
    >
      <defs>
        <clipPath id="my-mask" clipPathUnits="objectBoundingBox">
          <path ref={pathRef} d={initialPath} />
        </clipPath>
      </defs>
    </svg>
  );
}
