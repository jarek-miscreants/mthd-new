"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface LinkIndicatorInteractionProps {
  children: React.ReactNode;
  triggerOnHover?: boolean;
  triggerOnCheck?: boolean;
}

export default function LinkIndicatorInteraction({
  children,
  triggerOnHover = false,
  triggerOnCheck = false,
}: LinkIndicatorInteractionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const linkIndicator = wrapper.querySelector<SVGElement>(
      "[data-link-indicator]",
    );
    const leftPath = wrapper.querySelector<SVGPathElement>("[data-path-open]");
    const arrowPath =
      wrapper.querySelector<SVGPathElement>("[data-path-arrow]");
    const rightPath =
      wrapper.querySelector<SVGPathElement>("[data-path-close]");

    if (!linkIndicator || !leftPath || !arrowPath || !rightPath) return;

    const ctx = gsap.context(() => {
      // Hover animation
      if (triggerOnHover) {
        const hoverTarget = wrapper.querySelector("a, label");
        if (!hoverTarget) return;

        const animateIn = () => {
          gsap.to(arrowPath, {
            rotation: -45,
            transformOrigin: "center center",
            duration: 0.4,
            color: "var(--swatch--neutral)",
            ease: "power2.out",
          });

          gsap.to(leftPath, {
            x: -5,
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(rightPath, {
            x: 5,
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: "power2.out",
          });
        };

        const animateOut = () => {
          gsap.to(arrowPath, {
            rotation: 0,
            transformOrigin: "center center",
            duration: 0.4,
            color: "inherit",
            ease: "power2.out",
          });

          gsap.to(leftPath, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(rightPath, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: "power2.out",
          });
        };

        hoverTarget.addEventListener("mouseenter", animateIn);
        hoverTarget.addEventListener("mouseleave", animateOut);

        return () => {
          hoverTarget.removeEventListener("mouseenter", animateIn);
          hoverTarget.removeEventListener("mouseleave", animateOut);
        };
      }

      // Checkbox animation (for Accordion)
      if (triggerOnCheck) {
        const input = wrapper.querySelector<HTMLInputElement>(
          "[data-accordion-input]",
        );
        if (!input) return;

        gsap.set(arrowPath, {
          rotation: -135,
          transformOrigin: "center center",
        });

        const handleChange = () => {
          if (input.checked) {
            gsap.to(arrowPath, {
              rotation: 45,
              transformOrigin: "center center",
              duration: 0.4,
              color: "var(--swatch--neutral)",
              ease: "power2.out",
            });

            gsap.to(leftPath, {
              x: -4,
              y: 0,
              rotation: 0,
              duration: 0.4,
              ease: "power2.out",
            });

            gsap.to(rightPath, {
              x: 4,
              y: 0,
              rotation: 0,
              duration: 0.4,
              ease: "power2.out",
            });
          } else {
            gsap.to(arrowPath, {
              rotation: -135,
              transformOrigin: "center center",
              duration: 0.4,
              color: "currentColor",
              ease: "power2.out",
            });

            gsap.to(leftPath, {
              x: 0,
              y: 0,
              rotation: 0,
              duration: 0.4,
              ease: "power2.out",
            });

            gsap.to(rightPath, {
              x: 0,
              y: 0,
              rotation: 0,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        };

        input.addEventListener("change", handleChange);

        return () => {
          input.removeEventListener("change", handleChange);
        };
      }
    }, wrapper);

    return () => ctx.revert();
  }, [triggerOnHover, triggerOnCheck]);

  return (
    <div ref={wrapperRef} className="contents">
      {children}
    </div>
  );
}
