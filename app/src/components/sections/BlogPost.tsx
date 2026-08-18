import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ClockFading } from "lucide-react";
import styles from "./BlogPost.module.css";
import Spacer from "../util/Spacer";

interface BlogPostProps {
    post: {
        title: string;
        subtitle?: string;
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
        contentHtml: string;
    };
}

export default function BlogPost({ post }: BlogPostProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <section className="bg-theme-bg text-theme-text">
            <Spacer size="main" />
            <article className={`${styles.container} u-container mt-small t:mb-large mx-auto px-4`}>
                {/* Header */}
                <header>
                    <div className="flex items-center gap-2">
                        <Link href="/blog" className="btn-main-wrap is-secondary text-small group flex items-center gap-2">
                            <svg
                                className="w-[0.75em] rotate-[225deg] group-hover:rotate-[180deg] transition-transform duration-[400ms] ease-[ease]"
                                width="100%"
                                height="100%"
                                viewBox="0 0 21 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.430332 7.57992L16.682 7.58375L11.2771 2.17879L12.78 0.675862L20.7046 8.60042L12.8243 16.4806L11.402 15.0583L16.8247 9.63556L0.430821 9.65201L0.430332 7.57992Z"
                                    fill="currentColor"
                                />
                            </svg>
                            Blog
                        </Link>
                        <button disabled className="btn-main-wrap is-primary text-small pointer-events-none">
                            {post.category}
                        </button>
                    </div>
                    <h1 className={styles.title}>{post.title}</h1>
                    {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}

                    <div className={`${styles.metadata} mt-small`}>
                        <div className={styles.authorSection}>
                            {post.author.avatarUrl && (
                                <Image
                                    src={post.author.avatarUrl}
                                    alt={post.author.name}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            )}
                            <div className={styles.authorInfo}>
                                By {post.author.name}
                                {post.author.role && ` • ${post.author.role}`}
                                {post.author.company && ` at ${post.author.company}`}
                            </div>
                        </div>

                        <div className={styles.dateSection}>
                            {post.estimatedReadingTime && (
                                <span className="flex items-center gap-2">
                                    <ClockFading className="w-2 h-2" />
                                    {post.estimatedReadingTime} min read
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <CalendarDays className="w-2 h-2" />
                                {formatDate(post.publishedAt)}
                            </span>
                        </div>
                    </div>

                    {post.featuredImageUrl && (
                        <div className="mb-small">
                            <Image
                                src={post.featuredImageUrl}
                                alt={post.featuredImageAlt || post.title}
                                width={1000}
                                height={500}
                                className="w-full h-auto rounded-main"
                                priority
                            />
                        </div>
                    )}
                </header>

                {/* Content */}
                <div
                    className={styles.prose}
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />

                {/* Back to Blog Button */}
                <div className="flex justify-center mt-large">
                    <Link href="/blog" className="btn-main-wrap is-secondary text-small group flex items-center gap-2">
                        <svg
                            className="w-[0.75em] rotate-[225deg] group-hover:rotate-[180deg] transition-transform duration-[400ms] ease-[ease]"
                            width="100%"
                            height="100%"
                            viewBox="0 0 21 17"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0.430332 7.57992L16.682 7.58375L11.2771 2.17879L12.78 0.675862L20.7046 8.60042L12.8243 16.4806L11.402 15.0583L16.8247 9.63556L0.430821 9.65201L0.430332 7.57992Z"
                                fill="currentColor"
                            />
                        </svg>
                        Back to All Blogs
                    </Link>
                </div>
            </article>
        </section>
    );
}
