"use client";

import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scalePathDepth, sectionClipperConfig } from "@/lib/animationHelpers";

gsap.registerPlugin(ScrollTrigger);

interface SectionBottomClipperProps {
  initialPath?: string;
  targetPathMultiplier?: number;
  mobileTargetMultiplier?: number;
}

export default function SectionBottomClipper({
  initialPath = sectionClipperConfig.initialPath,
  targetPathMultiplier = sectionClipperConfig.targetPathMultiplier,
  mobileTargetMultiplier = sectionClipperConfig.mobileTargetMultiplier,
}: SectionBottomClipperProps) {
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
        <clipPath id="section-bottom-clip" clipPathUnits="objectBoundingBox">
          <path ref={pathRef} d={initialPath} transform="rotate(180 0.5 0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
}
