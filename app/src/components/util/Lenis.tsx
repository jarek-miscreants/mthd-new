"use client";

import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import type { LenisOptions } from "lenis";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type LenisPreset = "performance";

interface LenisProps {
  children: React.ReactNode;
  preset?: LenisPreset;
  customOptions?: Partial<LenisOptions>;
}

const LENIS_PRESETS: Record<LenisPreset, LenisOptions> = {
  performance: {
    lerp: 0.12,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    syncTouch: false,
    smoothWheel: true,
    orientation: "vertical",
    gestureOrientation: "vertical",
    autoRaf: false,
    autoResize: true,
    overscroll: false,
  },
};

export default function Lenis({
  children,
  preset = "performance",
  customOptions = {},
}: LenisProps) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();

  const lenisOptions: LenisOptions = {
    ...LENIS_PRESETS[preset],
    ...customOptions,
  };

  // Scroll to top on route change — deferred so it runs after new page layout,
  // and repeated once to override any delayed ScrollTrigger/animations (e.g. 100ms timeouts).
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const scrollToTop = () => {
      window.scrollTo(0, 0);
      lenisRef.current?.lenis?.scrollTo(0, { immediate: true });
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Run after paint so we're scrolling the new page, not the old one
    const rafId = requestAnimationFrame(() => {
      scrollToTop();
      // Run again after delayed effects (e.g. CompanyHighlightInteraction's 100ms setTimeout)
      // so we always end at top even if something else briefly changes scroll
      timeoutId = setTimeout(scrollToTop, 150);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [pathname]);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
    }

    return () => {
      if (lenis) {
        lenis.off("scroll", ScrollTrigger.update);
      }
    };
  }, []);

  return (
    <ReactLenis root options={lenisOptions} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
