import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { aboutPageQuery } from "@/lib/queries";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import CompanyHighlight from "@/components/sections/CompanyHighlight";
import CardSection from "@/components/sections/CardSection";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
    const data = await client.fetch<{
        seo?: {
            title?: string;
            description?: string;
            ogTitle?: string;
            ogDescription?: string;
            ogImage?: { url?: string } | null;
        } | null;
    }>(aboutPageQuery);

    return mapSeoToMetadata(data?.seo, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
    });
}

export default async function About() {
    const data = await client.fetch<{
        highlightTexts?: Array<{ eyebrow: string; text: string }>;
        cards?: Array<{
            eyebrow: string;
            title: string;
            href: string;
            target?: "_self" | "_blank";
        }>;
    } | null>(aboutPageQuery);

    return (
        <>
            <div data-no-eyebrow-animation className={styles.noEyebrowAnimation}>
                <CompanyHighlight highlightTexts={data?.highlightTexts || []} />
            </div>
            <CardSection cards={data?.cards || []} />
        </>
    );
}
