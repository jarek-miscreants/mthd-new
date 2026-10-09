import type { Metadata } from "next";
import Tradecraft from "./Tradecraft";
import Deploy from "./Deploy";
import HeroMotion from "./HeroMotion";
import styles from "./page.module.css";

const description =
  "Unleash your tradecraft. Pair your cyber expertise with Method's world-class developer tooling to build and equip your cyber mission system.";

export const metadata: Metadata = {
  title: "Developer | Method Security",
  description,
  alternates: { canonical: "/developer" },
};

export default function DeveloperPage() {
  return (
    <>
    <section data-theme="dark" className={styles.hero} aria-labelledby="developer-title">
      <HeroMotion />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.eyebrow}>Method / Developer</p>
        <h1 id="developer-title" className={styles.title}>
          Every operator<br />is a developer.
        </h1>
        <p className={styles.description}>
          <span>Unleash your tradecraft.</span> Pair your cyber expertise with
          Method&apos;s world-class developer tooling to build and equip your cyber mission system.
        </p>
        <ol className={styles.steps} aria-label="From development to mission effects">
          {["Develop", "Equip", "Deliver effects"].map((step, index) => (
            <li key={step}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
    <Tradecraft />
    <Deploy />
    </>
  );
}
