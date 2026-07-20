import Spacer from "@/components/util/Spacer";
import type { BastionPageData } from "@/lib/content-types";
import ReaperIntroInteraction from "@/components/sections/reaper/ReaperIntroInteraction";

/**
 * Bastion product page — intro paragraph (Figma node 406:2912).
 *
 * A centered statement that reveals on scroll: each character scrubs from
 * faded to full (see ReaperIntroInteraction), while the side rule fills
 * top→bottom as a progress indicator for the text being revealed.
 * Mirrors ReaperIntro. Copy comes from bastionPage.intro in bastion.mdx.
 */

export default function BastionIntro({
  data,
}: {
  data?: BastionPageData["intro"];
}) {
  return (
    <ReaperIntroInteraction>
      <section className="bg-theme-bg text-theme-text">
        <Spacer size="small" />
        <div className="u-container flex max-w-none justify-center">
          <div
            data-highlight-group
            className="flex max-w-[48em] items-stretch gap-[1.5em] md:gap-[3em]"
          >
            {/* Progress rule */}
            <div
              aria-hidden="true"
              className="relative w-px shrink-0 self-stretch"
            >
              <span
                data-highlight-line
                style={{ transform: "scaleY(0)" }}
                className="absolute left-[0px] top-[0px] h-full w-full origin-top bg-theme-text"
              />
            </div>

            <p
              data-highlight-text
              className="font-primary text-h5 leading-[1.6] tracking-[-0.03em] t:text-h3"
            >
              {data?.paragraph}
            </p>
          </div>
        </div>
        <Spacer size="main" />
      </section>
    </ReaperIntroInteraction>
  );
}
