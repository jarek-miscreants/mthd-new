import Image from "next/image";
import Eyebrow from "./GEyebrow";
import LinkIndicator from "@/components/elements/LinkIndicator";
import LinkIndicatorInteraction from "@/components/elements/LinkIndicatorInteraction";

export interface BlogCardProps {
    title: string;
    excerpt: string;
    author: string;
    publishedAt: string;
    category: string;
    slug: string;
    featuredImageUrl?: string;
    featuredImageAlt?: string;
}

export default function BlogCard({
    title,
    excerpt,
    author,
    publishedAt,
    category,
    slug,
    featuredImageUrl,
    featuredImageAlt,
}: BlogCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <LinkIndicatorInteraction triggerOnHover={true}>
            <a
                href={`/blog/${slug}`}
                className="bg-theme-bg-secondary text-theme-text hover:bg-theme-text hover:text-theme-bg-secondary rounded-main min-h-[11.75em] t:min-h-[18.75em] flex flex-col transition-colors duration-400 ease-out overflow-hidden"
            >
                {featuredImageUrl && (
                    <div className="relative w-full h-32 t:h-48 overflow-hidden">
                        <Image
                            src={featuredImageUrl}
                            alt={featuredImageAlt || title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                )}

                <div className="p-2 flex flex-col justify-between flex-1">
                    <div className="flex flex-col gap-xxs mb-2">
                        <Eyebrow>{category}</Eyebrow>
                        <h2 className="u-text-style-h4">{title}</h2>
                        <p className="text-small text-theme-text-secondary line-clamp-3">{excerpt}</p>
                    </div>

                    <div className="flex flex-col gap-xs">
                        <div className="text-small text-theme-text-secondary">
                            {author} • {formatDate(publishedAt)}
                        </div>
                        <LinkIndicator className="w-[3.0625em]" />
                    </div>
                </div>
            </a>
        </LinkIndicatorInteraction>
    );
}
