"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/brand/Logo";
import { AppWindow, Blocks, Bot, Braces, Cpu, Network, Radio, Terminal, type LucideIcon } from "lucide-react";
import styles from "./MissionArchitecture.module.css";

function Node({ label, customLabel, icon: Icon }: { label: string; customLabel?: string; icon: LucideIcon }) {
  const [custom, setCustom] = useState(false);
  const replacement = customLabel ?? `Your ${label.toLowerCase()}`;
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      timer = setTimeout(() => {
        if (!document.hidden) setCustom(value => !value);
        schedule();
      }, 2800 + Math.random() * 5200);
    }
    function update() {
      clearTimeout(timer);
      setCustom(false);
      if (!motion.matches) schedule();
    }
    update();
    motion.addEventListener("change", update);
    return () => { clearTimeout(timer); motion.removeEventListener("change", update); };
  }, []);
  return <div className={styles.node} aria-label={`${label} — ${replacement}`}>
    <Icon size={21} strokeWidth={1.25} aria-hidden="true" />
    <span className={styles.labelWindow} aria-hidden="true"><span className={styles.labelTrack} data-custom={custom}>
      <span>{label}</span><span>{replacement}</span>
    </span></span>
  </div>;
}

export default function MissionArchitecture() {
  return <div className={styles.schematic}>
    <div className={styles.horizontalExtensions} aria-hidden="true" />
    <div className={styles.verticalExtensions} aria-hidden="true" />
    <div className={styles.architecture} aria-label="Method system architecture">
    <section className={`${styles.boundary} ${styles.custom}`} aria-labelledby="custom-workflows-title">
      <h3 id="custom-workflows-title">Custom workflows</h3>
      <div className={styles.threeNodes}>
        <Node label="Apps" customLabel="Your custom apps" icon={AppWindow} />
        <Node label="Integrations" customLabel="Your custom integrations" icon={Blocks} />
        <Node label="Models" icon={Cpu} />
      </div>
    </section>
    <div className={styles.apiConnection}><span className={styles.verticalLine} aria-hidden="true" /><span>Method Public API</span><span className={styles.verticalLine} aria-hidden="true" /></div>
    <section className={`${styles.boundary} ${styles.method}`} aria-labelledby="architecture-method-title">
      <h3 id="architecture-method-title" className={styles.methodLabel}>Method</h3>
      <div className={styles.methodHeader}><Logo title="Method" className={styles.methodLogo} /><p>Mission system</p></div>
      <section className={styles.group} aria-labelledby="agent-systems-title">
        <h4 id="agent-systems-title">Agent systems</h4>
        <div className={styles.threeNodes}>
          <Node label="Agents" icon={Bot} />
          <Node label="Skills" icon={Braces} />
          <Node label="Models" icon={Cpu} />
        </div>
      </section>
      <section className={`${styles.group} ${styles.tooling}`} aria-labelledby="architecture-tooling-title">
        <h4 id="architecture-tooling-title">Tools</h4>
        <Node label="Tools" icon={Terminal} />
      </section>
    </section>
    <div className={styles.executionConnection} aria-label="Method connects to mission execution infrastructure"><span aria-hidden="true" /></div>
    <section className={`${styles.boundary} ${styles.execution}`} aria-labelledby="execution-infra-title">
      <h3 id="execution-infra-title">Execution infra</h3>
      <Node label="C2" customLabel="Your C2" icon={Radio} />
      <div className={styles.internalConnection} aria-hidden="true" />
      <Node label="Jackal / Access" customLabel="Your implants" icon={Network} />
    </section>
  </div>
  </div>;
}
