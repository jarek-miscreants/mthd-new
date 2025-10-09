"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(ScrambleTextPlugin);

export default function FooterInteraction({
  componentId,
}: {
  componentId: string;
}) {
  useEffect(() => {
    const footer = document.querySelector(`[data-footer="${componentId}"]`);

    if (!footer) return;

    const timer = setTimeout(() => {
      const links =
        footer.querySelectorAll<HTMLAnchorElement>(`[data-footer-link]`);

      links.forEach((link) => {
        const originalText = link.textContent || "";

        link.addEventListener("mouseenter", () => {
          gsap.killTweensOf(link);

          gsap.to(link, {
            duration: 0.6,
            scrambleText: {
              text: originalText,
              chars: "!?%$&_!?%$&",
              revealDelay: 0,
              speed: 0.5,
              tweenLength: false,
            },
          });
        });
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [componentId]);

  return null;
}
