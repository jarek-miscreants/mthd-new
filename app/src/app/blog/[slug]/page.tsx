import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentWithBody, getContent, getCollectionSlugs, getReadingTime } from "@/lib/content";
import type { BlogPostData, AuthorData } from "@/lib/content-types";
import BlogPost from "@/components/sections/BlogPost";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getCollectionSlugs("blog");
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;

    let result: { frontmatter: BlogPostData; contentHtml: string };
    try {
        result = await getContentWithBody<BlogPostData>(`blog/${slug}`);
    } catch {
        return { title: "Post Not Found" };
    }

    const post = result.frontmatter;

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
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
    });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;

    let result: { frontmatter: BlogPostData; contentHtml: string };
    try {
        result = await getContentWithBody<BlogPostData>(`blog/${slug}`);
    } catch {
        notFound();
    }

    const post = result.frontmatter;

    // Resolve author
    let author: AuthorData;
    try {
        author = await getContent<AuthorData>(`authors/${post.author}`);
        author.slug = post.author;
    } catch {
        author = { name: post.author, slug: post.author };
    }

    // Get reading time
    const estimatedReadingTime = getReadingTime(`blog/${slug}`);

    return (
        <BlogPost
            post={{
                title: post.title,
                subtitle: post.subtitle,
                slug,
                excerpt: post.excerpt,
                author: {
                    name: author.name,
                    slug: author.slug || post.author,
                    bio: author.bio,
                    role: author.role,
                    company: author.company,
                    avatarUrl: author.avatarUrl,
                    socialLinks: author.socialLinks,
                },
                publishedAt: post.publishedAt,
                category: post.category,
                featuredImageUrl: post.featuredImageUrl,
                featuredImageAlt: post.featuredImageAlt,
                estimatedReadingTime,
                contentHtml: result.contentHtml,
            }}
        />
    );
}
