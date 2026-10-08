"use client";

import Image from "next/image";
import Link from "next/link";
import LinkIndicator from "@/components/elements/LinkIndicator";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { HomeFeatureCardData } from "@/lib/content-types";
import { animate } from "@/lib/animations/primitives";
import styles from "./HomeMission.module.css";

export default function HomeFeatureCard({ id, label, href, backgroundImage, videoSrc, copy, compact = false }: HomeFeatureCardData & { compact?: boolean }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const labelAnimation = useRef<ReturnType<typeof animate.scrambleText> | null>(null);
  const hasStarted = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const characters = Array.from(copy);
  const characterDelay = Math.min(18, 1600 / Math.max(characters.length, 1));

  const reveal = useCallback(() => {
    if (!compact && hasStarted.current) return;
    hasStarted.current = true;
    setRevealed(true);
  }, [compact]);

  // Reverse from the current character when hover ends, even mid-typing.
  useEffect(() => {
    if (!compact) return;
    const target = revealed ? characters.length : 0;
    const timer = window.setInterval(() => {
      setVisibleCharacters(current => {
        const next = current < target ? current + 1 : current > target ? current - 1 : current;
        if (next === target) window.clearInterval(timer);
        return next;
      });
    }, revealed ? 24 : 6);
    return () => window.clearInterval(timer);
  }, [compact, revealed, characters.length]);

  const activate = useCallback(() => {
    reveal();
    const element = labelRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = videoRef.current;
    if (video && (video.paused || video.ended)) {
      video.currentTime = 0;
      void video.play().catch(() => { /* Leave the resting frame if playback is unavailable. */ });
    }
    if (labelAnimation.current?.isActive()) return;

    labelAnimation.current?.kill();
    element.textContent = label;
    // Match the existing PARTNERS eyebrow's character set and timing.
    labelAnimation.current = animate.scrambleText(element, 1, 1, 0.5);
  }, [label, reveal]);

  useEffect(() => () => { labelAnimation.current?.kill(); }, [label]);

  const deactivate = () => {
    if (compact && !window.matchMedia("(hover: none)").matches) setRevealed(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      reveal();
      return;
    }
    if (!window.matchMedia("(hover: none)").matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        activate();
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(card);
    return () => observer.disconnect();
  }, [activate, reveal]);

  return (
      <Link
        href={href}
        ref={cardRef}
        className={`${styles.card} ${compact ? styles.compact : ""}`}
        aria-labelledby={`${id}-label`}
        data-revealed={revealed}
        onPointerEnter={activate}
        onPointerDown={activate}
        onFocus={activate}
        onPointerLeave={deactivate}
        onBlur={deactivate}
      >
        {videoSrc ? (
          <video ref={videoRef} src={videoSrc} muted playsInline preload="auto" className={styles.background} aria-hidden="true" />
        ) : backgroundImage ? (
          <Image src={backgroundImage} alt="" fill sizes={compact ? "(max-width: 767px) 100vw, 50vw" : "100vw"} className={styles.background} />
        ) : null}
        <div className={styles.shade} aria-hidden="true" />
        <h2 id={`${id}-label`} className={styles.label}>
          <span className={styles.srOnly}>{label}</span>
          <span ref={labelRef} aria-hidden="true">{label}</span>
        </h2>
        <div className={styles.content}>
          <p className={styles.copy}>
            <span className={styles.srOnly}>{copy}</span>
            <span aria-hidden="true">
              {characters.map((character, index) => (
                <span
                  key={index}
                  className={styles.character}
                  style={{ "--character-delay": `${index * characterDelay}ms`, "--character-opacity": index < visibleCharacters ? 1 : 0 } as CSSProperties}
                >
                  {character}
                </span>
              ))}
            </span>
          </p>
          <LinkIndicator className={styles.indicator} aria-hidden="true" focusable="false" />
        </div>
      </Link>
  );
}
