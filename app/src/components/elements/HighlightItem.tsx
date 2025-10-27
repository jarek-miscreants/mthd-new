import HighlightItemInteraction from "./HighlightItemInteraction";
import styles from "@/components/elements/HighlightItem.module.css";

export interface HighlightItemData {
    title: string;
    description: string;
}

export interface HighlightItemProps {
    title: string;
    description: string;
}

export default function HighlightItem({ title, description }: HighlightItemProps) {
    return (
        <HighlightItemInteraction>
            <div className={`${styles.item_wrapper} t:grid t:grid-cols-12 flex flex-col`}>
                <h3
                    data-highlight-title
                    className={`${styles.item_h} relative t:col-start-1 t:col-end-6 u-text-style-h3 max-w-[25ch] pl-[20px] t:pl-[0.5em] py-3xs`}
                >
                    {title}
                </h3>
                <p
                    data-highlight-description
                    className={`${styles.item_p} text-main relative t:col-start-7 t:col-end-[-1] pl-[20px] t:pl-[1.875em] py-xxs`}
                >
                    {description}
                </p>
            </div>
        </HighlightItemInteraction>
    );
}
