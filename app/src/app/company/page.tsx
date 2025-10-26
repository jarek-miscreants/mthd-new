import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { companyOverviewQuery } from "@/lib/queries";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import CompanyOverview from "@/components/sections/CompanyOverview";
import Spacer from "@/components/util/Spacer";

export async function generateMetadata(): Promise<Metadata> {
    const data = await client.fetch<{
        seo?: {
            title?: string;
            description?: string;
            ogTitle?: string;
            ogDescription?: string;
            ogImage?: { url?: string } | null;
        } | null;
    }>(companyOverviewQuery);

    return mapSeoToMetadata(data?.seo, {
        defaultOg: "",
        robots: { index: false, follow: false },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/company`,
    });
}

interface CompanyNavItem {
    label: string;
    href: string;
    target?: "_self" | "_blank";
}

export default async function Company() {
    const [navData] = await Promise.all([
        client.fetch<{
            companyItems?: CompanyNavItem[];
        } | null>(companyOverviewQuery),
    ]);

    const items = navData?.companyItems || [];

    return (
        <>
            <CompanyOverview items={items} />
            <Spacer size="small" />
        </>
    );
}
