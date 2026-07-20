import Spacer from "@/components/util/Spacer";
import type { ReaperPageData } from "@/lib/content-types";
import ReaperHowItWorksTabs from "./ReaperHowItWorksTabs";

/**
 * Reaper product page — "High fidelity adversaries. At any scale".
 *
 * Section intro (heading + paragraph) + the "How it works" horizontal
 * accordion. Spans Figma frames 299:58916 / 59132 / 59342 (one per open tab).
 */

export default function ReaperHowItWorks({
  data,
}: {
  data?: ReaperPageData["howItWorks"];
}) {
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="main" />
      <div className="u-container flex max-w-none flex-col gap-main">
        <div className="flex max-w-[44em] flex-col gap-4">
          <h2 className="u-text-style-h2">{data?.heading}</h2>
          <p className="text-large text-neutral">{data?.body}</p>
        </div>

        <div className="flex flex-col gap-4">

          <ReaperHowItWorksTabs tabs={data?.tabs} />
        </div>
      </div>
      <Spacer size="large" />
    </section>
  );
}
