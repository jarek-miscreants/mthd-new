"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { runWhileVisible } from "@/lib/animations/runWhileVisible";

/**
 * Reaper "How it works" — Rules tab visualization (Figma export 685:3225).
 *
 * The Reaper badge wrapped in four orbital guardrail rings (two horizontal
 * ellipses, two vertical). Checking rules in the secondary checklist lights
 * the rings progressively — `lit` is the number of rules checked:
 *   0 → no ring highlighted
 *   1 → bottom ring highlighted
 *   2 → top ring highlighted too (both horizontal ellipses)
 *   3 → left + right rings too (all four)
 *
 * Each ring is drawn twice: a dark base stroke that's always there, and a
 * white-gradient highlight stroke that fades in on top.
 *
 * The badge is the still "inner sphere"; the ellipse cage rotates slowly
 * around it (horizontal + vertical pairs at slightly different speeds) so the
 * whole thing reads as a wireframe "outer sphere" turning around the core —
 * a sphere-inside-a-sphere. Respects prefers-reduced-motion.
 */

const TOP_D =
  "M147.75 76.125C188.533 76.125 225.444 79.4817 252.15 84.9043C265.507 87.6162 276.291 90.8415 283.727 94.4111C287.445 96.1964 290.308 98.0578 292.234 99.9697C294.16 101.881 295.125 103.813 295.125 105.75C295.125 107.687 294.16 109.619 292.234 111.53C290.308 113.442 287.445 115.304 283.727 117.089C276.291 120.659 265.507 123.884 252.15 126.596C225.444 132.018 188.533 135.375 147.75 135.375C106.967 135.375 70.0559 132.018 43.3496 126.596C29.9934 123.884 19.2094 120.659 11.7734 117.089C8.05461 115.304 5.19246 113.442 3.26562 111.53C1.33966 109.619 0.375 107.687 0.375 105.75C0.375 103.813 1.33966 101.881 3.26562 99.9697C5.19246 98.0578 8.05461 96.1964 11.7734 94.4111C19.2094 90.8415 29.9934 87.6162 43.3496 84.9043C70.0559 79.4817 106.967 76.125 147.75 76.125Z";

const RIGHT_D =
  "M160.25 147.75C160.25 188.527 163.606 225.43 169.026 252.126C171.737 265.478 174.96 276.25 178.523 283.673C180.306 287.385 182.16 290.233 184.059 292.146C185.956 294.058 187.858 295 189.75 295C191.642 295 193.544 294.058 195.441 292.146C197.34 290.233 199.194 287.385 200.977 283.673C204.54 276.25 207.763 265.478 210.474 252.126C215.894 225.43 219.25 188.527 219.25 147.75C219.25 106.973 215.894 70.0699 210.474 43.374C207.763 30.0221 204.54 19.2496 200.977 11.8271C199.194 8.11481 197.34 5.26655 195.441 3.35351C193.544 1.44165 191.642 0.499999 189.75 0.499999C187.858 0.499999 185.956 1.44165 184.059 3.35351C182.16 5.26655 180.306 8.11482 178.523 11.8271C174.96 19.2496 171.737 30.0221 169.026 43.374C163.606 70.0699 160.25 106.973 160.25 147.75Z";

const LEFT_D =
  "M76.125 147.75C76.125 188.533 79.4817 225.444 84.9043 252.15C87.6162 265.507 90.8415 276.291 94.4111 283.727C96.1964 287.445 98.0578 290.308 99.9697 292.234C101.881 294.16 103.813 295.125 105.75 295.125C107.687 295.125 109.619 294.16 111.53 292.234C113.442 290.308 115.304 287.445 117.089 283.727C120.659 276.291 123.884 265.507 126.596 252.15C132.018 225.444 135.375 188.533 135.375 147.75C135.375 106.967 132.018 70.0559 126.596 43.3496C123.884 29.9934 120.659 19.2094 117.089 11.7734C115.304 8.05461 113.442 5.19246 111.53 3.26562C109.619 1.33965 107.687 0.374999 105.75 0.374999C103.813 0.374999 101.881 1.33965 99.9697 3.26562C98.0578 5.19246 96.1964 8.05461 94.4111 11.7734C90.8415 19.2094 87.6162 29.9934 84.9043 43.3496C79.4817 70.0559 76.125 106.967 76.125 147.75Z";

const BOTTOM_D =
  "M147.75 160.25C188.527 160.25 225.43 163.606 252.126 169.026C265.478 171.737 276.25 174.96 283.673 178.523C287.385 180.306 290.233 182.16 292.146 184.059C294.058 185.956 295 187.858 295 189.75C295 191.642 294.058 193.544 292.146 195.441C290.233 197.34 287.385 199.194 283.673 200.977C276.25 204.54 265.478 207.763 252.126 210.474C225.43 215.894 188.527 219.25 147.75 219.25C106.973 219.25 70.0699 215.894 43.374 210.474C30.0221 207.763 19.2496 204.54 11.8271 200.977C8.11482 199.194 5.26655 197.34 3.35352 195.441C1.44166 193.544 0.5 191.642 0.5 189.75C0.5 187.858 1.44166 185.956 3.35352 184.059C5.26655 182.16 8.11482 180.306 11.8271 178.523C19.2496 174.96 30.0221 171.737 43.374 169.026C70.0699 163.606 106.973 160.25 147.75 160.25Z";

const GLYPH_D =
  "M175.788 144.17C176.121 143.59 176.121 142.878 175.788 142.298L162.446 119.188C162.111 118.608 161.493 118.25 160.823 118.25H134.138C133.468 118.25 132.851 118.608 132.518 119.185L119.173 142.298C118.841 142.878 118.841 143.59 119.173 144.17L132.516 167.28C132.851 167.86 133.468 168.215 134.138 168.215H160.823C161.493 168.215 162.111 167.857 162.443 167.28L175.788 144.17ZM145.888 157.915V165.002C145.888 165.642 145.041 165.87 144.721 165.315L135.676 149.65C135.331 149.052 134.566 148.847 133.968 149.192L127.828 152.737C127.273 153.057 126.656 152.438 126.973 151.882L136.018 136.218C136.363 135.62 136.158 134.855 135.561 134.51L129.421 130.965C128.866 130.645 129.093 129.797 129.733 129.797H147.821C148.511 129.797 149.071 129.237 149.071 128.547V121.463C149.071 120.823 149.918 120.595 150.238 121.15L159.283 136.815C159.628 137.413 160.393 137.617 160.991 137.272L167.131 133.727C167.686 133.408 168.303 134.028 167.986 134.583L158.941 150.247C158.596 150.845 158.801 151.61 159.398 151.955L165.538 155.5C166.093 155.82 165.866 156.667 165.226 156.667H147.138C146.448 156.667 145.888 157.228 145.888 157.917V157.915Z";

const FADE = { transition: "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)" };

export default function ReaperRulesViz({
  lit,
  className = "",
}: {
  lit: number;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The whole ellipse cage spins as one rigid armillary around the centre,
    // so the symmetric sphere silhouette stays intact while it turns (turning
    // the pairs at different speeds just scatters them and reads as broken).
    //
    // Pivot = the cage's centroid (147.75,147.75): the four ellipse centres
    // are symmetric about it, so it spins true with no wobble.
    const tween = gsap.to(root.querySelector("[data-orbit]"), {
      rotation: 360,
      svgOrigin: "147.75 147.75",
      duration: 28,
      ease: "none",
      repeat: -1,
      paused: true,
    });
    // Only spin while the viz is on screen.
    const stop = runWhileVisible(root, { timelines: [tween] });
    return () => {
      stop();
      tween.kill();
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={ref}
        // Tightened in to make the cage fill more of the frame. The spin's
        // rotation circle reaches ~153px from the centre (147.75,147.75), so
        // ~155px half-size (centre 148,148) is about as large as it goes
        // before the swinging tips clip.
        viewBox="-7 -7 310 310"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full overflow-visible"
        role="img"
        aria-label="The Reaper agent wrapped in orbital guardrail rings; each selected rule lights another ring"
      >
        <defs>
          {/* Dark base ring gradients (dark at the inner edge, grey outer). */}
          <linearGradient
            id="rrv-top-base"
            x1="148.098"
            y1="135.75"
            x2="148.098"
            y2="75.75"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1A1A1A" />
            <stop offset="1" stopColor="#808080" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient
            id="rrv-right-base"
            x1="159.75"
            y1="148.098"
            x2="219.75"
            y2="148.098"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1A1A1A" />
            <stop offset="1" stopColor="#808080" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient
            id="rrv-left-base"
            x1="135.75"
            y1="148.098"
            x2="75.75"
            y2="148.098"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1A1A1A" />
            <stop offset="1" stopColor="#808080" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient
            id="rrv-bottom-base"
            x1="148.098"
            y1="159.75"
            x2="148.098"
            y2="219.75"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1A1A1A" />
            <stop offset="1" stopColor="#808080" stopOpacity="0.25" />
          </linearGradient>
          {/* White highlight gradients (bright at the outer edge). */}
          <linearGradient
            id="rrv-bottom-lit"
            x1="148.098"
            y1="219.75"
            x2="148.098"
            y2="159.75"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="rrv-top-lit"
            x1="148.098"
            y1="75.75"
            x2="148.098"
            y2="135.75"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="rrv-right-lit"
            x1="219.75"
            y1="148.098"
            x2="159.75"
            y2="148.098"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="rrv-left-lit"
            x1="75.75"
            y1="148.098"
            x2="135.75"
            y2="148.098"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter
            id="rrv-badge-glow"
            x="101.65"
            y="100.65"
            width="92.2"
            height="92.2"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="3.8" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
        </defs>

        {/* The full ellipse cage — all four rings (bases + lit highlights)
            spin together as one rigid armillary around the centre. */}
        <g data-orbit>
          <path d={TOP_D} fill="none" stroke="url(#rrv-top-base)" strokeWidth={0.75} />
          <path d={RIGHT_D} fill="none" stroke="url(#rrv-right-base)" strokeWidth={0.75} />
          <path d={LEFT_D} fill="none" stroke="url(#rrv-left-base)" strokeWidth={0.75} />
          <path d={BOTTOM_D} fill="none" stroke="url(#rrv-bottom-base)" strokeWidth={0.75} />
          <path
            d={BOTTOM_D}
            fill="none"
            stroke="url(#rrv-bottom-lit)"
            strokeWidth={1}
            style={{ ...FADE, opacity: lit >= 1 ? 1 : 0 }}
          />
          <path
            d={TOP_D}
            fill="none"
            stroke="url(#rrv-top-lit)"
            strokeWidth={1}
            style={{ ...FADE, opacity: lit >= 2 ? 1 : 0 }}
          />
          <path
            d={RIGHT_D}
            fill="none"
            stroke="url(#rrv-right-lit)"
            strokeWidth={1}
            style={{ ...FADE, opacity: lit >= 3 ? 1 : 0 }}
          />
          <path
            d={LEFT_D}
            fill="none"
            stroke="url(#rrv-left-lit)"
            strokeWidth={1}
            style={{ ...FADE, opacity: lit >= 3 ? 1 : 0 }}
          />
        </g>

        {/* Centre badge with the Reaper glyph. */}
        <g filter="url(#rrv-badge-glow)">
          <rect
            x="109.25"
            y="104.25"
            width="77"
            height="77"
            rx="38.5"
            fill="black"
          />
          <rect
            x="109.5"
            y="104.5"
            width="76.5"
            height="76.5"
            rx="38.25"
            fill="none"
            stroke="#808080"
            strokeWidth={0.5}
          />
          {/* Glyph spans ~73% of the disc in the raw export; scale it down
              about the disc centre to match the ~57% padding the other
              How-it-works badges use (Custom agents / Scale). */}
          <g transform="translate(147.75 142.75) scale(0.777) translate(-147.48 -143.23)">
            <path d={GLYPH_D} fill="white" />
          </g>
        </g>
      </svg>
    </div>
  );
}
