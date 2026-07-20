import Spacer from "@/components/util/Spacer";
import VLine from "@/components/elements/VLine";
import type { ReaperPageData } from "@/lib/content-types";

/**
 * Reaper product page — "BYOT: Bring Your Own Tradecraft"
 * (Figma frame 299:60139). Header + a 3×2 grid of capability items, each with
 * a top rule, title (some flagged "Coming soon") and copy.
 */

export default function ReaperBYOT({
  data,
}: {
  data?: ReaperPageData["byot"];
}) {
  const items = data?.items ?? [];
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="large" />
      <div className="u-container flex max-w-none flex-col gap-main">
        <div className="flex max-w-[44em] flex-col gap-4">
          <h2 className="u-text-style-h2">{data?.heading}</h2>
          <p className="text-large text-neutral">{data?.body}</p>
        </div>

        <ul className="grid grid-cols-1 gap-x-4 gap-y-main t:grid-cols-2 d:grid-cols-3">
          {items.map((item) => (
            <li key={item.title} className="flex gap-[1.25em]">
              <VLine className="relative w-px shrink-0 self-stretch" />
              <div className="flex min-w-[0px] flex-1 flex-col">
                <div className="mb-2 flex items-center gap-3">
                  <h3
                    className={`u-text-style-h5 ${
                      item.comingSoon ? "text-neutral" : ""
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.comingSoon && (
                    <span className="inline-flex items-center rounded-round bg-light px-[1em] py-[0.5em] font-secondary text-small uppercase leading-none tracking-[0.1em] text-dark">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="text-main text-neutral">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Spacer size="large" />
    </section>
  );
}
