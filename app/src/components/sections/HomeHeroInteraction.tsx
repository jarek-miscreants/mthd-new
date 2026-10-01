"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export default function HomeHeroInteraction({
  componentId,
  title,
}: {
  componentId: string;
  title: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const heroText = document.querySelector(
      `[data-hero-text="${componentId}"]`
    ) as HTMLElement;

    if (!heroText) return;

    const originalText = title;

    // Create an object to animate
    const textObject = { value: 0 };

    // Start with empty text
    heroText.textContent = "";

    // Small delay before starting the animation
    const animation = gsap.to(textObject, {
      value: originalText.length,
      duration: originalText.length * 0.05, // 50ms per character
      ease: "in",
      delay: 0.5, // Start after 500ms
      onUpdate: () => {
        const currentLength = Math.floor(textObject.value);
        heroText.textContent = originalText.substring(0, currentLength);
      },
    });

    return () => {
      animation.kill();
      // Restore original text on cleanup
      if (heroText) {
        heroText.textContent = originalText;
      }
    };
  }, [componentId, pathname, title]);

  return null;
}
