import type { Metadata } from "next";
import { getContent, getCollectionSlugs } from "@/lib/content";
import type { ProductData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

import { notFound } from "next/navigation";
import ProductHero from "@/components/sections/ProductHero";
import ProductTagline from "@/components/sections/ProductTagline";
import CardSection from "@/components/sections/CardSection";
import CTASection from "@/components/sections/CTASection";
import ProductSolutions from "@/components/sections/ProductSolutions";

// SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let data: ProductData;
  try {
    data = await getContent<ProductData>(`products/${slug}`);
  } catch {
    return { title: "Product Not Found" };
  }

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = getCollectionSlugs("products");
  return slugs.map((slug) => ({ slug }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function Product({ params }: ProductPageProps) {
  const { slug } = await params;

  let data: ProductData;
  try {
    data = await getContent<ProductData>(`products/${slug}`);
  } catch {
    notFound();
  }

  return (
    <>
      <ProductHero
        productSymbol={data.productSymbolUrl || ""}
        name={data.name || ""}
        description={data.description || ""}
        videoSrc={data.hero?.videoSrc || ""}
        videoSrcMobile={data.hero?.videoSrcMobile || ""}
      />
      <ProductTagline
        eyebrow={data.tagline?.eyebrow || ""}
        text={data.tagline?.text || ""}
      />
      <ProductSolutions
        eyebrow={data.solutions?.eyebrow || ""}
        items={data.solutions?.items || []}
      />

      <CTASection
        ctaTitle={data.cta?.ctaTitle}
        ctaButtonText={data.cta?.ctaButtonText}
        ctaLink={data.cta?.ctaLink}
      />

      <CardSection cards={data.cards || []} />
    </>
  );
}
