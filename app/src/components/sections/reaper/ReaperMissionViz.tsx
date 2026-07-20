"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { runWhileVisible } from "@/lib/animations/runWhileVisible";

/**
 * Reaper "Different Missions. Same Method." — the per-state window
 * visualizations (storyboard different-mission-storyboard.svg).
 *
 *   state 0 — Operator Augmentation: the Overwatch terminal. Window toolbar +
 *     commands typed at a prompt, with a Method agent chip riding the cursor.
 *   state 1 — Selective Automated Assumed Breach: two agents working dotted
 *     tool chains across the Method app canvas (sidebar + graph).
 *   state 2 — Large Scale Adversary Emulation: the same chains stamped at
 *     half scale into a dense ten-agent field.
 *
 * Graph geometry is lifted from the storyboard export. Chains are defined as
 * "motifs" — square/sub-node/edge offsets from their agent's centre — so the
 * dense state reuses the exact small-state chains at 0.5× (which is also how
 * the storyboard was drawn).
 */

type Pt = [number, number];

// Reaper product symbol (public/product-symbols/reaper.svg, 67×57 viewBox).
// Exported for the operator badge's orbiting agent chips in ReaperUseCases.
export const REAPER_GLYPH_D =
  "M65.7839 29.5686C66.17 28.9072 66.1694 28.093 65.7824 27.4323L50.3487 1.06859C49.9609 0.408385 49.2456 0.00171111 48.4717 0.00171111L17.6013 0C16.8274 0.00114074 16.1128 0.408671 15.7258 1.06945L0.28917 27.4314C-0.0969196 28.0928 -0.0963412 28.907 0.290616 29.5677L15.7244 55.9314C16.1122 56.5919 16.8274 56.9983 17.6013 56.9983L48.4717 57C49.2456 56.9989 49.9603 56.5913 50.3472 55.9306L65.7839 29.5686ZM31.1928 45.2478V53.3342C31.1928 54.0637 30.2136 54.3224 29.8437 53.6907L19.3814 35.8216C18.982 35.1397 18.0976 34.9058 17.4061 35.2997L10.3044 39.3428C9.66378 39.7075 8.94684 39.0005 9.31673 38.3688L19.779 20.4997C20.1784 19.8178 19.9413 18.9457 19.2498 18.5519L12.1481 14.5088C11.5075 14.1441 11.7698 13.1784 12.5096 13.1784H33.4339C34.2324 13.1784 34.8799 12.5399 34.8799 11.7525V3.66606C34.8799 2.93655 35.8592 2.67789 36.2291 3.30958L46.6914 21.1787C47.0908 21.8606 47.9752 22.0945 48.6667 21.7006L55.7684 17.6575C56.409 17.2928 57.1259 17.9998 56.756 18.6314L46.2937 36.5006C45.8943 37.1825 46.1315 38.0546 46.823 38.4484L53.9247 42.4915C54.5653 42.8562 54.303 43.8219 53.5632 43.8219H32.6389C31.8404 43.8219 31.1928 44.4604 31.1928 45.2478Z";
const GLYPH_W = 67;
const GLYPH_CX = 33.2;
const GLYPH_CY = 28.5;

const r2 = (n: number) => Math.round(n * 100) / 100;

// Polyline with rounded corners. Long segments earn sweeping curves, short
// ones stay tight, which reproduces the storyboard's elbows and S-bends from
// one generator. Coordinates rounded so the SSR/browser markup matches.
function roundedPath(pts: Pt[]): string {
  let d = `M ${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const l1 = Math.hypot(x1 - x0, y1 - y0) || 1;
    const l2 = Math.hypot(x2 - x1, y2 - y1) || 1;
    const rr = Math.min(12, l1 / 2.05, l2 / 2.05);
    const ax = x1 - ((x1 - x0) / l1) * rr;
    const ay = y1 - ((y1 - y0) / l1) * rr;
    const bx = x1 + ((x2 - x1) / l2) * rr;
    const by = y1 + ((y2 - y1) / l2) * rr;
    d += ` L ${r2(ax)} ${r2(ay)} Q ${r2(x1)} ${r2(y1)} ${r2(bx)} ${r2(by)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  d += ` L ${r2(lx)} ${r2(ly)}`;
  return d;
}

const hexPoints = (r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return `${r2(r * Math.cos(a))},${r2(r * Math.sin(a))}`;
  }).join(" ");

// ---- Graph primitives ------------------------------------------------------

/** Agent — black disc, grey ring, white Reaper glyph, soft white glow. */
function AgentNode({ r, glow }: { r: number; glow: string }) {
  const k = (r * 1.15) / GLYPH_W;
  return (
    <g data-agent>
      <circle r={r} fill="#0a0a0a" stroke="#808080" strokeWidth={0.5} filter={glow} />
      <g transform={`scale(${r2(k)}) translate(${-GLYPH_CX} ${-GLYPH_CY})`}>
        <path d={REAPER_GLYPH_D} fill="#ffffff" />
      </g>
    </g>
  );
}

/** Object/sub-agent node — small disc with a grey hex outline. */
function SubNode({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g data-node transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#0a0a0a" stroke="#808080" strokeOpacity={0.5} strokeWidth={0.45} />
      <polygon
        points={hexPoints(r * 0.55)}
        fill="none"
        stroke="#808080"
        strokeWidth={0.7}
      />
    </g>
  );
}

// ---- Chain motifs ----------------------------------------------------------
// Offsets from the agent's centre, in the small-graph (state 1) scale: tool
// squares are 8px, sub-nodes r5.6, edges start at the agent's rim (r≈19).
// The dense state renders the same motifs inside a scale(0.5) group.

interface Motif {
  squares: Pt[];
  subs: Pt[];
  edges: Pt[][];
}

const MOTIF_A: Motif = {
  squares: [
    [40.3, 0.3],
    [86.8, -7.7],
    [78.8, 11.3],
    [116.3, 11.3],
    [141.3, 0.3],
    [182.8, 23.3],
    [251.3, -47.7],
  ],
  subs: [],
  edges: [
    [[19, 0.3], [40.3, 0.3]],
    [[40.3, 0.3], [64, 0.3], [64, 11.3], [78.8, 11.3]],
    [[78.8, 11.3], [116.3, 11.3]],
    [[86.8, -7.7], [104, -7.7], [104, 11.3], [112, 11.3]],
    [[116.3, 11.3], [128, 11.3], [128, 0.3], [141.3, 0.3]],
    [[141.3, 0.3], [158, 0.3], [158, 23.3], [182.8, 23.3]],
    [[182.8, 23.3], [212, 23.3], [212, -47.7], [251.3, -47.7]],
  ],
};

const MOTIF_B: Motif = {
  squares: [
    [40.3, 0.3],
    [64.8, 0.3],
    [88.3, -14.7],
    [115.3, 0.3],
    [154.3, 16.8],
    [-14.7, 71.3],
  ],
  subs: [[94.9, 30.3]],
  edges: [
    [[19, 0.3], [40.3, 0.3]],
    [[40.3, 0.3], [64.8, 0.3]],
    [[64.8, 0.3], [72, 0.3], [72, -14.7], [88.3, -14.7]],
    [[64.8, 0.3], [115.3, 0.3]],
    [[115.3, 0.3], [134, 0.3], [134, 16.8], [154.3, 16.8]],
    [[64.8, 0.3], [64.8, 30.3], [94.9, 30.3]],
    [[-14.7, 71.3], [8, 71.3], [8, 0.3], [40.3, 0.3]],
  ],
};

const MOTIF_C: Motif = {
  squares: [
    [40.2, 0.2],
    [78.8, 11.2],
    [116.2, 4.2],
    [116.2, 26.2],
    [141.2, 0.2],
    [166.2, 32.2],
  ],
  subs: [],
  edges: [
    [[19, 0.2], [40.2, 0.2]],
    [[40.2, 0.2], [60, 0.2], [60, 11.2], [78.8, 11.2]],
    [[78.8, 11.2], [98, 11.2], [98, 4.2], [116.2, 4.2]],
    [[116.2, 4.2], [116.2, 26.2]],
    [[116.2, 4.2], [130, 4.2], [130, 0.2], [141.2, 0.2]],
    [[141.2, 0.2], [154, 0.2], [154, 32.2], [166.2, 32.2]],
  ],
};

const MOTIF_D: Motif = {
  squares: [
    [40.2, -0.8],
    [68.8, -30.2],
    [88.2, -36.8],
    [113.8, -26.2],
    [142.8, -6.8],
    [175.8, -36.8],
  ],
  subs: [
    [61.4, -54.2],
    [140.8, 7.4],
  ],
  edges: [
    [[19, -0.8], [40.2, -0.8]],
    [[40.2, -0.8], [56, -0.8], [56, -30.2], [68.8, -30.2]],
    [[68.8, -30.2], [80, -30.2], [80, -36.8], [88.2, -36.8]],
    [[88.2, -36.8], [104, -36.8], [104, -26.2], [113.8, -26.2]],
    [[113.8, -26.2], [130, -26.2], [130, -6.8], [142.8, -6.8]],
    [[113.8, -26.2], [160, -26.2], [160, -36.8], [175.8, -36.8]],
    [[68.8, -30.2], [61.4, -40], [61.4, -54.2]],
    [[142.8, -6.8], [140.8, 7.4]],
  ],
};

/** Short trail for the field's loose agents. */
const MOTIF_TRAIL: Motif = {
  squares: [
    [40, 0],
    [72, 10],
  ],
  subs: [[104, 18]],
  edges: [
    [[19, 0], [40, 0]],
    [[40, 0], [58, 0], [58, 10], [72, 10]],
    [[72, 10], [90, 10], [90, 18], [104, 18]],
  ],
};

interface ClusterDef {
  x: number;
  y: number;
  s: number;
  motif: Motif;
}

// Both graph states share one viewBox/sidebar so nothing jumps on swap.
const GRAPH_VIEWBOX = "0 -1.5 588 294";
const GRAPH_H = 291;

// State 1 — the two-agent graph (storyboard frame 2, rescaled from its
// 544×253 window into the shared 588×291 frame: ×1.15).
const SMALL_CLUSTERS: ClusterDef[] = [
  { x: 130.8, y: 97.4, s: 1.15, motif: MOTIF_A },
  { x: 359.6, y: 165.3, s: 1.15, motif: MOTIF_B },
];

// State 2 — the ten-agent field (storyboard frame 3): the same motifs at
// half scale, twice each, plus loose agents trailing off at the edges.
const DENSE_CLUSTERS: ClusterDef[] = [
  { x: 84.4, y: 85.9, s: 0.5, motif: MOTIF_A },
  { x: 183.9, y: 115.4, s: 0.5, motif: MOTIF_B },
  { x: 284.9, y: 75.9, s: 0.5, motif: MOTIF_D },
  { x: 238.4, y: 167.9, s: 0.5, motif: MOTIF_D },
  { x: 321.4, y: 129.4, s: 0.5, motif: MOTIF_C },
  { x: 462.4, y: 37.4, s: 0.5, motif: MOTIF_C },
  { x: 397.4, y: 217.9, s: 0.5, motif: MOTIF_A },
  { x: 496.9, y: 247.4, s: 0.5, motif: MOTIF_B },
  { x: 597.9, y: 207.9, s: 0.5, motif: MOTIF_TRAIL },
  { x: 551.4, y: 283, s: 0.5, motif: MOTIF_TRAIL },
];

function Cluster({
  def,
  glow,
  dotted,
}: {
  def: ClusterDef;
  glow: string;
  dotted: boolean;
}) {
  const { x, y, s, motif } = def;
  return (
    <g data-cluster transform={`translate(${x} ${y}) scale(${s})`}>
      {motif.edges.map((pts, i) => (
        <path
          key={`e-${i}`}
          data-edge
          d={roundedPath(pts)}
          fill="none"
          stroke="#808080"
          strokeOpacity={dotted ? 0.9 : 0.75}
          strokeWidth={dotted ? 1.33 : 0.9}
          strokeLinecap="round"
          strokeDasharray={dotted ? "0.1 3.2" : undefined}
        />
      ))}
      {motif.squares.map(([dx, dy], i) => (
        <rect
          key={`s-${i}`}
          data-node
          x={dx - 4}
          y={dy - 4}
          width={8}
          height={8}
          rx={1}
          fill="#808080"
        />
      ))}
      {motif.subs.map(([dx, dy], i) => (
        <SubNode key={`o-${i}`} x={dx} y={dy} r={5.6} />
      ))}
      <AgentNode r={18.7} glow={glow} />
    </g>
  );
}

// ---- App sidebar (graph states' window chrome) -----------------------------

function Sidebar({ h }: { h: number }) {
  const icon = {
    fill: "none" as const,
    stroke: "#808080",
    strokeWidth: 1.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <g aria-hidden>
      {/* Method mark */}
      <g transform="translate(12 10) scale(1.15)" fill="#ffffff">
        <circle cx={4} cy={4} r={1.9} />
        <circle cx={10} cy={4} r={1.9} />
        <circle cx={7} cy={9} r={1.9} />
      </g>
      <line x1={40} y1={16} x2={40} y2={h - 16} stroke="#808080" strokeOpacity={0.5} strokeWidth={0.5} />
      {/* home */}
      <g transform="translate(13.5 45.5)" {...icon}>
        <path d="M2 5.5 6.5 1.8 11 5.5 V11.2 H2 Z" />
        <path d="M5.2 11.2 V7.8 H7.8 V11.2" />
      </g>
      {/* zap */}
      <g transform="translate(13.5 69.5)" {...icon}>
        <path d="M7.2 1.2 2.8 7.2 H6 L5.6 11.8 10.2 5.6 H7 Z" />
      </g>
      <line x1={12.5} y1={92} x2={27.5} y2={92} stroke="#808080" strokeOpacity={0.5} strokeWidth={0.5} />
      {/* grid */}
      <g transform="translate(13.5 100.5)" {...icon}>
        <rect x={1} y={1} width={4.4} height={4.4} rx={1} />
        <rect x={7.6} y={1} width={4.4} height={4.4} rx={1} />
        <rect x={1} y={7.6} width={4.4} height={4.4} rx={1} />
        <rect x={7.6} y={7.6} width={4.4} height={4.4} rx={1} />
      </g>
      {/* bar chart */}
      <g transform="translate(13.5 123.5)" {...icon} strokeWidth={1.4}>
        <path d="M2.6 11 V7.2" />
        <path d="M6.5 11 V3.4" />
        <path d="M10.4 11 V8.6" />
      </g>
      <line x1={12.5} y1={146} x2={27.5} y2={146} stroke="#808080" strokeOpacity={0.5} strokeWidth={0.5} />
      {/* clipboard */}
      <g transform="translate(13.5 153.5)" {...icon}>
        <rect x={2.4} y={2} width={8.2} height={9.4} rx={1} />
        <rect x={4.6} y={0.6} width={3.8} height={2.8} rx={0.8} />
      </g>
    </g>
  );
}

// ---- Graph states (1 & 2) --------------------------------------------------

function GraphViz({
  viewBox,
  height,
  clusters,
  clusterStagger,
  dotted,
  label,
  className,
}: {
  viewBox: string;
  height: number;
  clusters: ClusterDef[];
  clusterStagger: number;
  /** Dotted connectors (the dense field); solid ones draw in instead. */
  dotted: boolean;
  label: string;
  className?: string;
}) {
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.utils.toArray<SVGGElement>("[data-cluster]", root).forEach((g, i) => {
          const edges = g.querySelectorAll<SVGPathElement>("[data-edge]");
          const tl = gsap
            .timeline({ delay: 0.15 + i * clusterStagger })
            .from(g.querySelector("[data-agent]"), {
              scale: 0,
              transformOrigin: "50% 50%",
              duration: 0.5,
              ease: "back.out(2)",
            });
          if (dotted) {
            tl.from(edges, { opacity: 0, duration: 0.35, stagger: 0.08 }, "-=0.25");
          } else {
            // Solid connectors draw in from the agent outward.
            edges.forEach((e) => {
              const len = e.getTotalLength();
              gsap.set(e, { strokeDasharray: len, strokeDashoffset: len });
            });
            tl.to(
              edges,
              { strokeDashoffset: 0, duration: 0.5, stagger: 0.08, ease: "power1.out" },
              "-=0.25",
            );
          }
          tl.from(
            g.querySelectorAll("[data-node]"),
            {
              scale: 0,
              transformOrigin: "50% 50%",
              duration: 0.3,
              ease: "back.out(2.5)",
              stagger: 0.08,
            },
            "<+0.06",
          );
        });
        // Ambient on dotted chains: the dots march. Offset is a multiple of
        // the dash period (3.3) so the loop wraps seamlessly.
        if (dotted) {
          const march = gsap.to(gsap.utils.toArray<SVGPathElement>("[data-edge]", root), {
            strokeDashoffset: -66,
            duration: 10,
            ease: "none",
            repeat: -1,
            paused: true,
          });
          // Only march the dots while the viz is on screen.
          return runWhileVisible(root, { timelines: [march] });
        }
      }
    }, root);
    return () => ctx.revert();
  }, [clusterStagger, dotted]);

  const glowId = `mission-glow-${clusters.length}`;
  return (
    <svg
      ref={rootRef}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <filter id={glowId} x="-120%" y="-120%" width="340%" height="340%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.28" />
        </filter>
      </defs>
      <Sidebar h={height} />
      {clusters.map((def, i) => (
        <Cluster key={i} def={def} glow={`url(#${glowId})`} dotted={dotted} />
      ))}
    </svg>
  );
}

// ---- Terminal state (0) ----------------------------------------------------

const TERM_X = 15;
const TERM_LINES = { out1: 64, cmd1: 85, out2: 106, cmd2: 127 };
const TERM_CMD1 = "cd missions/raven-04";
const TERM_CMD2 = "overwatch --attach";

function TerminalViz({ className }: { className?: string }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const cmd1Ref = useRef<SVGTextElement>(null);
  const cmd2Ref = useRef<SVGTextElement>(null);
  const out2Ref = useRef<SVGTextElement>(null);
  const cursorRef = useRef<SVGRectElement>(null);
  const chipRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const cmd1 = cmd1Ref.current;
    const cmd2 = cmd2Ref.current;
    const out2 = out2Ref.current;
    const cursor = cursorRef.current;
    const chip = chipRef.current;
    if (!root || !cmd1 || !cmd2 || !out2 || !cursor || !chip) return;

    // Caret + agent chip sit just past the end of the active line's text.
    const setCaret = (textEl: SVGTextElement, lineY: number) => {
      const len = textEl.getComputedTextLength();
      cursor.setAttribute("x", `${r2(TERM_X + len + 2)}`);
      cursor.setAttribute("y", `${lineY - 10.5}`);
      chip.setAttribute(
        "transform",
        `translate(${r2(TERM_X + len + 22)} ${lineY - 4.5})`,
      );
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cmd1.textContent = TERM_CMD1;
      cmd2.textContent = TERM_CMD2;
      out2.style.opacity = "1";
      setCaret(cmd2, TERM_LINES.cmd2);
      return;
    }

    const ctx = gsap.context(() => {
      const blink = gsap.to(cursor, {
        opacity: 0,
        duration: 0.55,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)",
        paused: true,
      });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true });
      const typeInto = (el: SVGTextElement, str: string, lineY: number) => {
        const state = { n: 0 };
        tl.to(state, {
          n: str.length,
          duration: str.length * 0.055,
          ease: "none",
          onUpdate: () => {
            el.textContent = str.slice(0, Math.round(state.n));
            setCaret(el, lineY);
          },
        });
      };

      tl.call(() => {
        cmd1.textContent = "";
        cmd2.textContent = "";
        gsap.set([cmd1, cmd2], { opacity: 1 });
        gsap.set(out2, { autoAlpha: 0 });
        setCaret(cmd1, TERM_LINES.cmd1);
      });
      tl.to({}, { duration: 0.7 });
      typeInto(cmd1, TERM_CMD1, TERM_LINES.cmd1);
      tl.to({}, { duration: 0.5 });
      tl.to(out2, { autoAlpha: 1, duration: 0.25 });
      tl.call(() => setCaret(cmd2, TERM_LINES.cmd2));
      tl.to({}, { duration: 0.35 });
      typeInto(cmd2, TERM_CMD2, TERM_LINES.cmd2);
      tl.to({}, { duration: 2 });
      tl.to([cmd1, cmd2, out2], { opacity: 0, duration: 0.45 });

      // Only run the terminal + caret blink while the viz is on screen.
      return runWhileVisible(root, { timelines: [blink, tl] });
    }, root);
    return () => ctx.revert();
  }, []);

  const grey = "#808080";
  return (
    <svg
      ref={rootRef}
      viewBox="0 -29.5 544 272"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label="The Overwatch terminal: commands typed at a prompt with a Method agent following the cursor"
    >
      {/* Typed prompt, nudged up so the terminal content sits higher in the
          window (footer/badge stay where they are). Toolbar chrome — dots,
          search, layout toggles, account avatar — all removed. */}
      <g transform="translate(0 -30)">
        {/* Prompt lines */}
        <text x={TERM_X} y={TERM_LINES.out1} fontSize={12} fill={grey} className="font-secondary">
          ~ (.048s)
        </text>
        <text
          ref={cmd1Ref}
          x={TERM_X}
          y={TERM_LINES.cmd1}
          fontSize={12}
          fill="#e0e0e0"
          className="font-secondary"
        />
        <text
          ref={out2Ref}
          x={TERM_X}
          y={TERM_LINES.out2}
          fontSize={12}
          fill={grey}
          style={{ opacity: 0 }}
          className="font-secondary"
        >
          ~ (.112s)
        </text>
        <text
          ref={cmd2Ref}
          x={TERM_X}
          y={TERM_LINES.cmd2}
          fontSize={12}
          fill="#e0e0e0"
          className="font-secondary"
        />

        {/* Block cursor + the Method agent chip riding it (storyboard: a 21.5px
            disc with the Method mark, a mouse pointer hovering its corner). */}
        <rect ref={cursorRef} x={17} y={74.5} width={6.5} height={13} fill="#e0e0e0" />
        <g ref={chipRef} transform="translate(37 80.5)" aria-hidden>
          <circle r={10.75} fill="#0a0a0a" stroke="#808080" strokeOpacity={0.6} strokeWidth={0.5} />
          <g transform="translate(-7.7 -7.2) scale(1.1)" fill="#ffffff">
            <circle cx={4} cy={4} r={1.7} />
            <circle cx={10} cy={4} r={1.7} />
            <circle cx={7} cy={9} r={1.7} />
          </g>
          {/* pointer */}
          <g transform="translate(-9.5 -11) scale(1.2)">
            <path
              d="M-1.5 -4 L-1.5 3.4 L0.6 1.5 L1.9 4.4 L3.2 3.8 L1.9 1 L4.3 0.7 Z"
              fill="#ffffff"
              stroke="#0a0a0a"
              strokeWidth={0.4}
            />
          </g>
        </g>
      </g>

      {/* Footer hint */}
      <g aria-hidden>
        <g
          transform={`translate(338 182.5) scale(${r2(11 / 24)})`}
          fill="none"
          stroke={grey}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </g>
        <g
          transform={`translate(356 182.5) scale(${r2(11 / 24)})`}
          fill="none"
          stroke={grey}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 10 4 15 9 20" />
          <path d="M20 4v7a4 4 0 0 1-4 4H4" />
        </g>
        <text x={374} y={192} fontSize={10.5} letterSpacing={0.4} fill={grey} className="font-secondary">
          new/agent conversation
        </text>
      </g>
    </svg>
  );
}

// ---- Entry -----------------------------------------------------------------

export default function ReaperMissionViz({
  state,
  className = "",
}: {
  state: number;
  className?: string;
}) {
  if (state === 1)
    return (
      <GraphViz
        viewBox={GRAPH_VIEWBOX}
        height={GRAPH_H}
        clusters={SMALL_CLUSTERS}
        clusterStagger={0.3}
        dotted={false}
        label="Two Method agents executing tool chains on the mission canvas"
        className={className}
      />
    );
  if (state === 2)
    return (
      <GraphViz
        viewBox={GRAPH_VIEWBOX}
        height={GRAPH_H}
        clusters={DENSE_CLUSTERS}
        clusterStagger={0.1}
        dotted
        label="A dense field of autonomous Method agents, each trailing its own tool chain"
        className={className}
      />
    );
  return <TerminalViz className={className} />;
}
