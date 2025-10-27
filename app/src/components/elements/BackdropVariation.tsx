"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

type BackdropVariation = "variation1" | "variation2" | "variation3";

interface BackdropVariationProps {
  variation?: BackdropVariation;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  "data-backdrop"?: string;
}

const animationPaths: Record<BackdropVariation, string> = {
  variation1: "/lottie-animation/backdrop-variation-1.json",
  variation2: "/lottie-animation/backdrop-variation-2.json",
  variation3: "/lottie-animation/backdrop-variation-3.json",
};

export default function BackdropVariation({
  variation = "variation1",
  className = "",
  loop = true,
  autoplay = true,
  ...props
}: BackdropVariationProps) {
  const [animationData, setAnimationData] = useState<unknown>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch(animationPaths[variation]);
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.statusText}`);
        }
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        console.error(`Failed to load backdrop "${variation}":`, err);
        setError(true);
      }
    };

    loadAnimation();
  }, [variation]);

  if (error) {
    console.error(`Backdrop "${variation}" failed to load`);
    return null;
  }

  if (!animationData) {
    return null;
  }

  return (
    <div
      className={`inset-[0] pointer-events-none ${className}`}
      style={{
        opacity: 0.65,
        width: "100vw",
        height: "100dvh", // dynamic viewport height for mobile (accounts for address bar)
      }}
      {...props}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          minWidth: "100%",
          minHeight: "100%",
          width: "auto",
          height: "auto",
        }}
      />
    </div>
  );
}
