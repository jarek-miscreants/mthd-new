import Spacer from "@/components/util/Spacer";
import VLine from "@/components/elements/VLine";
import type { BastionPageData } from "@/lib/content-types";
import BastionInventoryViz from "./BastionInventoryViz";

/**
 * Bastion product page — "Create a continuous, attacker-minded inventory"
 * (Figma 885:4029).
 *
 * Heading + subhead, the digital-twin visualization, then three static feature
 * columns (all lit, no interaction). The viz auto-progresses across its three
 * stages on a timer (Reaper-style), so nothing here is clickable. Copy comes
 * from bastionPage.inventory in bastion.mdx.
 */

export default function BastionInventory({
  data,
}: {
  data?: BastionPageData["inventory"];
}) {
  const columns = data?.columns ?? [];
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="small" />
      <div className="u-container flex max-w-none flex-col gap-small">
        <div className="flex max-w-[44em] flex-col gap-4">
          <h2 data-reveal className="u-text-style-h2 t:whitespace-nowrap">
            {data?.heading}
          </h2>
          <p className="text-large text-neutral">{data?.body}</p>
        </div>

        {/* Digital-twin visualization — auto-cycles through its three stages */}
        <div className="h-[38em] w-full t:h-[26em]">
          <BastionInventoryViz />
        </div>

        <div className="grid gap-main d:grid-cols-3">
          {columns.map((p) => (
            <div key={p.title} className="flex gap-3 text-left">
              <VLine className="relative w-px shrink-0 self-stretch" />
              <div className="flex flex-col gap-3 lg:gap-4">
                <h3 data-reveal className="u-text-style-h5">
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
