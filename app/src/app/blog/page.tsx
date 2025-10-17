import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { allBlogPostsQuery, blogPageQuery } from "@/lib/queries";
import BlogList from "@/components/sections/BlogList";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

export async function generateMetadata(): Promise<Metadata> {
    const data = await client.fetch<{
        seo?: {
            title?: string;
            description?: string;
            ogTitle?: string;
            ogDescription?: string;
            ogImage?: { url?: string } | null;
        } | null;
    }>(blogPageQuery);

    return mapSeoToMetadata(data?.seo, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
    });
}

interface SanityBlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    author: {
        name: string;
        slug: string;
        role?: string;
        company?: string;
        avatarUrl?: string;
    };
    publishedAt: string;
    category: string;
    featuredImageUrl?: string;
    featuredImageAlt?: string;
}

export default async function Blog() {
    const [posts, pageData] = await Promise.all([client.fetch<SanityBlogPost[]>(allBlogPostsQuery), client.fetch(blogPageQuery)]);

    return <BlogList posts={posts} pageData={pageData} />;
}
