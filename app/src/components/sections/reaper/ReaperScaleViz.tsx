"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { gsap } from "gsap";

/**
 * Reaper "How it works" — Scale tab visualization (storyboard
 * method-scale-flow.svg).
 *
 * One SVG "world" drawn at three levels of detail, with a camera that zooms
 * smoothly between them: a single agent's tool chain → a 5-agent cluster
 * (each trailing its own chain) → the full field of hundreds of agents. The
 * camera is a <g> transform tweened by GSAP (zoom interpolated in log space
 * so the motion feels like a map zoom, not a linear scale). Layers cross-fade
 * with the camera so each zoom level only shows its own detail (map-style
 * LOD).
 *
 * Starts fully zoomed in; the 3-detent zoom slider (storyboard's bottom
 * control) is the only thing that moves the camera.
 */

const W = 1000;
const H = 420;

type Pt = [number, number];

// Camera targets: world-space centre + zoom for each step.
// Step 0 = fully zoomed in (slider handle right), 2 = whole world (left).
const VIEWS = [
  { x: 517, y: 211, s: 5.7 },
  { x: 512, y: 206, s: 2.45 },
  { x: 500, y: 210, s: 1 },
];

// Per-step layer opacities: chain detail / world field.
const LAYERS = [
  { chain: 1, world: 0 },
  { chain: 1, world: 0 },
  { chain: 0, world: 1 },
];

const ZOOM_DUR = 1.15; // camera tween (s)
const FADE_DUR = 0.9; // layer cross-fade (s)
const AUTO_MS = 3000; // dwell on the final stage before handing off to the next tab
// Per-stage dwell before auto-advancing: step 0→1 after 1.5s, step 1→2 after
// 2.5s, then the final field holds for AUTO_MS before onSequenceEnd.
const DWELL_MS = [1500, 2500, AUTO_MS];

const camTransform = (x: number, y: number, s: number) =>
  `translate(${W / 2 - s * x} ${H / 2 - s * y}) scale(${s})`;

// ---- Agent badge (Reaper product symbol on a disc) ----------------------
// public/product-symbols/reaper.svg, 67×57 viewBox.
const GLYPH_D =
  "M65.7839 29.5686C66.17 28.9072 66.1694 28.093 65.7824 27.4323L50.3487 1.06859C49.9609 0.408385 49.2456 0.00171111 48.4717 0.00171111L17.6013 0C16.8274 0.00114074 16.1128 0.408671 15.7258 1.06945L0.28917 27.4314C-0.0969196 28.0928 -0.0963412 28.907 0.290616 29.5677L15.7244 55.9314C16.1122 56.5919 16.8274 56.9983 17.6013 56.9983L48.4717 57C49.2456 56.9989 49.9603 56.5913 50.3472 55.9306L65.7839 29.5686ZM31.1928 45.2478V53.3342C31.1928 54.0637 30.2136 54.3224 29.8437 53.6907L19.3814 35.8216C18.982 35.1397 18.0976 34.9058 17.4061 35.2997L10.3044 39.3428C9.66378 39.7075 8.94684 39.0005 9.31673 38.3688L19.779 20.4997C20.1784 19.8178 19.9413 18.9457 19.2498 18.5519L12.1481 14.5088C11.5075 14.1441 11.7698 13.1784 12.5096 13.1784H33.4339C34.2324 13.1784 34.8799 12.5399 34.8799 11.7525V3.66606C34.8799 2.93655 35.8592 2.67789 36.2291 3.30958L46.6914 21.1787C47.0908 21.8606 47.9752 22.0945 48.6667 21.7006L55.7684 17.6575C56.409 17.2928 57.1259 17.9998 56.756 18.6314L46.2937 36.5006C45.8943 37.1825 46.1315 38.0546 46.823 38.4484L53.9247 42.4915C54.5653 42.8562 54.303 43.8219 53.5632 43.8219H32.6389C31.8404 43.8219 31.1928 44.4604 31.1928 45.2478Z";
const GLYPH_W = 67;
const GLYPH_CX = 33.2;
const GLYPH_CY = 28.5;

function AgentBadge({ x, y, r }: { x: number; y: number; r: number }) {
  const k = (r * 1.15) / GLYPH_W;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        r={r}
        fill="#0a0a0a"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={r * 0.07}
      />
      <g transform={`scale(${k}) translate(${-GLYPH_CX} ${-GLYPH_CY})`}>
        <path d={GLYPH_D} fill="#ffffff" />
      </g>
    </g>
  );
}

// Small hex "object" node (the sub-agent / data nodes between chains).
const hexPoints = (r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

function SubNode({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#0d0d0d" stroke="rgba(255,255,255,0.55)" strokeWidth={r * 0.16} />
      <polygon points={hexPoints(r * 0.6)} fill="#e0e0e0" />
      <polygon points={hexPoints(r * 0.3)} fill="#0d0d0d" />
    </g>
  );
}

// ---- World geometry ------------------------------------------------------

// The 5-agent mesh (step-1 view). A is the step-0 close-up focus.
const MESH_AGENTS: { p: Pt; r: number }[] = [
  { p: [470, 205], r: 8.5 }, // A — focus of the zoomed-in view
  { p: [352, 183], r: 8 }, // B left
  { p: [612, 150], r: 8 }, // C top
  { p: [660, 228], r: 8 }, // D right
  { p: [562, 266], r: 8 }, // E bottom
];

// Tool chains trailing each agent: connector polylines (drawn as gentle
// quadratic wiggles), square tool nodes, and small hex object nodes.
interface Chain {
  paths: Pt[][];
  squares: Pt[];
  circles: Pt[];
}

const CHAINS: Chain[] = [
  {
    // A's chain — the storyboard's zoomed-in frame: straight run with a
    // branch up to a tool and a branch down to a sub-agent.
    paths: [
      [
        [478, 205],
        [497, 204],
        [517, 206],
        [544, 207],
        [564, 220],
        [590, 228],
      ],
      [
        [517, 206],
        [530, 188],
      ],
      [
        [517, 206],
        [527, 224],
      ],
    ],
    squares: [
      [497, 204],
      [517, 206],
      [544, 207],
      [564, 220],
      [590, 228],
      [530, 188],
    ],
    circles: [[527, 227.5]],
  },
  {
    paths: [
      [
        [360, 183],
        [372, 180],
        [388, 187],
        [403, 181],
      ],
    ],
    squares: [
      [372, 180],
      [388, 187],
      [403, 181],
    ],
    circles: [],
  },
  {
    paths: [
      [
        [620, 150],
        [630, 145],
        [645, 153],
        [661, 146],
        [672, 140],
      ],
    ],
    squares: [
      [630, 145],
      [645, 153],
      [661, 146],
    ],
    circles: [[672, 140]],
  },
  {
    paths: [
      [
        [668, 228],
        [678, 232],
        [694, 225],
        [709, 234],
        [714, 227],
      ],
    ],
    squares: [
      [678, 232],
      [694, 225],
      [709, 234],
    ],
    circles: [[714, 227]],
  },
  {
    paths: [
      [
        [570, 266],
        [580, 271],
        [595, 264],
        [609, 271],
      ],
    ],
    squares: [
      [580, 271],
      [595, 264],
      [609, 271],
    ],
    circles: [],
  },
];

// Loose object nodes floating in the mesh (storyboard mid frame).
const FREE_CIRCLES: Pt[] = [
  [612, 250],
  [646, 198],
];

// Connector path through points as gentle alternating quadratic wiggles.
function wiggle(pts: Pt[]): string {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const k = (i % 2 ? 1 : -1) * Math.min(4, len * 0.22);
    d += ` Q ${(mx - (dy / len) * k).toFixed(2)} ${(my + (dx / len) * k).toFixed(2)} ${x1} ${y1}`;
  }
  return d;
}

// ---- Zoomed-out world field ----------------------------------------------
// Geometry extracted verbatim from the stage-3 Figma export
// (scale-stage-3d.svg): 87 agent badges, 3 radiating hubs, 56 hub edges,
// scaled from export space (centres 97–877 × 27–408) into world coords.
// Integer hash (not Math.sin — transcendentals differ at the 1e-9 level
// between Node and the browser, which breaks hydration) drives the debris.
const frac = (n: number) => {
  let t = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  t ^= t >>> 13;
  t = Math.imul(t, 0xc2b2ae35);
  t ^= t >>> 16;
  return (t >>> 0) / 4294967296;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

// The three radiating hub agents (drawn slightly larger).
const HUBS: Pt[] = [
  [367.5, 242.5],
  [629, 312.2],
  [221.7, 36],
];

const W_BADGES_RAW: Pt[] = [
  [310.8, 124.1],
  [283.1, 169.5],
  [189.1, 129],
  [175.9, 154.3],
  [467.5, 131.6],
  [467.5, 43.8],
  [718.2, 43.8],
  [856.8, 82.2],
  [420.5, 177],
  [420.5, 89.2],
  [671.2, 89.2],
  [809.8, 127.6],
  [332.5, 150.5],
  [333.7, 66.9],
  [389.2, 133],
  [389.2, 45.2],
  [639.8, 45.2],
  [778.4, 83.7],
  [374.7, 99.4],
  [339.8, 206],
  [265.1, 191.2],
  [249.4, 143.6],
  [151.8, 178.4],
  [526.6, 188.3],
  [526.6, 100.4],
  [777.2, 100.4],
  [915.8, 138.9],
  [498.8, 233.6],
  [404.8, 193.2],
  [391.6, 218.4],
  [683.2, 195.7],
  [745.9, 76.3],
  [836.3, 166.1],
  [108.4, 400],
  [859.2, 195.7],
  [30.1, 195.7],
  [636.2, 241.1],
  [548.3, 214.6],
  [549.5, 131],
  [549.5, 43.2],
  [800.1, 43.2],
  [938.7, 81.7],
  [604.9, 197.1],
  [604.9, 96.5],
  [169.8, 228.7],
  [321.7, 317.5],
  [200, 322.4],
  [228.9, 339.8],
  [478.4, 325],
  [400, 326.4],
  [590.4, 163.6],
  [555.5, 270.2],
  [480.8, 255.4],
  [465.1, 207.7],
  [367.5, 242.5],
  [367.5, 154.7],
  [618.2, 154.7],
  [756.7, 193.2],
  [627.8, 33.3],
  [779.6, 122.1],
  [657.9, 127],
  [936.3, 129.6],
  [858, 131],
  [661.5, 277.1],
  [842.3, 252],
  [795.3, 297.4],
  [624.2, 264],
  [820.6, 333.3],
  [676, 266.8],
  [629, 312.2],
  [457.9, 278.8],
  [433.8, 381.5],
  [355.4, 383],
  [413.3, 335.3],
  [654.3, 348.1],
  [439.8, 24],
  [392.8, 69.4],
  [221.7, 36],
  [418.1, 105.4],
  [313.3, 198.7],
  [266.3, 244.1],
  [95.1, 210.7],
  [291.6, 280],
  [813.4, 365.9],
  [691.7, 370.8],
  [970.1, 373.4],
  [891.7, 374.8],
];

// Field badges: drop the hubs (drawn separately, larger) and anything that
// would double up under the always-visible mesh agents.
const WORLD_AGENTS: Pt[] = W_BADGES_RAW.filter(
  (b) =>
    !HUBS.some(([hx, hy]) => Math.hypot(hx - b[0], hy - b[1]) < 2) &&
    !MESH_AGENTS.some(
      ({ p }) => Math.hypot(p[0] - b[0], p[1] - b[1]) < 16,
    ),
);

// Hub→satellite edges from the export (edges into the mesh region terminate
// under our mesh badges, which reads as intended).
const HUB_EDGES: [Pt, Pt][] = [
  [[367.7, 242.7], [321.3, 318.2]],
  [[367.7, 242.7], [399.6, 326.6]],
  [[367.7, 242.7], [413.5, 335.5]],
  [[367.7, 242.7], [478.5, 325.1]],
  [[367.7, 242.7], [433.4, 381.8]],
  [[367.7, 242.7], [355, 383.3]],
  [[367.7, 242.7], [291.2, 280.2]],
  [[367.7, 242.7], [228.5, 339.9]],
  [[367.7, 242.7], [457.5, 278.7]],
  [[367.7, 242.7], [480.4, 255.5]],
  [[367.7, 242.7], [555.7, 270.3]],
  [[367.7, 242.7], [499, 233.3]],
  [[367.7, 242.7], [548.4, 215.1]],
  [[367.7, 242.7], [199.6, 323.1]],
  [[367.7, 242.7], [266.4, 244.2]],
  [[367.7, 242.7], [108, 400.1]],
  [[367.7, 242.7], [605.1, 196.8]],
  [[367.7, 242.7], [391.8, 218.5]],
  [[367.7, 242.7], [465.3, 207.7]],
  [[367.7, 242.7], [527.4, 188.9]],
  [[628.6, 311.8], [555.1, 270.3]],
  [[628.6, 311.8], [623.8, 263.4]],
  [[628.6, 311.8], [661.7, 276.2]],
  [[628.6, 311.8], [676.2, 266.4]],
  [[628.6, 311.8], [636.4, 241.2]],
  [[628.6, 311.8], [683.4, 194.8]],
  [[628.6, 311.8], [756.3, 192.4]],
  [[628.6, 311.8], [654.5, 348.3]],
  [[628.6, 311.8], [691.9, 370.5]],
  [[628.6, 311.8], [813.6, 365.6]],
  [[628.6, 311.8], [820.2, 333]],
  [[628.6, 311.8], [795.5, 297]],
  [[628.6, 311.8], [842.5, 251.6]],
  [[628.6, 311.8], [859.4, 194.8]],
  [[628.6, 311.8], [836.5, 165.2]],
  [[628.6, 311.8], [892.5, 374.4]],
  [[628.6, 311.8], [970.2, 373]],
  [[628.6, 311.8], [915.4, 138.6]],
  [[221.3, 35.9], [249.6, 144]],
  [[221.3, 35.9], [188.7, 128.7]],
  [[221.3, 35.9], [175.5, 154.9]],
  [[221.3, 35.9], [311, 124.3]],
  [[221.3, 35.9], [283.3, 169.2]],
  [[221.3, 35.9], [265.2, 191.9]],
  [[221.3, 35.9], [170, 228.9]],
  [[221.3, 35.9], [151.4, 178.1]],
  [[440, 24.1], [221.3, 35.9]],
  [[221.3, 35.9], [94.7, 211.1]],
  [[221.3, 35.9], [333.9, 67]],
  [[221.3, 35.9], [393, 69.5]],
  [[221.3, 35.9], [389.4, 45.3]],
  [[221.3, 35.9], [467.7, 43.8]],
  [[221.3, 35.9], [389.4, 132.7]],
  [[221.3, 35.9], [374.9, 99.6]],
  [[221.3, 35.9], [420.7, 89.2]],
  [[221.3, 35.9], [418.3, 105.5]],
];

// Dotted debris trails — chains degraded to dots at this distance
// (stage-3 export: 2×2 rounded squares, #808080).
const DOTS: { x: number; y: number; o: number }[] = WORLD_AGENTS.flatMap(
  (a, i) =>
    Array.from({ length: 6 + Math.floor(frac(i * 7 + 3) * 7) }, (_, k) => ({
      x: r2(a[0] + 8 + k * 6.5 + frac(i * 13 + k) * 3),
      y: r2(a[1] + (frac(i * 17 + k) - 0.5) * 8),
      o: 0.35 + frac(i * 19 + k) * 0.45,
    })).filter((d) => d.x < 990),
);

// ---- Component -----------------------------------------------------------

export default function ReaperScaleViz({
  className = "",
  autoPlay = false,
  onInteract,
  onSequenceEnd,
}: {
  className?: string;
  /** Cycle the zoom steps every AUTO_MS while true (still hand-controllable). */
  autoPlay?: boolean;
  /** Fired on any manual zoom (slider/buttons/keys) so the parent can pause. */
  onInteract?: () => void;
  /**
   * Fired once the auto-zoom dwells on the final step. When provided, the zoom
   * stops looping and hands control back (e.g. so the parent can advance to the
   * next tab); without it, the zoom loops back to the start as before.
   */
  onSequenceEnd?: () => void;
}) {
  const id = useId().replace(/:/g, "");
  const camEl = useRef<SVGGElement>(null);
  const chainEl = useRef<SVGGElement>(null);
  const worldEl = useRef<SVGGElement>(null);

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const cam = useRef({ x: VIEWS[0].x, y: VIEWS[0].y, z: Math.log(VIEWS[0].s) });
  const reducedMotion = useRef(false);

  const applyCam = useCallback(() => {
    const { x, y, z } = cam.current;
    const s = Math.exp(z);
    camEl.current?.setAttribute("transform", camTransform(x, y, s));
  }, []);

  const go = useCallback(
    (next: number) => {
      next = Math.max(0, Math.min(VIEWS.length - 1, next));
      if (next === stepRef.current) return;
      stepRef.current = next;
      setStep(next);

      const v = VIEWS[next];
      const o = LAYERS[next];
      const instant = reducedMotion.current;

      gsap.to(cam.current, {
        x: v.x,
        y: v.y,
        z: Math.log(v.s), // log-space zoom → constant perceptual zoom rate
        duration: instant ? 0 : ZOOM_DUR,
        ease: "power2.inOut",
        overwrite: "auto",
        onUpdate: applyCam,
      });
      const fade = (el: SVGGElement | null, opacity: number) =>
        el &&
        gsap.to(el, {
          opacity,
          duration: instant ? 0 : FADE_DUR,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      fade(chainEl.current, o.chain);
      fade(worldEl.current, o.world);
    },
    [applyCam],
  );

  // Detect reduced motion once; kill in-flight tweens on unmount.
  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targets = [cam.current, chainEl.current, worldEl.current];
    return () => {
      targets.forEach((t) => t && gsap.killTweensOf(t));
    };
  }, []);

  // Auto-advance the zoom (in → mid → out). Keyed on `step`, so any manual move
  // (slider/buttons/keys, which all call `go`) restarts the 3s countdown rather
  // than fighting the user. On the final step it either signals completion (if
  // a parent wants to take over) or loops back to the start.
  useEffect(() => {
    if (!autoPlay) return;
    // Each stage holds for its own beat before the next zoom out.
    const delay = DWELL_MS[stepRef.current] ?? AUTO_MS;
    const id = setTimeout(() => {
      if (stepRef.current >= VIEWS.length - 1) {
        if (onSequenceEnd) onSequenceEnd();
        else go(0);
      } else {
        go(stepRef.current + 1);
      }
    }, delay);
    return () => clearTimeout(id);
  }, [autoPlay, step, go, onSequenceEnd]);

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    onInteract?.();
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    go(2 - Math.round(f * 2));
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label="Zooming out from a single agent's tool chain to a mesh of adversary agents, to a field of hundreds of agents"
      >
        {/* Clip to the viewBox frame: with "meet" letterboxing on wide
            screens, the SVG element is wider than the viewBox, so without
            this, world content outside 0..W would paint into the side margins
            (neighbouring agents peeking past the zoomed-in frame). */}
        <defs>
          <clipPath id={`${id}-frame`}>
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-frame)`}>
          <g
            ref={camEl}
            transform={camTransform(VIEWS[0].x, VIEWS[0].y, VIEWS[0].s)}
          >
          {/* World field — only at the widest zoom. */}
          <g ref={worldEl} style={{ opacity: LAYERS[0].world }}>
            {/* Hub edges: #1A1A1A per the stage-3 export — subtle dark
                shading against the canvas, not white. */}
            {HUB_EDGES.map(([a, b], i) => (
              <line
                key={`he-${i}`}
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                stroke="#1A1A1A"
                strokeWidth={0.8}
              />
            ))}
            {DOTS.map((d, i) => (
              <rect
                key={`d-${i}`}
                x={d.x - 0.9}
                y={d.y - 0.9}
                width={1.8}
                height={1.8}
                rx={0.25}
                fill="#808080"
                opacity={d.o.toFixed(2)}
              />
            ))}
            {WORLD_AGENTS.map(([x, y], i) => (
              <AgentBadge key={`wa-${i}`} x={x} y={y} r={7} />
            ))}
            {HUBS.map(([x, y], i) => (
              <AgentBadge key={`h-${i}`} x={x} y={y} r={8.5} />
            ))}
          </g>

          {/* Tool chains + object nodes — fade out at the widest zoom where
              they degrade into the dotted trails of the world layer. */}
          <g ref={chainEl} style={{ opacity: LAYERS[0].chain }}>
            {CHAINS.map((c, i) => (
              <g key={`c-${i}`}>
                {c.paths.map((pts, j) => (
                  <path
                    key={j}
                    d={wiggle(pts)}
                    fill="none"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={0.45}
                  />
                ))}
                {c.squares.map(([x, y], j) => (
                  <rect
                    key={`s-${j}`}
                    x={x - 2.6}
                    y={y - 2.6}
                    width={5.2}
                    height={5.2}
                    rx={1.2}
                    fill="#8a8a8a"
                  />
                ))}
                {c.circles.map(([x, y], j) => (
                  <SubNode key={`o-${j}`} x={x} y={y} r={i === 0 ? 3.4 : 2.4} />
                ))}
              </g>
            ))}
            {FREE_CIRCLES.map(([x, y], i) => (
              <SubNode key={`f-${i}`} x={x} y={y} r={2.4} />
            ))}
          </g>

          {/* The 5 mesh agents — present at every zoom level. */}
          <g>
            {MESH_AGENTS.map(({ p, r }, i) => (
              <AgentBadge key={`ma-${i}`} x={p[0]} y={p[1]} r={r} />
            ))}
          </g>
          </g>
        </g>
      </svg>

      {/* Zoom slider (storyboard's bottom control): 3 detents, right = in. */}
      <div className="absolute bottom-[1.2em] left-1/2 flex -translate-x-1/2 items-center gap-[0.9em] rounded-[0.3em] border border-[#808080]/70 bg-[#1a1a1a] px-[1.1em] py-[0.7em]">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => {
            onInteract?.();
            go(stepRef.current + 1);
          }}
          className="cursor-pointer text-light/80 transition-colors hover:text-light"
        >
          <ZoomOut className="h-[1em] w-[1em]" />
        </button>
        <div
          role="slider"
          aria-label="Zoom level"
          aria-valuemin={0}
          aria-valuemax={2}
          aria-valuenow={2 - step}
          tabIndex={0}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            seek(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) seek(e);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "ArrowLeft" ||
              e.key === "ArrowDown" ||
              e.key === "ArrowRight" ||
              e.key === "ArrowUp"
            )
              onInteract?.();
            if (e.key === "ArrowLeft" || e.key === "ArrowDown")
              go(stepRef.current + 1);
            if (e.key === "ArrowRight" || e.key === "ArrowUp")
              go(stepRef.current - 1);
          }}
          className="relative flex h-[1.4em] w-[9em] cursor-pointer touch-none items-center"
        >
          <div className="h-[3px] w-full rounded-full bg-light/80" />
          <div
            className="absolute top-1/2 h-[0.8em] w-[0.8em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-light transition-[left] duration-[1150ms] ease-[cubic-bezier(0.45,0,0.25,1)]"
            style={{ left: `${((2 - step) / 2) * 100}%` }}
          />
        </div>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => {
            onInteract?.();
            go(stepRef.current - 1);
          }}
          className="cursor-pointer text-light/80 transition-colors hover:text-light"
        >
          <ZoomIn className="h-[1em] w-[1em]" />
        </button>
      </div>
    </div>
  );
}
