import type { BastionPageData } from "@/lib/content-types";
import ReaperHeroCarousel from "@/components/sections/reaper/ReaperHeroCarousel";

/**
 * Bastion product page — Hero section.
 *
 * Bespoke section matching Figma node 406:2888.
 * Layout: centered Bastion mark + wordmark, muted tagline, then a full-width
 * product-UI video carousel that fades into the page background top and
 * bottom, with the Challenge / Serve / Protect view tabs overlaid near the
 * base. Mirrors ReaperHero and reuses its carousel; copy comes from the
 * bastionPage.hero block in bastion.mdx.
 */

export default function BastionHero({
  data,
}: {
  data?: BastionPageData["hero"];
}) {
  return (
    <section className="bg-theme-bg text-theme-text overflow-clip mx-auto max-w-[100rem]">
      {/* Heading */}
      <div className="u-container max-w-none flex flex-col items-center gap-4 pt-[7.5em] text-center">
        <div className="flex items-center gap-[1.5em]">
          <BastionMark className="h-[3.5em] w-auto shrink-0" />
          <h1 className="u-text-style-h1 leading-none">{data?.title}</h1>
        </div>
        <p className="u-text-style-h2 text-neutral max-w-[24ch]">
          {data?.tagline}
        </p>
      </div>

      {/* Product UI — per-view video carousel */}
      <ReaperHeroCarousel tabs={data?.tabs} />
    </section>
  );
}

function BastionMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 66 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M65.7102 30.0875C66.097 29.4148 66.097 28.5858 65.7102 27.9128L50.3086 1.08732C49.9218 0.414342 49.2071 0 48.4338 0H17.5665C16.7932 0 16.0785 0.414342 15.6917 1.08732L0.290095 27.9128C-0.0966984 28.5858 -0.0966984 29.4145 0.290095 30.0875L15.6917 56.9127C16.0785 57.5857 16.7932 58 17.5665 58H48.4338C49.2071 58 49.9218 57.5857 50.3086 56.9127L65.7102 30.0875ZM33.7218 49.4827C33.2752 49.7416 32.7251 49.7416 32.2785 49.4827L15.709 39.8731C15.2625 39.6141 14.9874 39.1354 14.9874 38.6176V19.3824C14.9874 18.8646 15.2625 18.3859 15.709 18.1269L32.2785 8.51734C32.7251 8.25842 33.2752 8.25842 33.7218 8.51734L50.2913 18.1269C50.7378 18.3859 51.0129 18.8646 51.0129 19.3824V38.6176C51.0129 39.1354 50.7378 39.6141 50.2913 39.8731L33.7218 49.4824V49.4827Z"
        fill="currentColor"
      />
    </svg>
  );
}
