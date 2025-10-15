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
    <div className="absolute inset-[0] pointer-events-none invert-[var(--logo--invert)]">
      <Lottie
        lottieRef={lottieRef}
        animationData={logoAnimation}
        loop={false}
        autoplay={true}
        onComplete={handleComplete}
        style={{ width: "100%", height: "100%", transform: "scale(1.75)" }}
      />
    </div>
  );
}
