import type { ReaperPageData } from "@/lib/content-types";
import ReaperHeroCarousel from "./ReaperHeroCarousel";

/**
 * Reaper product page — Hero section.
 *
 * Bespoke section matching Figma node 299:58886.
 * Layout: centered Reaper mark + wordmark, muted tagline, then a full-width
 * product-UI video carousel that fades into the page background top and
 * bottom, with the Operate / Plan / Observe / Report view tabs overlaid
 * near the base (see ReaperHeroCarousel).
 */

export default function ReaperHero({ data }: { data?: ReaperPageData["hero"] }) {
  return (
    <section className="bg-theme-bg text-theme-text overflow-clip mx-auto max-w-[100rem]">
      {/* Heading */}
      <div className="u-container max-w-none flex flex-col items-center gap-4 pt-[7.5em] text-center">
        <div className="flex items-center gap-[1.5em]">
          <ReaperMark className="h-[3.5em] w-auto shrink-0 t:h-[5em]" />
          <h1 className="u-text-style-h1 leading-none">{data?.title}</h1>
        </div>
        <p className="u-text-style-h2 text-neutral max-w-[20ch]">
          {data?.tagline}
        </p>
      </div>

      {/* Product UI — per-view video carousel */}
      <ReaperHeroCarousel tabs={data?.tabs} />
    </section>
  );
}

function ReaperMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64.5506 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M64.2674 41.0595C64.6431 40.404 64.6431 39.5988 64.2674 38.9433L49.1878 12.8247C48.8092 12.1692 48.1113 11.7651 47.3541 11.7651H17.1951C16.4379 11.7651 15.74 12.1692 15.3642 12.8218L0.281865 38.9433C-0.0939218 39.5988 -0.0939218 40.404 0.281865 41.0595L15.3614 67.1781C15.74 67.8337 16.4379 68.2349 17.1951 68.2349H47.3541C48.1113 68.2349 48.8092 67.8308 49.185 67.1781L64.2674 41.0595ZM30.4748 56.594V64.6041C30.4748 65.3275 29.517 65.5846 29.1553 64.9573L18.9328 47.253C18.5428 46.5777 17.6783 46.346 17.003 46.7359L10.0636 50.7424C9.43637 51.1041 8.73848 50.4034 9.09732 49.7761L19.3199 32.0717C19.7098 31.3965 19.4781 30.5319 18.8028 30.1419L11.8634 26.1354C11.2362 25.7738 11.4933 24.8159 12.2166 24.8159H32.6589C33.4387 24.8159 34.0716 24.183 34.0716 23.4032V15.3958C34.0716 14.6725 35.0294 14.4154 35.3911 15.0427L45.6136 32.747C46.0035 33.4223 46.8681 33.654 47.5434 33.2641L54.4828 29.2576C55.11 28.8959 55.8079 29.5966 55.4491 30.2239L45.2265 47.9283C44.8366 48.6035 45.0683 49.4681 45.7436 49.858L52.6829 53.8646C53.3102 54.2262 53.0531 55.184 52.3298 55.184H31.8875C31.1077 55.184 30.4748 55.817 30.4748 56.5968V56.594Z"
        fill="currentColor"
      />
    </svg>
  );
}
