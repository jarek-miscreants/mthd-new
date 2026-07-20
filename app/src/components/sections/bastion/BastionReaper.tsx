import Link from "next/link";
import Eyebrow from "@/components/elements/GEyebrow";
import Spacer from "@/components/util/Spacer";
import type { BastionPageData } from "@/lib/content-types";

/**
 * Bastion product page — Reaper hand-off card (Figma 481:27809 / 481:27810).
 *
 * A single centered dark card — there is NO section heading (the heading layer
 * is hidden in Figma). REAPER eyebrow + copy on the left, the Reaper mark on
 * the right, and the Method bracket-arrow glyph at the bottom-left. The whole
 * card links through to the Reaper product page.
 */

// Method brand glyph — square brackets + up-right arrow (Figma 29:42, Inverse
// variant). Cropped viewBox onto the inverse paths; follows currentColor.
function MethodGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="113 32 49 30"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M120.328 62L113 54.638V39.362L120.328 32L121.861 33.5644L115.3 40.1595V53.8098L121.892 60.4049L120.328 62Z" />
      <path d="M130.975 39.0789L142.464 50.5732V42.9295H144.589V54.1365H133.445V52.125H141.114L129.51 40.5444L130.975 39.0789Z" />
      <path d="M154.672 62L153.108 60.4049L159.7 53.8098V40.1595L153.139 33.5644L154.672 32L162 39.362V54.638L154.672 62Z" />
    </svg>
  );
}

export default function BastionReaper({
  data,
}: {
  data?: BastionPageData["reaper"];
}) {
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="small" />
      <div className="u-container">
        <Link
          href="/products/reaper"
          className="mx-auto flex max-w-[65em] flex-col gap-[5em] rounded-main bg-dark-secondary p-[2em] t:gap-[6em] t:p-[2.5em]"
        >
          <div className="flex flex-col gap-8 t:flex-row t:items-end t:gap-[6em]">
            <div className="flex flex-1 flex-col gap-2">
              <Eyebrow customClass="text-theme-text">{data?.eyebrow}</Eyebrow>
              <p className="u-text-style-h3 whitespace-pre-line">
                {data?.text}
              </p>
            </div>
            <img
              src="/product-symbols/reaper-mark.svg"
              alt=""
              aria-hidden="true"
              className="w-[7.5em] shrink-0 self-start t:w-[8.4em] t:self-auto"
            />
          </div>
          <MethodGlyph className="h-[1.875em] w-[3.0625em] shrink-0 text-theme-text" />
        </Link>
      </div>
      <Spacer size="main" />
    </section>
  );
}
