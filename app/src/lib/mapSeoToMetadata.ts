import type { Metadata } from "next";

export type MinimalSeo = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: { url?: string } | null;
};

export function mapSeoToMetadata(
  seo: MinimalSeo | null | undefined,
  options?: {
    defaultOg?: string;
    robots?: { index: boolean; follow: boolean };
    canonical?: string;
  },
): Metadata {
  const title = seo?.title || "";
  const description = seo?.description || "";
  const socialTitle = seo?.ogTitle || title;
  const socialDescription = seo?.ogDescription || description;
  const ogImageUrl = seo?.ogImage?.url || options?.defaultOg || "";

  return {
    title,
    description,
    robots: options?.robots ?? { index: false, follow: false },
    alternates: options?.canonical
      ? { canonical: options.canonical }
      : undefined,
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: [ogImageUrl],
    },
  };
}
