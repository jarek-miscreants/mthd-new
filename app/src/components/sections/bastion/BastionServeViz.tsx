"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Bastion "Serve targets for defense and offense" — hand-off visualization
 * (Figma 483:40815).
 *
 * A sphere of nodes, each tethered to the centre by a thin connector, rotating
 * slowly in 3D. The node field is a <canvas> (per-frame projection is cheap and
 * stays off the DOM); the DEFENSE / OFFENSE badges below are an SVG overlay that
 * reuses the Reaper chevron-bracket geometry.
 *
 * Sequence (looping): nodes drift → a few flash red (targets surfaced) → the
 * DEFENSE badge's brackets snap-lock and glow green, then nodes hand off green →
 * the OFFENSE badge's brackets snap-lock and glow red, then nodes hand off red →
 * everything settles back and the loop repeats. One GSAP timeline drives both
 * the canvas node colours and the SVG badges so they stay in lockstep.
 */

// ---- Node sphere (deterministic Fibonacci distribution) -----------------
const NODE_COUNT = 22;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

interface Node {
  x: number;
  y: number;
  z: number;
}

const NODES: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => {
  const y = 1 - (i / (NODE_COUNT - 1)) * 2; // 1 → -1
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN * i;
  return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
});

// ---- Colours ------------------------------------------------------------
const BASE: [number, number, number] = [205, 205, 205];
const RED: [number, number, number] = [229, 72, 77];
const GREEN: [number, number, number] = [37, 214, 162];
const RED_HEX = "#e5484d";
const GREEN_HEX = "#25d6a2";
const DIM_STROKE = "#5c5c5c";
const DIM_LABEL = "rgba(255,255,255,0.5)";

const TILT = 0.38; // fixed X-axis tilt → 3/4 view
const CT = Math.cos(TILT);
const ST = Math.sin(TILT);
const FOCAL = 3.2; // perspective depth
const SPIN = 0.00022; // rad per ms (~full turn / 28s)

// Depth (0 back → 1 front) of a node at the current spin angle. Used both by
// the renderer and by the highlight picker (so lit nodes are biased forward).
function depthAt(n: Node, ca: number, sa: number) {
  const rz = -n.x * sa + n.z * ca;
  const rzz = n.y * ST + rz * CT;
  return (rzz + 1) / 2;
}

// ---- Bracket badge geometry (shared with the Reaper toolkit viz) --------
const FIG_CENTER_X = 69.5997;
const FIG_CENTER_Y = 39.3952;
const FIG_HEX_W = 110.643 - 28.5564;
const RR = 52.8;
const BRK_SCALE = (2 * RR) / FIG_HEX_W;
const BRK_NORMALIZE = `scale(${BRK_SCALE}) translate(${-FIG_CENTER_X} ${-FIG_CENTER_Y})`;
const FRAME_HALF_W = (137.907 - FIG_CENTER_X) * BRK_SCALE;
const FRAME_NARROW_X = RR / FRAME_HALF_W; // ≈ 0.6 lock-on width

const BRK_HEX_D =
  "M90.121 3.85064L110.643 39.395L90.121 74.9393L49.0779 74.9393L28.5564 39.395L49.0779 3.85064L90.121 3.85064Z";
const BRK_FRAME_D =
  "M113.658 0.5C115.801 0.5 117.782 1.644 118.854 3.5L137.907 36.5C138.979 38.356 138.979 40.644 137.907 42.5L118.854 75.5C117.782 77.356 115.802 78.5 113.658 78.5M25.553 0.5C23.409 0.5 21.429 1.644 20.357 3.5L1.304 36.5C0.232 38.356 0.232 40.644 1.304 42.5L20.357 75.5C21.429 77.356 23.41 78.5 25.553 78.5";

// SVG <text> font — var() resolves in CSS/DOM here (unlike canvas), so just
// reference the correct next/font token.
const MONO = "var(--font-rom-mono, ui-monospace, 'SFMono-Regular', monospace)";

// One badge: dim hex + chevron frame + label, centred on the local origin.
// `labelDx` nudges the label off-centre so it spills across the hex edge for a
// glitchy, misaligned feel.
function Badge({
  id,
  label,
  cx,
  labelDx = 0,
}: {
  id: string;
  label: string;
  cx: number;
  labelDx?: number;
}) {
  return (
    <g transform={`translate(${cx} 60)`}>
      <g transform={BRK_NORMALIZE}>
        <path
          data-badge-hex={id}
          d={BRK_HEX_D}
          fill="none"
          stroke={DIM_STROKE}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </g>
      <g data-badge-frame={id}>
        <g transform={BRK_NORMALIZE}>
          <path
            data-badge-bracket={id}
            d={BRK_FRAME_D}
            fill="none"
            stroke={DIM_STROKE}
            strokeWidth={1.5}
            strokeMiterlimit={10}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </g>
      <text
        data-badge-label={id}
        x={labelDx}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: MONO,
          fontSize: 17,
          letterSpacing: "0.12em",
          fill: DIM_LABEL,
        }}
      >
        {label}
      </text>
    </g>
  );
}

export default function BastionServeViz() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!root || !canvas || !svg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Per-node runtime colour (tweened by the timeline, read by the renderer).
    const cols = NODES.map(() => ({
      r: BASE[0],
      g: BASE[1],
      b: BASE[2],
      glow: 0,
    }));

    // ---- Canvas sizing (HiDPI) -----------------------------------------
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Clamp to a sane ceiling. A canvas element carries an intrinsic size
      // from its width/height attributes; as a flex child that size can feed
      // back into layout and, combined with a ResizeObserver that writes it,
      // spiral (a 60,000px canvas that exceeds the browser max and paints
      // blank). The layout below gives this viz a definite height so it can't
      // happen, but this bound is cheap insurance against any future regressor.
      w = Math.min(rect.width, 2000);
      h = Math.min(rect.height, 2000);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    // Setting canvas.width in resize() wipes the buffer; the ticker repaints
    // on the next frame while in view. This viz intentionally ignores
    // prefers-reduced-motion (the hand-off animation is the whole point of the
    // section), so there is no static path to protect here.
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.46;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);

      const proj = NODES.map((n, i) => {
        // rotate Y, then tilt X
        const rx = n.x * ca + n.z * sa;
        const rz = -n.x * sa + n.z * ca;
        const ry = n.y * CT - rz * ST;
        const rzz = n.y * ST + rz * CT;
        const scale = FOCAL / (FOCAL - rzz);
        const depth = (rzz + 1) / 2; // 0 back → 1 front
        return {
          i,
          sx: cx + rx * scale * radius,
          sy: cy + ry * scale * radius,
          depth,
          size: 1.4 + depth * 2.4,
        };
      });

      // Connectors first (under the nodes).
      for (const p of proj) {
        const a = 0.06 + p.depth * 0.32;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.sx, p.sy);
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // Central hub.
      ctx.beginPath();
      ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();

      // Nodes back-to-front so near ones overlap far ones; highlighted nodes
      // sort last so they always sit on top, and get a size/brightness boost so
      // a lit node never reads as a tiny background speck.
      const order = [...proj].sort(
        (a, b) =>
          (cols[a.i].glow > 0 ? 1 : 0) - (cols[b.i].glow > 0 ? 1 : 0) ||
          a.depth - b.depth,
      );
      for (const p of order) {
        const c = cols[p.i];
        const hl = c.glow; // 0 → 1
        const size = p.size + hl * 2.4;
        const a = Math.min(1, 0.4 + p.depth * 0.6 + hl * 0.5);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${a})`;
        if (hl > 0) {
          ctx.shadowBlur = 12 * hl;
          ctx.shadowColor = `rgba(${c.r | 0},${c.g | 0},${c.b | 0},0.9)`;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    // Self-heal the backing store: a GPU context loss (integrated GPUs,
    // display/resolution changes, driver resets — screen/machine dependent and
    // intermittent) blanks the canvas bitmap. Re-render on restore / tab
    // re-show. resize() re-applies the DPR transform a restored context drops.
    const heal = () => {
      resize();
      render();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") heal();
    };
    const onContextLost = (e: Event) => e.preventDefault(); // enable restore
    canvas.addEventListener("contextlost", onContextLost);
    canvas.addEventListener("contextrestored", heal);
    document.addEventListener("visibilitychange", onVisible);
    const detachHeal = () => {
      canvas.removeEventListener("contextlost", onContextLost);
      canvas.removeEventListener("contextrestored", heal);
      document.removeEventListener("visibilitychange", onVisible);
    };

    // ---- Hand-off timeline (drives canvas colours + SVG badges) --------
    const gctx = gsap.context(() => {
      const el = (sel: string) => svg.querySelector(sel) as SVGElement | null;
      const defHex = el("[data-badge-hex='def']");
      const defBr = el("[data-badge-bracket='def']");
      const defFrame = el("[data-badge-frame='def']");
      const defLbl = el("[data-badge-label='def']");
      const offHex = el("[data-badge-hex='off']");
      const offBr = el("[data-badge-bracket='off']");
      const offFrame = el("[data-badge-frame='off']");
      const offLbl = el("[data-badge-label='off']");

      [defFrame, offFrame].forEach((f) =>
        gsap.set(f, { transformOrigin: "center", scaleX: 1 }),
      );

      // Front-biased highlight: at fire time, pick the N frontmost nodes that
      // haven't already been used this loop, so lit nodes sit near the front
      // plane rather than as tiny specks at the back. `used` resets each loop.
      const used = new Set<number>();
      const pickFront = (count: number) => {
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const chosen = NODES.map((n, i) => ({ i, d: depthAt(n, ca, sa) }))
          .filter((o) => !used.has(o.i))
          .sort((a, b) => b.d - a.d)
          .slice(0, count)
          .map((o) => o.i);
        chosen.forEach((i) => used.add(i));
        return chosen;
      };

      // Because selection depends on the live spin angle, the tween is created
      // at fire time inside a tl.call (not baked into the timeline up front).
      const lightFront = (
        count: number,
        rgb: [number, number, number],
        store: number[],
        at: number,
      ) =>
        tl.call(
          () => {
            store.length = 0;
            store.push(...pickFront(count));
            gsap.to(
              store.map((i) => cols[i]),
              {
                r: rgb[0],
                g: rgb[1],
                b: rgb[2],
                glow: 1,
                duration: 0.5,
                stagger: 0.14,
                overwrite: "auto",
              },
            );
          },
          undefined,
          at,
        );

      const clearFront = (store: number[], at: number) =>
        tl.call(
          () => {
            if (!store.length) return;
            gsap.to(
              store.map((i) => cols[i]),
              { r: BASE[0], g: BASE[1], b: BASE[2], glow: 0, duration: 0.5, overwrite: "auto" },
            );
          },
          undefined,
          at,
        );

      const redStore: number[] = [];
      const defStore: number[] = [];
      const offStore: number[] = [];

      // Dim a badge back to its resting state.
      const dimBadge = (
        hex: SVGElement | null,
        br: SVGElement | null,
        lbl: SVGElement | null,
        at: number,
      ) => {
        tl.to([hex, br], { stroke: DIM_STROKE, duration: 0.45 }, at);
        tl.to(lbl, { fill: DIM_LABEL, duration: 0.45 }, at);
      };

      // Badge highlight: chevron lock-on (snap narrow → spring wide) + colour.
      const lightBadge = (
        hex: SVGElement | null,
        br: SVGElement | null,
        frame: SVGElement | null,
        lbl: SVGElement | null,
        color: string,
        at: number,
      ) => {
        tl.to(frame, { scaleX: FRAME_NARROW_X, duration: 0.16, ease: "power2.in" }, at);
        tl.to(frame, { scaleX: 1, duration: 0.28, ease: "back.out(1.8)" }, at + 0.16);
        tl.to([hex, br], { stroke: color, duration: 0.3 }, at);
        tl.to(lbl, { fill: "rgba(255,255,255,0.95)", duration: 0.3 }, at + 0.1);
      };

      // Starts paused — the IntersectionObserver below only runs the timeline
      // and the canvas render loop while the viz is actually on screen.
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true });

      // Reset to the resting state at the top of every loop.
      tl.set(cols, { r: BASE[0], g: BASE[1], b: BASE[2], glow: 0 }, 0);
      tl.set([defHex, defBr, offHex, offBr], { stroke: DIM_STROKE }, 0);
      tl.set([defLbl, offLbl], { fill: DIM_LABEL }, 0);
      tl.call(() => used.clear(), undefined, 0);

      // Each phase fully clears (nodes faded back + badge dim) before the next
      // begins, with a comfortable gap — so a lingering green dot can never be
      // on screen while the OFFENSE side is lit, and vice versa.

      // 1 — targets surface (red flash), then settle.
      lightFront(3, RED, redStore, 0.4);
      clearFront(redStore, 1.6); // red-free by ~2.1

      // 2 — DEFENSE: brackets lock on, glow green, nodes hand off green —
      //     then fully settle back before offense gets its turn.
      lightBadge(defHex, defBr, defFrame, defLbl, GREEN_HEX, 2.6);
      lightFront(2, GREEN, defStore, 2.9);
      dimBadge(defHex, defBr, defLbl, 4.3);
      clearFront(defStore, 4.3); // green fully gone by ~4.8

      // 3 — OFFENSE: brackets lock on, glow red, nodes hand off red. Starts a
      //     clear beat after the green has cleared, so the two never coexist.
      lightBadge(offHex, offBr, offFrame, offLbl, RED_HEX, 5.4);
      lightFront(2, RED, offStore, 5.7);
      dimBadge(offHex, offBr, offLbl, 7.1);
      clearFront(offStore, 7.1);

      function tickRender() {
        angle += gsap.ticker.deltaRatio(60) * (1000 / 60) * SPIN;
        render();
      }

      // Only spin + run the hand-off while the section is in view. Pausing the
      // timeline and dropping out of the shared gsap.ticker means an off-screen
      // viz costs nothing — important with several animations on the page.
      let running = false;
      const start = () => {
        if (running) return;
        running = true;
        gsap.ticker.add(tickRender);
        tl.play();
      };
      const stop = () => {
        if (!running) return;
        running = false;
        gsap.ticker.remove(tickRender);
        tl.pause();
      };
      const io = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0 },
      );
      io.observe(root);

      // gsap.context runs this on revert — ticker + observer aren't GSAP tweens,
      // so they must be torn down explicitly (the previous code leaked tickRender).
      return () => {
        io.disconnect();
        gsap.ticker.remove(tickRender);
      };
    }, root);

    return () => {
      detachHeal();
      ro.disconnect();
      gctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="A sphere of validated targets handed off to defense and offense teams"
      className="relative flex w-full flex-col items-center gap-[1.5em] py-[1.5em]"
    >
      {/* Definite canvas height (not flex-1) so it can't grow the grid row and
          spiral. The viz is content-height and bottom-aligned to the text
          column (see BastionServe), so the sphere sits just above the
          DEFENSE/OFFENSE badges. */}
      <canvas ref={canvasRef} className="w-full h-[20em]" />
      <svg
        ref={svgRef}
        viewBox="0 0 380 120"
        className="w-full max-w-[22em] shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <Badge id="def" label="DEFENSE" cx={95} />
        <Badge id="off" label="OFFENSE" cx={285} />
      </svg>
    </div>
  );
}
