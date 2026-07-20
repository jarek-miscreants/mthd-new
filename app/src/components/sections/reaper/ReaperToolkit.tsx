import Spacer from "@/components/util/Spacer";
import type { ReaperPageData } from "@/lib/content-types";
import ReaperToolkitTabs from "./ReaperToolkitTabs";

/**
 * Reaper product page — "A home for your operators' toolkit"
 * (Figma frames 299:59552 / 59608 / 59690).
 */

export default function ReaperToolkit({
  data,
}: {
  data?: ReaperPageData["toolkit"];
}) {
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="large" />
      <div className="u-container flex max-w-none flex-col gap-main">
        <div className="flex max-w-[44em] flex-col gap-4">
          <h2 className="u-text-style-h2">{data?.heading}</h2>
          {(Array.isArray(data?.body) ? data.body : [data?.body]).map(
            (para, i) => (
              <p key={i} className="text-large text-neutral">
                {para}
              </p>
            ),
          )}
        </div>

        <ReaperToolkitTabs tabs={data?.tabs} />
      </div>
      <Spacer size="large" />
    </section>
  );
}
