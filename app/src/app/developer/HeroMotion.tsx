"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function HeroMotion() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      const video = videoRef.current;
      if (!video) return;
      if (preference.matches) video.pause();
      else void video.play().catch(() => {});
    };
    syncPlayback();
    preference.addEventListener("change", syncPlayback);
    return () => preference.removeEventListener("change", syncPlayback);
  }, []);

  return (
    <div className={styles.motion} aria-hidden="true">
      <video ref={videoRef} muted loop playsInline preload="metadata" tabIndex={-1}>
        <source src="/reaper_hero_mobile.mp4" media="(max-width: 600px)" type="video/mp4" />
        <source src="/reaper_hero.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
