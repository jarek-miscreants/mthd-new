import type { HomePrototypeData } from "@/lib/content-types";
import HomeFeatureCard from "./HomeFeatureCard";
import styles from "./HomeMission.module.css";

export default function HomeMission(props: HomePrototypeData["mission"]) {
  return (
    <section className={styles.section} aria-labelledby="home-mission-label">
      <HomeFeatureCard id="home-mission" {...props} />
    </section>
  );
}
