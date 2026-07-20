"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { getMonoFontFamily } from "@/lib/canvasMono";

/**
 * Bastion "Create a continuous, attacker-minded inventory" — digital-twin viz
 * (Figma storyboard 885:4029; stage 1 = frame 885:191).
 *
 * An operator query card (left) fans connectors rightward, through two thin
 * orbital rings, to a large dotted half-lit planet — the digital twin of the
 * estate. All-canvas so the card, connectors, rings and planet share one
 * coordinate space; drawn in Figma design space (1568×546) and fit to the
 * canvas. Gated to run only while visible.
 *
 * Ambient, no interaction: an internal timer auto-cycles the three stages
 * (Reaper-style) — 1) FOUND host, 2) DENIED/SCAN probes, 3) ALLOWED +
 * EXPLOITABILITY CONFIRMED — crossfading the action overlays at each seam
 * while the planet / rings / query card persist. The card's active row and
 * source dot track the current stage.
 */

// ---- Figma design space (1568×546) -------------------------------------
// The Figma frame has wide empty margins; fit this tight content viewport
// (card + connectors + globe) so it fills the box.
const VB = { x: 196, y: 8, w: 868, h: 398 };

const PLANET = { x: 876, y: 210, r: 150 };
const CP = { x: 462, y: 210 }; // connector convergence point (card right edge)

// Dotted sphere (unit-sphere lat/long grid).
const DOTS = (() => {
  const pts: { x: number; y: number; z: number }[] = [];
  const LAT = 26;
  const LONG = 52;
  for (let i = 1; i < LAT; i++) {
    const phi = (i / LAT) * Math.PI;
    for (let j = 0; j < LONG; j++) {
      const theta = (j / LONG) * Math.PI * 2;
      pts.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      });
    }
  }
  return pts;
})();

// Connector targets in design space (ring crossings + points on the planet).
// Connectors fan from the card to the planet's left hemisphere — a clean,
// consistent spread (no short stray lines stopping at a ring).
const TARGETS = [
  { x: 742, y: 116 },
  { x: 730, y: 166 },
  { x: 740, y: 214 },
  { x: 748, y: 262 },
  { x: 770, y: 308 },
];

// Found-host callout (Scale-viz style): a random dot ON the spinning sphere
// (rotates with it) → diagonal connector → thin hexagon + label (fixed).
const FOUND_HEX = { x: 642, y: 52 }; // hexagon callout head, in open space

// Query-card rows — one per stage; the current stage's row renders as a white
// pill (the source dot fires from it).
const CARD_ROWS = [
  { pre: "SCAN", mid: "Y", post: "HOST" },
  { pre: "SCAN", mid: "✕", post: "HOST" },
  { pre: "EXPLOIT", mid: "", post: "CVE-2026-1234" },
];

// Stage 2 (tab 1): two probes that travel along DIFFERENT connectors. The
// first lands on the ring (DENIED); the second runs along a separate, lower
// connector — starting where IT crosses the ring (a distinct point from the
// DENIED node) — out to the mid-gap, with a SCAN hexagon callout.
const DENIED_PT = { x: 536, y: 200 }; // ON the first ring's right edge → DENIED (red)
const SCAN_RING_PT = { x: 535, y: 248 }; // SCAN connector's own crossing of the ring
const SCAN_PT = { x: 605, y: 262 }; // mid-gap → SCAN (white, positive)

// Hexagon nodes orbiting along the first ellipsis (tab 1), each with a mono
// label that types in / erases as it rotates to the front.
const ORBIT_LABELS = [
  "Y HOST LIVE",
  "X SERVICE EXPOSED",
  "CVE X FEASIBLE",
  "Z PORT 443 OPEN",
  "X TLS WEAK",
];
const ORBIT_SPEED = 0.26; // rad/s

// Stage 3 (tab 2 / "Extract signal from noise"): the EXPLOIT query runs
// straight THROUGH to the sphere (no stopping at a ring). The rule check
// passes at ring 1 (green ALLOWED), and the target validates on the sphere
// (green EXPLOITABILITY CONFIRMED).
const GREEN = "#37f5a1"; // design accent for accepted/confirmed
const ALLOWED_PT = { x: 536, y: 246 }; // green node on ring 1's front edge
const RING2_END = { x: 716, y: 238 }; // tracer/connectors terminate on ring 2
// faint through-connectors fan out and TERMINATE on ring 2's front edge
// (they don't reach the sphere).
const S3_TARGETS = [
  { x: 713, y: 132 },
  { x: 718, y: 200 },
  { x: 716, y: 252 },
  { x: 710, y: 300 },
];

// ---- Layouts ------------------------------------------------------------
// The viz has two compositions sharing one animation logic. Landscape (H) is
// the original left→right flow. Portrait (V, mobile) rotates the flow to run
// top→down: full-width card → two horizontal rings → planet at the bottom.
// Geometry differs per layout; the draw functions read the active layout `L`.
const RING1_H = { cx: 516, cy: PLANET.y, rx: 20, ry: 132 };
const RING2_H = { cx: 694, cy: PLANET.y, rx: 24, ry: 150 };
const CARD_H = {
  panel: { x: 280, y: 158, w: 168, h: 112 },
  avatar: { x: 256, y: 208, r: 30 },
  padV: 0, // vertical inset for the rows within the panel
  pillL: 16, // active-pill inset from panel left / right
  pillR: 2,
  pillHRatio: 0.75, // pill height as a fraction of the row band
  toggleInset: 12, // +/- toggle inset from panel right
};
const LAYOUT_H = {
  vb: VB,
  planet: PLANET,
  cp: CP,
  targets: TARGETS,
  ring1: RING1_H,
  ring2: RING2_H,
  foundHex: FOUND_HEX,
  card: CARD_H,
  perRowSource: true,
  // stage 2/3 nodes
  denied: DENIED_PT,
  scanRing: SCAN_RING_PT,
  scan: SCAN_PT,
  allowed: ALLOWED_PT,
  ring2End: RING2_END,
  s3targets: S3_TARGETS,
};

// Portrait design space (taller than wide) — vertical flow.
const VB_V = { x: 0, y: 0, w: 420, h: 720 };
const PLANET_V = { x: 210, y: 560, r: 150 };
const CP_V = { x: 210, y: 152 }; // convergence point just below the card
const TARGETS_V = [
  { x: 122, y: 452 },
  { x: 170, y: 446 },
  { x: 210, y: 444 },
  { x: 252, y: 446 },
  { x: 300, y: 452 },
];
const RING1_V = { cx: 210, cy: 252, rx: 150, ry: 24 };
const RING2_V = { cx: 210, cy: 432, rx: 198, ry: 30 };
const FOUND_HEX_V = { x: 300, y: 326 }; // callout head in open space, mid-flow
const CARD_V = {
  // avatar sits beside the panel (to its left, not overlapping), aligned to
  // row 1.
  panel: { x: 62, y: 14, w: 312, h: 134 },
  avatar: { x: 30, y: 46, r: 26 },
  padV: 16,
  pillL: 14,
  pillR: 16,
  pillHRatio: 0.7,
  toggleInset: 22,
};
const LAYOUT_V = {
  vb: VB_V,
  planet: PLANET_V,
  cp: CP_V,
  targets: TARGETS_V,
  ring1: RING1_V,
  ring2: RING2_V,
  foundHex: FOUND_HEX_V,
  card: CARD_V,
  perRowSource: false,
  // stage 2/3 nodes — on the front (lower) edges of the horizontal rings
  denied: { x: 172, y: 272 }, // ON ring 1's front edge → DENIED (red)
  scanRing: { x: 248, y: 272 }, // SCAN connector's own crossing of ring 1
  scan: { x: 262, y: 344 }, // mid-gap → SCAN (white, positive)
  allowed: { x: 206, y: 276 }, // green node on ring 1's front edge
  ring2End: { x: 210, y: 462 }, // tracer terminates on ring 2's front edge
  s3targets: [
    { x: 140, y: 454 },
    { x: 188, y: 458 },
    { x: 240, y: 458 },
    { x: 296, y: 454 },
  ],
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export default function BastionInventoryViz() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ABC ROM Mono, resolved from the CSS token (canvas can't parse var()).
    const MONO = getMonoFontFamily();

    let w = 0;
    let h = 0;
    let s = 1; // design → screen scale
    let ox = 0;
    let oy = 0;
    let vertical = false;
    let L = LAYOUT_H;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // portrait canvas → vertical flow composition
      vertical = h > w * 1.15;
      L = vertical ? LAYOUT_V : LAYOUT_H;
      // fit the content viewport within the canvas, centred
      s = Math.min(w / L.vb.w, h / L.vb.h);
      ox = (w - L.vb.w * s) / 2 - L.vb.x * s;
      oy = (h - L.vb.h * s) / 2 - L.vb.y * s;
    };
    resize();
    // Setting canvas.width in resize() wipes the buffer. Under reduced motion
    // there is no ticker to repaint, and ResizeObserver ALWAYS fires once
    // right after observe() — without the re-render the static frame would be
    // erased and the viz left permanently blank (e.g. macOS "Reduce Motion").
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) render();
    });
    ro.observe(canvas);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // design point → screen
    const X = (dx: number) => ox + dx * s;
    const Y = (dy: number) => oy + dy * s;

    // row centre (design space) derived from the active layout's card panel,
    // so card rows / tracer origins stay correct in both orientations.
    const rowCY = (i: number) => {
      const p = L.card.panel;
      const padV = L.card.padV;
      return p.y + padV + (p.h - 2 * padV) * ((i + 0.5) / 3);
    };

    // uniform card pill width (screen px), sized to the longest row's label.
    const cardPillW = () => {
      ctx.font = `${12 * s}px ${MONO}`;
      const sw = ctx.measureText(" ").width;
      let mx = 0;
      for (const row of CARD_ROWS) {
        const w0 =
          ctx.measureText(row.pre).width +
          (row.mid ? sw + ctx.measureText(row.mid).width : 0) +
          sw +
          ctx.measureText(row.post).width;
        if (w0 > mx) mx = w0;
      }
      return 15 * s + mx + sw * 1.8 + ctx.measureText("+").width + 13 * s;
    };

    let time = 0;

    // Stage-cycle timing. Each stage runs for exactly one of its own cycles;
    // the stage machine in render() strings them together on a loop.
    // Stage 1 — probe + found-host callout:
    const TR = 1.0; // travel (snappy)
    const HD = 3.0; // hold
    const FD = 0.7; // fade
    const GP = 0.5; // gap before restart
    const CYC = TR + HD + FD + GP;
    // Stage 2 — DENIED probe, then SCAN probe:
    const P2S = TR + 0.5; // probe 2 starts
    const P2L = P2S + TR; // probe 2 lands
    const S2_HOLD_END = P2L + 2.0; // SCAN reveal + dwell
    const CYC2 = S2_HOLD_END + FD + GP;
    // Stage 3 — EXPLOIT tracer straight through (ALLOWED + CONFIRMED):
    const TR3 = 1.5;
    const HD3 = 3.2;
    const FD3 = 0.7;
    const GP3 = 0.6;
    const CYC3 = TR3 + HD3 + FD3 + GP3;
    const SPIN = 0.25; // planet spin rate (rad/s) — also drives the host dot

    // Clickable card rows: clicking a row jumps the sequence to the start of
    // that stage; auto-advance then continues from there. Implemented as a
    // sequence-time shift so the planet's spin stays continuous (no jump).
    let seqShift = 0;
    const STAGE_START = [0, CYC, CYC + CYC2]; // seqT at each stage's start
    const hitRow = (mx: number, my: number) => {
      const p = L.card.panel;
      const half = (p.h / 3 / 2) * s;
      for (let i = 0; i < CARD_ROWS.length; i++) {
        const cyr = Y(rowCY(i));
        if (mx >= X(p.x) && mx <= X(p.x + p.w) && my >= cyr - half && my <= cyr + half)
          return i;
      }
      return -1;
    };
    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const i = hitRow(e.clientX - r.left, e.clientY - r.top);
      if (i >= 0) {
        seqShift = time - 1.1 - STAGE_START[i];
        if (reduce) render();
      }
    };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      canvas.style.cursor =
        hitRow(e.clientX - r.left, e.clientY - r.top) >= 0 ? "pointer" : "default";
    };
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousemove", onMove);

    const roundRect = (
      x: number,
      y: number,
      ww: number,
      hh: number,
      r: number,
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + ww, y, x + ww, y + hh, r);
      ctx.arcTo(x + ww, y + hh, x, y + hh, r);
      ctx.arcTo(x, y + hh, x, y, r);
      ctx.arcTo(x, y, x + ww, y, r);
      ctx.closePath();
    };

    // ---- planet -------------------------------------------------------
    const drawPlanet = () => {
      const cx = X(L.planet.x);
      const cy = Y(L.planet.y);
      const R = L.planet.r * s;

      if (vertical) {
        // portrait: an evenly-lit dark sphere (no directional side light) with
        // a faint radial sheen — the dots read across the whole face.
        const g = ctx.createRadialGradient(
          cx - R * 0.25,
          cy - R * 0.3,
          R * 0.1,
          cx,
          cy,
          R,
        );
        g.addColorStop(0, "#1f1f1f");
        g.addColorStop(0.7, "#141414");
        g.addColorStop(1, "#0a0a0a");
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      } else {
        // body: a sphere lit from the right (the dots ride on top)
        const g = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
        g.addColorStop(0, "#0c0c0c");
        g.addColorStop(0.5, "#1c1c1c");
        g.addColorStop(0.85, "#9a9a9a");
        g.addColorStop(1, "#cccccc");
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // dotted front hemisphere — slowly spins about its vertical axis and
      // each dot twinkles (same motion as the Map at Planetary Scale planet).
      // Dots read on the dark (left) side and vanish into the lit right side.
      const spin = time * SPIN;
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      for (const p of DOTS) {
        const px = p.x * cs - p.z * sn;
        const pz = p.x * sn + p.z * cs;
        if (pz <= 0.02) continue; // front only
        const sx = cx + px * R;
        const sy = cy - p.y * R;
        const phase = (p.x + 1) * 5.1 + (p.y + 1) * 8.7 + (p.z + 1) * 3.3;
        const tw = 0.62 + 0.38 * Math.sin(time * 1.9 + phase);
        // occasional swell: 0 most of the time, some dots briefly grow
        const pulse = Math.max(0, Math.sin(time * 0.7 + phase * 2.3) - 0.8) * 5;
        const a =
          (vertical ? clamp(0.5 + pz * 0.1, 0.18, 0.7) : clamp(0.55 - px * 0.6, 0.04, 0.85)) *
          clamp(pz * 2.2, 0, 1) *
          (0.6 + 0.4 * tw + pulse * 0.4);
        if (a < 0.04) continue;
        ctx.beginPath();
        ctx.arc(
          sx,
          sy,
          Math.max(0.5, (0.7 + 0.4 * tw + pulse * 1.5) * s),
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(255,255,255,${Math.min(a, 1)})`;
        ctx.fill();
      }
    };

    // ---- vertical orbital rings (gradient lens paths) -----------------
    // A tall ellipse: dark fill + white stroke, both fading left→right so the
    // planet-facing (right) edge glows and the far (left) edge dissolves.
    const drawRing = (ring: {
      cx: number;
      cy: number;
      rx: number;
      ry: number;
    }) => {
      const cxr = X(ring.cx);
      const cyr = Y(ring.cy);
      const RX = ring.rx * s;
      const RY = ring.ry * s;
      ctx.beginPath();
      ctx.ellipse(cxr, cyr, RX, RY, 0, 0, Math.PI * 2);
      if (vertical) {
        // horizontal ring: faint fill, white stroke brightest on the front
        // (lower) edge that faces the planet below.
        const fill = ctx.createLinearGradient(0, cyr - RY, 0, cyr + RY);
        fill.addColorStop(0, "rgba(0,0,0,0)");
        fill.addColorStop(1, "rgba(0,0,0,0.5)");
        ctx.fillStyle = fill;
        ctx.fill();
        const stroke = ctx.createLinearGradient(0, cyr - RY, 0, cyr + RY);
        stroke.addColorStop(0, "rgba(255,255,255,0.32)");
        stroke.addColorStop(1, "rgba(255,255,255,0.85)");
        ctx.lineWidth = 1;
        ctx.strokeStyle = stroke;
        ctx.stroke();
      } else {
        // tall ring: dark fill + white stroke, fading left→right so the
        // planet-facing (right) edge glows and the far (left) edge dissolves.
        const fill = ctx.createLinearGradient(cxr - RX, 0, cxr + RX, 0);
        fill.addColorStop(0, "rgba(0,0,0,0)");
        fill.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = fill;
        ctx.fill();
        const stroke = ctx.createLinearGradient(cxr - RX, 0, cxr + RX, 0);
        stroke.addColorStop(0, "rgba(255,255,255,0.16)");
        stroke.addColorStop(0.5, "rgba(255,255,255,0.4)");
        stroke.addColorStop(1, "rgba(255,255,255,1)");
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = stroke;
        ctx.stroke();
      }
    };

    // ---- query card ---------------------------------------------------
    // Drawn relative to the active layout's card panel, so the same widget
    // renders compact (landscape) or full-width at the top (portrait).
    const drawCard = (intro: number, act: number) => {
      const p = L.card.panel;
      const av = L.card.avatar;
      ctx.save();
      ctx.globalAlpha = clamp(intro * 1.5, 0, 1);

      // (no container box — rows read as plain labels: grey when inactive,
      // a white pill when active.)

      ctx.font = `${12 * s}px ${MONO}`;
      ctx.textBaseline = "middle";
      const dim = "rgba(160,160,160,0.85)";
      const dimmer = "rgba(120,120,120,0.8)";

      // Uniform pill width (sized to the longest row). Portrait anchors the card
      // from the left; landscape anchors it from the RIGHT — its right edge just
      // left of the connector dot — so the card grows leftward into the empty
      // space and the animation (dot, rings, planet) stays exactly where it was.
      const innerH = p.h - 2 * L.card.padV;
      const pillH = (innerH / 3) * L.card.pillHRatio;
      const padL = 15 * s;
      const padR = 13 * s;
      const spaceW = ctx.measureText(" ").width; // one mono cell
      const pillW = cardPillW();
      // portrait centres the pills on the flow axis (where the dot sits);
      // landscape anchors them just left of the dot.
      const x0 = vertical
        ? X(L.cp.x) - pillW / 2
        : X(L.cp.x - 14) - pillW;

      // avatar — beside the card on the left.
      const ar = av.r * s;
      const ax = x0 - 40 * s;
      const ay = vertical ? Y(av.y) : Y(rowCY(1));
      ctx.save();
      ctx.shadowColor = "rgba(255,255,255,0.3)";
      ctx.shadowBlur = 22 * s;
      ctx.shadowOffsetY = 5 * s;
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(128,128,128,0.5)";
      ctx.lineWidth = 0.75 * s;
      ctx.stroke();
      // person glyph — stroked outline, not filled
      ctx.strokeStyle = "rgba(235,235,235,0.95)";
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.arc(ax, ay - ar * 0.18, ar * 0.24, 0, Math.PI * 2); // head
      ctx.stroke();
      ctx.beginPath(); // shoulders
      ctx.arc(ax, ay + ar * 0.6, ar * 0.46, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      CARD_ROWS.forEach((row, i) => {
        const ry = Y(rowCY(i));
        const on = i === act;
        ctx.fillStyle = on ? "#f2f2f2" : "#242424";
        roundRect(x0, ry - (pillH / 2) * s, pillW, pillH * s, 6 * s);
        ctx.fill();

        const txt = on ? "#111" : dim;
        const preW = ctx.measureText(row.pre).width;
        const midW = row.mid ? ctx.measureText(row.mid).width : 0;
        ctx.textAlign = "left";
        let tx = x0 + padL;
        ctx.fillStyle = txt;
        ctx.fillText(row.pre, tx, ry);
        tx += preW + spaceW;
        if (row.mid) {
          ctx.fillStyle = on ? "#555" : dimmer;
          ctx.fillText(row.mid, tx, ry);
          tx += midW + spaceW;
        }
        ctx.fillStyle = txt;
        ctx.fillText(row.post, tx, ry);
        // toggle pinned to the pill's right edge
        ctx.textAlign = "right";
        ctx.fillStyle = txt;
        ctx.fillText(on ? "–" : "+", x0 + pillW - padR, ry);
      });

      // toggle/source dot — the port every tracer fires from, so its centre
      // sits exactly on the connector origin (original, fixed position).
      const sx = X(L.cp.x);
      const sy = Y(L.perRowSource ? rowCY(act) : L.cp.y);
      ctx.beginPath();
      ctx.arc(sx, sy, 4 * s, 0, Math.PI * 2);
      ctx.fillStyle = "#f2f2f2";
      ctx.fill();

      ctx.restore();
    };

    // ---- FOUND-host callout (Scale-viz style) -------------------------
    // A discovered dot on the sphere → diagonal connector → thin hexagon
    // framing a typed-style label. Revealed when the probe lands.
    const rnd = (n: number) => {
      const x = Math.sin((n + 1) * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    // `ft` = seconds since the probe landed; drives the staged reveal. `ci` =
    // loop index, so each pass picks a different host.
    const drawFoundCallout = (a: number, ft: number, ci: number) => {
      if (a <= 0 || ft < 0) return;
      // stable-per-loop random host point on the sphere; rotates with SPIN.
      const phi = 0.34 * Math.PI + rnd(ci) * 0.32 * Math.PI; // latitude
      const desiredA = Math.PI * 0.52 + rnd(ci + 101) * 0.55; // azimuth at land
      const A = desiredA + SPIN * ft; // tracks the spin (ft = since land)
      const y0 = Math.cos(phi);
      const rxz = Math.sin(phi);
      const px = rxz * Math.cos(A);
      const pz = rxz * Math.sin(A);
      if (pz <= 0.04) return; // host rotated out of view

      const cx = X(L.planet.x);
      const cy = Y(L.planet.y);
      const R = L.planet.r * s;
      const fx = cx + px * R;
      const fy = cy - y0 * R;
      const hx = X(L.foundHex.x);
      const hy = Y(L.foundHex.y);

      // staged reveal: 1) dot highlights → 2) connector draws →
      // 3) hexagon blinks twice → 4) label types in.
      const dotReveal = clamp(ft / 0.14, 0, 1);
      const connProg = clamp((ft - 0.18) / 0.26, 0, 1); // faster line draw
      let hexA = 0;
      if (ft >= 0.5) {
        hexA = ft >= 1.0 ? 1 : Math.floor((ft - 0.5) / 0.125) % 2 === 0 ? 1 : 0;
      }

      ctx.save();
      ctx.globalAlpha = a;

      // 2) connector grows from the dot toward the hexagon
      if (connProg > 0) {
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + (hx - fx) * connProg, fy + (hy - fy) * connProg);
        ctx.strokeStyle = "rgba(220,220,220,0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 1) host dot pops in red, with glow
      if (dotReveal > 0) {
        const rr = 7 * s * (0.5 + 0.5 * dotReveal);
        const glow = ctx.createRadialGradient(fx, fy, rr * 0.4, fx, fy, rr * 2.4);
        glow.addColorStop(0, `rgba(229,57,53,${0.5 * dotReveal})`);
        glow.addColorStop(1, "rgba(229,57,53,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(fx, fy, rr * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(fx, fy, rr, 0, Math.PI * 2);
        ctx.fillStyle = "#e53935";
        ctx.fill();
      }

      // 3) hexagon — blinks twice then holds
      const hw = 22 * s;
      if (hexA > 0) {
        const hh = 17 * s;
        const inset = hw * 0.5;
        ctx.save();
        ctx.globalAlpha = a * hexA;
        ctx.beginPath();
        ctx.moveTo(hx - hw, hy);
        ctx.lineTo(hx - hw + inset, hy - hh);
        ctx.lineTo(hx + hw - inset, hy - hh);
        ctx.lineTo(hx + hw, hy);
        ctx.lineTo(hx + hw - inset, hy + hh);
        ctx.lineTo(hx - hw + inset, hy + hh);
        ctx.closePath();
        ctx.strokeStyle = "rgba(220,220,220,0.85)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 4) label types in after the hexagon settles
      if (ft >= 1.05) {
        const lx = hx - hw * 0.3;
        const full = "FOUND ✕ HOST";
        const typed = Math.min(full.length, Math.floor((ft - 1.05) / 0.03));
        let str = full.slice(0, typed);
        if (typed < full.length) str += "▋";
        ctx.beginPath();
        ctx.arc(lx, hy, 3 * s, 0, Math.PI * 2);
        ctx.fillStyle = "#e53935";
        ctx.fill();
        ctx.font = `${11 * s}px ${MONO}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(235,235,235,0.95)";
        ctx.fillText(str, lx + 11 * s, hy);
      }

      ctx.restore();
    };

    // a traveling probe: bright white trail (ax,ay)→(dx,dy) + a node at (dx,dy).
    // centerColor red = negative result, white = positive.
    const drawProbe = (
      ax: number,
      ay: number,
      dx: number,
      dy: number,
      a: number,
      centerColor = "#e53935",
    ) => {
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(dx, dy);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      const nr = 9 * s;
      const glow = ctx.createRadialGradient(dx, dy, nr * 0.5, dx, dy, nr * 2.3);
      glow.addColorStop(0, "rgba(255,255,255,0.32)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(dx, dy, nr * 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dx, dy, nr, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(210,210,210,0.7)";
      ctx.stroke();
      // centre hexagon (red = negative, white = positive)
      const hr = nr * 0.55;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const ang = k * (Math.PI / 3);
        const hpx = dx + hr * Math.cos(ang);
        const hpy = dy + hr * Math.sin(ang);
        if (k === 0) ctx.moveTo(hpx, hpy);
        else ctx.lineTo(hpx, hpy);
      }
      ctx.closePath();
      ctx.fillStyle = centerColor;
      ctx.fill();
      ctx.restore();
    };

    // Result pill beside a node: dark rounded rect + label. DENIED → bold red
    // ✕ prefix; otherwise just text. Pill blinks in, then the text types.
    // `ft` = seconds since the node landed.
    const drawResultLabel = (
      nodeX: number,
      nodeY: number,
      text: string,
      denied: boolean,
      ft: number,
      a: number,
    ) => {
      if (a <= 0 || ft < 0) return;
      const fs = 11 * s;
      ctx.font = `${fs}px ${MONO}`;
      const textW = ctx.measureText(text).width;
      const xPad = 16 * s;
      const xGlyph = denied ? 18 * s : 0;
      const x0 = nodeX + 16 * s;
      const pw = xPad + xGlyph + textW + 16 * s;
      const ph = 26 * s;

      // pill blinks in over the first 0.5s, then holds
      const pillA = ft >= 0.5 ? 1 : Math.floor(ft / 0.125) % 2 === 0 ? 1 : 0;
      if (pillA > 0) {
        ctx.save();
        ctx.globalAlpha = a * pillA;
        ctx.fillStyle = "#161616";
        roundRect(x0, nodeY - ph / 2, pw, ph, 6 * s);
        ctx.fill();
        ctx.strokeStyle = "rgba(120,120,120,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // content types in after the pill settles
      if (ft >= 0.55) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        let tx = x0 + xPad;
        if (denied) {
          const xs = 5 * s;
          ctx.strokeStyle = "#e53935";
          ctx.lineWidth = 1.7 * s;
          ctx.beginPath();
          ctx.moveTo(tx - xs, nodeY - xs);
          ctx.lineTo(tx + xs, nodeY + xs);
          ctx.moveTo(tx + xs, nodeY - xs);
          ctx.lineTo(tx - xs, nodeY + xs);
          ctx.stroke();
          tx += xs + 12 * s;
        }
        const typed = Math.min(text.length, Math.floor((ft - 0.55) / 0.03));
        let str = text.slice(0, typed);
        if (typed < text.length) str += "▋";
        ctx.fillStyle = "rgba(205,205,205,0.95)";
        ctx.fillText(str, tx, nodeY);
        ctx.restore();
      }
    };

    // a highlighted green node (accepted/confirmed) with a soft glow.
    const drawGreenDot = (x: number, y: number, r: number, a: number) => {
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha = a;
      const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6);
      glow.addColorStop(0, "rgba(55,245,161,0.5)");
      glow.addColorStop(1, "rgba(55,245,161,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = GREEN;
      ctx.fill();
      ctx.restore();
    };

    // Green result pill beside a node: dark rounded rect, a green glyph (check
    // or dot), then a WHITE typed label (per design, the whole label is white).
    // `ft` = seconds since the node landed; pill blinks in, then text types.
    const drawGreenLabel = (
      nodeX: number,
      nodeY: number,
      text: string,
      kind: "check" | "dot",
      ft: number,
      a: number,
    ) => {
      if (a <= 0 || ft < 0) return;
      const fs = 11 * s;
      ctx.font = `${fs}px ${MONO}`;
      const textW = ctx.measureText(text).width;
      const lead = 16 * s; // node → pill gap
      const padX = 14 * s;
      const glyphW = 14 * s; // green glyph + gap
      const x0 = nodeX + lead;
      const pw = padX + glyphW + textW + 14 * s;
      const ph = 26 * s;

      // smooth fade-in (no strobing blink)
      const pillA = clamp(ft / 0.18, 0, 1);
      if (pillA > 0) {
        ctx.save();
        ctx.globalAlpha = a * pillA;
        ctx.fillStyle = "#161616";
        roundRect(x0, nodeY - ph / 2, pw, ph, 6 * s);
        ctx.fill();
        ctx.strokeStyle = "rgba(120,120,120,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      if (ft >= 0.22) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        const gx = x0 + padX;
        if (kind === "check") {
          ctx.strokeStyle = GREEN;
          ctx.lineWidth = 1.7 * s;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(gx - 1 * s, nodeY + 0.5 * s);
          ctx.lineTo(gx + 2.5 * s, nodeY + 4 * s);
          ctx.lineTo(gx + 7 * s, nodeY - 4 * s);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(gx + 3 * s, nodeY, 3.2 * s, 0, Math.PI * 2);
          ctx.fillStyle = GREEN;
          ctx.fill();
        }
        const typed = Math.min(text.length, Math.floor((ft - 0.22) / 0.03));
        let str = text.slice(0, typed);
        if (typed < text.length) str += "▋";
        ctx.fillStyle = "rgba(255,255,255,0.96)";
        ctx.fillText(str, gx + glyphW, nodeY);
        ctx.restore();
      }
    };

    // hexagon nodes orbiting the first ellipsis; labels type in / erase as
    // each node rotates into the front (right) of the ring.
    const drawRingOrbiters = (a: number, skipNearY?: number) => {
      if (a <= 0) return;
      const cx = X(L.ring1.cx);
      const cy = Y(L.ring1.cy);
      const rx = L.ring1.rx * s;
      const ry = L.ring1.ry * s;
      ctx.font = `${10 * s}px ${MONO}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ORBIT_LABELS.forEach((label, i) => {
        const phi = (i / ORBIT_LABELS.length) * Math.PI * 2 + time * ORBIT_SPEED;
        const c = Math.cos(phi);
        const nx = cx + rx * c;
        const ny = cy + ry * Math.sin(phi);
        // depth (which side faces the viewer): the narrow axis of the ellipse.
        // Landscape rings are tall (depth = cos/x); portrait rings lie flat
        // (depth = sin/y, front = lower edge).
        const depth = vertical ? Math.sin(phi) : c;
        // skip the orbiter passing in front of the ALLOWED node (tab 3) so the
        // green highlight cleanly replaces it instead of overlapping its label.
        if (
          skipNearY !== undefined &&
          depth > 0.04 &&
          Math.abs(L.ring1.cy + L.ring1.ry * Math.sin(phi) - skipNearY) < 36
        )
          return;
        // node: small white hexagon, dimmer on the back of the ring
        const nodeA = clamp((depth + 0.4) / 0.7, 0.12, 1) * a;
        const hr = 5 * s;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const ang = k * (Math.PI / 3);
          const px = nx + hr * Math.cos(ang);
          const py = ny + hr * Math.sin(ang);
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${nodeA})`;
        ctx.fill();
        // label on the front, typed proportionally to how far into the front
        if (depth > 0.04) {
          const typed = Math.floor(label.length * clamp(depth / 0.32, 0, 1));
          let str = label.slice(0, typed);
          if (typed > 0 && typed < label.length) str += "▋";
          if (str) {
            ctx.save();
            ctx.globalAlpha = clamp(depth * 2.2, 0, 1) * a;
            ctx.fillStyle = "rgba(195,195,195,0.95)";
            ctx.fillText(str, nx + 12 * s, ny);
            ctx.restore();
          }
        }
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      // mono labels get a touch of tracking (canvas resets state on resize, so
      // re-apply each frame). Guarded — letterSpacing is a newer canvas prop.
      if ("letterSpacing" in ctx) {
        (ctx as unknown as { letterSpacing: string }).letterSpacing = "0.075rem";
      }
      const intro = reduce ? 1 : clamp(time / 1.1, 0, 1);

      // Auto-advancing stage machine (Reaper-style): after a one-time intro,
      // loop stage 0 → 1 → 2, one cycle each. `stage` = current stage, `localT`
      // = time within it, `loopN` = loop index (varies the random host each
      // pass). `stageAlpha` crossfades the action overlays at the seams while
      // the planet / rings / card persist at full.
      const seqT = reduce ? 0 : Math.max(0, time - 1.1 - seqShift);
      const DUR = [CYC, CYC2, CYC3];
      const TOTAL = DUR[0] + DUR[1] + DUR[2];
      const loopT = seqT % TOTAL;
      const loopN = Math.floor(seqT / TOTAL);
      let stage = 0;
      let localT = loopT;
      for (let acc = 0, i = 0; i < DUR.length; i++) {
        if (loopT < acc + DUR[i]) {
          stage = i;
          localT = loopT - acc;
          break;
        }
        acc += DUR[i];
      }
      const XF = 0.5; // crossfade window at each stage seam
      const stageAlpha = reduce
        ? 1
        : clamp(localT / XF, 0, 1) * clamp((DUR[stage] - localT) / XF, 0, 1);

      drawPlanet();
      drawRing(L.ring1);
      drawRing(L.ring2);

      // connectors/probes fire from the dot (fixed connector origin), so the
      // white dot is exactly where every tracer originates.
      const srcX = L.cp.x;
      const srcY = L.perRowSource ? rowCY(stage) : L.cp.y;
      const cpx = X(srcX);
      const cpy = Y(srcY);
      // Stages 0–1 fan to the planet's left hemisphere; stage 2 draws its own
      // longer fan that runs straight through to the sphere face (below).
      if (stage !== 2) {
        L.targets.forEach((t, i) => {
          const p = clamp((intro - i * 0.06) * 1.5, 0, 1);
          if (p <= 0) return;
          const tx = X(t.x);
          const ty = Y(t.y);
          ctx.beginPath();
          ctx.moveTo(cpx, cpy);
          ctx.lineTo(cpx + (tx - cpx) * p, cpy + (ty - cpy) * p);
          ctx.strokeStyle = `rgba(210,210,210,${0.28 * stageAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        });
      }

      const ease = (t: number) => 1 - (1 - t) * (1 - t);

      if (stage === 1) {
        // hexagon nodes orbiting the first ellipsis (with typewriter labels)
        drawRingOrbiters(stageAlpha);

        // STAGE 2 — probe → first ring (DENIED), then a 2nd probe to the
        // mid-gap (SCAN hexagon callout).
        const rc = localT;
        let da = 0;
        if (rc >= 0 && rc < S2_HOLD_END) da = 1;
        else if (rc >= S2_HOLD_END && rc < S2_HOLD_END + FD)
          da = 1 - (rc - S2_HOLD_END) / FD;
        da *= stageAlpha;
        if (da > 0) {
          // probe 1: card → first ring → red node + DENIED pill
          const p1 = rc < TR ? ease(rc / TR) : 1;
          drawProbe(
            cpx,
            cpy,
            X(srcX + (L.denied.x - srcX) * p1),
            Y(srcY + (L.denied.y - srcY) * p1),
            da,
          );
          drawResultLabel(
            X(L.denied.x),
            Y(L.denied.y),
            "DENIED",
            true,
            rc - TR,
            da,
          );
          // probe 2: card → mid-gap via a different (lower) connector →
          // WHITE node (positive) + SCAN pill
          if (rc >= P2S) {
            const p2 = rc < P2L ? ease((rc - P2S) / TR) : 1;
            // SCAN tracer runs along its own connector — starting where that
            // connector crosses the ring (below the DENIED node), not from the
            // DENIED node itself.
            drawProbe(
              X(L.scanRing.x),
              Y(L.scanRing.y),
              X(L.scanRing.x + (L.scan.x - L.scanRing.x) * p2),
              Y(L.scanRing.y + (L.scan.y - L.scanRing.y) * p2),
              da,
              "#ffffff",
            );
            drawResultLabel(
              X(L.scan.x),
              Y(L.scan.y),
              "SCAN",
              false,
              rc - P2L,
              da,
            );
          }
        }
      } else if (stage === 2) {
        // STAGE 3 — "Extract signal from noise": the continuous inventory
        // orbits ring 1 (the noise); the EXPLOIT query runs straight THROUGH
        // to the sphere. The rule check passes at ring 1 (ALLOWED) and the
        // target validates on the sphere (EXPLOITABILITY CONFIRMED).
        // Skip the orbiter that would sit on top of the ALLOWED highlight.
        drawRingOrbiters(stageAlpha, L.allowed.y);

        // through-connectors run from the active row and TERMINATE on ring 2
        L.s3targets.forEach((t, i) => {
          const p = clamp((intro - i * 0.06) * 1.5, 0, 1);
          if (p <= 0) return;
          const tx = X(t.x);
          const ty = Y(t.y);
          ctx.beginPath();
          ctx.moveTo(cpx, cpy);
          ctx.lineTo(cpx + (tx - cpx) * p, cpy + (ty - cpy) * p);
          ctx.strokeStyle = `rgba(210,210,210,${0.22 * stageAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        });

        // tracer: card → through ring 1 (ALLOWED) → sphere (CONFIRMED)
        const rc = localT;
        let da = 0;
        if (rc >= 0 && rc < TR3 + HD3) da = 1;
        else if (rc >= TR3 + HD3 && rc < TR3 + HD3 + FD3)
          da = 1 - (rc - (TR3 + HD3)) / FD3;
        da *= stageAlpha;
        if (da > 0) {
          const p = rc < TR3 ? ease(rc / TR3) : 1;
          const hx = X(srcX + (L.ring2End.x - srcX) * p);
          const hy = Y(srcY + (L.ring2End.y - srcY) * p);
          // bright tracer line from the card to the comet head (ends on ring 2)
          ctx.save();
          ctx.globalAlpha = da;
          ctx.beginPath();
          ctx.moveTo(cpx, cpy);
          ctx.lineTo(hx, hy);
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 1.4;
          ctx.stroke();
          const hr = 4 * s;
          const g = ctx.createRadialGradient(hx, hy, hr * 0.4, hx, hy, hr * 2.4);
          g.addColorStop(0, "rgba(255,255,255,0.5)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(hx, hy, hr * 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // ALLOWED — lights once the head clears ring 1 (invert the ease so
          // the reveal tracks the head's actual crossing of ring 1). Progress
          // runs along the flow axis: x in landscape, y in portrait.
          const pAllow = vertical
            ? (L.allowed.y - srcY) / (L.ring2End.y - srcY)
            : (L.allowed.x - srcX) / (L.ring2End.x - srcX);
          const rcAllow = TR3 * (1 - Math.sqrt(1 - pAllow));
          drawGreenDot(
            X(L.allowed.x),
            Y(L.allowed.y),
            4.5 * s,
            da * clamp((rc - rcAllow) / 0.12, 0, 1),
          );
          drawGreenLabel(
            X(L.allowed.x),
            Y(L.allowed.y),
            "ALLOWED",
            "check",
            rc - rcAllow,
            da,
          );

          // CONFIRMED — a dot ON the spinning sphere lights green. A DIFFERENT,
          // currently-visible (front) dot each loop: parametrised like the
          // stage-1 found-host dot — chosen per loop, placed in front at the
          // reveal, then tracking the planet's spin. Revealed when the tracer
          // lands on ring 2.
          const ftc = rc - TR3; // seconds since the tracer landed
          const cphi = 0.3 * Math.PI + rnd(loopN) * 0.4 * Math.PI; // latitude
          const cAz = 1.15 + rnd(loopN + 7) * 0.7; // azimuth → front at reveal
          const cA = cAz + SPIN * ftc; // tracks the spin (ftc = since land)
          const cFront = Math.sin(cphi) * Math.sin(cA); // screen depth
          if (cFront > 0.05) {
            const gfx =
              X(L.planet.x) + Math.sin(cphi) * Math.cos(cA) * L.planet.r * s;
            const gfy = Y(L.planet.y) - Math.cos(cphi) * L.planet.r * s;
            drawGreenDot(gfx, gfy, 5 * s, da * clamp(ftc / 0.14, 0, 1));
            drawGreenLabel(gfx, gfy, "EXPLOITABILITY CONFIRMED", "dot", ftc, da);
          }
        }
      } else {
        // STAGE 1 (default) — probe → midpoint → FOUND host on the sphere.
        const rc = localT;
        let dp = 0;
        let da = 0;
        if (rc >= 0 && rc < TR) {
          dp = ease(rc / TR);
          da = 1;
        } else if (rc >= TR && rc < TR + HD) {
          dp = 1;
          da = 1;
        } else if (rc >= TR + HD && rc < TR + HD + FD) {
          dp = 1;
          da = 1 - (rc - TR - HD) / FD;
        }
        da *= stageAlpha;
        if (da > 0) {
          const t0 = L.targets[0];
          const mx = (srcX + t0.x) / 2;
          const my = (srcY + t0.y) / 2;
          drawProbe(
            cpx,
            cpy,
            X(srcX + (mx - srcX) * dp),
            Y(srcY + (my - srcY) * dp),
            da,
          );
        }
        drawFoundCallout(da, rc >= TR ? rc - TR : -1, loopN);
      }
      drawCard(intro, stage);
    };

    // Self-heal the backing store: a GPU context loss (integrated GPUs,
    // display/resolution changes, driver resets — screen/machine dependent and
    // intermittent) blanks the canvas bitmap, and on the static reduced-motion
    // path nothing repaints it. Re-render on restore / tab re-show. resize()
    // re-applies the DPR transform a restored context drops.
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

    if (reduce) {
      render();
      return () => {
        detachHeal();
        ro.disconnect();
        canvas.removeEventListener("click", onClick);
        canvas.removeEventListener("mousemove", onMove);
      };
    }

    const tick = () => {
      time += (gsap.ticker.deltaRatio(60) * (1000 / 60)) / 1000;
      render();
    };

    const gctx = gsap.context(() => {
      let running = false;
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting && !running) {
            running = true;
            gsap.ticker.add(tick);
          } else if (!e.isIntersecting && running) {
            running = false;
            gsap.ticker.remove(tick);
          }
        },
        { threshold: 0 },
      );
      io.observe(root);
      return () => {
        io.disconnect();
        gsap.ticker.remove(tick);
      };
    }, root);

    return () => {
      detachHeal();
      ro.disconnect();
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousemove", onMove);
      gctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="An operator query fanning out to a planetary digital twin of the estate, surfacing a found host"
      className="relative h-full w-full"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
