import { MetadataRoute } from "next";
import { client } from "@/lib/sanity";
import { allProductSlugsQuery, allLegalSlugsQuery } from "@/lib/queries";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const products = await client.fetch<{ slug: string }[]>(allProductSlugsQuery);
  const legals = await client.fetch<{ slug: string }[]>(allLegalSlugsQuery);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
    },
    {
      url: `${baseUrl}/company`,
    },
    {
      url: `${baseUrl}/contact`,
    },
  ];

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/products`,
    },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
    })),
  ];

  // Dynamic product pages
  const legalPages: MetadataRoute.Sitemap = legals.map((legal) => ({
    url: `${baseUrl}/legal/${legal.slug}`,
  }));

  return [...staticPages, ...productPages, ...legalPages];
}
