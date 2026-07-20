"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { REAPER_GLYPH_D } from "@/components/sections/reaper/ReaperMissionViz";

// Layout effect on the client (set hidden state before paint), plain effect on
// the server to avoid the SSR warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// How long the flow graph waits after an agent is chosen, so the roster
// selection animation plays first and then the flow builds.
const FLOW_DELAY = 1.2;

/**
 * Reaper "How it works" — Custom agents tab visualization (storyboard
 * custom-agents-motion.svg).
 *
 * LEFT (built here): a "choose your character" roster. The selected agent
 * stands large on a glowing pedestal; the rest sit as smaller chips in a row.
 * Selecting an agent (via the bottom secondary tabs, or a chip) flies it onto
 * the pedestal and grows it while the previous pick shrinks back into the row
 * — a FLIP move driven by GSAP. Below, a spec sheet swaps to the selected
 * agent's configuration.
 *
 * RIGHT: the agent's tool-chain flowchart — built in a follow-up step.
 *
 * Geometry (disc/pedestal/row positions, agent glyph paths) is lifted from the
 * storyboard export and rendered in its native coordinate space.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;
const RBASE = 38.5; // showcase disc radius (storyboard); row scales down from it
const SHOWCASE: Pt3 = { x: 191, y: 127.5, s: 1 };
const ROW_Y = 127.7;
const ROW_S = 20.7 / RBASE;
const ROW_X = [291, 351]; // slots for the non-selected agents, left→right

type Pt3 = { x: number; y: number; s: number };

interface Agent {
  name: string;
  /** glyph path + its centre in storyboard coords + scale to reach RBASE */
  glyph: string;
  gx: number;
  gy: number;
  gs: number;
  specs: [string, string][];
}

const AGENTS: Agent[] = [
  {
    name: "Adversary",
    // Reaper product symbol (67×57 viewBox)
    glyph: REAPER_GLYPH_D,
    gx: 33.2,
    gy: 28.5,
    gs: 22 / 33.5,
    specs: [
      ["Data type", "Credentials, session tokens"],
      ["Collaborators", "Pathfinder, Data Analyst"],
      ["Policies", "No destructive actions"],
      ["Underlying model", "Opus 4.7"],
      ["Approval level", "Human-in-the-loop"],
    ],
  },
  {
    name: "Pathfinder",
    // hex "scope" glyph (storyboard chip @291)
    glyph:
      "M301.718 127.49L296.71 118.816C296.585 118.599 296.352 118.465 296.101 118.465H286.086C285.835 118.465 285.602 118.599 285.476 118.816L280.469 127.49C280.344 127.708 280.344 127.976 280.469 128.193L285.476 136.867C285.602 137.085 285.835 137.219 286.086 137.219H296.101C296.352 137.219 296.585 137.085 296.71 136.867L301.718 128.193C301.843 127.976 301.843 127.708 301.718 127.49ZM300.309 128.231L291.447 133.36C291.23 133.485 290.961 133.486 290.743 133.36L281.879 128.231C281.567 128.05 281.567 127.599 281.88 127.419L290.744 122.323C290.961 122.198 291.228 122.198 291.445 122.323L300.308 127.419C300.621 127.599 300.621 128.05 300.309 128.231Z",
    gx: 291.1,
    gy: 127.8,
    gs: 22 / 10.65,
    specs: [
      ["Data type", "Network maps, routing tables"],
      ["Sub-Agents", "Recon agent"],
      ["Policies", "Read-only, no writes"],
      ["Underlying model", "Opus 4.7"],
      ["Approval level", "Operator Approval Required"],
    ],
  },
  {
    name: "Data Analyst",
    // hex "cube" glyph (storyboard chip @461)
    glyph:
      "M468.876 127.812C468.96 127.667 468.96 127.489 468.876 127.344L465.542 121.561C465.458 121.416 465.303 121.327 465.136 121.327H458.453C458.285 121.327 458.13 121.416 458.046 121.561L454.711 127.344C454.627 127.489 454.627 127.667 454.711 127.812L458.046 133.595C458.13 133.74 458.285 133.829 458.453 133.829H465.136C465.304 133.829 465.459 133.74 465.543 133.595L468.878 127.812H468.876ZM461.95 131.993C461.853 132.049 461.734 132.049 461.637 131.993L458.05 129.922C457.953 129.866 457.894 129.763 457.894 129.651V125.505C457.894 125.393 457.953 125.29 458.05 125.234L461.637 123.163C461.734 123.107 461.853 123.107 461.95 123.163L465.538 125.234C465.634 125.29 465.694 125.393 465.694 125.505V129.651C465.694 129.763 465.634 129.866 465.538 129.922L461.95 131.993Z",
    gx: 461.7,
    gy: 127.6,
    gs: 22 / 7.15,
    specs: [
      ["Data type", "Logs, passwords, Confluence pages"],
      ["Collaborators", "Adversary agent"],
      ["Policies", "No outbound comms"],
      ["Underlying model", "Opus 4.7"],
      ["Approval level", "Semi-autonomous"],
    ],
  },
];

// ---- Right-side tool-chain flowchart --------------------------------------
// Per-agent flows from the same vocabulary (lead agent → curved connectors →
// tool squares + sub-agent nodes) so they stay visually similar while differing
// in shape. Connectors are smooth bezier swoops, drawn left→right.

const FLOW_VB = "0 0 392 204";
const LEAD_R = 18.7;
const LEAD_AT = { x: 44, y: 130 };

interface FNode {
  id: string;
  x: number;
  y: number;
  kind: "sq" | "sub" | "spark";
}
// An optional third element flags the edge to draw in reverse (end→start), so
// a connector can animate *toward* its source node instead of away from it.
interface Flow {
  nodes: FNode[];
  edges: [string, string, boolean?][];
}

const FLOWS: Flow[] = [
  {
    // Adversary — a long climbing spine with a low branch
    nodes: [
      { id: "a", x: 110, y: 142, kind: "sq" },
      { id: "b", x: 162, y: 96, kind: "sq" },
      { id: "c", x: 232, y: 72, kind: "sq" },
      { id: "d", x: 300, y: 52, kind: "sub" },
      { id: "e", x: 262, y: 146, kind: "sq" },
      { id: "f", x: 336, y: 118, kind: "sq" },
    ],
    edges: [
      ["L", "a"],
      ["a", "b"],
      ["b", "c"],
      ["c", "d"],
      ["b", "e"],
      ["e", "f"],
    ],
  },
  {
    // Pathfinder — a climbing spine to the top-right (a→b→c→e→f), a low spark
    // leaf hanging off the middle (c→g), and an incoming sub-agent branch that
    // feeds the spine from the upper-left (h→d→b). Geometry mapped from the
    // storyboard pathfinder-flow export, anchored to the persistent lead.
    nodes: [
      { id: "a", x: 103, y: 130, kind: "sq" },
      { id: "b", x: 175, y: 108, kind: "sq" },
      { id: "c", x: 243, y: 82, kind: "sq" },
      { id: "d", x: 132, y: 86, kind: "sq" },
      { id: "e", x: 298, y: 119, kind: "sq" },
      { id: "f", x: 361, y: 62, kind: "sq" },
      { id: "g", x: 294, y: 146, kind: "spark" },
      { id: "h", x: 81, y: 53, kind: "sub" },
    ],
    edges: [
      ["L", "a"],
      ["a", "b"],
      ["b", "c"],
      ["c", "e"],
      ["e", "f"],
      ["c", "g"],
      // Incoming sub-agent branch — drawn in reverse so it animates toward the
      // hex icon (b → d → h) rather than out of it.
      ["d", "b", true],
      ["h", "d", true],
    ],
  },
  {
    // Data Analyst — two streams split off the entry node and re-converge into
    // a single node (a diamond/merge, unique to this agent: it aggregates
    // rather than fans out), then the merged node forks to a rising sub-agent
    // leaf and a low one.
    nodes: [
      { id: "a", x: 108, y: 130, kind: "sq" },
      { id: "b", x: 168, y: 92, kind: "sq" },
      { id: "c", x: 168, y: 168, kind: "sq" },
      { id: "d", x: 236, y: 130, kind: "sq" },
      { id: "e", x: 300, y: 100, kind: "sq" },
      { id: "f", x: 348, y: 70, kind: "sub" },
      { id: "g", x: 330, y: 168, kind: "sub" },
    ],
    edges: [
      ["L", "a"],
      ["a", "b"],
      ["a", "c"],
      ["b", "d"],
      ["c", "d"],
      ["d", "e"],
      ["e", "f"],
      ["d", "g"],
    ],
  },
];

// Smooth horizontal-flow bezier between two points (gentle S-swoop).
function flowCurve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const k = Math.max(26, Math.abs(b.x - a.x) * 0.55);
  return `M ${a.x} ${a.y} C ${r2(a.x + k)} ${a.y}, ${r2(b.x - k)} ${b.y}, ${b.x} ${b.y}`;
}

const hexPoints = (r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const ang = (Math.PI / 3) * k + Math.PI / 6;
    return `${r2(r * Math.cos(ang))},${r2(r * Math.sin(ang))}`;
  }).join(" ");

const SUB_R = 13.5;

// 8-pointed sparkle (alternating outer/inner radii) for the storyboard's
// asterisk node. Built in the same local-origin convention as the hex sub-node.
const sparkPoints = (ro: number, ri: number) =>
  Array.from({ length: 16 }, (_, k) => {
    const ang = (Math.PI / 8) * k;
    const r = k % 2 === 0 ? ro : ri;
    return `${r2(r * Math.cos(ang))},${r2(r * Math.sin(ang))}`;
  }).join(" ");

// Drawn centred at the local origin (0,0); the caller translates it into place
// so GSAP can scale it about its own centre without leaving an offset.
function FlowSubNode() {
  return (
    <>
      <circle r={SUB_R} fill="#0a0a0a" stroke="#808080" strokeOpacity={0.5} strokeWidth={0.5} />
      <polygon points={hexPoints(7.4)} fill="#808080" />
      <polygon points={hexPoints(3.6)} fill="#0a0a0a" />
    </>
  );
}

function FlowSparkNode() {
  return (
    <>
      <circle r={SUB_R} fill="#0a0a0a" stroke="#808080" strokeOpacity={0.5} strokeWidth={0.5} />
      <polygon points={sparkPoints(7.6, 2.1)} fill="#808080" />
    </>
  );
}

function Flowchart({
  active,
  className = "",
}: {
  active: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const flowRef = useRef<SVGGElement | null>(null);
  const leadInner = useRef<SVGGElement | null>(null);
  const lead = AGENTS[active] ?? AGENTS[0];
  const leadGs = lead.gs * ((LEAD_R * 0.58) / 22);
  const flow = FLOWS[active] ?? FLOWS[0];
  // Connectors run node-centre → node-centre: the opaque node sits centred on
  // the line (it hides the crossing), so every square reads as being on the
  // line. The left/right port dots mark the connection sides.
  const posOf = (nid: string) =>
    nid === "L" ? LEAD_AT : flow.nodes.find((n) => n.id === nid) ?? LEAD_AT;

  // Rebuild on each agent change: after FLOW_DELAY (so the roster selection
  // animates first), the lead pops, connectors draw in, then nodes pop. Layout
  // effect sets the hidden start state before paint so nothing flashes during
  // the delay.
  useIsoLayoutEffect(() => {
    const root = flowRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const edges = root.querySelectorAll<SVGPathElement>("[data-edge]");
      const nodes = root.querySelectorAll<SVGGElement>("[data-fnode]");
      if (leadInner.current) {
        gsap.fromTo(
          leadInner.current,
          { scale: reduced ? 1 : 0.55, opacity: reduced ? 1 : 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
            transformOrigin: "0px 0px",
            delay: reduced ? 0 : FLOW_DELAY,
          },
        );
      }
      if (reduced) return;
      edges.forEach((e) => {
        const len = e.getTotalLength();
        // Reversed edges start with a negative offset so the dash reveals from
        // the path end; both directions still animate to 0 (fully drawn).
        // Held at opacity 0 until the draw starts: at offset === length the
        // round line-cap can otherwise paint a 1px nub at the path origin.
        const rev = e.getAttribute("data-rev") === "1";
        gsap.set(e, { strokeDasharray: len, strokeDashoffset: rev ? -len : len, opacity: 0 });
      });
      gsap.to(edges, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        delay: FLOW_DELAY + 0.15,
      });
      gsap.fromTo(
        nodes,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(2)",
          stagger: 0.07,
          delay: FLOW_DELAY + 0.28,
          transformOrigin: "0px 0px",
        },
      );
    }, root);
    return () => ctx.revert();
  }, [active]);

  return (
    <div className={className}>
      <svg
        viewBox={FLOW_VB}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label="The selected agent's tool-chain flow: connectors branching out to tools and sub-agents"
      >
        <defs>
          <filter id={`${id}-lead-glow`} x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="4" stdDeviation="3.8" floodColor="#ffffff" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Flow — rebuilt per agent (keyed). */}
        <g ref={flowRef} key={active}>
          {flow.edges.map((e, i) => (
            <path
              key={i}
              data-edge
              data-rev={e[2] ? "1" : undefined}
              d={flowCurve(posOf(e[0]), posOf(e[1]))}
              fill="none"
              stroke="#808080"
              strokeOpacity={0.7}
              strokeWidth={1}
              strokeLinecap="round"
            />
          ))}
          {flow.nodes.map((n) => (
            // Outer group positions the node; inner [data-fnode] holds the
            // centred-at-origin content so the pop scales about its own centre.
            <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
              <g data-fnode>
                {n.kind === "sq" ? (
                  <>
                    <rect x={-8} y={-8} width={16} height={16} rx={2} fill="#808080" />
                    {/* connection ports (left/right) */}
                    <circle cx={-8} cy={0} r={1.68} fill="#808080" />
                    <circle cx={8} cy={0} r={1.68} fill="#808080" />
                  </>
                ) : n.kind === "spark" ? (
                  <FlowSparkNode />
                ) : (
                  <FlowSubNode />
                )}
              </g>
            </g>
          ))}
        </g>

        {/* Lead agent — persistent; adopts the selected agent's glyph. */}
        <g transform={`translate(${LEAD_AT.x} ${LEAD_AT.y})`}>
          <g ref={leadInner}>
            <circle
              r={LEAD_R}
              fill="#0a0a0a"
              stroke="#808080"
              strokeWidth={0.5}
              filter={`url(#${id}-lead-glow)`}
            />
            <path
              d={lead.glyph}
              transform={`scale(${r2(leadGs)}) translate(${-lead.gx} ${-lead.gy})`}
              fill="#ffffff"
              style={{ transition: "fill 0.3s ease" }}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

// Glowing pedestal beam beneath the showcase agent (storyboard pill paths).
const PEDESTAL_FILL =
  "M191 194C227.451 194 257 187.873 257 180.316V89H125V180.316C125 187.873 154.549 194 191 194Z";
const PEDESTAL_RIM =
  "M191 167.5C209.202 167.5 225.668 169.01 237.569 171.444C243.524 172.662 248.31 174.106 251.596 175.695C253.24 176.49 254.481 177.309 255.306 178.133C256.129 178.955 256.5 179.746 256.5 180.5C256.5 181.254 256.129 182.045 255.306 182.867C254.481 183.691 253.24 184.51 251.596 185.305C248.31 186.894 243.524 188.338 237.569 189.556C225.668 191.99 209.202 193.5 191 193.5C172.798 193.5 156.332 191.99 144.431 189.556C138.476 188.338 133.69 186.894 130.404 185.305C128.76 184.51 127.519 183.691 126.694 182.867C125.871 182.045 125.5 181.254 125.5 180.5C125.5 179.746 125.871 178.955 126.694 178.133C127.519 177.309 128.76 176.49 130.404 175.695C133.69 174.106 138.476 172.662 144.431 171.444C156.332 169.01 172.798 167.5 191 167.5Z";

function targetFor(i: number, active: number): Pt3 {
  if (i === active) return SHOWCASE;
  let rowIdx = 0;
  for (let k = 0; k < i; k++) if (k !== active) rowIdx++;
  return { x: ROW_X[rowIdx] ?? ROW_X[ROW_X.length - 1], y: ROW_Y, s: ROW_S };
}

const tfm = (t: Pt3) => `translate(${t.x} ${t.y}) scale(${t.s})`;

function AgentRoster({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (i: number) => void;
}) {
  const id = useId().replace(/:/g, "");
  const rootRef = useRef<SVGSVGElement>(null);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const pedestal = useRef<SVGGElement | null>(null);
  const glow = useRef<SVGFEDropShadowElement | null>(null);
  const pulse = useRef<(SVGGElement | null)[]>([]);
  const pedY = useRef({ op: 1 }); // pedestal fade proxy

  // Shared in-view gate: the ambient loops (glow orbit, agent breathing) only
  // run while the roster is on screen. Each loop registers itself here; one
  // IntersectionObserver plays/pauses them all. The pulse loop is re-created on
  // every selection change, so a Set keeps the membership current.
  const inView = useRef(false);
  const loops = useRef(new Set<gsap.core.Animation>());
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        loops.current.forEach((t) => (entry.isIntersecting ? t.play() : t.pause()));
      },
      { threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);
  // Constant initial selection so React never fights us for the transform.
  const initial = useRef(active).current;
  // Per-agent animated transform state (proxy objects tweened by GSAP, written
  // to the transform attribute on each frame — avoids GSAP's transform-origin
  // decomposition entirely, same approach as ReaperScaleViz's camera).
  const state = useRef(
    AGENTS.map((_, i) => {
      const t = targetFor(i, initial);
      return { x: t.x, y: t.y, s: t.s };
    }),
  );
  const first = useRef(true);

  // Continuously orbit the glow's offset so the bright crescent rotates around
  // the selected agent — subtle ambient motion. Skipped for reduced motion.
  useEffect(() => {
    const el = glow.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const R = 4.5;
    const a = { t: Math.PI / 2 }; // start at the spec's downward offset
    const tween = gsap.to(a, {
      t: Math.PI / 2 + Math.PI * 2,
      duration: 5,
      ease: "none",
      repeat: -1,
      paused: true,
      onUpdate: () => {
        el.setAttribute("dx", (R * Math.cos(a.t)).toFixed(2));
        el.setAttribute("dy", (R * Math.sin(a.t)).toFixed(2));
      },
    });
    loops.current.add(tween);
    if (inView.current) tween.play();
    return () => {
      loops.current.delete(tween);
      tween.kill();
    };
  }, []);

  // Selected agent gently breathes (scale 0.9↔1.1, ping-pong), scaling about
  // its disc centre so it pulses in place. Others rest at scale 1.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    pulse.current.forEach((g, i) => {
      if (!g) return;
      gsap.killTweensOf(g);
      if (i !== active || reduced) {
        g.setAttribute("transform", "scale(1)");
      }
    });
    const el = pulse.current[active];
    if (!el || reduced) return;
    const k = { v: 1 };
    const tween = gsap.fromTo(
      k,
      { v: 0.9 },
      {
        v: 1.1,
        duration: 1.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true,
        onUpdate: () => el.setAttribute("transform", `scale(${k.v.toFixed(4)})`),
      },
    );
    loops.current.add(tween);
    if (inView.current) tween.play();
    return () => {
      loops.current.delete(tween);
      tween.kill();
    };
  }, [active]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AGENTS.forEach((_, i) => {
      const el = groups.current[i];
      if (!el) return;
      const t = targetFor(i, active);
      gsap.to(state.current[i], {
        x: t.x,
        y: t.y,
        s: t.s,
        duration: reduced ? 0 : 1,
        ease: "power3.inOut",
        overwrite: "auto",
        onUpdate: () => el.setAttribute("transform", tfm(state.current[i])),
      });
    });

    // Pedestal "impact": the glow fades to 10% then back to full as the new
    // agent lands, emphasising the swap. Skip for reduced motion.
    const ped = pedestal.current;
    if (ped && !reduced) {
      const write = () => {
        ped.style.opacity = String(pedY.current.op);
      };
      gsap
        .timeline({ overwrite: "auto" })
        .to(pedY.current, { op: 0.3, duration: 0.45, ease: "power2.in", onUpdate: write })
        .to(pedY.current, { op: 1, duration: 1.0, ease: "power2.out", onUpdate: write });
    }
  }, [active]);

  return (
    <svg
      ref={rootRef}
      viewBox="118 84 268 118"
      preserveAspectRatio="xMidYMid meet"
      className="w-full"
      role="img"
      aria-label="Agent roster: the selected agent stands on a glowing pedestal, the others wait as chips"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="191" y1="127.15" x2="191" y2="194" gradientUnits="userSpaceOnUse">
          <stop stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="191" y1="194" x2="191" y2="167" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Selected-agent glow — SVG equivalent of
            box-shadow: 0 4px 7.6px 0 rgba(255,255,255,0.25).
            objectBoundingBox region so it follows the agent as it moves; the
            offset orbits (see effect) so the bright crescent rotates. */}
        <filter id={`${id}-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow
            ref={glow}
            dx="0"
            dy="4"
            stdDeviation="3.8"
            floodColor="#ffffff"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      {/* Pedestal — beneath the showcase; pulses in height on each swap. */}
      <g ref={pedestal}>
        <path d={PEDESTAL_FILL} fill={`url(#${id}-fill)`} />
        <path d={PEDESTAL_RIM} fill="none" stroke={`url(#${id}-rim)`} strokeWidth={0.75} />
      </g>

      {AGENTS.map((agent, i) => {
        const sel = i === active;
        return (
          <g
            key={agent.name}
            ref={(el) => {
              groups.current[i] = el;
            }}
            transform={tfm(targetFor(i, initial))}
            className="cursor-pointer"
            onClick={() => onSelect(i)}
            role="button"
            aria-label={`Select ${agent.name} agent`}
          >
            {/* Inner group breathes (scale, about the disc centre) when selected. */}
            <g
              ref={(el) => {
                pulse.current[i] = el;
              }}
            >
              {/* generous transparent hit target */}
              <circle r={RBASE} fill="transparent" />
              <circle
                r={RBASE}
                fill="#0a0a0a"
                stroke="#808080"
                strokeOpacity={sel ? 1 : 0.5}
                vectorEffect="non-scaling-stroke"
                strokeWidth={1}
                filter={sel ? `url(#${id}-glow)` : undefined}
                style={{ transition: "stroke-opacity 0.4s ease" }}
              />
              <path
                d={agent.glyph}
                transform={`scale(${agent.gs}) translate(${-agent.gx} ${-agent.gy})`}
                fill={sel ? "#ffffff" : "#808080"}
                style={{ transition: "fill 0.4s ease" }}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

// Labels are identical across agents, so the list structure is stable — only
// the values change. We keep the <dl> un-keyed (no remount) and let the effect
// own the value text so the typewriter reliably targets the live nodes.
const SPEC_LABELS = AGENTS[0].specs.map(([label]) => label);

function SpecSheet({ active }: { active: number }) {
  const vals = useRef<(HTMLElement | null)[]>([]);

  // Type the values out row by row (terminal-style) on each agent change, with
  // a block caret on the line currently being typed. Manual rAF typer for
  // precise control.
  useEffect(() => {
    const specs = AGENTS[active].specs;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      specs.forEach(([, value], i) => {
        const el = vals.current[i];
        if (el) el.textContent = value;
      });
      return;
    }
    vals.current.forEach((el) => {
      if (el) el.textContent = "";
    });
    const CPS = 75; // characters per second
    let row = 0;
    let chars = 0;
    let last = 0;
    let raf = 0;
    const step = (now: number) => {
      if (!last) last = now;
      chars += ((now - last) / 1000) * CPS;
      last = now;
      while (row < specs.length) {
        const value = specs[row][1];
        const el = vals.current[row];
        const cut = Math.min(value.length, Math.floor(chars));
        if (el) el.textContent = value.slice(0, cut) + (cut < value.length ? "▋" : "");
        if (cut < value.length) break;
        if (el) el.textContent = value;
        row += 1;
        chars -= value.length;
      }
      if (row < specs.length) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <dl className="flex flex-col gap-[0.55em] font-secondary text-[0.6875rem] uppercase leading-[1.4] tracking-[0.1em]">
      {SPEC_LABELS.map((label, i) => (
        <div key={label} className="flex gap-[0.6em]">
          <dt className="shrink-0 whitespace-nowrap text-neutral">{label}:</dt>
          <dd
            className="text-light"
            ref={(el) => {
              vals.current[i] = el;
            }}
          />
        </div>
      ))}
    </dl>
  );
}

export default function ReaperAgentsViz({
  active,
  onSelect,
  className = "",
}: {
  active: number;
  onSelect: (i: number) => void;
  className?: string;
}) {
  // Phones (< t:/768px) stack the roster above the flowchart; tablet and up
  // keep them side-by-side with a scaled-down roster so neither squishes.
  return (
    <div
      className={`flex min-h-[0px] flex-col gap-[1.5em] t:flex-row t:gap-[1.5em] ${className}`}
    >
      {/* Character select + spec sheet */}
      <div className="mx-auto flex w-full max-w-[34em] flex-col justify-center gap-[1.5em] t:mx-0 t:w-[18em] t:max-w-none t:shrink-0 d:w-[20em]">
        <AgentRoster active={active} onSelect={onSelect} />
        <SpecSheet active={active} />
      </div>
      {/* The selected agent's tool-chain flowchart. */}
      <Flowchart
        active={active}
        className="mx-auto h-[15em] w-full max-w-[36em] t:mx-0 t:h-auto t:max-w-none t:min-w-[0px] t:flex-1 t:self-stretch"
      />
    </div>
  );
}
