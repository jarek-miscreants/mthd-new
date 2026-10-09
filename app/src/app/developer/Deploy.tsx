import Eyebrow from "@/components/elements/GEyebrow";
import HomeFeatureCard from "@/components/sections/HomeFeatureCard";
import { getContent } from "@/lib/content";
import type { HomePrototypeData } from "@/lib/content-types";
import styles from "./Deploy.module.css";

export default async function Deploy() {
  const { operationCards } = await getContent<HomePrototypeData>("pages/home-prototype");
  return <section data-theme="dark" className={styles.section} aria-labelledby="deploy-title">
    <div className={styles.intro}>
      <Eyebrow customClass={styles.eyebrow}>Deploy</Eyebrow>
      <h2 id="deploy-title">Scale your tradecraft to meet hardcore missions.</h2>
      <p>Put your tools, access, and agents to work across the enterprise, in contested environments, and at the edge. Method brings the scale and orchestration to turn your tradecraft into mission effects.</p>
    </div>
    <div className={styles.cards}>
      {operationCards.map(card => <HomeFeatureCard key={card.id} {...card} id={card.id.replace("home-", "deploy-")} compact />)}
    </div>
  </section>;
}
