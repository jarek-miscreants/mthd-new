"use client";

import { useEffect, useState } from "react";

interface VideoSwapperProps {
  videoSrc: string;
  videoSrcMobile: string;
  className?: string;
}

export default function VideoSwapper({
  videoSrc,
  videoSrcMobile,
  className = "",
}: VideoSwapperProps) {
  const [currentSrc, setCurrentSrc] = useState(videoSrc);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 479px)");

    const updateSource = () => {
      setCurrentSrc(mediaQuery.matches ? videoSrcMobile : videoSrc);
    };

    updateSource();
    mediaQuery.addEventListener("change", updateSource);

    return () => mediaQuery.removeEventListener("change", updateSource);
  }, [videoSrc, videoSrcMobile]);

  return (
    <video
      key={currentSrc}
      autoPlay
      playsInline
      loop
      muted
      preload="none"
      className={className}
    >
      <source src={currentSrc} type="video/mp4" />
    </video>
  );
}
