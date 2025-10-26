import CompanyOverviewItem, { CompanyOverviewItemProps } from "./CompanyOverviewItem";

export interface CompanyOverviewProps {
    items: CompanyOverviewItemProps[];
}

export default function CompanyOverview({ items }: CompanyOverviewProps) {
    return (
        <section>
            <div className="u-container max-w-[none] flex flex-col gap-xs t:gap-small pt-main">
                {items.map((item, index) => (
                    <CompanyOverviewItem key={index} {...item} />
                ))}
            </div>
        </section>
    );
}
