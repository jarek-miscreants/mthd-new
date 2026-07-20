"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ReaperToolkitContextViz from "./ReaperToolkitContextViz";

/**
 * Reaper "A home for your operators' toolkit" — Results tab visualization
 * (Figma 382:4636).
 *
 * The Context tab's honeycomb, settled in its end state, with an "After Action
 * Report" panel overlaid on the right: the operation, summarised. The report's
 * cards fade up on mount; the comb sits behind, finished.
 */

interface Card {
  head: string;
  sub?: string;
  body: React.ReactNode;
}

const CARDS: Card[] = [
  {
    head: "Executive Summary",
    body: (
      <>
        This operation achieved full domain compromise of the AURIC-DYNAMICS.LOCAL Active Directory
        environment and successfully exfiltrated the target{" "}
        <span className="font-secondary uppercase tracking-[0.04em] text-[0.85em] text-neutral">
          {"\\C$\\SHARE\\DATABASE\\BLUEPRINTS\\SECRET.TXT"}
        </span>{" "}
        from the AURIC-DYN…
      </>
    ),
  },
  {
    head: "Environment",
    body: "The target environment is AURIC-DYNAMICS.LOCAL, a Windows Active Directory domain comprising 14 hosts including a domain controller (AURIC-DYNAMICS…",
  },
  {
    head: "Attack Chain",
    body: "The operation began with Host Jackal Context Discovery on both implants, identi…",
  },
];

export default function ReaperToolkitResultsViz() {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-report-item]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.from(items, {
        opacity: 0,
        y: 14,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.12,
        delay: 0.15,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative flex min-h-[24em] w-full items-stretch">
      {/* Finished honeycomb, behind and anchored left. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-[60%] items-center justify-center">
        <ReaperToolkitContextViz mode="endState" />
      </div>

      {/* After Action Report — in flow on the right, defines the height. */}
      <div
        ref={panelRef}
        className="relative ml-auto flex w-[60%] max-w-[20em] flex-col gap-[0.75em] rounded-[0.5em] border border-dark-secondary bg-dark p-[0.625em]"
      >
        <p data-report-item className="text-main leading-[1.4] text-theme-text">
          After Action Report
        </p>

        {CARDS.map((c) => (
          <div
            key={c.head}
            data-report-item
            className="flex flex-col gap-[0.5em] rounded-[0.5em] bg-dark-secondary p-[1em]"
          >
            <div className="flex flex-col gap-[0.25em]">
              <span className="font-secondary text-[0.6875em] uppercase leading-none tracking-[0.12em] text-theme-text">
                {c.head}
              </span>
              {c.sub && (
                <span className="font-secondary text-[0.6875em] uppercase leading-none tracking-[0.12em] text-neutral">
                  {c.sub}
                </span>
              )}
            </div>
            <p className="text-small leading-[1.5] text-theme-text">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
