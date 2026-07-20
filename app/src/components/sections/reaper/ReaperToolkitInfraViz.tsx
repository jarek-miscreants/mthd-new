"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { runWhileVisible } from "@/lib/animations/runWhileVisible";

/**
 * Reaper "A home for your operators' toolkit" — Infrastructure tab visualization
 * (Figma storyboard 2265:539).
 *
 * A honeycomb of hexagons scanned by several "scan" selectors at once — each a
 * wide bracket frame that holds its label inside it (Figma's exact bracket
 * geometry). A selector glides hex-to-hex like a pawn; on arrival the frame
 * snaps narrow to lock onto the hex, springs back wide, the tool label types
 * in, and the hex fills with a metallic gradient. The scanners share out the
 * comb between them, fill it, then it dissolves and loops. Auto-plays while
 * mounted (Infrastructure is the default tab).
 */

const SELECTOR_COUNT = 2;

// Global playback rate for the scan timeline. < 1 slows the whole sequence
// (glides, lock-on, typing, dwell) down proportionally; 1 is the original speed.
const PLAYBACK_RATE = 0.5;

// ---- Geometry (flat-top hexagons, axial → pixel) ------------------------
const R = 60; // layout radius (centre → vertex)
const RR = R * 0.88; // drawn radius, leaving a gutter between cells

interface Cell {
  cx: number;
  cy: number;
  ring: number;
}

const CELLS: Cell[] = (() => {
  const out: Cell[] = [];
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      const ring = (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
      if (ring > 2) continue;
      out.push({
        cx: 1.5 * R * q,
        cy: Math.sqrt(3) * R * (r + q / 2),
        ring,
      });
    }
  }
  return out;
})();

// Flat-top hex polygon points, centred on the origin.
const HEX_POINTS = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 180) * 60 * k;
  return `${(RR * Math.cos(a)).toFixed(2)},${(RR * Math.sin(a)).toFixed(2)}`;
}).join(" ");

// ---- Scan selector (Figma bracket, normalised to our hex) ---------------
const FIG_CENTER_X = 69.5997;
const FIG_CENTER_Y = 39.3952;
const FIG_HEX_W = 110.643 - 28.5564;
const BRK_SCALE = (2 * RR) / FIG_HEX_W; // ≈ 1.287
const BRK_NORMALIZE = `scale(${BRK_SCALE}) translate(${-FIG_CENTER_X} ${-FIG_CENTER_Y})`;

const BRK_HEX_D =
  "M90.121 3.85064L110.643 39.395L90.121 74.9393L49.0779 74.9393L28.5564 39.395L49.0779 3.85064L90.121 3.85064Z";
const BRK_FRAME_D =
  "M113.658 0.5C115.801 0.5 117.782 1.644 118.854 3.5L137.907 36.5C138.979 38.356 138.979 40.644 137.907 42.5L118.854 75.5C117.782 77.356 115.802 78.5 113.658 78.5M25.553 0.5C23.409 0.5 21.429 1.644 20.357 3.5L1.304 36.5C0.232 38.356 0.232 40.644 1.304 42.5L20.357 75.5C21.429 77.356 23.41 78.5 25.553 78.5";

// Horizontal scale that pulls the wide frame's tips in to the hex's left/right
// vertices — the "lock on" narrow state of the bracket's secondary motion.
const FRAME_HALF_W = (137.907 - FIG_CENTER_X) * BRK_SCALE;
const FRAME_NARROW_X = RR / FRAME_HALF_W; // ≈ 0.6

// ViewBox from cell bounds + padding (brackets/labels overflow into the gutter).
// Smaller padding → the comb fills more of the canvas, so it renders larger.
const PAD = 40;
const xs = CELLS.map((c) => c.cx);
const ys = CELLS.map((c) => c.cy);
const VB_X = Math.min(...xs) - RR - PAD;
const VB_Y = Math.min(...ys) - RR - PAD;
const VB_W = Math.max(...xs) - Math.min(...xs) + 2 * (RR + PAD);
const VB_H = Math.max(...ys) - Math.min(...ys) + 2 * (RR + PAD);

// ---- Scan order + labels ------------------------------------------------
// [category, name] — rendered as two centred lines inside the bracket.
const LABEL_PAIRS: [string, string][] = [
  [":METHOD LIBRARY", "JACKAL (M)"],
  [":USER TOOLS", "ORIONFORGE"],
  [":METHOD OPEN SOURCE", "OSINTSCAN (M)"],
  [":USER TOOLS", "SATURNLINK"],
  [":METHOD OPEN SOURCE", "METHODAZURE (M)"],
  [":METHOD LIBRARY", "C2 (M)"],
  [":USER TOOLS", "ZENITHORBIT"],
  [":METHOD OPEN SOURCE", "NETWORK SCAN (M)"],
  [":USER TOOLS", "JUPITERWINGS"],
  [":METHOD OPEN SOURCE", "METHODAWS (M)"],
  [":USER TOOLS", "LYRAFLOW"],
  [":METHOD OPEN SOURCE", "GITLABCTL (M)"],
  [":USER TOOLS", "LUNARMESH"],
  [":METHOD OPEN SOURCE", "WEBSCAN (M)"],
  [":USER TOOLS", "NEPTUNEGRID"],
  [":USER TOOLS", "NEBULATRACE"],
];

// Deterministic scattered scan order (SSR-stable, no Date/Math.random at runtime).
const frac = (n: number) => n - Math.floor(n);
const ORDER = CELLS.map((_, i) => i).sort(
  (a, b) => frac(Math.sin(a * 127.1) * 43758.5) - frac(Math.sin(b * 127.1) * 43758.5),
);

// Partition the comb between the scanners (round-robin keeps each scanner's
// route spread across the whole shape rather than clustered).
const ROUTES: { idx: number; n: number }[][] = Array.from(
  { length: SELECTOR_COUNT },
  () => [],
);
ORDER.forEach((idx, n) => ROUTES[n % SELECTOR_COUNT].push({ idx, n }));

const MONO = "var(--font-rom-mono, ui-monospace, 'SFMono-Regular', monospace)";

export default function ReaperToolkitInfraViz() {
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(root.querySelectorAll("[data-hex-fill]"), { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const fills = gsap.utils.toArray<SVGElement>("[data-hex-fill]");
      const selectorEls = gsap.utils.toArray<SVGGElement>("[data-selector]");

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
      tl.timeScale(PLAYBACK_RATE); // slow the whole sequence down uniformly

      // Type `str` into `el` char-by-char (monospace → typewriter feel).
      const addType = (el: Element, str: string, at: number, dur: number) => {
        const o = { n: 0 };
        tl.to(
          o,
          {
            n: str.length,
            duration: dur,
            ease: "none",
            onUpdate: () => {
              el.textContent = str.slice(0, Math.ceil(o.n));
            },
          },
          at,
        );
      };

      let maxEnd = 0;

      selectorEls.forEach((sel, k) => {
        const frame = sel.querySelector<SVGGElement>("[data-frame]");
        const label = sel.querySelector<SVGGElement>("[data-label]");
        const line1 = sel.querySelector<SVGTSpanElement>("[data-line1]");
        const line2 = sel.querySelector<SVGTSpanElement>("[data-line2]");
        const route = ROUTES[k];
        if (!frame || !label || !line1 || !line2 || route.length === 0) return;

        const clear = () => {
          line1.textContent = "";
          line2.textContent = "";
        };

        const first = CELLS[route[0].idx];
        tl.set(sel, { x: first.cx, y: first.cy, opacity: 0 }, 0);
        tl.set(frame, { scaleX: 1, transformOrigin: "center" }, 0);
        tl.to(sel, { opacity: 1, duration: 0.3 }, k * 0.22);

        // Phase each scanner so they don't move in lockstep.
        let t = 0.15 + k * 0.3;

        route.forEach(({ idx, n }, m) => {
          const { cx, cy } = CELLS[idx];
          const [cat, name] = LABEL_PAIRS[n % LABEL_PAIRS.length];

          // Glide to the hex, wide, with empty label.
          if (m > 0) {
            tl.to(sel, { x: cx, y: cy, duration: 0.4, ease: "power2.inOut" }, t);
            t += 0.4;
          }

          // Secondary motion: snap narrow to lock onto the hex, spring back
          // wide, then type the label (slow enough to read).
          tl.to(frame, { scaleX: FRAME_NARROW_X, duration: 0.15, ease: "power2.in" }, t);
          tl.to(frame, { scaleX: 1, duration: 0.24, ease: "back.out(1.8)" }, t + 0.15);

          // Nudge the label off-centre (deterministic per stop) so it sits
          // imperfectly in the frame — biased away from centre with a minimum
          // magnitude so every label clearly shifts, often past the tips.
          const sx = frac(Math.sin(n * 53.3) * 9301.7) < 0.5 ? -1 : 1;
          const sy = frac(Math.sin(n * 91.7) * 6271.3) < 0.5 ? -1 : 1;
          const ox = sx * (16 + frac(Math.sin(n * 12.9) * 7919.3) * 26);
          const oy = sy * (5 + frac(Math.sin(n * 27.1) * 3137.7) * 11);
          tl.set(label, { x: ox, y: oy }, t);

          addType(line1, cat, t + 0.42, 0.36);
          addType(line2, name, t + 0.82, 0.3);

          tl.to(fills[idx], { opacity: 1, duration: 0.45, ease: "power2.out" }, t + 0.5);

          // Hold the finished label a beat, then clear before moving on.
          tl.call(clear, undefined, t + 1.6);
          t += 1.6; // dwell before moving on
        });

        maxEnd = Math.max(maxEnd, t);
      });

      // Fade the scanners, hold the full comb for a beat, then dissolve + loop.
      const HOLD = 2; // seconds the completed honeycomb stays before transitioning back
      tl.to(selectorEls, { opacity: 0, duration: 0.4 }, maxEnd + 0.2);
      tl.to(
        fills,
        { opacity: 0, duration: 0.6, ease: "power1.in", stagger: 0.02 },
        maxEnd + 0.6 + HOLD,
      );

      // Only run the loop while the viz is on screen.
      return runWhileVisible(root, { timelines: [tl] });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={rootRef}
      viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
      className="h-full w-full overflow-visible"
      role="img"
      aria-label="Reaper toolkit honeycomb: Method and user tools being scanned into the platform"
    >
      <defs>
        <linearGradient id="reaper-hex-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dadada" />
          <stop offset="45%" stopColor="#6a6a6a" />
          <stop offset="100%" stopColor="#161616" />
        </linearGradient>
      </defs>

      {/* Honeycomb: persistent outline + gradient fill that animates in. */}
      {CELLS.map((c, i) => (
        <g key={i} transform={`translate(${c.cx},${c.cy})`}>
          <polygon
            points={HEX_POINTS}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.25}
          />
          <polygon
            data-hex-fill={i}
            points={HEX_POINTS}
            fill="url(#reaper-hex-grad)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
            style={{ opacity: 0 }}
          />
        </g>
      ))}

      {/* Scan selectors — each a bracket frame that glides between hexes and
          carries its label centred inside it. */}
      {Array.from({ length: SELECTOR_COUNT }, (_, k) => (
        <g key={`sel-${k}`} data-selector style={{ opacity: 0 }}>
          {/* Static inner reference hex (selection highlight). */}
          <g transform={BRK_NORMALIZE}>
            <path
              d={BRK_HEX_D}
              fill="none"
              stroke="#808080"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          </g>
          {/* Chevron frame — animates width (wide ⇄ narrow lock-on). */}
          <g data-frame>
            <g transform={BRK_NORMALIZE}>
              <path
                d={BRK_FRAME_D}
                fill="none"
                stroke="#cccccc"
                strokeWidth={1.5}
                strokeMiterlimit={10}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          </g>
          <g data-label>
            <text
              textAnchor="middle"
              style={{
                // Slightly oversized on purpose — the longer labels spill a
                // touch past the bracket tips so they don't sit too perfectly
                // inside the frame.
                fontFamily: MONO,
                fontSize: 18,
                letterSpacing: "0.09em",
                fill: "rgba(255,255,255,0.92)",
              }}
            >
              <tspan data-line1 x="0" dy="-2" />
              <tspan data-line2 x="0" dy="15" />
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}
