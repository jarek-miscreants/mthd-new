import Spacer from "@/components/util/Spacer";
import type { BastionPageData } from "@/lib/content-types";
import BastionChallengeSplit from "./BastionChallengeSplit";

/**
 * Bastion product page — "Challenge every asset" (Figma 471:17367).
 *
 * Heading + subhead, then a two-column layout: left is the feature accordion,
 * right is the Bastion console image tracking the active tab (see
 * BastionChallengeSplit). Copy comes from bastionPage.challenge in bastion.mdx.
 */

export default function BastionChallenge({
  data,
}: {
  data?: BastionPageData["challenge"];
}) {
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="small" />
      <div className="u-container flex max-w-none flex-col gap-main">
        <div className="flex max-w-[44em] flex-col gap-4">
          <h2 data-reveal className="u-text-style-h2">
            {data?.heading}
          </h2>
          <p className="text-large text-neutral">{data?.body}</p>
        </div>

        <BastionChallengeSplit items={data?.features ?? []} />
      </div>
      <Spacer size="small" />
    </section>
  );
}
