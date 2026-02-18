import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import type { CompanyPageData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import CompanyOverview from "@/components/sections/CompanyOverview";
import Spacer from "@/components/util/Spacer";

export async function generateMetadata(): Promise<Metadata> {
    const data = await getContent<CompanyPageData>("pages/company");

    return mapSeoToMetadata(data?.seo, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/company`,
    });
}

export default async function Company() {
    const data = await getContent<CompanyPageData>("pages/company");

    const items = data?.companyItems || [];

    return (
        <>
            <CompanyOverview items={items} />
            <Spacer size="small" />
        </>
    );
}
