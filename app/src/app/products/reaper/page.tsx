import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import type { ProductData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

import ReaperHero from "@/components/sections/reaper/ReaperHero";
import ReaperIntro from "@/components/sections/reaper/ReaperIntro";
import ReaperHowItWorks from "@/components/sections/reaper/ReaperHowItWorks";
import ReaperToolkit from "@/components/sections/reaper/ReaperToolkit";
import ReaperUseCases from "@/components/sections/reaper/ReaperUseCases";
import ReaperBYOT from "@/components/sections/reaper/ReaperBYOT";
import ReaperFrontier from "@/components/sections/reaper/ReaperFrontier";
import ReaperCTA from "@/components/sections/reaper/ReaperCTA";
import ReaperLineReveal from "@/components/sections/reaper/ReaperLineReveal";

/**
 * Bespoke Reaper product page.
 *
 * This static route takes precedence over the content-driven
 * products/[slug] template for `/products/reaper`. SEO metadata is still
 * sourced from content/products/reaper.mdx so the entry stays in the
 * products collection (nav, listing, sitemap) and keeps its canonical SEO.
 *
 * Sections are built one at a time from Figma (node 299:58884).
 */

export async function generateMetadata(): Promise<Metadata> {
  const data = await getContent<ProductData>("products/reaper");

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products/reaper`,
  });
}

export default async function ReaperPage() {
  const data = await getContent<ProductData>("products/reaper");
  const c = data?.reaperPage ?? {};

  return (
    <div data-reaper-page>
      <ReaperLineReveal>
        <ReaperHero data={c.hero} />
        <ReaperIntro data={c.intro} />
        <ReaperHowItWorks data={c.howItWorks} />
        <ReaperToolkit data={c.toolkit} />
        <ReaperUseCases data={c.useCases} />
        <ReaperBYOT data={c.byot} />
        <ReaperFrontier data={c.frontier} />
        <ReaperCTA data={c.cta} />
      </ReaperLineReveal>
    </div>
  );
}
