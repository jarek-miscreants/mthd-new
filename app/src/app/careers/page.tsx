import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { careersPageQuery } from "@/lib/queries";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import Careers from "@/components/sections/Careers";

export async function generateMetadata(): Promise<Metadata> {
    const data = await client.fetch<{
        seo?: {
            title?: string;
            description?: string;
            ogTitle?: string;
            ogDescription?: string;
            ogImage?: { url?: string } | null;
        } | null;
    }>(careersPageQuery);

    return mapSeoToMetadata(data?.seo, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/careers`,
    });
}

export default async function CareersPage() {
    const data = await client.fetch<{
        eyebrow?: string;
        text?: string;
        careersPageUrl?: string;
        section1Eyebrow?: string;
        section1Items?: Array<{
            title: string;
            description: string;
        }>;
        section2Eyebrow?: string;
        section2Items?: Array<{
            title: string;
            description: string;
        }>;
        mainImage?: {
            src: string;
            alt: string;
            aspectRatio?: number | null;
            cutAngle?: number | null;
        };
        secondaryImages?: Array<{
            src: string;
            alt: string;
            aspectRatio?: number | null;
            cutAngle?: number | null;
        }>;
        cards?: Array<{
            eyebrow: string;
            title: string;
            href: string;
            target?: "_self" | "_blank";
        }>;
    } | null>(careersPageQuery);

    return (
        <Careers
            eyebrow={data?.eyebrow}
            text={data?.text}
            careersPageUrl={data?.careersPageUrl}
            section1Eyebrow={data?.section1Eyebrow}
            section1Items={data?.section1Items}
            section2Eyebrow={data?.section2Eyebrow}
            section2Items={data?.section2Items}
            mainImage={data?.mainImage}
            secondaryImages={data?.secondaryImages}
        />
    );
}
