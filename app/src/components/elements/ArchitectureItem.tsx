import ArchitectureItemInteraction from "./ArchitectureItemInteraction";
import styles from "@/components/elements/ArchitectureItem.module.css";

export interface ArchitectureItemProps {
    title: string;
    subtext: string;
}

export default function ArchitectureItem({ title, subtext }: ArchitectureItemProps) {
    return (
        <ArchitectureItemInteraction>
            <div className={`${styles.item_wrapper} t:grid t:grid-cols-12 flex flex-col`}>
                <h3
                    data-architecture-title
                    className={`${styles.item_h} relative t:col-start-1 t:col-end-6 u-text-style-h2 max-w-[14ch] pl-[20px] t:pl-[0.5em] py-3xs`}
                >
                    {title}
                </h3>
                <p
                    data-architecture-subtext
                    className={`${styles.item_p} text-main relative t:col-start-7 t:col-end-[-1] pl-[20px] t:pl-[1.875em] py-xxs`}
                >
                    {subtext}
                </p>
            </div>
        </ArchitectureItemInteraction>
    );
}
