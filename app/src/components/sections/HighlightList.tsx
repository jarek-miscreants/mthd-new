import HighlightItem, { HighlightItemData } from "../elements/HighlightItem";

export interface HighlightListProps {
    items: HighlightItemData[];
}

export default function HighlightList({ items }: HighlightListProps) {
    return (
        <div className="flex flex-col">
            {items.map((item, index) => (
                <HighlightItem key={index} title={item.title} description={item.description} />
            ))}
        </div>
    );
}
