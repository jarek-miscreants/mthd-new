import { client } from "@/lib/sanity";
import { firstBlogPostQuery, aboutPageQuery } from "@/lib/queries";
import PortableTextRenderer from "@/components/elements/PortableTextRenderer";
import Spacer from "@/components/util/Spacer";
import styles from "./page.module.css";
import CardSection from "@/components/sections/CardSection";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import { Metadata } from "next";

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

interface BlogPost {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any[];
}

export default async function AboutPage() {
    const post = await client.fetch<BlogPost>(firstBlogPostQuery);

    const data = await client.fetch<{
        highlightTexts?: Array<{ eyebrow: string; text: string }>;
        cards?: Array<{
          eyebrow: string;
          title: string;
          href: string;
          target?: "_self" | "_blank";
        }>;
      } | null>(aboutPageQuery);

    if (!post) {
        return (
            <section className="bg-theme-bg text-theme-text">
                <Spacer size="main" />
                <div className="u-container mx-auto px-4">
                    <h1 className={styles.title}>No blog post found</h1>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-theme-bg text-theme-text">
            <Spacer size="large" />
            <article className={`${styles.container} u-container mx-auto px-4`}>
                {/* Title */}
                <h1 className={styles.title}>{post.title}</h1>

                {/* Content */}
                <div className={styles.prose}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <PortableTextRenderer value={post.body as any} />
                </div>
            </article>
            <CardSection cards={data?.cards || []} />
        </section>
    );
}
