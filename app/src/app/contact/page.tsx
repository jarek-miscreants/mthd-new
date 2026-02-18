import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import type { ContactPageData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import CardSection from "@/components/sections/CardSection";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getContent<ContactPageData>("pages/contact");

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
  });
}

export default async function Contact() {
  const data = await getContent<ContactPageData>("pages/contact");

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
