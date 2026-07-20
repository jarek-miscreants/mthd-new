import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import type { ProductData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

import ReaperLineReveal from "@/components/sections/reaper/ReaperLineReveal";
import BastionHero from "@/components/sections/bastion/BastionHero";
import BastionIntro from "@/components/sections/bastion/BastionIntro";
import BastionScale from "@/components/sections/bastion/BastionScale";
import BastionInventory from "@/components/sections/bastion/BastionInventory";
import BastionChallenge from "@/components/sections/bastion/BastionChallenge";
// import BastionReaper from "@/components/sections/bastion/BastionReaper"; // restore with the Reaper hand-off card below
import BastionServe from "@/components/sections/bastion/BastionServe";
import BastionCTA from "@/components/sections/bastion/BastionCTA";

/**
 * Bespoke Bastion product page.
 *
 * This static route takes precedence over the content-driven
 * products/[slug] template for `/products/bastion`. SEO metadata is still
 * sourced from content/products/bastion.mdx so the entry stays in the
 * products collection (nav, listing, sitemap) and keeps its canonical SEO.
 *
 * Built section by section from Figma (node 406:2886). The vertical rules and
 * their headers animate in via ReaperLineReveal (generic [data-vline] /
 * [data-reveal] reveal), matching the Reaper page.
 */

export async function generateMetadata(): Promise<Metadata> {
  const data = await getContent<ProductData>("products/bastion");

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products/bastion`,
  });
}

export default async function BastionPage() {
  const data = await getContent<ProductData>("products/bastion");
  const c = data?.bastionPage ?? {};

  return (
    <div data-bastion-page>
      <ReaperLineReveal>
        <BastionHero data={c.hero} />
        <BastionIntro data={c.intro} />
        <BastionScale data={c.scale} />
        <BastionInventory data={c.inventory} />
        <BastionChallenge data={c.challenge} />
        {/* Temporarily hidden — Reaper hand-off card (copy still in bastion.mdx reaper)
        <BastionReaper data={c.reaper} />
        */}
        <BastionServe data={c.serve} />
        <BastionCTA data={c.cta} />
      </ReaperLineReveal>
    </div>
  );
}
