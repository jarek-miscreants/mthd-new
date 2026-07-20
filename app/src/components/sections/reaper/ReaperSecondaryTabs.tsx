"use client";

import { useState } from "react";
import { Plus, Minus, Check } from "lucide-react";

/**
 * Nested secondary tabs inside a "How it works" content panel
 * (Figma e.g. 299:59027). A row of cards — the open one is white with a "−",
 * the rest are dark with a "+". Hover shows a light border.
 *
 * Uncontrolled by default; pass `open` + `onOpenChange` to drive an inner
 * visualization from the selection (e.g. the Rules tab's orbital rings).
 *
 * Pass `multi` for checkbox behaviour — any number of cards can be ticked at
 * once. Drive it with `selected` (an array of checked indices) + `onToggle`;
 * the indicator becomes a checkbox (empty square / white tick).
 */

export interface SecondaryTabsProps {
  eyebrow: string;
  items: string[];
  /** index open by default (uncontrolled) */
  defaultOpen?: number;
  /** controlled open index — pair with onOpenChange */
  open?: number;
  onOpenChange?: (i: number) => void;
  /** stack vertically (mobile/vertical accordion) instead of a row */
  stacked?: boolean;
  /** multi-select checkbox mode — pair with `selected` + `onToggle` */
  multi?: boolean;
  /** controlled checked indices (multi mode) */
  selected?: number[];
  onToggle?: (i: number) => void;
  /**
   * Autoplay progress bar: while `progressPlaying`, the button at
   * `progressIndex` shows a thin bar that fills over `progressDuration` ms
   * (the parent's auto-advance interval), restarting whenever `progressKey`
   * changes. Dark on the active (white) card, light on the dark cards.
   */
  progressPlaying?: boolean;
  progressIndex?: number | null;
  progressKey?: number | string;
  progressDuration?: number;
}

export default function ReaperSecondaryTabs({
  eyebrow,
  items,
  defaultOpen = 0,
  open: openProp,
  onOpenChange,
  stacked = false,
  multi = false,
  selected = [],
  onToggle,
  progressPlaying = false,
  progressIndex = null,
  progressKey,
  progressDuration = 3000,
}: SecondaryTabsProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = (i: number) => {
    setOpenState(i);
    onOpenChange?.(i);
  };

  return (
    <div
      className={`flex items-stretch gap-3 ${stacked ? "flex-col" : "flex-row"}`}
    >
      {items.map((label, i) => {
        const isActive = multi ? selected.includes(i) : i === open;
        const showProgress = progressPlaying && progressIndex === i;
        return (
          <button
            key={label}
            type="button"
            onClick={() => (multi ? onToggle?.(i) : setOpen(i))}
            aria-pressed={multi ? isActive : undefined}
            aria-expanded={multi ? undefined : isActive}
            className={`relative flex min-w-[0px] flex-1 cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-[0.5em] p-[1em] text-left transition-colors duration-200 ${
              isActive
                ? "bg-light text-dark"
                : "bg-dark-secondary text-light hover:ring-1 hover:ring-inset hover:ring-neutral"
            }`}
          >
            {/* Autoplay progression bar — fills across the bottom of the card
                over the parent's auto-advance interval. Dark on the white
                (active) card so it stays legible; light on the dark cards. */}
            {showProgress && (
              <span
                key={progressKey}
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-[0px] left-[0px] h-[3px] ${
                  isActive
                    ? "bg-[rgba(0,0,0,0.45)]"
                    : "bg-[rgba(255,255,255,0.35)]"
                }`}
                style={{
                  animation: `reaper-tab-progress ${progressDuration}ms linear forwards`,
                }}
              />
            )}
            <span className="flex min-w-[0px] flex-col gap-[0.3em] font-secondary uppercase leading-[1.3] tracking-[0.1em]">
              <span className="text-[0.6875rem] text-neutral">{eyebrow}</span>
              <span className="line-clamp-2 text-menu">{label}</span>
            </span>
            {multi ? (
              <span
                className={`flex h-[1.25em] w-[1.25em] shrink-0 items-center justify-center rounded-[0.25em] border transition-colors duration-200 ${
                  isActive
                    ? "border-dark bg-dark text-light"
                    : "border-neutral"
                }`}
              >
                {isActive && (
                  <Check className="h-[0.875em] w-[0.875em]" strokeWidth={3} />
                )}
              </span>
            ) : isActive ? (
              <Minus className="h-[0.9375em] w-[0.9375em] shrink-0" />
            ) : (
              <Plus className="h-[0.9375em] w-[0.9375em] shrink-0 text-neutral" />
            )}
          </button>
        );
      })}
    </div>
  );
}
