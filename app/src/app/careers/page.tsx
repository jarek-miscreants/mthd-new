import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import type { CareersPageData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import Careers from "@/components/sections/Careers";

export async function generateMetadata(): Promise<Metadata> {
    const data = await getContent<CareersPageData>("pages/careers");

    return mapSeoToMetadata(data?.seo, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/careers`,
    });
}

export default async function CareersPage() {
    const data = await getContent<CareersPageData>("pages/careers");

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
