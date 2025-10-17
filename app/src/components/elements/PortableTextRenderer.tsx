import { PortableText, type PortableTextComponents, type PortableTextBlock } from "@portabletext/react";
import Image from "next/image";

interface PortableTextRendererProps {
    value: PortableTextBlock;
    className?: string;
}

const components: PortableTextComponents = {
    block: {
        normal: ({ children }) => <p className="mb-2">{children}</p>,
        h2: ({ children }) => <h2 className="u-text-style-h4 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="u-text-style-h5 mb-1">{children}</h3>,
        h4: ({ children }) => <h4 className="u-text-style-h6 mb-1">{children}</h4>,
        h5: ({ children }) => <h5 className="text-large mb-1">{children}</h5>,
        h6: ({ children }) => <h6 className="text-main mb-1">{children}</h6>,
    },
    list: {
        bullet: ({ children }) => <ul className="list-disc pl-3 flex flex-col gap-3xs mb-3">{children}</ul>,
        number: ({ children }) => <ol className="list-decimal pl-3 flex flex-col gap-3xs mb-3">{children}</ol>,
    },
    marks: {
        strong: ({ children }) => <strong className="font-primary-medium">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        link: ({ children, value }) => {
            const { href, blank } = value;
            const isExternal = href?.startsWith("http") || href?.startsWith("https");
            const target = blank ? "_blank" : undefined;
            const rel = isExternal && blank ? "noopener noreferrer" : undefined;

            return (
                <a href={href} target={target} rel={rel} className="text-style-link">
                    {children}
                </a>
            );
        },
    },
    types: {
        image: ({ value }) => {
            const { asset, caption, alt } = value;
            if (!asset) return null;

            return (
                <figure className="my-6">
                    <Image
                        src={asset.url}
                        alt={alt || caption || ""}
                        width={800}
                        height={400}
                        className="w-full h-auto rounded-main"
                        priority={false}
                    />
                    {caption && <figcaption className="text-small text-theme-text-secondary mt-2 text-center">{caption}</figcaption>}
                </figure>
            );
        },
    },
};

export default function PortableTextRenderer({ value, className = "" }: PortableTextRendererProps) {
    return (
        <div className={className}>
            <PortableText value={value} components={components} />
        </div>
    );
}
