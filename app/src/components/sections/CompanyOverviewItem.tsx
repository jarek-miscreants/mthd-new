export interface CompanyOverviewItemProps {
    label: string;
    href: string;
    target?: "_self" | "_blank";
}

export default function CompanyOverviewItem({ label, href, target = "_self" }: CompanyOverviewItemProps) {
    return (
        <a
            href={href}
            target={target}
            className="bg-theme-bg-secondary text-theme-text p-xs t:p-small rounded-main flex items-center min-h-[120px] t:min-h-[160px]"
        >
            <h2 className="u-text-style-h2">{label}</h2>
        </a>
    );
}
