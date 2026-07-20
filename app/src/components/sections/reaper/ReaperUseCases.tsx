"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Box, Hexagon } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Spacer from "@/components/util/Spacer";
import VLine from "@/components/elements/VLine";
import { useActiveRowSegment } from "@/lib/useActiveRowSegment";
import type { ReaperPageData } from "@/lib/content-types";
import ReaperMissionViz, {
  REAPER_GLYPH_D,
} from "@/components/sections/reaper/ReaperMissionViz";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reaper product page — "Different Missions. Same Method." (redesign,
 * Figma 635:632; per-state visuals from different-mission-storyboard.svg).
 *
 * Behaviour: a pinned, scroll-driven section. The heading + intro stay put
 * while the page scrolls through three states. Each state swaps the left-hand
 * text block (use case) and the right-hand "Method" window visualization
 * (see ReaperMissionViz), narrating the same operator scaling up:
 *   1. Operator Augmentation           — the Overwatch terminal
 *   2. Selective Automated …           — a two-agent tool-chain graph
 *   3. Large Scale Adversary Emulation — a dense ten-agent field
 * An operator badge sits beneath the window; in state 3 it gains a swarm of
 * orbiting agent chips.
 */

interface UseCase {
  title: string;
  desc: string;
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

function Header({ heading, intro }: { heading?: string; intro?: string }) {
  return (
    <div className="flex max-w-[44em] flex-col gap-4">
      <h2 data-reveal className="u-text-style-h2 whitespace-pre-line">
        {heading}
      </h2>
      <p className="text-large text-neutral">{intro}</p>
    </div>
  );
}

/**
 * The swarm of agent chips that gathers above the operator badge at the
 * large-scale state. Sizes/offsets (em, from the badge centre) are the
 * storyboard's pyramid arrangement; glyphs alternate across agent flavours.
 */
const ORBIT_CHIPS: { s: number; x: number; y: number; g: "reaper" | "method" | "hex" | "cube" }[] = [
  { s: 2.59, x: -4.8, y: -3.86, g: "hex" },
  { s: 2.59, x: -1.61, y: -3.86, g: "cube" },
  { s: 2.59, x: 1.58, y: -3.86, g: "method" },
  { s: 2.59, x: 4.76, y: -3.86, g: "reaper" },
  { s: 1.67, x: -3.2, y: -4.95, g: "reaper" },
  { s: 1.67, x: 0, y: -4.95, g: "method" },
  { s: 1.67, x: 3.18, y: -4.95, g: "reaper" },
  { s: 1.25, x: -1.59, y: -6.03, g: "reaper" },
  { s: 1.25, x: 1.59, y: -6.03, g: "hex" },
  { s: 0.875, x: 0, y: -6.78, g: "hex" },
];

function ChipGlyph({ g, large }: { g: (typeof ORBIT_CHIPS)[number]["g"]; large: boolean }) {
  const cls = `h-[55%] w-[55%] ${large ? "text-light" : "text-light/60"}`;
  if (g === "hex") return <Hexagon className={cls} strokeWidth={1.5} />;
  if (g === "cube") return <Box className={cls} strokeWidth={1.5} />;
  if (g === "method")
    return (
      <svg viewBox="0 0 14 14" className={cls} fill="currentColor" aria-hidden>
        <circle cx="4" cy="4" r="1.9" />
        <circle cx="10" cy="4" r="1.9" />
        <circle cx="7" cy="9" r="1.9" />
      </svg>
    );
  return (
    <svg viewBox="0 0 67 57" className={cls} fill="currentColor" aria-hidden>
      <path d={REAPER_GLYPH_D} />
    </svg>
  );
}

/** Pixel-art operator headset (24×24), inherits colour via currentColor. */
function OperatorIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M10 7H9V8H8V11H9V14H8V13H7V12H6V8H7V6H8V5H9V4H15V5H16V6H17V8H18V10H17V11H16V8H15V6H10V7Z" fill="currentColor" />
      <path d="M20 6V12H19V13H18V14H16V15H10V12H13V13H17V12H18V11H19V7H18V5H17V4H16V3H15V2H9V3H8V4H7V5H6V7H5V11H4V10H3V7H4V6H5V4H6V3H7V2H8V1H16V2H17V3H18V4H19V6H20Z" fill="currentColor" />
      <path d="M21 19V18H20V17H19V16H15V17H9V16H5V17H4V18H3V19H2V22H3V23H21V22H22V19H21ZM20 21H4V19H5V18H8V19H16V18H19V19H20V21Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Operator badge — concentric rings with a headset icon (192/96/48 in Figma).
 * When `swarm` is set (the large-scale state), the orbiting agent chips pop
 * in above the rings; they retract when it clears.
 */
function OperatorBadge({ swarm }: { swarm: boolean }) {
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    const chips = Array.from(el.children);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(chips, { scale: swarm ? 1 : 0, opacity: swarm ? 1 : 0 });
      return;
    }
    gsap.to(chips, {
      scale: swarm ? 1 : 0,
      opacity: swarm ? 1 : 0,
      duration: swarm ? 0.45 : 0.25,
      ease: swarm ? "back.out(2)" : "power2.in",
      stagger: swarm ? 0.05 : 0.02,
      overwrite: "auto",
    });
  }, [swarm]);

  return (
    <div className="pointer-events-none relative grid h-[12em] w-[12em] place-items-center">
      {[12, 8, 5].map((em) => (
        <span
          key={em}
          className="absolute rounded-round border border-neutral/25"
          style={{ height: `${em}em`, width: `${em}em` }}
        />
      ))}
      <span className="grid h-[3em] w-[3em] place-items-center rounded-round border border-theme-text bg-theme-bg text-theme-text">
        <OperatorIcon className="h-[1.6em] w-[1.6em]" />
      </span>
      <div ref={chipsRef} aria-hidden className="absolute" style={{ left: "50%", top: "50%" }}>
        {ORBIT_CHIPS.map((c, i) => (
          <span
            key={i}
            className="absolute grid place-items-center rounded-round border border-neutral/40 bg-dark"
            style={{
              width: `${c.s}em`,
              height: `${c.s}em`,
              left: `${c.x}em`,
              top: `${c.y}em`,
              transform: "translate(-50%, -50%) scale(0)",
              opacity: 0,
            }}
          >
            <ChipGlyph g={c.g} large={c.s >= 1.6} />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The shared window "base": the storyboard's gradient tab strip — a browser
 * tab anchored top right carrying the Method mark, stepping down to a
 * full-width bar that fades out — drawn above the window body.
 */
function WindowTab() {
  const id = useId();
  return (
    <svg viewBox="0 0 719 74" className="w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient
          id={id}
          x1="414.5"
          y1="0"
          x2="415"
          y2="74"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1A1A1A" />
          <stop offset="1" stopColor="#1A1A1A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M719 0H371.177C367.572 0 364.085 1.28051 361.336 3.61315L328.72 31.2955C325.972 33.6281 322.484 34.9086 318.88 34.9086H-50V58.7923C-50 67.1913 -43.1913 74 -34.7923 74H703.792C712.191 74 719 67.1913 719 58.7923V0Z"
        fill={`url(#${id})`}
      />
      {/* Method logotext (storyboard export, 90.6×15), slightly enlarged. */}
      <g transform="translate(375 13.2) scale(1.2)" fill="#808080">
        <path d="M15.6618 11.3855C15.7552 11.2237 15.7552 11.0244 15.6618 10.8626L13.9509 7.89917C13.8574 7.73741 13.6848 7.6377 13.498 7.6377H10.982C10.4452 7.6377 10.1098 7.05666 10.3782 6.5918L11.6362 4.41284C11.7296 4.25108 11.7296 4.05173 11.6362 3.88989L9.92528 0.926514C9.83185 0.764678 9.65921 0.665039 9.47241 0.665039H6.05058C5.86371 0.665039 5.69107 0.764678 5.5977 0.926514L3.88682 3.88989C3.79339 4.05173 3.79339 4.25108 3.88682 4.41284L5.5977 7.37622C5.69114 7.53806 5.86378 7.6377 6.05058 7.6377H8.56659C9.10335 7.6377 9.4388 8.21873 9.17042 8.68359L8.36529 10.0781C8.09691 10.543 7.426 10.543 7.15756 10.0781L5.89955 7.89917C5.80612 7.73741 5.63347 7.6377 5.44668 7.6377H2.02485C1.83798 7.6377 1.66534 7.73741 1.57197 7.89917L-0.138909 10.8626C-0.232343 11.0244 -0.232343 11.2237 -0.138909 11.3855L1.57197 14.3489C1.66541 14.5107 1.83805 14.6104 2.02485 14.6104H5.44668C5.63354 14.6104 5.80619 14.5107 5.89955 14.3489L7.15756 12.1699C7.42594 11.7051 8.09684 11.7051 8.36522 12.1699L9.62323 14.3489C9.71666 14.5107 9.8893 14.6104 10.0761 14.6104H13.4979C13.6847 14.6104 13.8574 14.5107 13.9508 14.3489L15.6617 11.3855H15.6618Z" />
        <path d="M23.7122 10.8626L22.0013 7.89917C21.9079 7.73741 21.7352 7.6377 21.5484 7.6377H19.0324C18.4957 7.6377 18.1602 7.05666 18.4286 6.5918L19.6866 4.41284C19.78 4.25108 19.78 4.05173 19.6866 3.88989L17.9757 0.926514C17.8823 0.764678 17.7096 0.665039 17.5228 0.665039H14.101C13.9141 0.665039 13.7415 0.764678 13.6481 0.926514L11.9373 3.88989C11.8438 4.05173 11.8438 4.25108 11.9373 4.41284L13.6481 7.37622C13.7416 7.53806 13.9142 7.6377 14.101 7.6377H16.617C17.1538 7.6377 17.4892 8.21873 17.2209 8.68359L15.9629 10.8626C15.8694 11.0244 15.8694 11.2237 15.9629 11.3855L17.6737 14.3489C17.7672 14.5107 17.9398 14.6104 18.1266 14.6104H21.5484C21.7352 14.6104 21.9079 14.5107 22.0013 14.3489L23.7122 11.3855C23.8056 11.2237 23.8056 11.0244 23.7122 10.8626Z" />
        <path d="M28.8529 14.5901H27.252V0.650391H29.8486L34.1437 12.4035H34.1828L38.478 0.650391H40.977V14.5901H39.3566L39.3564 2.65231C39.3564 2.57456 39.2483 2.55518 39.2213 2.62811L34.7881 14.5901H33.4214L28.987 2.63627C28.96 2.56334 28.8519 2.58279 28.8519 2.66054L28.8529 14.5901Z" />
        <path d="M50.2901 11.7003H51.8129C51.6046 12.6764 51.136 13.4412 50.4073 13.9943C49.6781 14.5477 48.7932 14.824 47.7521 14.824C46.3332 14.824 45.1911 14.3621 44.3257 13.4378C43.4599 12.5138 43.0273 11.2775 43.0273 9.72839C43.0273 8.17928 43.4599 6.92678 44.3257 5.97013C45.1911 5.01348 46.3006 4.53516 47.6544 4.53516C48.9558 4.53516 49.9841 4.98113 50.7391 5.87251C51.4938 6.76418 51.8715 7.93224 51.8715 9.37697V10.0212H44.6087C44.6478 11.1408 44.9437 12.0062 45.4971 12.6179C46.0501 13.2298 46.8017 13.5355 47.752 13.5355C48.3896 13.5355 48.9201 13.3827 49.3431 13.0767C49.7659 12.771 50.0817 12.3122 50.2901 11.7003ZM47.6544 5.84323C46.8344 5.84323 46.1639 6.10679 45.6435 6.63393C45.1531 7.13031 44.8358 7.81447 44.692 8.68591C44.6778 8.77153 44.7426 8.84984 44.8294 8.84984H50.1446C50.2239 8.84984 50.2883 8.78367 50.2841 8.70453C50.2376 7.83643 49.9955 7.14962 49.5579 6.64369C49.0957 6.11014 48.4613 5.84323 47.6544 5.84323Z" />
        <path d="M57.2795 13.3793C57.5138 13.3793 57.7447 13.3598 57.9726 13.3208C58.2001 13.2817 58.4442 13.2232 58.7047 13.1451V14.4727C58.3923 14.5639 58.096 14.6319 57.8164 14.6777C57.5363 14.7231 57.2599 14.746 56.9866 14.746C56.0754 14.746 55.3955 14.5248 54.9464 14.0822C54.4974 13.6398 54.2729 12.9694 54.2729 12.0713V5.99948H52.8281V4.76951H54.2729V2.27051H55.8738V4.63005C55.8738 4.7071 55.9362 4.76951 56.0132 4.76951H58.4509V5.99948H55.8543V11.9932C55.8543 12.4749 55.9681 12.8263 56.1959 13.0474C56.4235 13.2689 56.7846 13.3793 57.2795 13.3793Z" />
        <path d="M62.3744 0.220703V5.95139C62.3744 6.09377 62.5605 6.14335 62.6341 6.02147C62.8659 5.63762 63.1762 5.3212 63.5653 5.07228C64.1247 4.71444 64.7757 4.53538 65.5176 4.53538C66.6237 4.53538 67.4861 4.86421 68.1045 5.52132C68.7225 6.1787 69.0318 7.09295 69.0318 8.26436V14.59H67.4115V8.61578C67.4115 7.70487 67.2128 7.01821 66.816 6.55606C66.4188 6.09419 65.8364 5.86298 65.0686 5.86298C64.2224 5.86298 63.5619 6.14941 63.087 6.72201C62.6117 7.29488 62.3744 8.11486 62.3744 9.18196V14.59H60.7539V0.220703H62.3744Z" />
        <path d="M75.3634 4.53516C76.7559 4.53516 77.8818 5.00707 78.7409 5.95061C79.5999 6.89442 80.0294 8.14058 80.0294 9.68934C80.0294 11.2381 79.5999 12.4812 78.7409 13.4183C77.8818 14.3554 76.7559 14.824 75.3634 14.824C73.9709 14.824 72.8448 14.3554 71.9858 13.4183C71.1268 12.4812 70.6973 11.2384 70.6973 9.68934C70.6973 8.1403 71.1268 6.89442 71.9858 5.95061C72.8448 5.00707 73.9705 4.53516 75.3634 4.53516ZM75.3634 5.84323C74.4131 5.84323 73.6648 6.18823 73.1182 6.87797C72.5715 7.56798 72.2981 8.50511 72.2981 9.68934C72.2981 10.8736 72.5715 11.8076 73.1182 12.491C73.6648 13.1743 74.4131 13.5159 75.3634 13.5159C76.3137 13.5159 77.0618 13.1743 77.6085 12.491C78.1552 11.8076 78.4285 10.8739 78.4285 9.68934C78.4285 8.50483 78.1552 7.56798 77.6085 6.87797C77.0618 6.18823 76.3133 5.84323 75.3634 5.84323Z" />
        <path d="M85.7483 14.8243C84.4725 14.8243 83.425 14.3493 82.605 13.3991C81.7851 12.4491 81.375 11.2125 81.375 9.68964C81.375 8.16681 81.7816 6.92707 82.5952 5.97043C83.4085 5.01378 84.4597 4.53545 85.7483 4.53545C86.4902 4.53545 87.1506 4.71451 87.7299 5.07235C88.1528 5.33389 88.4943 5.65958 88.7542 6.04929C88.8304 6.16364 89.0087 6.1089 89.0087 5.9714V0.220703H90.6292V14.59H89.0673V12.8719C88.7809 13.4448 88.3382 13.9133 87.7397 14.2776C87.1409 14.6418 86.4771 14.8242 85.7483 14.8242V14.8243ZM86.0802 5.80448C85.1431 5.80448 84.3979 6.1559 83.8448 6.85874C83.2914 7.56159 83.015 8.5054 83.015 9.68964C83.015 10.861 83.2914 11.7982 83.8448 12.501C84.3979 13.2039 85.143 13.5553 86.0802 13.5553C87.0042 13.5553 87.7364 13.217 88.2766 12.5401C88.8166 11.8634 89.0868 10.9522 89.0868 9.80678V9.53345C89.0868 8.38826 88.8166 7.48042 88.2766 6.80993C87.7364 6.13972 87.0042 5.80448 86.0802 5.80448Z" />
      </g>
    </svg>
  );
}

/**
 * The "Method" window visualization: the tab-strip base above the window
 * body (ReaperMissionViz per state), with the operator badge overlapping the
 * lower edge. The body is keyed by state so each swap replays its intro.
 */
function MissionWindow({ state }: { state: number }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Method tab strip — hidden for now (flip to true to restore). */}
      {false && <WindowTab />}
      <div className="w-full overflow-hidden rounded-[0.75em] border border-dark-secondary bg-dark-secondary/30">
        {/* Body — per-state visualization. */}
        <div className="aspect-[719/360] w-full">
          <ReaperMissionViz key={state} state={state} className="h-full w-full" />
        </div>
      </div>

      {/* Operator badge overlaps the window's lower edge, centred. */}
      <div className="-mt-[6em]">
        <OperatorBadge swarm={state === 2} />
      </div>
    </div>
  );
}

/**
 * Desktop left column: all three use-case titles shown at once, stacked beside
 * a single bright white rule segment that follows the open use case — the same
 * side-line mechanism as BastionChallengeTabs (no grey full-height track). The
 * active one (driven by scroll) expands to reveal its description and brightens;
 * the others collapse to just the title. Description height animates via
 * grid-template-rows (0fr ⇄ 1fr).
 */
function UseCaseList({
  items,
  active,
  onSelect,
}: {
  items: UseCase[];
  active: number;
  onSelect: (i: number) => void;
}) {
  const { setRowRef, seg } = useActiveRowSegment(active, items.length);
  return (
    <div
      className="relative flex w-full flex-col gap-[2.5em]"
      style={{ paddingLeft: "1.25em" }}
    >
      {/* single white rule segment that follows the open use case */}
      <span
        aria-hidden="true"
        className="absolute left-[0px] w-px bg-theme-text transition-all duration-500 ease-out"
        style={{ top: seg.top, height: seg.height }}
      />
      {items.map((uc, i) => {
        const isActive = i === active;
        return (
          <div key={uc.title} ref={setRowRef(i)} className="flex flex-col">
            {/* Clickable — scrolls the pinned section to this step. Users
                instinctively try to click these titles. */}
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={isActive ? "true" : undefined}
              className={`u-text-style-h5 cursor-pointer text-left transition-colors duration-300 ${
                isActive ? "text-theme-text" : "text-neutral hover:text-theme-text"
              }`}
            >
              {uc.title}
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isActive ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
              }`}
            >
              <div className="min-h-[0px] overflow-hidden">
                <p
                  aria-hidden={!isActive}
                  className={`pt-1 text-[1rem] d:text-[1.2rem] text-neutral transition-opacity duration-300 ${
                    isActive ? "opacity-100 delay-200" : "opacity-0"
                  }`}
                >
                  {uc.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ReaperUseCases({
  data,
}: {
  data?: ReaperPageData["useCases"];
}) {
  const isDesktop = useIsDesktop();
  const pinRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ReturnType<typeof ScrollTrigger.create> | null>(null);
  const [active, setActive] = useState(0);
  const useCases: UseCase[] = data?.items ?? [];

  // Desktop: pin the panel and step through the states on scroll.
  // (CSS `position: sticky` can't be used here — an ancestor <main> uses
  //  `overflow: clip`, which breaks sticky — so ScrollTrigger does the pinning,
  //  which also keeps the section's height correct via its pin-spacer.)
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin || !isDesktop) return;
    const count = useCases.length;
    const st = ScrollTrigger.create({
      trigger: pin,
      // Pin the (height-capped) panel centred in the viewport so tall screens
      // don't leave big sparse gaps the way a full 100vh panel would.
      start: "center center",
      end: `+=${(count - 1) * 100}%`,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        setActive(Math.min(count - 1, Math.floor(self.progress * count)));
      },
    });
    stRef.current = st;
    return () => {
      st.kill();
      stRef.current = null;
    };
  }, [isDesktop, useCases.length]);

  // Clicking a use-case title scrolls the page to the scroll position that
  // lands squarely on that step (centre of its progress band), so the pinned
  // animation advances to it. Smooth-scroll keeps the pinned panel coherent.
  const goToStep = useCallback(
    (i: number) => {
      const st = stRef.current;
      if (!st) return;
      const count = useCases.length;
      const progress = (i + 0.5) / count;
      const target = st.start + progress * (st.end - st.start);
      window.scrollTo({ top: target, behavior: "smooth" });
    },
    [useCases.length],
  );

  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="large" />

      {isDesktop ? (
        /* Desktop: pinned, scroll-driven states. Height capped so tall screens
           don't look sparse. */
        <div ref={pinRef} className="flex h-[min(100svh,60rem)] items-center">
          <div className="u-container flex max-w-none flex-col gap-main">
            <Header heading={data?.heading} intro={data?.intro} />
            <div className="grid grid-cols-12 items-stretch gap-4">
              {/* Full-height accent rule + bright segment that follows the open
                  use case (rule lives inside the accordion). */}
              <div className="col-span-4">
                <UseCaseList items={useCases} active={active} onSelect={goToStep} />
              </div>
              <div className="col-span-7 col-start-6">
                <MissionWindow state={active} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / tablet: stacked states, no pinning. */
        <div className="u-container flex flex-col gap-main">
          <Header heading={data?.heading} intro={data?.intro} />
          {useCases.map((uc, i) => (
            <div key={uc.title} className="flex flex-col gap-4">
              <div className="flex gap-[1.25em]">
                <VLine className="relative w-px shrink-0 self-stretch" />
                <div className="flex flex-col gap-3">
                  <h3 className="u-text-style-h5">{uc.title}</h3>
                  <p className="text-neutral">{uc.desc}</p>
                </div>
              </div>
              <MissionWindow state={i} />
            </div>
          ))}
        </div>
      )}

      <Spacer size="large" />
    </section>
  );
}
