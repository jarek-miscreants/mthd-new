"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Reaper "What wraps the model" visualization (Figma "Planet" 382:5064).
 *
 * Two-step, driven by `lit` (the layer-reveal stage from ReaperFrontierStages):
 *   1. concentric orbital rings draw in + the sphere with the Method logo rises.
 *   2. translucent gradient spheres scale out around it — a "protection bubble"
 *      — growing a shell per layer (Guardrails, then Purpose-built UX).
 *
 * Geometry + gradients are lifted verbatim from Figma (viewBox 477×406, sphere
 * centred at ~238,192). Respects prefers-reduced-motion.
 */

const ORIGIN = "238 192"; // sphere centre (svg units)

// Orbital rings (outer → inner), stroked with a white→transparent gradient.
const RINGS = [
  {
    g: "rf-p1",
    d: "M238.328 154.889C304.115 154.889 363.662 160.359 406.75 169.198C428.298 173.618 445.706 178.876 457.716 184.701C463.722 187.614 468.355 190.657 471.48 193.79C474.604 196.921 476.19 200.108 476.19 203.323C476.19 206.538 474.604 209.725 471.48 212.856C468.355 215.989 463.722 219.032 457.716 221.945C445.706 227.77 428.298 233.028 406.75 237.448C363.662 246.287 304.115 251.757 238.328 251.757C172.54 251.757 112.994 246.287 69.9058 237.448C48.358 233.028 30.9501 227.77 18.9399 221.945C12.9338 219.032 8.30125 215.989 5.17627 212.856C2.05254 209.725 0.466327 206.538 0.466306 203.323C0.466306 200.108 2.05256 196.921 5.17627 193.79C8.30125 190.657 12.9338 187.614 18.9399 184.701C30.9501 178.876 48.358 173.618 69.9058 169.198C112.994 160.359 172.54 154.889 238.328 154.889Z",
  },
  {
    g: "rf-p0",
    d: "M238.327 163.62C278.321 163.62 314.517 166.94 340.702 172.303C353.799 174.986 364.368 178.175 371.651 181.702C375.294 183.466 378.091 185.304 379.972 187.186C381.851 189.067 382.784 190.959 382.784 192.848C382.784 194.737 381.851 196.63 379.972 198.511C378.091 200.394 375.294 202.231 371.651 203.995C364.368 207.522 353.799 210.711 340.702 213.393C314.517 218.756 278.322 222.077 238.327 222.077C198.333 222.077 162.138 218.756 135.952 213.393C122.856 210.711 112.287 207.522 105.003 203.995C101.361 202.231 98.5633 200.394 96.6827 198.511C94.8031 196.63 93.8702 194.737 93.8702 192.848C93.8703 190.959 94.8032 189.067 96.6827 187.186C98.5633 185.304 101.36 183.466 105.003 181.702C112.287 178.175 122.856 174.986 135.952 172.303C162.138 166.94 198.333 163.62 238.327 163.62Z",
  },
  {
    g: "rf-p2",
    d: "M238.597 172.327C254.403 172.327 268.701 173.639 279.035 175.755C284.206 176.813 288.36 178.069 291.212 179.449C292.638 180.14 293.716 180.85 294.43 181.564C295.142 182.277 295.462 182.961 295.462 183.61C295.462 184.26 295.142 184.943 294.43 185.655C293.716 186.37 292.638 187.081 291.212 187.771C288.361 189.152 284.206 190.406 279.035 191.465C268.701 193.581 254.403 194.893 238.597 194.893C222.79 194.893 208.493 193.581 198.159 191.465C192.988 190.406 188.834 189.151 185.982 187.771C184.556 187.081 183.478 186.37 182.765 185.655C182.052 184.943 181.732 184.26 181.732 183.61C181.732 182.961 182.052 182.277 182.765 181.564C183.478 180.85 184.556 180.14 185.982 179.449C188.834 178.069 192.988 176.813 198.159 175.755C208.493 173.639 222.79 172.327 238.597 172.327Z",
  },
];

// Sphere shells (top + bottom halves), translucent fills.
const SM = {
  top: "M238.517 195.428C270.251 195.428 295.977 190.118 295.977 183.568C295.977 156.615 274.127 134.765 247.174 134.765L229.86 134.765C202.907 134.765 181.057 156.615 181.057 183.568C181.057 190.118 206.783 195.428 238.517 195.428Z",
  bottom: "M238.517 172.007C270.251 172.007 295.977 177.317 295.977 183.867C295.977 210.82 274.127 232.67 247.174 232.67L229.86 232.67C202.907 232.67 181.057 210.82 181.057 183.867C181.057 177.317 206.783 172.007 238.517 172.007Z",
  topG: "rf-p3",
  bottomG: "rf-p4",
};
const MD = {
  top: "M238.518 222.733C318.532 222.733 383.396 209.345 383.396 192.829C383.396 124.871 328.305 69.7797 260.347 69.7797L216.689 69.7797C148.731 69.7797 93.6399 124.871 93.6399 192.829C93.6399 209.345 158.504 222.733 238.518 222.733Z",
  bottom: "M238.518 162.711C318.532 162.711 383.396 176.099 383.396 192.614C383.396 260.572 328.305 315.664 260.347 315.664L216.689 315.664C148.731 315.664 93.6399 260.572 93.6399 192.614C93.6399 176.099 158.504 162.711 238.518 162.711Z",
  topG: "rf-p5",
  bottomG: "rf-p6",
};
const LG = {
  top: "M238.517 252.191C370.247 252.191 477.034 230.149 477.034 202.96C477.034 91.078 386.336 0.37984 274.454 0.37984L202.58 0.379839C90.6982 0.379839 5.80636e-07 91.078 0 202.96C-1.41125e-07 230.149 106.788 252.191 238.517 252.191Z",
  bottom: "M238.517 154.726C370.247 154.726 477.034 176.768 477.034 203.957C477.034 315.839 386.336 406.537 274.454 406.537L202.58 406.537C90.6982 406.537 5.80636e-07 315.839 0 203.957C-1.41125e-07 176.768 106.788 154.726 238.517 154.726Z",
  topG: "rf-p7",
  bottomG: "rf-p8",
};

const LOGO_D =
  "M33.4684 19.088C33.6431 18.7833 33.6431 18.4089 33.4684 18.1042L26.4581 5.962C26.2821 5.65727 25.9577 5.46943 25.6057 5.46943H11.5852C11.2332 5.46943 10.9087 5.65727 10.734 5.96069L3.72246 18.1042C3.54776 18.4089 3.54776 18.7833 3.72246 19.088L10.7327 31.2301C10.9087 31.5349 11.2332 31.7214 11.5852 31.7214H25.6057C25.9577 31.7214 26.2821 31.5336 26.4568 31.2301L33.4684 19.088ZM17.7587 26.3097V30.0335C17.7587 30.3698 17.3134 30.4893 17.1453 30.1977L12.393 21.9672C12.2117 21.6533 11.8098 21.5456 11.4959 21.7268L8.26985 23.5894C7.97825 23.7575 7.65381 23.4318 7.82063 23.1402L12.5729 14.9097C12.7542 14.5958 12.6465 14.1938 12.3326 14.0126L9.10657 12.15C8.81496 11.9819 8.93449 11.5366 9.27076 11.5366H18.7741C19.1366 11.5366 19.4308 11.2423 19.4308 10.8798V7.1573C19.4308 6.82104 19.8761 6.70151 20.0442 6.99311L24.7965 15.2236C24.9778 15.5375 25.3797 15.6453 25.6937 15.464L28.9197 13.6014C29.2113 13.4333 29.5357 13.759 29.3689 14.0506L24.6166 22.2811C24.4353 22.5951 24.543 22.997 24.857 23.1783L28.083 25.0408C28.3746 25.209 28.255 25.6543 27.9188 25.6543H18.4155C18.0529 25.6543 17.7587 25.9485 17.7587 26.311V26.3097Z";

const Half = ({ d, g }: { d: string; g: string }) => <path d={d} fill={`url(#${g})`} />;

export default function ReaperModelViz({ lit }: { lit: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const rings = q("[data-ring]");
    const sm = q("[data-sphere='sm']");
    const logo = q("[data-logo]");
    // One protection shell per layer: medium grows with stage 2, large with
    // stage 3 — so each sphere tracks its highlighted tab.
    const md = q("[data-sphere='md']");
    const lg = q("[data-sphere='lg']");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([...rings, ...sm, ...md, ...lg, ...logo], {
        opacity: 1,
        scale: 1,
      });
      return;
    }

    // Step 1 — rings draw in + the sphere appears; the logo only fades (no move).
    gsap.to(rings, {
      opacity: lit >= 1 ? 1 : 0,
      scale: lit >= 1 ? 1 : 0.7,
      svgOrigin: ORIGIN,
      duration: 1.2,
      ease: "power2.out",
      stagger: 0.18,
      overwrite: "auto",
    });
    gsap.to(sm, {
      opacity: lit >= 1 ? 1 : 0,
      scale: lit >= 1 ? 1 : 0.4,
      svgOrigin: ORIGIN,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(logo, {
      opacity: lit >= 1 ? 1 : 0,
      duration: 1.2,
      ease: "power2.out",
      overwrite: "auto",
    });

    // Step 2 — medium protection shell scales out with the Guardrails layer.
    gsap.to(md, {
      opacity: lit >= 2 ? 1 : 0,
      scale: lit >= 2 ? 1 : 0.3,
      svgOrigin: ORIGIN,
      duration: 1.6,
      ease: "power2.out",
      stagger: 0.12,
      overwrite: "auto",
    });

    // Step 3 — large protection shell scales out with the Purpose-built UX
    // layer (behind the medium shell), completing the bubble.
    gsap.to(lg, {
      opacity: lit >= 3 ? 1 : 0,
      scale: lit >= 3 ? 1 : 0.3,
      svgOrigin: ORIGIN,
      duration: 1.6,
      ease: "power2.out",
      stagger: 0.12,
      overwrite: "auto",
    });
  }, [lit]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 477.283 406.537"
      className="h-full w-full overflow-visible"
      role="img"
      aria-label="The model at the centre, wrapped by orbital rings and a protective bubble of data, guardrails and UX layers"
    >
      <defs>
        {[
          ["rf-p0", 222.528, 163.168],
          ["rf-p1", 252.208, 154.438],
          ["rf-p2", 195.344, 171.876],
        ].map(([id, y1, y2]) => (
          <linearGradient key={id} id={id as string} x1="238" y1={y1 as number} x2="238" y2={y2 as number} gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        ))}
        {[
          ["rf-p3", 137.491, 195.428],
          ["rf-p4", 229.944, 172.007],
          ["rf-p5", 76.6515, 222.733],
          ["rf-p6", 308.792, 162.711],
          ["rf-p7", 11.6929, 252.191],
          ["rf-p8", 395.224, 154.727],
        ].map(([id, y1, y2]) => (
          <linearGradient key={id} id={id as string} x1="238" y1={y1 as number} x2="238" y2={y2 as number} gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.5" />
          </linearGradient>
        ))}
      </defs>

      {/* Protection bubble — large + medium shells (behind). */}
      <g data-sphere="lg" style={{ opacity: 0 }}>
        <Half d={LG.top} g={LG.topG} />
        <Half d={LG.bottom} g={LG.bottomG} />
      </g>
      <g data-sphere="md" style={{ opacity: 0 }}>
        <Half d={MD.top} g={MD.topG} />
        <Half d={MD.bottom} g={MD.bottomG} />
      </g>

      {/* Orbital rings. */}
      {RINGS.map((r, i) => (
        <path
          key={i}
          data-ring
          d={r.d}
          fill="none"
          stroke={`url(#${r.g})`}
          strokeWidth={0.9}
          style={{ opacity: 0 }}
        />
      ))}

      {/* Inner sphere (the model's shell). */}
      <g data-sphere="sm" style={{ opacity: 0 }}>
        <Half d={SM.top} g={SM.topG} />
        <Half d={SM.bottom} g={SM.bottomG} />
      </g>

      {/* Method logo at the centre. */}
      <g data-logo style={{ opacity: 0 }} transform="translate(213.4 145) scale(1.35)">
        <path d={LOGO_D} fill="#ffffff" />
      </g>
    </svg>
  );
}
