"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { runWhileVisible } from "@/lib/animations/runWhileVisible";

/**
 * Reaper "A home for your operators' toolkit" — Context tab visualization
 * (Figma storyboard 2270:705).
 *
 * The same faint honeycomb as the Infrastructure tab, but here a bright white
 * line *draws* along the hexagons' edges — the exact path the designers drew.
 * As the line's head reaches a flagged intersection a node lights up (a filled
 * white disc with a check) and a monospace "context" label types in beside it:
 * the operator's autonomy, adversary TTPs, intelligence and infrastructure.
 * After the line lands at the bottom centre it pours into a glowing beam —
 * context feeding the platform — then dissolves and loops.
 *
 * Geometry is lifted verbatim from the Figma vectors (flat-top hexagons, edge
 * length 41.04) so the line traces real comb edges. Auto-plays while mounted.
 */

// ---- Designed line segments (exact Figma vector paths + frame offsets) --
// Each entry is one Figma <vector>; `d` is its local path, (ox,oy) its top-left
// in the frame. Ordered so the draw flows top → left → centre → right → down.
const LINE_SEGMENTS: { ox: number; oy: number; d: string }[] = [
  {
    ox: 138.506,
    oy: 20.48,
    d: "M61.8555 71.6659H20.812 M0.289507 35.958L20.8113 71.5027 M61.8539 0.25L20.8104 0.25L0.288675 35.7947L20.8104 71.3394H61.8539",
  },
  {
    ox: 15.433,
    oy: 91.773,
    d: "M82.3756 35.834L61.8539 0.289288H20.8104L0.288675 35.834L20.8104 71.3787H61.8539 M61.8519 71.7043H20.8085 M143.942 0.125004L123.42 35.6697H82.3768L61.8551 0.125",
  },
  {
    ox: 15.431,
    oy: 127.646,
    d: "M123.42 0.250001L82.3768 0.25L61.8551 35.7947 M143.942 35.7947L123.42 71.3394H82.3768 M184.987 35.957H143.943L123.421 71.5017 M123.424 71.665H82.3807L61.859 107.21L82.3807 142.754 M61.8539 35.957H20.8104L0.288675 71.5017L20.8104 107.046H61.8539L82.3756 71.5017",
  },
  {
    ox: 200.128,
    oy: 56.23,
    d: "M61.8539 71.54H20.8104L0.288675 107.085L20.8104 142.629L61.8539 142.629 M123.42 178.336L82.3768 178.336L61.8551 142.792 M61.8558 0.125L82.3776 35.6697L61.8559 71.2144H20.8124 M61.8551 71.3777L82.3768 35.833",
  },
  {
    ox: 220.65,
    oy: 91.938,
    d: "M9.29428e-08 178.462L41.0435 178.462L61.5652 142.918L41.0435 107.373H7.72234e-06 M102.61 71.6641H61.5664L41.0447 107.209L61.5664 142.753L102.61 142.753 M61.5664 71.3394H102.61L123.132 35.7947L102.61 0.250001L61.5664 0.25L41.0447 35.7947",
  },
];

// ---- Context nodes (frame coords; sit exactly on line vertices) ---------
interface NodeDef {
  x: number;
  y: number;
  lines?: string[]; // omitted = plain marker
}
const NODES: NodeDef[] = [
  { x: 200.17, y: 91.37, lines: ["AUTONOMOUS: AGENTS FULL (M)"] }, // 0
  { x: 261.34, y: 55.73 }, // 1 top-right
  { x: 76.34, y: 162.73, lines: ["ADVERSARY TTPS: CUSTOM TTPS", "(TEAM-PCP_TTPS-26.JSON) (M)"] }, // 2
  { x: 200.18, y: 162.73, lines: ["INTELLIGENCE: CUSTOM TI", "(SCATTERED-SPIDER_INTEL.PDF) (M)"] }, // 3
  { x: 97.34, y: 269.73, lines: ["INFRASTRUCTURE: CUSTOM C2", "(C2SERVER319) (M)"] }, // 4
  { x: 323.34, y: 233.73 }, // 5 right
  { x: 220.34, y: 270.73 }, // 6 centre-lower (beam origin)
];

// Order the head visits the nodes — the designer's storyboard sequence, taken
// from the order each node's label is introduced across the five frames:
// autonomy → adversary TTPs → intelligence → infrastructure → the two plain
// markers → the centre-lower node, where the beam finally pours down.
const VISIT_ORDER = [0, 2, 3, 4, 1, 5, 6];

// ---- Beam (exact Figma geometry), drops straight down from the centre node.
// Coords are already in frame space — a vertical column with two inner streaks,
// fading top → bottom.
const BEAM = {
  fill:
    "M200.13 234.768L220.65 270.313L220.65 456.072L200.13 456.072L159.09 456.072L138.56 456.072L138.56 270.313L159.09 234.768L200.13 234.768Z",
  stroke:
    "M159.09 234.768L200.13 234.768L220.65 270.313L220.65 456.072L138.56 456.072L138.56 270.313L159.09 234.768ZM200.13 234.768L200.13 456.072M159.09 234.768L159.09 456.072",
};

// ---- Honeycomb (flat-top, reconstructed on the line's own lattice) ------
const R = 41.04; // edge length === centre→vertex, lifted from the vectors
const RR = R * 0.97; // drawn radius (the comb cells touch, like the design)
const BASE = { x: 179.84, y: 56.27 }; // a hex centre derived from segment 1
const HEX_POINTS = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 180) * 60 * k;
  return `${(RR * Math.cos(a)).toFixed(2)},${(RR * Math.sin(a)).toFixed(2)}`;
}).join(" ");
const COMB_CELLS: { cx: number; cy: number }[] = (() => {
  const out: { cx: number; cy: number }[] = [];
  for (let q = -3; q <= 3; q++) {
    for (let r = -2; r <= 4; r++) {
      const cx = BASE.x + 1.5 * R * q;
      const cy = BASE.y + Math.sqrt(3) * R * r + (Math.sqrt(3) / 2) * R * q;
      if (cx < -40 || cx > 410 || cy < -30 || cy > 360) continue;
      out.push({ cx, cy });
    }
  }
  return out;
})();

// ---- Viewport ------------------------------------------------------------
const VB = { x: 0, y: -6, w: 396, h: 460 };
const CHECK_D =
  "M6.38972 3.19221C6.50717 3.26901 6.54015 3.42648 6.46335 3.54393L4.73552 6.18649C4.6948 6.24877 4.62883 6.29004 4.55503 6.29947C4.48122 6.3089 4.40699 6.28548 4.35193 6.23544L3.23393 5.21908C3.1301 5.12468 3.12244 4.96398 3.21684 4.86014C3.31124 4.75631 3.47194 4.74865 3.57577 4.84305L4.47327 5.65896L6.03802 3.26583C6.11482 3.14838 6.27227 3.11542 6.38972 3.19221Z";
const ICON = 9.655; // checkmark disc diameter
const MONO = "var(--font-rom-mono, ui-monospace, 'SFMono-Regular', monospace)";

// ---- Minimal absolute-path parser (M / L / H / V) -----------------------
function parsePath(d: string, ox: number, oy: number): [number, number][][] {
  const toks = d.match(/[MLHVZ]|-?[0-9.]+(?:e-?[0-9]+)?/gi) ?? [];
  const subs: [number, number][][] = [];
  let cur: [number, number][] = [];
  let cmd = "";
  let x = 0;
  let y = 0;
  let i = 0;
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    const t = toks[i];
    if (/[MLHVZ]/i.test(t)) {
      cmd = t;
      i++;
      if (cmd === "M") {
        if (cur.length) subs.push(cur);
        cur = [];
        x = num();
        y = num();
        cur.push([x + ox, y + oy]);
      }
      continue;
    }
    if (cmd === "L" || cmd === "M") {
      x = num();
      y = num();
    } else if (cmd === "H") {
      x = num();
    } else if (cmd === "V") {
      y = num();
    } else {
      i++;
      continue;
    }
    cur.push([x + ox, y + oy]);
  }
  if (cur.length) subs.push(cur);
  return subs;
}

export default function ReaperToolkitContextViz({
  mode = "loop",
}: {
  /** "loop" plays the tracing animation; "endState" renders the finished frame
   *  (used by the Results tab, which shows this visual settled). */
  mode?: "loop" | "endState";
}) {
  const rootRef = useRef<SVGSVGElement>(null);

  // Build a graph from the designed edges, then walk the head node-to-node
  // along real comb edges (shortest path per leg). `lineD` is the resulting
  // single continuous route; `stops` marks where each visited node sits along
  // it (as a fraction of the total length) so the draw can pause there.
  const { lineD, stops } = useMemo(() => {
    const EPS = 5; // merge vertices closer than this (min edge length is ~41)
    const verts: { x: number; y: number }[] = [];
    const adj: Set<number>[] = [];
    const findOrAdd = (x: number, y: number) => {
      for (let k = 0; k < verts.length; k++) {
        if (Math.hypot(verts[k].x - x, verts[k].y - y) < EPS) return k;
      }
      verts.push({ x, y });
      adj.push(new Set());
      return verts.length - 1;
    };

    for (const seg of LINE_SEGMENTS) {
      for (const sub of parsePath(seg.d, seg.ox, seg.oy)) {
        let prev = -1;
        for (const [x, y] of sub) {
          const id = findOrAdd(x, y);
          if (prev !== -1 && prev !== id) {
            adj[prev].add(id);
            adj[id].add(prev);
          }
          prev = id;
        }
      }
    }

    const nearestVert = (x: number, y: number) => {
      let best = Infinity;
      let bi = 0;
      for (let k = 0; k < verts.length; k++) {
        const d = Math.hypot(verts[k].x - x, verts[k].y - y);
        if (d < best) {
          best = d;
          bi = k;
        }
      }
      return bi;
    };
    const nodeVert = NODES.map((n) => nearestVert(n.x, n.y));

    const bfs = (a: number, b: number): number[] | null => {
      if (a === b) return [a];
      const prev = new Array(verts.length).fill(-1);
      const seen = new Array(verts.length).fill(false);
      const q = [a];
      seen[a] = true;
      while (q.length) {
        const u = q.shift()!;
        if (u === b) break;
        for (const v of adj[u]) {
          if (!seen[v]) {
            seen[v] = true;
            prev[v] = u;
            q.push(v);
          }
        }
      }
      if (!seen[b]) return null;
      const path: number[] = [];
      let c = b;
      while (c !== -1) {
        path.push(c);
        c = prev[c];
      }
      return path.reverse();
    };

    // Walk the visit order, stitching each leg's shortest path into one route.
    const routePts: { x: number; y: number }[] = [verts[nodeVert[VISIT_ORDER[0]]]];
    const stopInfo: { nodeIdx: number; ptIndex: number }[] = [
      { nodeIdx: VISIT_ORDER[0], ptIndex: 0 },
    ];
    for (let s = 1; s < VISIT_ORDER.length; s++) {
      const from = nodeVert[VISIT_ORDER[s - 1]];
      const to = nodeVert[VISIT_ORDER[s]];
      const vp = bfs(from, to);
      if (vp && vp.length > 1) {
        for (let k = 1; k < vp.length; k++) routePts.push(verts[vp[k]]);
      } else {
        routePts.push(verts[to]); // fallback: straight hop if disconnected
      }
      stopInfo.push({ nodeIdx: VISIT_ORDER[s], ptIndex: routePts.length - 1 });
    }

    // Cumulative length along the route → fraction per stop.
    const cum = [0];
    for (let i = 1; i < routePts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(routePts[i].x - routePts[i - 1].x, routePts[i].y - routePts[i - 1].y));
    }
    const total = cum[cum.length - 1] || 1;

    const d = "M" + routePts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join("L");
    const stopsOut = stopInfo.map((s) => ({ nodeIdx: s.nodeIdx, frac: cum[s.ptIndex] / total }));

    return { lineD: d, stops: stopsOut };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const line = root.querySelector<SVGPathElement>("[data-line]")!;
    const beam = root.querySelector<SVGGElement>("[data-beam]")!;
    const nodeEls = gsap.utils.toArray<SVGGElement>("[data-node]");
    const len = line.getTotalLength();
    const icon = (i: number) => nodeEls[i].querySelector("[data-icon]")!;
    const labels = (i: number) =>
      Array.from(nodeEls[i].querySelectorAll<SVGTSpanElement>("[data-label]"));

    if (mode === "endState" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: 0, opacity: 1 });
      nodeEls.forEach((_, i) => gsap.set(icon(i), { scale: 1 }));
      gsap.set(beam, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const SPEED = 150; // px/sec the head travels along the line
      const HOLD = 2.2; // seconds the finished frame holds before dissolving
      const o = { len: 0 }; // draw head position along the path

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, paused: true });

      // Reset to the start-of-loop state.
      tl.set(o, { len: 0 }, 0);
      // Keep the line invisible while fully retracted — a round line-cap renders
      // a stray dot at the path ends otherwise. It's revealed once it sets off.
      tl.set(line, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 }, 0);
      tl.set(beam, { opacity: 0 }, 0);
      nodeEls.forEach((_, i) => {
        tl.set(icon(i), { scale: 0, opacity: 1, transformOrigin: "center" }, 0);
        labels(i).forEach((t) => {
          tl.set(t, { opacity: 0 }, 0);
          tl.set(t, { textContent: "" }, 0);
        });
      });

      const addType = (el: Element, str: string, at: number, dur: number) =>
        tl.to(
          { n: 0 },
          {
            n: str.length,
            duration: dur,
            ease: "none",
            onUpdate() {
              el.textContent = str.slice(0, Math.ceil((this.targets()[0] as { n: number }).n));
            },
          },
          at,
        );

      // Pop the node's icon, reveal its label, hold, then clear it. Returns the
      // timeline position once the node is "done" (so the head can move on).
      const visitNode = (nodeIdx: number, at: number) => {
        const def = NODES[nodeIdx];
        tl.to(icon(nodeIdx), { scale: 1, duration: 0.32, ease: "back.out(2)" }, at);
        let t = at + 0.32;
        if (def.lines) {
          const ls = labels(nodeIdx);
          ls.forEach((el, li) => {
            const lt = t + li * 0.22;
            tl.to(el, { opacity: 1, duration: 0.01 }, lt);
            addType(el, def.lines![li], lt, 0.3);
          });
          t += 0.3 + (ls.length - 1) * 0.22 + 1.0; // typing + read hold
          tl.to(ls, { opacity: 0, duration: 0.3, ease: "power1.in" }, t);
          tl.call(() => ls.forEach((el) => (el.textContent = "")), undefined, t + 0.3);
          t += 0.3;
        } else {
          t += 0.3; // brief beat on a plain marker
        }
        return t;
      };

      // Walk the head from node to node along the route.
      let t = visitNode(stops[0].nodeIdx, 0);
      tl.set(line, { opacity: 1 }, t); // reveal as the head sets off on leg 1
      for (let s = 1; s < stops.length; s++) {
        const fromLen = stops[s - 1].frac * len;
        const toLen = stops[s].frac * len;
        const dur = Math.min(1.4, Math.max(0.45, (toLen - fromLen) / SPEED));
        tl.to(
          o,
          {
            len: toLen,
            duration: dur,
            ease: "power1.inOut",
            onUpdate: () => {
              gsap.set(line, { strokeDashoffset: len - o.len });
            },
          },
          t,
        );
        t += dur;
        t = visitNode(stops[s].nodeIdx, t);
      }

      // Beam pours down from the final (centre-lower) node.
      tl.to(beam, { opacity: 1, duration: 0.7, ease: "power2.out" }, t);
      t += 0.7 + HOLD;

      // Dissolve and loop.
      tl.to([line, ...nodeEls.map((_, i) => icon(i)), beam], { opacity: 0, duration: 0.7, ease: "power1.in" }, t);

      // Only run the loop while the viz is on screen.
      return runWhileVisible(root, { timelines: [tl] });
    }, root);

    return () => ctx.revert();
  }, [lineD, stops, mode]);

  return (
    <svg
      ref={rootRef}
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      className="h-full w-full overflow-visible"
      role="img"
      aria-label="Reaper context honeycomb: a line tracing the comb, lighting up the operator's autonomy, adversary TTPs, intelligence and infrastructure context before pouring into the platform"
    >
      <defs>
        <linearGradient id="reaper-ctx-beam-fill" x1="184.32" y1="234.73" x2="184.32" y2="363.91" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="reaper-ctx-beam-stroke" x1="184.32" y1="232.37" x2="184.32" y2="460.01" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Faint honeycomb. */}
      {COMB_CELLS.map((c, i) => (
        <polygon
          key={i}
          transform={`translate(${c.cx.toFixed(2)},${c.cy.toFixed(2)})`}
          points={HEX_POINTS}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1}
        />
      ))}

      {/* Beam: the line pouring down into the platform. */}
      <g data-beam style={{ opacity: 0 }}>
        <path d={BEAM.fill} fill="url(#reaper-ctx-beam-fill)" />
        <path
          d={BEAM.stroke}
          fill="none"
          stroke="url(#reaper-ctx-beam-stroke)"
          strokeOpacity={0.5}
          strokeWidth={0.6}
        />
      </g>

      {/* The bright tracing line — exact designed geometry. */}
      <path
        data-line
        d={lineD}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 2.5px rgba(255,255,255,0.55))" }}
      />

      {/* Context nodes. */}
      {NODES.map((def, i) => (
        <g key={i} data-node>
          <g data-icon transform={`translate(${def.x - ICON / 2},${def.y - ICON / 2})`}>
            <rect width={ICON} height={ICON} rx={ICON / 2} fill="#ffffff" />
            <path d={CHECK_D} fill="#0b0b0b" />
          </g>
          {def.lines && (
            <text
              x={def.x + 9}
              y={def.y + (def.lines.length > 1 ? -1 : 3)}
              style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.09em", fill: "rgba(255,255,255,0.92)" }}
            >
              {def.lines.map((ln, li) => (
                <tspan key={li} data-label data-full={ln} x={def.x + 9} dy={li === 0 ? 0 : 11} style={{ opacity: 0 }} />
              ))}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
