"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface AccordionInteractionProps {
  children: React.ReactNode;
}

export default function AccordionInteraction({
  children,
}: AccordionInteractionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const input = wrapper.querySelector<HTMLInputElement>(
      "[data-accordion-input]",
    );
    const content = wrapper.querySelector<HTMLDivElement>(
      "[data-accordion-content]",
    );
    const video = wrapper.querySelector<HTMLVideoElement>("video");

    if (!input || !content) return;

    const handleChange = () => {
      if (input.checked) {
        gsap.to(content, {
          height: "auto",
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            if (video) {
              video.play().catch((error) => {
                console.error("Error playing video:", error);
              });
            }
          },
        });
      } else {
        gsap.to(content, {
          height: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            if (video) {
              video.pause();
            }
          },
        });
      }
    };

    input.addEventListener("change", handleChange);

    return () => {
      input.removeEventListener("change", handleChange);
    };
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}
