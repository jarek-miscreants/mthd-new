import Spacer from "@/components/util/Spacer";
import VLine from "@/components/elements/VLine";
import type { BastionPageData } from "@/lib/content-types";
import BastionScaleViz from "./BastionScaleViz";

/**
 * Bastion product page — "Map at Planetary Scale" (Figma 406:2917 / 858:264).
 *
 * Heading + subhead, one ambient orbital-system visualization that shows every
 * asset type at once, then three static feature columns. No interaction: the
 * viz runs on its own and all three columns read at full weight. The vertical
 * rules still reveal on scroll via ReaperLineReveal ([data-vline]). Copy comes
 * from bastionPage.scale in bastion.mdx.
 */

export default function BastionScale({
  data,
}: {
  data?: BastionPageData["scale"];
}) {
  const columns = data?.columns ?? [];
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="small" />
      <div className="u-container flex max-w-none flex-col gap-small">
        <div className="flex max-w-[44em] flex-col gap-4">
          <h2 data-reveal className="u-text-style-h2">
            {data?.heading}
          </h2>
          <p className="text-large text-neutral">{data?.body}</p>
        </div>

        {/* Ambient orbital-system visualization — every asset type at once */}
        <div className="h-[24em] w-full t:h-[30em]">
          <BastionScaleViz />
        </div>

        <div className="grid gap-main d:grid-cols-3">
          {columns.map((p) => (
            <div key={p.title} className="flex gap-3 text-left">
              <VLine className="relative w-px shrink-0 self-stretch" />
              <div className="flex flex-col gap-3 lg:gap-4">
                <h3
                  data-reveal
                  data-reveal-start="top 95%"
                  className="u-text-style-h5"
                >
                  {p.title}
                </h3>
                <p className="text-main text-neutral">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Spacer size="main" />
    </section>
  );
}
