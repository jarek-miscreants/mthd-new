import type { Metadata } from "next";
import { getContent, getCollection } from "@/lib/content";
import type { BlogPostData, BlogPageData, AuthorData } from "@/lib/content-types";
import BlogList from "@/components/sections/BlogList";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await getContent<BlogPageData>("pages/blog");

    return mapSeoToMetadata(pageData?.seo, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
    });
}

export default async function Blog() {
    const [postEntries, pageData, authorEntries] = await Promise.all([
        getCollection<BlogPostData>("blog"),
        getContent<BlogPageData>("pages/blog"),
        getCollection<AuthorData>("authors"),
    ]);

    // Build author lookup map
    const authorMap = new Map<string, AuthorData>();
    for (const a of authorEntries) {
        authorMap.set(a.slug, { ...a.frontmatter, slug: a.slug });
    }

    // Sort posts by publishedAt (newest first) and resolve authors
    const posts = postEntries
        .sort((a, b) =>
            new Date(b.frontmatter.publishedAt).getTime() -
            new Date(a.frontmatter.publishedAt).getTime()
        )
        .map((p, idx) => {
            const author = authorMap.get(p.frontmatter.author) || {
                name: p.frontmatter.author,
                slug: p.frontmatter.author,
            };
            return {
                _id: String(idx),
                title: p.frontmatter.title,
                slug: p.slug,
                excerpt: p.frontmatter.excerpt,
                author: {
                    name: author.name,
                    slug: author.slug || p.frontmatter.author,
                    role: author.role,
                    company: author.company,
                    avatarUrl: author.avatarUrl,
                },
                publishedAt: p.frontmatter.publishedAt,
                category: p.frontmatter.category,
                featuredImageUrl: p.frontmatter.featuredImageUrl,
                featuredImageAlt: p.frontmatter.featuredImageAlt,
            };
        });

    return <BlogList posts={posts} pageData={pageData} />;
}
