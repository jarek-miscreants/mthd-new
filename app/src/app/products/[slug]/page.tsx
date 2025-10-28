import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { productQuery, allProductSlugsQuery } from "@/lib/queries";
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

  const data = await client.fetch<{
    seo?: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: { url?: string } | null;
    } | null;
  }>(productQuery, { slug });

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(allProductSlugsQuery);
  return slugs.map(({ slug }) => ({ slug }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function Product({ params }: ProductPageProps) {
  const { slug } = await params;

  const data = await client.fetch<{
    name?: string;
    description?: string;
    productSymbolUrl?: string;
    hero?: { videoSrc?: string; videoSrcMobile?: string };
    tagline?: { eyebrow?: string; text?: string };
    solutions?: {
      eyebrow?: string;
      items?: Array<{
        eyebrow: string;
        title: string;
        text: string;
        mediaSrc: string;
      }>;
    };
    cta?: {
      ctaTitle?: string;
      ctaButtonText?: string;
      ctaLink?: string;
    };
    cards?: Array<{
      eyebrow: string;
      title: string;
      href: string;
      target?: "_self" | "_blank";
    }>;
  } | null>(productQuery, { slug });

  if (!data) {
    notFound();
  }

  return (
    <>
      <ProductHero
        productSymbol={data?.productSymbolUrl || ""}
        name={data?.name || ""}
        description={data?.description || ""}
        videoSrc={data?.hero?.videoSrc || ""}
        videoSrcMobile={data?.hero?.videoSrcMobile || ""}
      />
      <ProductTagline
        eyebrow={data?.tagline?.eyebrow || ""}
        text={data?.tagline?.text || ""}
      />
      <ProductSolutions
        eyebrow={data?.solutions?.eyebrow || ""}
        items={data?.solutions?.items || []}
      />

      <CTASection
        ctaTitle={data?.cta?.ctaTitle}
        ctaButtonText={data?.cta?.ctaButtonText}
        ctaLink={data?.cta?.ctaLink}
      />

      <CardSection cards={data?.cards || []} />
    </>
  );
}
