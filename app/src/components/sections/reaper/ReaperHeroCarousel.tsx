"use client";

import { useEffect, useRef, useState } from "react";

import { runWhileVisible } from "@/lib/animations/runWhileVisible";

/**
 * Reaper hero video carousel — product-UI captures with view tabs.
 *
 * Evolves Figma node 299:58899 from a timed placeholder into the real thing:
 * one video per view (Operate / Plan / Observe / Report), crossfaded in a
 * fixed 16:9 stage. The active tab's progress bar tracks the video's actual
 * playhead and the carousel advances when the clip ends. Clicking a tab
 * switches (or restarts) its clip immediately.
 *
 * Clips are 1920x1080 and 1680x1080 mixed; object-cover in the 16:9 stage
 * crops the narrower pair slightly top/bottom, which the edge fades hide.
 */

type HeroTab = { label?: string; video?: string; poster?: string };

export default function ReaperHeroCarousel({
  tabs = [],
}: {
  tabs?: HeroTab[];
}) {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const activeRef = useRef(active);
  const inViewRef = useRef(false);

  // Play the active clip from the start, pause the rest. Playback only
  // starts once the hero is in view (see runWhileVisible below), so a page
  // opened mid-scroll doesn't decode video off screen.
  useEffect(() => {
    activeRef.current = active;
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && inViewRef.current) {
        // React can drop the `muted` attribute during SSR; set it before
        // play() so autoplay policies don't reject the call.
        v.muted = true;
        v.currentTime = 0;
        v.play().catch(() => {});
      } else if (i !== active) {
        v.pause();
      }
    });
  }, [active]);

  // Pause the carousel while the hero is scrolled out of the viewport and
  // resume the active clip where it left off when it comes back.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return runWhileVisible(el, {
      onShow: () => {
        inViewRef.current = true;
        const v = videoRefs.current[activeRef.current];
        if (v) {
          v.muted = true;
          v.play().catch(() => {});
        }
      },
      onHide: () => {
        inViewRef.current = false;
        videoRefs.current.forEach((v) => v?.pause());
      },
    });
  }, []);

  // Drive the active tab's progress bar from the video playhead.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = videoRefs.current[active];
      if (v && barRef.current && v.duration) {
        barRef.current.style.width = `${(v.currentTime / v.duration) * 100}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const restart = (i: number) => {
    const v = videoRefs.current[i];
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  return (
    <div ref={rootRef} className="relative mt-2 t:mt-4">
      {/* Video stage */}
      <div className="relative aspect-[16/9] w-full">
        {tabs.map((tab, i) => (
          <video
            key={tab.label ?? i}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={tab.video}
            poster={tab.poster}
            muted
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
            onEnded={() => {
              if (i === active) setActive((a) => (a + 1) % tabs.length);
            }}
            className={`absolute left-[0px] top-[0px] h-full w-full object-cover transition-opacity duration-700 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Fades into the page background.
            NOTE: numeric `*-0` utilities (top-0/inset-x-0) are broken in this
            project because @theme resets the spacing scale, so they emit an
            invalid calc() and fall back to `auto`. Use arbitrary [0px]. */}
        <div className="pointer-events-none absolute left-[0px] right-[0px] top-[0px] h-[15%] t:h-[27%] bg-gradient-to-b from-theme-bg to-transparent" />
        <div className="pointer-events-none absolute left-[0px] right-[0px] bottom-[0px] h-[15%] t:h-[27%] bg-gradient-to-t from-theme-bg to-transparent" />
      </div>

      {/* View tabs — in flow below the stage on mobile (the 16:9 stage is too
          short there for an overlay), overlaid near its base from t: up. */}
      <div className="mt-2 flex w-full flex-wrap justify-center gap-[0.75em] px-xs t:absolute t:bottom-[7%] t:left-[0px] t:mt-[0px] t:flex-nowrap">
        {tabs.map((tab, i) => {
          const isActive = i === active;
          return (
            <button
              key={tab.label ?? i}
              type="button"
              aria-current={isActive}
              onClick={() => (isActive ? restart(i) : setActive(i))}
              className={`relative cursor-pointer overflow-clip rounded-main border px-[1.5em] py-[0.875em] text-main leading-none transition-colors ${
                isActive
                  ? "border-dark-secondary bg-dark-secondary text-light"
                  : "border-neutral/30 bg-dark-secondary text-neutral hover:text-light"
              }`}
            >
              {isActive && (
                <span
                  ref={barRef}
                  aria-hidden="true"
                  className="absolute left-[0px] top-[0px] h-full w-[0%] rounded-l-[4px] bg-[rgba(255,255,255,0.2)]"
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
