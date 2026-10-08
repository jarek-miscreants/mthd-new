import type { HomeFeatureCardData } from "@/lib/content-types";
import HomeFeatureCard from "./HomeFeatureCard";
import styles from "./HomeMission.module.css";

export default function HomeFeatureRow({ cards, columns = 2 }: { cards: HomeFeatureCardData[]; columns?: 2 | 3 }) {
  return (
    <section className={`${styles.section} ${columns === 3 ? styles.threeColumn : styles.twoColumn}`} aria-label={columns === 3 ? "Missions" : "Explore Method"}>
      {cards.map((card) => <HomeFeatureCard key={card.id} {...card} compact />)}
    </section>
  );
}
