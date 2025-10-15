import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import {
  productsOverviewQuery,
  productsOverviewPageQuery,
} from "@/lib/queries";
import ProductsOverview from "@/components/sections/ProductsOverview";
import CardSection from "@/components/sections/CardSection";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const data = await client.fetch<{
    seo?: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: { url?: string } | null;
    } | null;
  }>(productsOverviewPageQuery);

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: false, follow: false },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
  });
}

interface SanityProduct {
  name: string;
  nameAddition: string;
  highlight: {
    leadParagraph: string;
  };
  slug: string;
  productSymbolUrl?: string;
}

export default async function Products() {
  const [products, pageData] = await Promise.all([
    client.fetch<SanityProduct[]>(productsOverviewQuery),
    client.fetch(productsOverviewPageQuery),
  ]);

  const items = products.map((product: SanityProduct) => ({
    productSymbol: product.productSymbolUrl || "",
    name: product.name,
    nameAddition: product.nameAddition,
    leadParagraph: product.highlight?.leadParagraph,
    href: `/products/${product.slug}`,
  }));

  return (
    <>
      <ProductsOverview items={items} />
      <CardSection cards={pageData?.cards || []} />
    </>
  );
}
