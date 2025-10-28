import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { contactPageQuery } from "@/lib/queries";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import CardSection from "@/components/sections/CardSection";

export async function generateMetadata(): Promise<Metadata> {
  const data = await client.fetch<{
    seo?: {
      title?: string;
      description?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: { url?: string } | null;
    } | null;
  }>(contactPageQuery);

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
  });
}

export default async function Contact() {
  const data = await client.fetch<{
    eyebrow?: string;
    text?: string;
    cards?: Array<{
      eyebrow: string;
      title: string;
      href: string;
      target?: "_self" | "_blank";
    }>;
  } | null>(contactPageQuery);

  return (
    <>
      <CardSection
        eyebrow={data?.eyebrow}
        text={data?.text}
        cards={data?.cards || []}
      />
    </>
  );
}
