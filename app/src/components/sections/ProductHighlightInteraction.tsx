"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ProductHighlightInteraction() {
  useEffect(() => {
    const wrap = document.querySelector(".ph_wrap") as HTMLElement | null;
    const items = gsap.utils.toArray<HTMLElement>(".ph_item");
    if (!wrap || items.length === 0) return;

    const triggers: ScrollTrigger[] = [];

    items.forEach((item, i) => {
      const next = items[i + 1] ?? wrap;

      const st = ScrollTrigger.create({
        trigger: item,
        start: "top top",
        endTrigger: next,
        end: items[i + 1] ? "top top" : "bottom top",
        pin: item,
        pinSpacing: false,
        toggleClass: { targets: item, className: "is-sticky" },
        invalidateOnRefresh: true,
        markers: false,
      });

      triggers.push(st);
    });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      triggers.forEach((st) => st.kill());
    };
  }, []);

  return null;
}
