"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export default function HomeHeroInteraction({ componentId, title }: {
  componentId: string;
  title: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const heroText = document.querySelector<HTMLElement>(`[data-hero-text="${componentId}"]`);
    if (!heroText || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const characters = heroText.querySelectorAll("[data-hero-character]");
    // Reveal letters in their final positions so line wrapping and centering stay fixed.
    const context = gsap.context(() => {
      gsap.timeline({ delay: 0.35, repeat: -1, repeatDelay: 10 })
        .set(heroText, { opacity: 1 })
        .fromTo(characters, { opacity: 0 }, { opacity: 1, duration: 0.001, stagger: 0.025, ease: "none" })
        .to(heroText, { opacity: 0, duration: 0.6, ease: "power2.in" }, "+=3");
    });
    return () => context.revert();
  }, [componentId, pathname, title]);

  return null;
}
