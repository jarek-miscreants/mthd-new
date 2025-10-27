"use client";

import { useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import logoAnimation from "./logo-animation-loop.json";

export default function LogoAnimation() {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const handleComplete = () => {
    setTimeout(() => {
      if (lottieRef.current) {
        lottieRef.current.goToAndPlay(0, true);
      }
    }, 10000);
  };

  return (
    <div className="absolute inset-[0] pointer-events-none invert-[var(--logo--invert)] flex items-center">
      {/* Logo Animation */}
      <div className="relative h-full aspect-[1.72/1] flex-shrink-0">
        <Lottie
          lottieRef={lottieRef}
          animationData={logoAnimation}
          loop={false}
          autoplay={true}
          onComplete={handleComplete}
          style={{ width: "100%", height: "100%", transform: "scale(1.75)" }}
        />
      </div>

      {/* Wordmark SVG */}
      <img
        src="/logotext.svg"
        alt=""
        className="h-full w-auto flex-shrink-0"
        style={{ transform: "scale(0.75)", marginLeft: "-1.12em" }}
      />
    </div>
  );
}
