import type { Metadata } from "next";
import { getContent, getCollection } from "@/lib/content";
import type { ProductData, ProductsOverviewPageData } from "@/lib/content-types";
import ProductsOverview from "@/components/sections/ProductsOverview";
import CardSection from "@/components/sections/CardSection";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getContent<ProductsOverviewPageData>("pages/products-overview");

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
  });
}

export default async function Products() {
  const [productEntries, pageData] = await Promise.all([
    getCollection<ProductData>("products"),
    getContent<ProductsOverviewPageData>("pages/products-overview"),
  ]);

  // Sort by sortOrder
  const sortedProducts = productEntries.sort(
    (a, b) => (a.frontmatter.sortOrder ?? 99) - (b.frontmatter.sortOrder ?? 99)
  );

  const items = sortedProducts.map((p) => ({
    productSymbol: p.frontmatter.productSymbolUrl || "",
    name: p.frontmatter.name,
    description: p.frontmatter.description,
    leadParagraph: p.frontmatter.highlight?.leadParagraph || "",
    href: `/products/${p.slug}`,
  }));

  return (
    <>
      <ProductsOverview items={items} />
      <CardSection cards={pageData?.cards || []} />
    </>
  );
}
