import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import type { AboutPageData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import CompanyHighlight from "@/components/sections/CompanyHighlight";
import CardSection from "@/components/sections/CardSection";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
    const data = await getContent<AboutPageData>("pages/about");

    return mapSeoToMetadata(data?.seo, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
    });
}

export default async function About() {
    const data = await getContent<AboutPageData>("pages/about");

    return (
        <>
            <div data-no-eyebrow-animation className={styles.noEyebrowAnimation}>
                <CompanyHighlight highlightTexts={data?.highlightTexts || []} />
            </div>
            <CardSection cards={data?.cards || []} />
        </>
    );
}
