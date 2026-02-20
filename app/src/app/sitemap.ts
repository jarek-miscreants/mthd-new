import { MetadataRoute } from "next";
import { getCollectionSlugs } from "@/lib/content";
import { getSiteUrl } from "@/lib/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const productSlugs = getCollectionSlugs("products");
  const legalSlugs = getCollectionSlugs("legal");
  const blogSlugs = getCollectionSlugs("blog");

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
    {
      url: `${baseUrl}/careers`,
    },
    {
      url: `${baseUrl}/blog`,
    },
    {
      url: `${baseUrl}/about`,
    },
  ];

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/products`,
    },
    ...productSlugs.map((slug) => ({
      url: `${baseUrl}/products/${slug}`,
    })),
  ];

  // Dynamic legal pages
  const legalPages: MetadataRoute.Sitemap = legalSlugs.map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
  }));

  // Dynamic blog pages
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
  }));

  return [...staticPages, ...productPages, ...legalPages, ...blogPages];
}
