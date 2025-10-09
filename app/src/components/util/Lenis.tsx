"use client";

import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import type { LenisOptions } from "lenis";
import { useEffect, useRef } from "react";
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

  const lenisOptions: LenisOptions = {
    ...LENIS_PRESETS[preset],
    ...customOptions,
  };

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
