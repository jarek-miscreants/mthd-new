"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";
import Eyebrow from "@/components/elements/GEyebrow";
import ReaperSecondaryTabs from "./ReaperSecondaryTabs";
import ReaperRulesViz from "./ReaperRulesViz";
import ReaperScaleViz from "./ReaperScaleViz";
import ReaperAgentsViz from "./ReaperAgentsViz";
import VLine from "@/components/elements/VLine";

/**
 * "How it works" tabs (Figma 299:58916 / 59132 / 59342).
 *
 * Desktop (>=992px): horizontal accordion — the active tab slides open to a
 * wide column (animatable `grid-template-columns`), others collapse to narrow
 * cards. Heights are fixed so text re-wrapping can't drive the row height.
 *
 * Below 992px: vertical stacking accordion — full-width tabs that expand
 * downward (animatable `grid-template-rows`).
 *
 * Each tab's secondary (sub)tabs auto-advance every AUTO_MS, but only once the
 * section scrolls into view (so the viewer catches it from the first state),
 * and only until the user takes over by clicking a subtab. Re-entering the
 * viewport resets everything to the first state and resumes.
 */

export interface HowItWorksTab {
  n: string;
  title: string;
  desc: string;
  secondaryEyebrow: string;
  secondary: string[];
}

/**
 * Tab copy comes from `reaperPage.howItWorks.tabs` in reaper.mdx. The tab ORDER
 * is load-bearing: index 0 = agents, 1 = rules, 2 = scale — the autoplay logic
 * and the by-index SVG vizzes (ReaperAgentsViz / ReaperRulesViz / ReaperScaleViz)
 * all key off it. Keep the YAML order matching those in-code viz arrays.
 */

/** Auto-advance interval for the secondary (sub)tabs. */
const AUTO_MS = 3000;
/** Rules of Engagement advances a touch quicker than the default. */
const RULES_MS = 2000;

/**
 * Advance the active tab's subtabs every `AUTO_MS` while keeping them
 * clickable. `enabled` gates it (visible + un-paused + open tab); `dep` is the
 * current selection — when it changes (auto tick OR manual click) the countdown
 * restarts, so a manual change pushes the next auto-advance a full interval out
 * instead of firing immediately.
 */
function useAutoCycle(
  enabled: boolean,
  dep: unknown,
  onTick: () => void,
  ms: number = AUTO_MS,
) {
  const cb = useRef(onTick);
  cb.current = onTick;
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => cb.current(), ms);
    return () => clearInterval(id);
  }, [enabled, dep, ms]);
}

/** True at >=70rem (1120px). Defaults to desktop for SSR. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 70rem)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

function VizPlaceholder({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-[0.5em] bg-dark-secondary/40 ${className}`}
    >
      <span className="font-secondary text-small uppercase tracking-[0.15em] text-neutral/60">
        {title} visualization
      </span>
    </div>
  );
}

export default function ReaperHowItWorksTabs({
  tabs = [],
}: {
  tabs?: HowItWorksTab[];
}) {
  const isDesktop = useIsDesktop();

  // State is lifted here so both layouts and the IntersectionObserver share a
  // single source of truth.
  const [active, setActive] = useState(0);
  const [agentOpen, setAgentOpen] = useState(0);
  const [ruleChecked, setRuleChecked] = useState<number[]>([]);
  // Autoplay runs only while the section is on screen and the user hasn't taken
  // over; `scaleKey` remounts the zoom viz to reset it.
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scaleKey, setScaleKey] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Manual subtab / zoom interaction stops autoplay until the next scroll-in.
  const pause = useCallback(() => setPaused(true), []);
  // Clicking a main tab is a manual takeover too — switch to it and stop
  // autoplay (distinct from `goNextTab`, which auto-advances without pausing).
  const selectTab = useCallback(
    (i: number) => {
      setActive(i);
      pause();
    },
    [pause],
  );
  const selectAgent = useCallback(
    (i: number) => {
      setAgentOpen(i);
      pause();
    },
    [pause],
  );
  const toggleRule = useCallback(
    (i: number) => {
      setRuleChecked((c) =>
        c.includes(i) ? c.filter((x) => x !== i) : [...c, i],
      );
      pause();
    },
    [pause],
  );

  // Start (and reset) autoplay only as the section enters the viewport, so the
  // viewer always catches it from the first state.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setActive(0);
          setAgentOpen(0);
          setRuleChecked([]);
          setPaused(false);
          setScaleKey((k) => k + 1);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Advance to the next main tab (looping). Each tab plays its own sequence
  // once, then hands off here instead of looping in place.
  const goNextTab = useCallback(
    () => setActive((a) => (a + 1) % (tabs.length || 1)),
    [tabs.length],
  );

  // Entering a tab resets its inner sequence so it always plays from the start
  // (and remounts the zoom viz so it replays). The reset lands well before the
  // panel finishes fading in, so there's no flash of the previous state.
  useEffect(() => {
    if (active === 0) setAgentOpen(0);
    else if (active === 1) setRuleChecked([]);
    else if (active === 2) setScaleKey((k) => k + 1);
  }, [active]);

  // Agents: step through each agent once, then advance to the next tab. Rules:
  // light each rule in turn; once all are lit, advance. Gated to visible +
  // un-paused + the relevant open tab.
  useAutoCycle(inView && !paused && active === 0, agentOpen, () => {
    if (agentOpen + 1 >= (tabs[0]?.secondary.length ?? 0)) goNextTab();
    else setAgentOpen((c) => c + 1);
  });
  useAutoCycle(
    inView && !paused && active === 1,
    ruleChecked.length,
    () => {
      if (ruleChecked.length >= (tabs[1]?.secondary.length ?? 0)) {
        goNextTab();
        return;
      }
      setRuleChecked((c) => {
        const next = (tabs[1]?.secondary ?? []).findIndex(
          (_, i) => !c.includes(i),
        );
        return [...c, next];
      });
    },
    RULES_MS,
  );

  const shared: ModeProps = {
    tabs,
    active,
    onChange: selectTab,
    agentOpen,
    onSelectAgent: selectAgent,
    ruleChecked,
    onToggleRule: toggleRule,
    agentsAutoPlay: inView && !paused && active === 0,
    rulesAutoPlay: inView && !paused && active === 1,
    scaleAutoPlay: inView && !paused && active === 2,
    scaleKey,
    onScaleInteract: pause,
    onScaleSequenceEnd: goNextTab,
  };

  return (
    <div ref={sectionRef}>
      {isDesktop ? (
        <HorizontalTabs {...shared} />
      ) : (
        <VerticalAccordion {...shared} />
      )}
    </div>
  );
}

interface ModeProps {
  tabs: HowItWorksTab[];
  active: number;
  onChange: (i: number) => void;
  agentOpen: number;
  onSelectAgent: (i: number) => void;
  ruleChecked: number[];
  onToggleRule: (i: number) => void;
  agentsAutoPlay: boolean;
  rulesAutoPlay: boolean;
  scaleAutoPlay: boolean;
  scaleKey: number;
  onScaleInteract: () => void;
  onScaleSequenceEnd: () => void;
}

/* Desktop: horizontal sliding accordion ---------------------------------- */
function HorizontalTabs({
  tabs,
  active,
  onChange,
  agentOpen,
  onSelectAgent,
  ruleChecked,
  onToggleRule,
  agentsAutoPlay,
  rulesAutoPlay,
  scaleAutoPlay,
  scaleKey,
  onScaleInteract,
  onScaleSequenceEnd,
}: ModeProps) {
  const gridTemplateColumns = tabs.map((_, i) =>
    i === active ? "9fr" : "2fr",
  ).join(" ");

  return (
    <div
      className="grid items-stretch gap-[1.5em] transition-[grid-template-columns] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
      style={{ gridTemplateColumns }}
    >
      {tabs.map((tab, i) => {
        const isActive = i === active;
        return (
          <div
            key={tab.n}
            className="relative flex min-w-[0px] flex-col gap-[1.5em] pl-[1.5em]"
          >
            {/* Column divider — canvas, no card fill (Figma 382:3846). The
                VLine grows top→bottom when the section enters view, like the
                homepage rules (driven by ReaperLineReveal). */}
            <VLine className="absolute left-[0px] top-[0px] h-full w-px" />
            <button
              type="button"
              onClick={() => onChange(i)}
              aria-expanded={isActive}
              className={`relative flex h-[13em] min-w-[0px] cursor-pointer flex-col gap-[0.75em] overflow-hidden py-[1.5em] pr-[1.5em] text-left transition-opacity duration-300 ${
                isActive ? "" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Eyebrow customClass="text-theme-text">{tab.n}</Eyebrow>
              {/* Collapsed tabs render a smaller header so longer titles don't
                  break badly in the narrow column; it grows to the full h3 size
                  on the active tab, timed to the column-width slide. */}
              <h3
                className="u-text-style-h3 break-words transition-[font-size] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                style={{ fontSize: isActive ? undefined : "1.5em" }}
              >
                {tab.title}
              </h3>
              {/* Revealed after the width slide so text doesn't rewrap in view */}
              <p
                aria-hidden={!isActive}
                className={`mt-2 max-w-[52em] text-main text-neutral transition-opacity ${
                  isActive
                    ? "opacity-100 delay-700 duration-300"
                    : "opacity-0 delay-0 duration-150"
                }`}
              >
                {tab.desc}
              </p>
            </button>

            {/* Content panel: viz placeholder + nested secondary tabs */}
            <div className="h-[22em] min-w-[0px] overflow-hidden">
              <div
                className={`flex h-full flex-col gap-[1.5em] transition-opacity ${
                  isActive
                    ? "opacity-100 delay-700 duration-300"
                    : "opacity-0 delay-0 duration-150"
                }`}
              >
                {i === 2 ? (
                  <ReaperScaleViz
                    key={scaleKey}
                    autoPlay={scaleAutoPlay}
                    onInteract={onScaleInteract}
                    onSequenceEnd={onScaleSequenceEnd}
                    className="min-h-[0px] flex-1"
                  />
                ) : i === 1 ? (
                  <>
                    <ReaperRulesViz
                      lit={ruleChecked.length}
                      className="min-h-[0px] flex-1"
                    />
                    <ReaperSecondaryTabs
                      eyebrow={tab.secondaryEyebrow}
                      items={tab.secondary}
                      multi
                      selected={ruleChecked}
                      onToggle={onToggleRule}
                      progressPlaying={rulesAutoPlay}
                      progressIndex={ruleChecked.length}
                      progressKey={ruleChecked.length}
                      progressDuration={RULES_MS}
                    />
                  </>
                ) : i === 0 ? (
                  <>
                    <ReaperAgentsViz
                      active={agentOpen}
                      onSelect={onSelectAgent}
                      className="flex-1"
                    />
                    <ReaperSecondaryTabs
                      eyebrow={tab.secondaryEyebrow}
                      items={tab.secondary}
                      open={agentOpen}
                      onOpenChange={onSelectAgent}
                      progressPlaying={agentsAutoPlay}
                      progressIndex={agentOpen}
                      progressKey={agentOpen}
                    />
                  </>
                ) : (
                  <>
                    <VizPlaceholder title={tab.title} className="flex-1" />
                    <ReaperSecondaryTabs
                      eyebrow={tab.secondaryEyebrow}
                      items={tab.secondary}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Mobile / tablet: vertical stacking accordion --------------------------- */
function VerticalAccordion({
  tabs,
  active,
  onChange,
  agentOpen,
  onSelectAgent,
  ruleChecked,
  onToggleRule,
  agentsAutoPlay,
  rulesAutoPlay,
  scaleAutoPlay,
  scaleKey,
  onScaleInteract,
  onScaleSequenceEnd,
}: ModeProps) {
  return (
    <div className="flex flex-col gap-[1.5em]">
      {tabs.map((tab, i) => {
        const isActive = i === active;
        return (
          <div key={tab.n} className="relative pl-[1.5em]">
            {/* White rule down the left of each tab (canvas stays black — no
                card fill). Grows top→bottom on scroll, like the desktop
                divider, via ReaperLineReveal. */}
            <VLine className="absolute left-[0px] top-[0px] h-full w-px" />
            <button
              type="button"
              onClick={() => onChange(i)}
              aria-expanded={isActive}
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-[1.5em] pr-[1.5em] text-left"
            >
              <span className="flex flex-col gap-[0.5em]">
                <Eyebrow customClass="text-theme-text">{tab.n}</Eyebrow>
                <h3 className="u-text-style-h4">{tab.title}</h3>
              </span>
              {isActive ? (
                <Minus className="h-[1.1em] w-[1.1em] shrink-0" />
              ) : (
                <Plus className="h-[1.1em] w-[1.1em] shrink-0" />
              )}
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isActive ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
              }`}
            >
              <div className="min-h-[0px] overflow-hidden">
                <div className="flex flex-col gap-[1.5em] pb-[1.5em] pr-[1.5em] pt-[0px]">
                  <p className="text-main text-neutral">{tab.desc}</p>
                  {i === 2 ? (
                    <ReaperScaleViz
                      key={scaleKey}
                      autoPlay={scaleAutoPlay}
                      onInteract={onScaleInteract}
                      onSequenceEnd={onScaleSequenceEnd}
                      className="h-[14em]"
                    />
                  ) : i === 1 ? (
                    <>
                      <ReaperRulesViz
                        lit={ruleChecked.length}
                        className="h-[14em]"
                      />
                      <ReaperSecondaryTabs
                        eyebrow={tab.secondaryEyebrow}
                        items={tab.secondary}
                        multi
                        selected={ruleChecked}
                        onToggle={onToggleRule}
                        stacked
                        progressPlaying={rulesAutoPlay}
                        progressIndex={ruleChecked.length}
                        progressKey={ruleChecked.length}
                        progressDuration={RULES_MS}
                      />
                    </>
                  ) : i === 0 ? (
                    <>
                      <ReaperAgentsViz
                        active={agentOpen}
                        onSelect={onSelectAgent}
                      />
                      <ReaperSecondaryTabs
                        eyebrow={tab.secondaryEyebrow}
                        items={tab.secondary}
                        open={agentOpen}
                        onOpenChange={onSelectAgent}
                        stacked
                        progressPlaying={agentsAutoPlay}
                        progressIndex={agentOpen}
                        progressKey={agentOpen}
                      />
                    </>
                  ) : (
                    <>
                      <VizPlaceholder title={tab.title} className="h-[14em]" />
                      <ReaperSecondaryTabs
                        eyebrow={tab.secondaryEyebrow}
                        items={tab.secondary}
                        stacked
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
