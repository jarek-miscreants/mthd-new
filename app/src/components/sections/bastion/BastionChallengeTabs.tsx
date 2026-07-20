"use client";

import { useActiveRowSegment } from "@/lib/useActiveRowSegment";

/**
 * Bastion "Challenge every asset" — accordion tabs (Figma 481:27793).
 *
 * A vertical stack of feature tabs with a single white rule segment on the left
 * that tracks the open tab (no full-height track). Clicking a tab expands its
 * copy (accordion) and collapses the others. The segment + heights animate; a
 * ResizeObserver keeps the segment glued to the active row as its height
 * transitions (see useActiveRowSegment). Controlled: the active index lives in
 * BastionChallengeSplit so the console image panel can track it too.
 */

export interface ChallengeTab {
  title: string;
  desc: string;
  mono?: string;
  image?: string;
}

export default function BastionChallengeTabs({
  items,
  active,
  onSelect,
}: {
  items: ChallengeTab[];
  active: number;
  onSelect: (index: number) => void;
}) {
  const { setRowRef, seg } = useActiveRowSegment(active, items.length);

  return (
    <div className="relative flex flex-col">
      {/* single white rule segment that tracks the open tab */}
      <span
        aria-hidden="true"
        className="absolute left-[0px] w-px bg-theme-text transition-all duration-500 ease-out"
        style={{ top: seg.top, height: seg.height }}
      />

      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <button
            key={item.title}
            type="button"
            aria-expanded={isActive}
            ref={setRowRef(i)}
            onClick={() => onSelect(i)}
            className="block w-full cursor-pointer text-left"
          >
            {/* This project's Tailwind build strips p-* padding utilities, so
                spacing uses inline styles (like the line segment above). The
                left inset reuses --space-xs — the compiled value of gap-3 —
                so the line-to-text distance matches the VLine rows. */}
            <div
              className="flex flex-col gap-3"
              style={{ padding: "1.5rem 0 1.5rem var(--space-xs)" }}
            >
              <h3
                className={`u-text-style-h5 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-45 hover:opacity-75"
                }`}
              >
                {item.title}
              </h3>
              <div
                className={`grid transition-all duration-500 ease-out ${
                  isActive
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-main text-neutral">{item.desc}</p>
                  {item.mono && (
                    <p
                      className="font-secondary text-small uppercase tracking-[0.1em] text-neutral/60"
                      style={{ marginTop: "0.75rem" }}
                    >
                      {item.mono}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
