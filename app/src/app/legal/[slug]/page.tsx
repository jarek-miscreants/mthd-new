import type { Metadata } from "next";
import { getContentWithBody, getCollectionSlugs } from "@/lib/content";
import type { LegalPageData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import LegalSection from "@/components/sections/LegalSection";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let result: { frontmatter: LegalPageData; contentHtml: string };
  try {
    result = await getContentWithBody<LegalPageData>(`legal/${slug}`);
  } catch {
    return { title: "Not Found" };
  }

  return mapSeoToMetadata(result.frontmatter?.seo, {
    defaultOg: "",
    robots: { index: false, follow: false },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/legal/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = getCollectionSlugs("legal");
  return slugs.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Legal({ params }: PageProps) {
  const { slug } = await params;

  let result: { frontmatter: LegalPageData; contentHtml: string };
  try {
    result = await getContentWithBody<LegalPageData>(`legal/${slug}`);
  } catch {
    notFound();
  }

  return (
    <LegalSection
      eyebrow={result.frontmatter.eyebrow}
      title={result.frontmatter.title}
      body={<div dangerouslySetInnerHTML={{ __html: result.contentHtml }} />}
    />
  );
}
