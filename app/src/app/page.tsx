import type { Metadata } from "next";
import { getContent, getCollection } from "@/lib/content";
import type { HomePageData, ProductData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import Architecture from "@/components/sections/Architecture";
import DeploySection from "@/components/sections/Deploy";
import HomeHero from "@/components/sections/HomeHero";
import Mission from "@/components/sections/Mission";
import Partners from "@/components/sections/Partners";
import CardSection from "@/components/sections/CardSection";
import ProductHighlightSection from "@/components/sections/ProductsHighlightSection";
import type { ProductHighlightProps } from "@/components/sections/ProductHighlight";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getContent<HomePageData>("pages/home");

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}`,
  });
}

export default async function Home() {
  const [homeData, productEntries] = await Promise.all([
    getContent<HomePageData>("pages/home"),
    getCollection<ProductData>("products"),
  ]);

  // Sort by sortOrder and build highlight items
  const sortedProducts = productEntries.sort(
    (a, b) => (a.frontmatter.sortOrder ?? 99) - (b.frontmatter.sortOrder ?? 99)
  );

  const productHighlightItems: ProductHighlightProps[] = sortedProducts
    .filter((p) => p.frontmatter.productSymbolUrl)
    .map((p) => ({
      eyebrow: p.frontmatter.highlight?.eyebrow || p.frontmatter.name,
      productSymbol: p.frontmatter.productSymbolUrl || "",
      title: p.frontmatter.highlight?.title || "",
      href: p.slug || "",
      leadParagraph: p.frontmatter.highlight?.leadParagraph || "",
      showcaseSrc: p.frontmatter.highlight?.showcaseSrc || "",
    }));

  return (
    <>
      <HomeHero
        videoSrc={homeData?.hero?.videoSrc || ""}
        videoSrcMobile={homeData?.hero?.videoSrcMobile || ""}
      />

      <Mission
        eyebrow={homeData?.mission?.eyebrow}
        title={homeData?.mission?.title || ""}
        leadParagraph={homeData?.mission?.leadParagraph || ""}
      />

      <Partners
        eyebrow={homeData?.partners?.eyebrow}
        logos={homeData?.partners?.logos || []}
      />

      {productHighlightItems.length > 0 && (
        <ProductHighlightSection items={productHighlightItems} />
      )}

      <Architecture
        eyebrow={homeData?.architecture?.eyebrow}
        title={homeData?.architecture?.title || ""}
        items={homeData?.architecture?.items || []}
      />

      <DeploySection
        eyebrow={homeData?.deploy?.eyebrow}
        title={homeData?.deploy?.title || ""}
        leadParagraph={homeData?.deploy?.leadParagraph || ""}
        videoSrc={homeData?.deploy?.videoSrc || ""}
        items={homeData?.deploy?.items || []}
        deployCTATitle={homeData?.deploy?.deployCTATitle}
        deployCTAButtonText={homeData?.deploy?.deployCTAButtonText}
        deployCTALink={homeData?.deploy?.deployCTALink}
      />

      <CardSection cards={homeData?.cards || []} />
    </>
  );
}
