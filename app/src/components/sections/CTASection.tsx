import Spacer from "@/components/util/Spacer";

interface CTASectionProps {
    ctaTitle?: string;
    ctaButtonText?: string;
    ctaLink?: string;
}

export default function CTASection({ ctaTitle, ctaButtonText, ctaLink }: CTASectionProps) {
    return (
        <section className="bg-theme-bg text-theme-text">
            <Spacer size="main" />
            <div className="u-container max-w-[none] flex flex-col gap-xs t:gap-[var(--site--gutter)]">
                <div className="flex t:flex-row flex-col gap-xs mb-3 justify-between bg-theme-bg-secondary text-theme-text t:py-4 py-2 px-2 rounded-main">
                    <h3 className="u-text-style-h4 flex-1">{ctaTitle || "Get started with a demo"}</h3>
                    <a className="btn-main-wrap is-primary md:flex-1 px-2" href={ctaLink || "mailto:"}>
                        {ctaButtonText || "Request Demo"}
                    </a>
                </div>
            </div>
        </section>
    );
}
