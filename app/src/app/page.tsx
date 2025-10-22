import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { homePageQuery, allProductsQuery } from "@/lib/queries";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import Architecture from "@/components/sections/Architecture";
import DeploySection from "@/components/sections/Deploy";
import HomeHero from "@/components/sections/HomeHero";
import Mission from "@/components/sections/Mission";
import CardSection from "@/components/sections/CardSection";
import ProductHighlightSection from "@/components/sections/ProductsHighlightSection";
import type { ProductHighlightProps } from "@/components/sections/ProductHighlight";

export async function generateMetadata(): Promise<Metadata> {
  const data = await client.fetch<{
    seo?: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: { url?: string } | null;
    } | null;
  }>(homePageQuery);

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: false, follow: false },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}`,
  });
}

interface SanityProduct {
  name: string;
  slug: string;
  productSymbolUrl?: string;
  highlight?: {
    eyebrow?: string;
    title?: string;
    leadParagraph?: string;
    showcaseSrc?: string;
  };
}

export default async function Home() {
  const [homeData, products] = await Promise.all([
    client.fetch(homePageQuery),
    client.fetch<SanityProduct[]>(allProductsQuery),
  ]);

  const productHighlightItems: ProductHighlightProps[] = products.map(
    (product: SanityProduct) => ({
      eyebrow: product.highlight?.eyebrow || product.name,
      productSymbol: product.productSymbolUrl || "",
      title: product.highlight?.title || "",
      href: product.slug || "",
      leadParagraph: product.highlight?.leadParagraph || "",
      showcaseSrc: product.highlight?.showcaseSrc || "",
    })
  );

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

      <div>
        {productHighlightItems.length > 0 && (
          <ProductHighlightSection items={productHighlightItems} />
        )}

        <Architecture
          eyebrow={homeData?.architecture?.eyebrow}
          title={homeData?.architecture?.title || ""}
          items={homeData?.architecture?.items || []}
        />
      </div>

      <DeploySection
        eyebrow={homeData?.deploy?.eyebrow}
        title={homeData?.deploy?.title || ""}
        leadParagraph={homeData?.deploy?.leadParagraph || ""}
        videoSrc={homeData?.deploy?.videoSrc || ""}
        items={homeData?.deploy?.items || []}
      />

      <CardSection cards={homeData?.cards || []} />
    </>
  );
}
