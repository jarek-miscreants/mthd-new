import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { client } from "@/lib/sanity";
import { blogPostQuery, allBlogPostSlugsQuery } from "@/lib/queries";
import BlogPost from "@/components/sections/BlogPost";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

interface BlogPostPageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    const slugs = await client.fetch<{ slug: string }[]>(allBlogPostSlugsQuery);
    return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = await client.fetch<{
        title?: string;
        excerpt?: string;
        seo?: {
            title?: string;
            description?: string;
            ogTitle?: string;
            ogDescription?: string;
            ogImage?: { url?: string } | null;
        } | null;
    }>(blogPostQuery, { slug: params.slug });

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    // Merge post data with seo data
    const seoWithDefaults = {
        title: post.seo?.title || post.title,
        description: post.seo?.description || post.excerpt,
        ogTitle: post.seo?.ogTitle,
        ogDescription: post.seo?.ogDescription,
        ogImage: post.seo?.ogImage,
    };

    return mapSeoToMetadata(seoWithDefaults, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${params.slug}`,
    });
}

interface SanityBlogPost {
    title: string;
    slug: string;
    excerpt: string;
    author: {
        name: string;
        slug: string;
        bio?: string;
        role?: string;
        company?: string;
        avatarUrl?: string;
        socialLinks?: {
            twitter?: string;
            linkedin?: string;
            github?: string;
            website?: string;
        };
    };
    publishedAt: string;
    category: string;
    featuredImageUrl?: string;
    featuredImageAlt?: string;
    estimatedReadingTime?: number;
    body: any[];
    seo?: {
        title?: string;
        description?: string;
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: { url?: string } | null;
    } | null;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await client.fetch<SanityBlogPost>(blogPostQuery, { slug: params.slug });

    if (!post) {
        notFound();
    }

    return <BlogPost post={post} />;
}
