"use client";

import { useEffect, useRef, useState } from "react";
import ReaperModelViz from "./ReaperModelViz";

/**
 * Frontier-models "what wraps the model" — autoplay stages
 * (Figma 299:60198 → 299:60256).
 *
 * When the block scrolls into view it autoplays: the three layers light up in
 * sequence (Unified Data → Guardrails → Purpose-built UX) while the visual
 * (ReaperModelViz) grows — rings + logo sphere first, then a protection bubble.
 */

/** Gap between each stage lighting up (ms). */
const STAGGER_MS = 1200;

interface Layer {
  title: string;
  meta: string;
}

export default function ReaperFrontierStages({
  layers = [],
}: {
  layers?: Layer[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timers: ReturnType<typeof setTimeout>[] = [];
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        clear();
        if (entry.isIntersecting) {
          // autoplay: reveal layers in sequence
          setLit(1);
          timers.push(setTimeout(() => setLit(2), STAGGER_MS));
          timers.push(setTimeout(() => setLit(3), STAGGER_MS * 2));
        } else {
          setLit(0);
        }
      },
      { threshold: 0.45 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 gap-main d:grid-cols-12 d:items-center d:gap-4"
    >
      {/* Visual: rings + logo sphere → protection bubble. */}
      <div className="d:col-span-5">
        <div className="flex h-[20em] items-center justify-center">
          <ReaperModelViz lit={lit} />
        </div>
      </div>

      {/* Layers */}
      <ul className="flex flex-col gap-3 d:col-span-7 d:gap-[2.5em]">
        {layers.map((layer, i) => {
          const active = i < lit;
          return (
            <li key={layer.title} className="flex gap-3">
              <span
                className={`w-px shrink-0 self-stretch transition-colors duration-700 ${
                  active ? "bg-theme-text" : "bg-neutral/20"
                }`}
              />
              <div className="flex flex-col gap-[0.5em]">
                <h3
                  className={`u-text-style-h5 transition-colors duration-700 ${
                    active ? "text-theme-text" : "text-neutral/40"
                  }`}
                >
                  {layer.title}
                </h3>
                <p
                  className={`text-main tracking-[0.05em] transition-colors duration-700 ${
                    active ? "text-neutral" : "text-neutral/30"
                  }`}
                >
                  {layer.meta}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
