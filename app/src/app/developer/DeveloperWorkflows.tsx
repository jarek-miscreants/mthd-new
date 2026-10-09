"use client";

import { useRef, useState } from "react";
import styles from "./DeveloperWorkflows.module.css";
import sectionStyles from "./Tradecraft.module.css";

const options = [
  {
    title: "Your harness",
    heading: "Method context. Your AI workflow.",
    description: "Connect your preferred AI harness to Method’s MCP. Give your agent the context and tools to build, integrate, and test against the Method platform.",
    capabilities: ["Method MCP", "Method APIs"],
    detail: "Use Method’s APIs to connect your harness to the rest of your development workflow.",
  },
  {
    title: "Your IDE",
    heading: "Your editor. A full Git workflow.",
    description: "Build locally in your preferred IDE. Every Tool is backed by a Git repository, so you can branch, review, and push using your existing workflow.",
    capabilities: ["Method APIs", "Git"],
    detail: "Use Method’s APIs to integrate your tools and automate your development workflow.",
  },
  {
    title: "Method Code Editor",
    heading: "An AI agent, with mission context.",
    description: "Build in Method’s browser-based Code Editor, built on VSCode and OpenCode. An integrated AI agent uses Method’s MCP and APIs to help develop, test, and deploy your tools.",
    capabilities: ["Method MCP", "Method APIs", "AI Agent"],
    detail: "All AI inference runs through the Method platform, using only approved AI inference.",
  },
];

export default function DeveloperWorkflows() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = options[active];
  return <section data-theme="dark" className={`${sectionStyles.section} ${styles.section}`} aria-labelledby="workflows-title">
    <div className={styles.card}>
      <h2 id="workflows-title">Develop wherever you think best.</h2>
      <div className={styles.body}>
        <div className={styles.tabs} role="tablist" aria-label="Development environment" aria-orientation="vertical">
          {options.map((option, index) => <button key={option.title} ref={node => { tabs.current[index] = node; }}
            id={`workspace-tab-${index}`} role="tab" aria-selected={active === index} aria-controls={`workspace-panel-${index}`} tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)} onKeyDown={event => {
              let next = index;
              if (event.key === "ArrowDown") next = (index + 1) % options.length;
              else if (event.key === "ArrowUp") next = (index + options.length - 1) % options.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = options.length - 1;
              else return;
              event.preventDefault(); setActive(next); tabs.current[next]?.focus();
            }}>{option.title}<span aria-hidden="true">↗</span></button>)}
        </div>
        <div className={styles.content} role="tabpanel" id={`workspace-panel-${active}`} aria-labelledby={`workspace-tab-${active}`} tabIndex={0}>
          <div className={styles.capabilities}>{item.capabilities.map(capability => <span key={capability}>{capability}</span>)}</div>
          <h3>{item.heading}</h3>
          <p>{item.description}</p>
          <p className={styles.detail}>{item.detail}</p>
        </div>
      </div>
    </div>
  </section>;
}
