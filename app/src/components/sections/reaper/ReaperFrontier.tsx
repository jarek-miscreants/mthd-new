// import Link from "next/link"; // restore with the frontier CTA button below
import Spacer from "@/components/util/Spacer";
import type { ReaperPageData } from "@/lib/content-types";
import ReaperFrontierStages from "./ReaperFrontierStages";

/**
 * Reaper product page — "Frontier models, on a deterministic harness"
 * (Figma frames 299:60198 / 299:60256). Header + "What wraps the model" banner
 * + the autoplay layers/visual.
 */

export default function ReaperFrontier({
  data,
}: {
  data?: ReaperPageData["frontier"];
}) {
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="large" />
      <div className="u-container flex max-w-none flex-col gap-main">
        <div className="flex max-w-[44em] flex-col gap-4">
          <h2 className="u-text-style-h2">{data?.heading}</h2>
          <p className="text-large text-neutral">{data?.body}</p>
          {/* Temporarily hidden — buttonLabel still in reaper.mdx frontier
          <div className="flex  gap-4">
          <Link href="#" className="btn-main-wrap is-primary shrink-0">
            {data?.buttonLabel}
          </Link>
          </div>
          */}
        </div>

        {/* "What wraps the model" banner */}


        <ReaperFrontierStages layers={data?.layers} />
      </div>
      <Spacer size="large" />
    </section>
  );
}
