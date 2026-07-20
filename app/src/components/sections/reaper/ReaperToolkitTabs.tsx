"use client";

import { useState } from "react";
import VLine from "@/components/elements/VLine";
import ReaperToolkitInfraViz from "./ReaperToolkitInfraViz";
import ReaperToolkitContextViz from "./ReaperToolkitContextViz";
import ReaperToolkitResultsViz from "./ReaperToolkitResultsViz";

/**
 * "A home for your operators' toolkit" — vertical tabs
 * (Figma 299:59552 / 59608 / 59690, one frame per tab).
 *
 * Left: vertical tab nav (Infrastructure / Context / Results).
 * Middle: the active tab's title + feature items (accent rule + sub-title + copy),
 *   with a matching divider rule at its right edge.
 * Right: the per-tab visualization (Infrastructure is built; others placeholder).
 *
 * Vertical rules are <VLine>s; <ReaperLineReveal> grows them top→bottom with a
 * stagger when the section scrolls into view (and when tabs swap in new rules).
 */

interface ToolkitItem {
  title: string;
  desc: string;
}
interface ToolkitTab {
  label: string;
  items: ToolkitItem[];
}

/**
 * Tab copy comes from `reaperPage.toolkit.tabs` in reaper.mdx. Tab ORDER is
 * load-bearing: index 0 = Infrastructure viz, 1 = Context viz, 2 = Results viz.
 */

export default function ReaperToolkitTabs({
  tabs = [],
}: {
  tabs?: ToolkitTab[];
}) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  if (!tab) return null;

  return (
    <div className="flex flex-col gap-main d:grid d:grid-cols-12 d:gap-4">
      {/* Tab nav — sticky on desktop so it stays reachable while scrolling
          the (long) item copy; self-start keeps it content-height so sticky
          can slide within the grid track. */}
      <nav className="flex flex-col gap-3 d:col-span-3 d:sticky d:top-[6em] d:self-start">
        {tabs.map((t, i) => {
          const isActive = i === active;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              className={`flex cursor-pointer items-center gap-3 font-secondary text-main uppercase tracking-[0.1em] transition-colors ${
                isActive ? "text-theme-text" : "text-neutral hover:text-theme-text"
              }`}
            >
              <span
                className={`h-[0.5em] w-[0.5em] shrink-0 rounded-round ${
                  isActive ? "bg-theme-text" : "bg-neutral"
                }`}
              />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Active tab content */}
      <div className="relative flex flex-col gap-4 d:col-span-4 d:pr-main">
        <h3 data-reveal className="u-text-style-h4">
          {tab.label}
        </h3>
        <ul className="flex flex-col gap-3 d:gap-4">
          {tab.items.map((item) => (
            <li key={item.title} className="flex gap-3">
              <VLine className="relative w-px shrink-0 self-stretch" />
              <div className="flex flex-col gap-1">
                <h4 data-reveal className="u-text-style-h5">
                  {item.title}
                </h4>
                <p className="text-main text-neutral">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Divider at the column's right edge — matches the item rules and
            reveals last in the stagger. Desktop only (beside the viz). */}
        <VLine className="absolute right-[0px] top-[0px] bottom-[0px] hidden w-px d:block" />
      </div>

      {/* Visualization — animates per tab. Infrastructure is built; others
          still placeholder until their storyboards are scaffolded. The cell
          stretches to the (taller) text column's height, so centre the viz
          vertically within it rather than letting it pin to the top. */}
      <div className="d:col-span-5 d:flex d:flex-col d:justify-center">
        {active === 0 ? (
          <div className="flex h-[24em] items-center justify-center">
            <ReaperToolkitInfraViz />
          </div>
        ) : active === 1 ? (
          <div className="flex h-[24em] items-center justify-center">
            <ReaperToolkitContextViz />
          </div>
        ) : (
          <ReaperToolkitResultsViz />
        )}
      </div>
    </div>
  );
}
