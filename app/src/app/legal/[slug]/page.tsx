import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allLegalSlugsQuery, legalPageQuery } from "@/lib/queries";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import LegalSection from "@/components/sections/LegalSection";
import PortableTextRenderer from "@/components/elements/PortableTextRenderer";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/react";

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
  }>(legalPageQuery, { slug });

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: false, follow: false },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/legal/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(allLegalSlugsQuery);
  return slugs.map(({ slug }) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Legal({ params }: PageProps) {
  const { slug } = await params;

  const data = await client.fetch<{
    title: string;
    eyebrow?: string;
    body: PortableTextBlock;
  } | null>(legalPageQuery, { slug });

  if (!data) notFound();

  return (
    <LegalSection
      eyebrow={data.eyebrow}
      title={data.title}
      body={<PortableTextRenderer value={data.body} />}
    />
  );
}
