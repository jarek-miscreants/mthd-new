"use client";

import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scalePathDepth, sectionClipperConfig } from "@/lib/animationHelpers";

gsap.registerPlugin(ScrollTrigger);

interface SectionTopClipperProps {
  initialPath?: string;
  targetPathMultiplier?: number;
  mobileTargetMultiplier?: number;
}

export default function SectionTopClipper({
  initialPath = sectionClipperConfig.initialPath,
  targetPathMultiplier = sectionClipperConfig.targetPathMultiplier,
  mobileTargetMultiplier = sectionClipperConfig.mobileTargetMultiplier,
}: SectionTopClipperProps) {
  const svgRef = useRef(null);
  const pathRef = useRef<SVGPathElement>(null);

  const targetPath = useMemo(
    () => scalePathDepth(initialPath, targetPathMultiplier),
    [initialPath, targetPathMultiplier],
  );

  const mobileTargetPath = useMemo(
    () => scalePathDepth(initialPath, mobileTargetMultiplier),
    [initialPath, mobileTargetMultiplier],
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.to(pathRef.current, {
          attr: { d: targetPath },
          ease: sectionClipperConfig.ease,
          scrollTrigger: {
            trigger: svgRef.current,
            ...sectionClipperConfig.scrollTrigger,
          },
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.to(pathRef.current, {
          attr: { d: mobileTargetPath },
          ease: sectionClipperConfig.ease,
          scrollTrigger: {
            trigger: svgRef.current,
            ...sectionClipperConfig.scrollTrigger,
          },
        });
      });
    });

    return () => ctx.revert();
  }, [targetPath, mobileTargetPath]);

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 950 150">
      <defs>
        <clipPath id="section-top-clip" clipPathUnits="objectBoundingBox">
          <path ref={pathRef} d={initialPath} />
        </clipPath>
      </defs>
    </svg>
  );
}
