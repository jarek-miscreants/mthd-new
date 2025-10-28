import type { Metadata } from "next";

export type MinimalSeo = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: { url?: string } | null;
};

export type SocialDefaults = {
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
};

export function mapSeoToMetadata(
  seo: MinimalSeo | null | undefined,
  options?: {
    defaultOg?: string;
    robots?: { index: boolean; follow: boolean };
    canonical?: string;
    socialDefaults?: SocialDefaults;
  },
): Metadata {
  const title = seo?.title || "";
  const description = seo?.description || "";
  const socialTitle = seo?.ogTitle || title || options?.socialDefaults?.title || "";
  const socialDescription = seo?.ogDescription || description || options?.socialDefaults?.description || "";
  const ogImageUrl = seo?.ogImage?.url || options?.defaultOg || options?.socialDefaults?.imageUrl || "";
  const ogImageWidth = options?.socialDefaults?.imageWidth;
  const ogImageHeight = options?.socialDefaults?.imageHeight;

  return {
    title,
    description,
    robots: options?.robots ?? { index: false, follow: false },
    alternates: options?.canonical
      ? { canonical: options.canonical }
      : undefined,
    openGraph: {
      type: "website",
      title: socialTitle,
      description: socialDescription,
      url: options?.socialDefaults?.url,
      images: [
        {
          url: ogImageUrl,
          width: ogImageWidth,
          height: ogImageHeight,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: [ogImageUrl],
    },
  };
}
