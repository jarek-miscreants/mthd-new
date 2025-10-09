import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { companyPageQuery } from "@/lib/queries";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import CompanyHighlight from "@/components/sections/CompanyHighlight";
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
  }>(companyPageQuery);

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: false, follow: false },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/company`,
  });
}

export default async function Company() {
  const data = await client.fetch<{
    highlightTexts?: Array<{ eyebrow: string; text: string }>;
    cards?: Array<{
      eyebrow: string;
      title: string;
      href: string;
      target?: "_self" | "_blank";
    }>;
  } | null>(companyPageQuery);

  return (
    <>
      <CompanyHighlight highlightTexts={data?.highlightTexts || []} />
      <CardSection cards={data?.cards || []} />
    </>
  );
}
