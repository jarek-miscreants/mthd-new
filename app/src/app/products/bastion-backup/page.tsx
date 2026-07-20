import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import type { ProductData } from "@/lib/content-types";

import { notFound } from "next/navigation";
import ProductHero from "@/components/sections/ProductHero";
import ProductTagline from "@/components/sections/ProductTagline";
import CardSection from "@/components/sections/CardSection";
import CTASection from "@/components/sections/CTASection";
import ProductSolutions from "@/components/sections/ProductSolutions";

/**
 * Backup of the original content-driven Bastion product page.
 *
 * This static route preserves the previous `/products/bastion` rendering
 * (template-driven from content/products/bastion.mdx) after the live
 * `/products/bastion` route was replaced by a bespoke page.
 *
 * It is intentionally NOT part of the `products` collection, so it does
 * not appear in the products listing, header/footer navigation, or the
 * sitemap, and it is marked noindex.
 */

const SLUG = "bastion";

export const metadata: Metadata = {
  title: "Bastion (backup)",
  robots: { index: false, follow: false },
};

export default async function BastionBackup() {
  let data: ProductData;
  try {
    data = await getContent<ProductData>(`products/${SLUG}`);
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
