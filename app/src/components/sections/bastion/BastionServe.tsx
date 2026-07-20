import Spacer from "@/components/util/Spacer";
import VLine from "@/components/elements/VLine";
import type { BastionPageData } from "@/lib/content-types";
import BastionServeViz from "./BastionServeViz";

/**
 * Bastion product page — "Serve targets for offense and defense"
 * (Figma 481:27817).
 *
 * Two-column layout: the left column holds the heading + subhead and a stack of
 * title|description rows, each led by an animated vertical rule; the right
 * column holds the defense/offense hand-off visualization. Copy comes from
 * bastionPage.serve in bastion.mdx.
 */

export default function BastionServe({
  data,
}: {
  data?: BastionPageData["serve"];
}) {
  const rows = data?.rows ?? [];
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="small" />
      <div className="u-container flex max-w-none flex-col gap-main">
        <div className="flex flex-col gap-main d:grid d:grid-cols-12 d:items-end d:gap-main">
          {/* Left: heading + feature rows */}
          <div className="flex flex-col gap-main d:col-span-7">
            <div className="flex max-w-[44em] flex-col gap-4">
              <h2 data-reveal className="u-text-style-h2">
                {data?.heading}
              </h2>
              <p className="text-large text-neutral">{data?.body}</p>
            </div>

            <div className="flex flex-col">
              {rows.map((r) => (
                <div
                  key={r.title}
                  className="grid gap-4 border-t border-neutral/15 py-[2em] d:grid-cols-2 d:gap-main"
                >
                  <div className="flex gap-3">
                    <VLine className="relative w-px shrink-0 self-stretch" />
                    <h3 data-reveal className="u-text-style-h5">
                      {r.title}
                    </h3>
                  </div>
                  <p className="text-main text-neutral">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: defense / offense hand-off visualization. No self-stretch:
              the viz has a definite height and centers against the taller text
              column (stretching it would reintroduce the canvas growth loop). */}
          <div className="d:col-span-5">
            <BastionServeViz />
          </div>
        </div>
      </div>
      <Spacer size="main" />
    </section>
  );
}
