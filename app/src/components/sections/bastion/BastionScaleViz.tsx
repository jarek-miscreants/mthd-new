"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { getMonoFontFamily } from "@/lib/canvasMono";

/**
 * Bastion "Map at Planetary Scale" — orbital-system visualization
 * (Figma 858:264 storyboard; node + label assets 865:317 / 860:265).
 *
 * A dotted planet (the estate's digital twin) ringed by tilted orbits. Small +
 * large "Bastion" icons drift along the orbits, and every asset type shows at
 * once: plain dots and external-source logos share the orbits. Each Bastion
 * icon fans connectors to several of them; one at a time a Bastion icon also
 * emits a query callout — a connector reaches out to a big thin hexagon that
 * types a lisp-like operation label, holds, then fades and moves on.
 *
 * Ambient: no interaction. All-canvas (planet + orbits + icons + connectors +
 * typewriter) so the connectors track the moving icons. Gated on visibility.
 */

// Operation labels typed beside the hexagon — multi-line, continuation lines
// indented to align after ":OPx " exactly like the Figma asset.
const OPS: string[][] = [
  [":OP2 (NOT (REFLECT-01", "           :ARG0 (MIRROR :MOD ALL)", "           :ARG1 I)))"],
  [":OP7 (MAP (ASSET", "           :SUBNET 10.4.0.0/16)", "           :DEPTH FULL)"],
  [":OP3 (RESOLVE (HOST", "               :DNS edge-04)", "               :TRUST VERIFIED)"],
  [":OP9 (SCAN (RANGE", "            :PORTS 0-1024)", "            :MODE PASSIVE)"],
  [":OP5 (LINK (TWIN", "            :NODE k-19)", "            :REL ADJACENT)"],
  [":OP1 (ENUM (IDENTITY", "            :REALM corp)", "            :SCOPE ALL)"],
];


// ---- Exact Figma paths (built inside the effect — Path2D is client-only) ---
// Node glyph: hexagonal-ring Method mark (even-odd → hex donut). 865:317.
const GLYPH_D =
  "M27.6637 286.457C27.7577 286.294 27.7577 286.094 27.6637 285.931L23.9224 279.443C23.8284 279.28 23.6545 279.18 23.4665 279.18H15.9676C15.7797 279.18 15.6058 279.28 15.5118 279.443L11.7697 285.931C11.6757 286.094 11.6757 286.294 11.7697 286.457L15.5118 292.945C15.6058 293.108 15.7797 293.208 15.9676 293.208H23.4672C23.6552 293.208 23.8291 293.108 23.9231 292.945L27.6651 286.457H27.6637Z" +
  "M19.892 291.148C19.7833 291.21 19.6501 291.21 19.5414 291.148L15.516 288.824C15.4073 288.761 15.3407 288.646 15.3407 288.52V283.868C15.3407 283.742 15.4073 283.627 15.516 283.564L19.5414 281.24C19.6501 281.178 19.7833 281.178 19.892 281.24L23.9174 283.564C24.0261 283.627 24.0928 283.742 24.0928 283.868V288.52C24.0928 288.646 24.0261 288.761 23.9174 288.824L19.892 291.148Z";
const GLYPH_CX = 19.717;
const GLYPH_CY = 286.194;
const GLYPH_W = 15.895;

// Label head: big thin rounded hexagon (pointy left/right). 865:317.
const HEX_D =
  "M231.012 18.25L221.486 1.75C220.95 0.822 219.959 0.25 218.888 0.25H199.835C198.763 0.25 197.773 0.822 197.237 1.75L187.711 18.25C187.175 19.178 187.175 20.322 187.711 21.25L197.237 37.75C197.773 38.678 198.764 39.25 199.835 39.25H218.888C219.96 39.25 220.95 38.678 221.486 37.75L231.012 21.25C231.548 20.322 231.548 19.178 231.012 18.25Z";
const HEX_CX = 209.63;
const HEX_CY = 19.75;
const HEX_HALF = 21.9; // centre → left/right vertex

// ---- Orbit geometry -----------------------------------------------------
const ORBITS = [0.52, 0.76, 1.0];
const SQUASH = 0.34;
const ROT = -0.12;

// Same speed + half-orbit (π) phase offset keeps the two big icons on
// opposite sides of the system, so they never bunch together.
const BIG = [
  { o: 1, t0: 0.6, spd: 0.11 },
  { o: 2, t0: 0.6 + Math.PI, spd: 0.11 },
];
const SMALL = [
  { o: 0, t0: 0.3, spd: 0.22 },
  { o: 0, t0: 3.1, spd: 0.22 },
  { o: 1, t0: 1.7, spd: 0.16 },
  { o: 1, t0: 4.9, spd: 0.16 },
  { o: 2, t0: 0.8, spd: 0.12 },
  { o: 2, t0: 2.6, spd: 0.12 },
  { o: 2, t0: 5.0, spd: 0.12 },
];
const LINKS_PER_BIG = 3;

// External data-source logos on white discs (Figma frame 853:3065). Torq's
// render has a proportionally larger disc, so it's drawn a touch smaller to
// match the others.
const SOURCE_FILES = ["aws.svg", "splunk.svg", "tenable.svg", "torq.png"];
const SOURCE_SCALE = [1, 1, 1, 0.86];
// Mix asset types across the orbits: some smalls render as a source logo
// (index into SOURCE_FILES) and the rest as plain dots (-1), so a single
// graphic carries every icon type at once.
const SMALL_SRC = [-1, 0, 1, -1, 2, -1, 3];

// ---- Planet -------------------------------------------------------------
const PLANET_DOTS = (() => {
  const pts: { x: number; y: number; z: number }[] = [];
  const LAT = 22;
  const LONG = 44;
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
const PLANET_TILT = -0.52;
const PT = Math.cos(PLANET_TILT);
const PS = Math.sin(PLANET_TILT);
const PLANET_SPIN = 0.32; // rad/s — calm but visible globe rotation (~20s/rev)
const LIGHT = (() => {
  const v = [-0.55, 0.68, 0.5];
  const m = Math.hypot(...v);
  return [v[0] / m, v[1] / m, v[2] / m];
})();

interface Label {
  big: number;
  born: number;
  lines: string[];
  chars: number;
}

const POP = 0.4; // connector grows + hexagon fades in
const CPS = 0.024;
const HOLD = 2.4;
const FADE = 0.7;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function BastionScaleViz() {
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

    const glyphPath = new Path2D(GLYPH_D);
    const hexPath = new Path2D(HEX_D);

    const sourceImgs = SOURCE_FILES.map((f) => {
      const im = new Image();
      im.src = `/products/bastion/sources/${f}`;
      return im;
    });

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let time = 0;
    const cosR = Math.cos(ROT);
    const sinR = Math.sin(ROT);

    let links: number[][] = [];
    // Initial full assignment: each big claims its own smalls (no sharing).
    const retarget = () => {
      const used = new Set<number>();
      links = BIG.map(() => {
        const order = SMALL.map((_, i) => i)
          .filter((i) => !used.has(i))
          .sort(() => Math.random() - 0.5)
          .slice(0, LINKS_PER_BIG);
        order.forEach((i) => used.add(i));
        return order;
      });
    };
    retarget();

    // Migrate one big's links at a time on a stagger, so the connectors are
    // always visibly changing — reaching out to new smalls it doesn't already
    // share with the other big.
    const bigRetargetAt = BIG.map((_, i) => 1.2 + i * 1.2);
    const retargetBig = (bi: number) => {
      const used = new Set<number>();
      links.forEach((l, i) => {
        if (i !== bi) l.forEach((s) => used.add(s));
      });
      links[bi] = SMALL.map((_, i) => i)
        .filter((i) => !used.has(i))
        .sort(() => Math.random() - 0.5)
        .slice(0, LINKS_PER_BIG);
    };

    const labels: Label[] = [];
    let labelAt = 1.0;

    const posOf = (o: number, t0: number, spd: number, maxA: number) => {
      const ang = t0 + spd * time;
      const A = maxA * ORBITS[o];
      const B = A * SQUASH;
      const ex = A * Math.cos(ang);
      const ey = B * Math.sin(ang);
      return {
        x: ex * cosR - ey * sinR,
        y: ex * sinR + ey * cosR,
        depth: Math.sin(ang),
      };
    };

    // Place an exact path centred at (x,y), scaled, optionally fill/stroke.
    const drawPath = (
      path: Path2D,
      ncx: number,
      ncy: number,
      x: number,
      y: number,
      s: number,
      fill: string | null,
      stroke: string | null,
      lw: number,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.translate(-ncx, -ncy);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill(path, "evenodd");
      }
      if (stroke) {
        ctx.lineWidth = lw / s;
        ctx.strokeStyle = stroke;
        ctx.stroke(path);
      }
      ctx.restore();
    };

    const drawSmall = (x: number, y: number, depth: number) => {
      const f = (depth + 1) / 2;
      const a = 0.4 + f * 0.5;
      const R = 7.5 + f * 4.5;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fillStyle = "#141414";
      ctx.fill();
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = `rgba(150,150,150,${a})`;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, R * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,210,210,${a})`;
      ctx.fill();
    };

    // A source logo on a white disc, sized + faded by orbital depth.
    const drawSource = (
      x: number,
      y: number,
      depth: number,
      img: HTMLImageElement,
      scale: number,
    ) => {
      if (!img.complete || img.naturalWidth === 0) {
        drawSmall(x, y, depth);
        return;
      }
      const f = (depth + 1) / 2;
      const D = (33 + f * 19) * scale;
      ctx.save();
      ctx.globalAlpha = 0.6 + f * 0.4;
      ctx.drawImage(img, x - D / 2, y - D / 2, D, D);
      ctx.restore();
    };

    const drawBig = (x: number, y: number, depth: number, lit: number) => {
      const f = (depth + 1) / 2;
      const a = 0.65 + f * 0.35;
      const R = (16 + f * 10) * (1 + lit * 0.08);
      // Soft white drop-shadow halo — same glow form as the avatar in the
      // "Create a continuous… inventory" viz (blur ≈ 0.73·r, nudged downward),
      // rather than a symmetric radial gradient.
      ctx.save();
      ctx.shadowColor = `rgba(255,255,255,${(0.3 + lit * 0.2) * (0.7 + 0.3 * f)})`;
      ctx.shadowBlur = R * 0.73;
      ctx.shadowOffsetY = R * 0.17;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `rgba(150,150,150,${a})`;
      ctx.stroke();
      // hexagonal-ring glyph
      drawPath(glyphPath, GLYPH_CX, GLYPH_CY, x, y, (R * 1.13) / GLYPH_W, `rgba(255,255,255,${a})`, null, 0);
    };

    const drawPlanet = (cx: number, cy: number, R: number) => {
      const bg = ctx.createLinearGradient(0, cy - R * 0.1, 0, cy + R * 1.5);
      bg.addColorStop(0, "rgba(0,0,0,0.45)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 0.55, R * 1.05, R * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();

      const sg = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.5, R * 0.1, cx, cy, R * 1.15);
      sg.addColorStop(0, "#3a3a3a");
      sg.addColorStop(0.55, "#141414");
      sg.addColorStop(1, "#070707");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();

      const spin = time * PLANET_SPIN;
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      for (const p of PLANET_DOTS) {
        // spin about the planet's vertical axis (x-z plane), then apply tilt
        const px = p.x * cs - p.z * sn;
        const pz = p.x * sn + p.z * cs;
        const ry = p.y * PT - pz * PS;
        const rz = p.y * PS + pz * PT;
        if (rz <= 0.02) continue;
        const sx = cx + px * R;
        const sy = cy - ry * R;
        const bright = px * LIGHT[0] + ry * LIGHT[1] + rz * LIGHT[2];
        const b = Math.max(0, Math.min(1, bright));
        // Per-dot twinkle: each dot pulses brightness + size on its own phase,
        // derived from its (static) position so the surface shimmers calmly.
        const phase = (p.x + 1) * 5.1 + (p.y + 1) * 8.7 + (p.z + 1) * 3.3;
        const tw = 0.62 + 0.38 * Math.sin(time * 1.9 + phase);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.7 + 0.45 * tw, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(0.08 + b * 0.85) * (0.55 + 0.45 * tw)})`;
        ctx.fill();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.46;
      // Orbit radius is driven by width, but the squashed ellipse must still
      // fit the (often much shorter) canvas height — otherwise the top/bottom
      // icons + their glow clip off on wide screens. Cap maxA so the outer
      // orbit's vertical extent plus an icon-glow margin stays inside.
      const ICON_MARGIN = 72;
      const vBudget = Math.min(cy, h - cy) - ICON_MARGIN;
      const maxA = Math.min(w * 0.42, vBudget / SQUASH);
      const planetR = Math.min(w * 0.085, h * 0.2);

      ctx.lineWidth = 1;
      for (const o of ORBITS) {
        const A = maxA * o;
        ctx.beginPath();
        ctx.ellipse(cx, cy, A, A * SQUASH, ROT, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(190,190,190,0.42)";
        ctx.stroke();
      }

      const bigPos = BIG.map((b) => {
        const p = posOf(b.o, b.t0, b.spd, maxA);
        return { x: cx + p.x, y: cy + p.y, depth: p.depth };
      });
      const smallPos = SMALL.map((s) => {
        const p = posOf(s.o, s.t0, s.spd, maxA);
        return { x: cx + p.x, y: cy + p.y, depth: p.depth };
      });

      const litBig = new Set(labels.map((l) => l.big));
      // Every small is either a plain dot or a source logo (SMALL_SRC), so the
      // one graphic carries all asset types at once.
      const drawNode = (p: { x: number; y: number; depth: number }, i: number) => {
        const src = SMALL_SRC[i % SMALL_SRC.length];
        if (src >= 0) drawSource(p.x, p.y, p.depth, sourceImgs[src], SOURCE_SCALE[src]);
        else drawSmall(p.x, p.y, p.depth);
      };

      smallPos.forEach((p, i) => p.depth < 0 && drawNode(p, i));
      bigPos.forEach((p, i) => p.depth < 0 && drawBig(p.x, p.y, p.depth, litBig.has(i) ? 1 : 0));

      drawPlanet(cx, cy, planetR);

      // Fan connectors from each big to its own (non-shared) smalls. Faint
      // exploratory links that reshuffle, brightening only while that big icon
      // is actively querying (hot).
      bigPos.forEach((bp, bi) => {
        const hot = litBig.has(bi);
        for (const si of links[bi]) {
          const sp = smallPos[si];
          ctx.beginPath();
          ctx.moveTo(bp.x, bp.y);
          ctx.lineTo(sp.x, sp.y);
          ctx.strokeStyle = `rgba(204,204,204,${hot ? 0.45 : 0.26})`;
          ctx.lineWidth = hot ? 0.9 : 0.68;
          ctx.stroke();
        }
      });

      smallPos.forEach((p, i) => p.depth >= 0 && drawNode(p, i));
      bigPos.forEach((p, i) => p.depth >= 0 && drawBig(p.x, p.y, p.depth, litBig.has(i) ? 1 : 0));

      // query callouts: connector → big thin hexagon → typewriter label
      for (const l of labels) {
        const age = time - l.born;
        const typeDur = l.chars * CPS;
        const fadeStart = POP + typeDur + HOLD;
        // Fade in, hold, then fade out after the hold.
        const a = clamp(
          Math.min(age / POP, age > fadeStart ? 1 - (age - fadeStart) / FADE : 1),
          0,
          1,
        );
        if (a <= 0) continue;

        const bp = bigPos[l.big];
        const dir = bp.x < cx ? 1 : -1;
        const hx = clamp(bp.x + dir * w * 0.13, w * 0.17, w * 0.74);
        const hy = clamp(bp.y - h * 0.4, h * 0.16, h * 0.55);
        const nearVx = bp.x < hx ? hx - HEX_HALF : hx + HEX_HALF;

        const prog = Math.min(1, age / POP);
        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y);
        ctx.lineTo(bp.x + (nearVx - bp.x) * prog, bp.y + (hy - bp.y) * prog);
        ctx.strokeStyle = `rgba(204,204,204,${a * 0.6})`;
        ctx.lineWidth = 0.85;
        ctx.stroke();

        if (age < POP * 0.5) continue;
        drawPath(hexPath, HEX_CX, HEX_CY, hx, hy, 1, null, `rgba(204,204,204,${a})`, 1);

        const typed = Math.max(0, Math.min(l.chars, Math.floor((age - POP) / CPS)));
        const typing = typed < l.chars;
        ctx.font = `13px ${MONO}`;
        if ("letterSpacing" in ctx) {
          (ctx as unknown as { letterSpacing: string }).letterSpacing = "0.075rem";
        }
        ctx.textBaseline = "middle";
        // Always left-align so the indented continuation lines read correctly
        // (continuation lines align under the inner s-expression).
        ctx.textAlign = "left";
        ctx.fillStyle = `rgba(204,204,204,${a})`;
        // Start the label just left of the hexagon centre so it overlaps it,
        // then flows right.
        const tx = hx - HEX_HALF * 0.3;
        const lineH = 15;
        const y0 = hy - lineH;
        let rem = typed;
        for (let li = 0; li < l.lines.length; li++) {
          const ln = l.lines[li];
          const n = Math.max(0, Math.min(ln.length, rem));
          let s = ln.slice(0, n);
          if (typing && rem > 0 && rem <= ln.length && n === rem) s += "▋";
          if (s) ctx.fillText(s, tx, y0 + li * lineH);
          rem -= ln.length;
          if (rem <= 0) break;
        }
      }

      for (let i = labels.length - 1; i >= 0; i--) {
        const l = labels[i];
        const end = POP + l.chars * CPS + HOLD + FADE;
        if (time - l.born > end) labels.splice(i, 1);
      }

      // Migrate one big's links at a time on a short stagger so connectors
      // change often.
      for (let bi = 0; bi < BIG.length; bi++) {
        if (time >= bigRetargetAt[bi]) {
          retargetBig(bi);
          bigRetargetAt[bi] = time + 1.8 + Math.random() * 1.2;
        }
      }

      // A single callout at a time, moving between the bigs: a connector reaches
      // out to a hexagon that types an operation, holds, fades, then re-cycles.
      if (time >= labelAt && labels.length < 1) {
        const busy = new Set(labels.map((l) => l.big));
        const free = BIG.map((_, i) => i).filter((i) => !busy.has(i));
        if (free.length) {
          const bi = free[(Math.random() * free.length) | 0];
          const lines = OPS[(Math.random() * OPS.length) | 0];
          labels.push({
            big: bi,
            born: time,
            lines,
            chars: lines.reduce((s, ln) => s + ln.length, 0),
          });
        }
        labelAt = time + 3.2 + Math.random() * 1.8;
      }
    };

    // Self-heal the backing store. The canvas bitmap can be blanked by a GPU
    // context loss (integrated GPUs, display/resolution changes, driver resets
    // — screen/machine dependent and intermittent), and the static
    // reduced-motion frame can be drawn before the vendor logos finish
    // loading. Repaint on any of those. resize() re-applies the DPR transform
    // that a restored context drops.
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
    sourceImgs.forEach((im) => im.addEventListener("load", heal));
    const detachHeal = () => {
      canvas.removeEventListener("contextlost", onContextLost);
      canvas.removeEventListener("contextrestored", heal);
      document.removeEventListener("visibilitychange", onVisible);
      sourceImgs.forEach((im) => im.removeEventListener("load", heal));
    };

    if (reduce) {
      render();
      return () => {
        detachHeal();
        ro.disconnect();
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
      gctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="A planetary digital twin of the estate, ringed by orbits of assets that Bastion connects to and queries"
      className="relative h-full w-full"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
