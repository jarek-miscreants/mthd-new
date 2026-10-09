"use client";

import { useRef, useState } from "react";
import Eyebrow from "@/components/elements/GEyebrow";
import CapabilityPreview from "./CapabilityPreview";
import DeveloperWorkflows from "./DeveloperWorkflows";
import ToolsPreview from "./ToolsPreview";
import WorkflowPreview from "./WorkflowPreview";
import ExecutionPreview from "./ExecutionPreview";
import MissionArchitecture from "./MissionArchitecture";
import styles from "./Tradecraft.module.css";

const tabs = [
  { name: "Tools" },
  { name: "C2 & Implants" },
  { name: "Agents" },
  { name: "Workflows" },
];


export default function Tradecraft() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <div data-theme="dark" className={styles.sections}>
      <section className={styles.section} aria-labelledby="tradecraft-title">
        <Eyebrow customClass={styles.eyebrow}>DEVELOP</Eyebrow>
        <h2 id="tradecraft-title" className={`${styles.heading} ${styles.tradecraftHeading}`}>The mission needs<br />your tradecraft</h2>
        <p className={styles.description}>Every part of the Method system can be replaced or augmented with your own tradecraft. Use your custom Tools or favorite third-party Tools instead of Method&apos;s bundled Tools. Integrate with your preferred C2 architecture. Connect your access points and implants. And build and deploy custom Agents to power the autonomy that orchestrates it all.</p>
        <div className={styles.tabs} role="tablist" aria-label="Tradecraft">
          {tabs.map((tab, index) => (
            <button key={tab.name} ref={(node) => { tabRefs.current[index] = node; }}
              role="tab" id={`tradecraft-tab-${index}`} aria-controls={`tradecraft-panel-${index}`}
              aria-selected={active === index} tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
                else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else return;
                event.preventDefault(); setActive(next); tabRefs.current[next]?.focus();
              }}>
              {tab.name}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`tradecraft-panel-${active}`} aria-labelledby={`tradecraft-tab-${active}`} tabIndex={0} className={active === 0 ? styles.toolsPanel : styles.panel}>
          {active === 0 ? <ToolsPreview /> : active === 3 ? <WorkflowPreview /> : active === 1 ? <ExecutionPreview /> : <CapabilityPreview kind="Agents" />}
        </div>
      </section>
      <DeveloperWorkflows />
      <section className={`${styles.section} ${styles.equip}`} aria-labelledby="equip-title">
        <Eyebrow customClass={styles.eyebrow}>EQUIP</Eyebrow>
        <h2 id="equip-title" className={styles.heading}>Your ultimate cyber mission system.</h2>
        <p className={`${styles.description} ${styles.equipDescription}`}>Method enables your creativity and tradecraft without compromise. Replace or augment any part of the system with your own. Method handles scale, orchestration, and autonomy so you can focus on the tradecraft.</p>
        <MissionArchitecture />
      </section>
    </div>
  );
}
