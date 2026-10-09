"use client";

import { useState } from "react";
import styles from "./ToolsPreview.module.css";

export default function CapabilityPreview({ kind }: { kind: "C2" | "Implants" | "Agents" }) {
  const [custom, setCustom] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);
  const c2 = kind === "C2";
  const implant = kind === "Implants";
  const title = c2 ? "Your C2. Connected to the mission." : implant ? "Your implant. Its own capabilities." : "Build agents that work like you.";
  const snippet = c2
    ? `# Conceptual adapter configuration\nconnection:\n  provider: ${custom ? "your_c2" : "method_c2"}\n  workflow_input: method\n  result_output: method\n\n# Preserve the context in both directions.\nworkflows: receive\nsignals: return`
    : implant
      ? `# Illustrative capability manifest\nimplant:\n  name: range-jackal\n  implementation: ${custom ? "third_party_bridge" : "custom_jackal"}\n\ncapabilities:\n  - host_inventory${enabled ? "\n  - file_metadata" : ""}\n\n# Tools declare the capability they need.\ntool_requires: file_metadata`
      : `# Illustrative agent definition\nname: inventory-reviewer\nmodel: ${custom ? "your_model" : "method_configured"}\n\ntools:\n  - read_inventory\n  - inspect_findings\nskills:${enabled ? "\n  - inventory_review" : " []"}\n\ninstructions: |\n  Review existing inventory.\n  Summarize gaps and cite evidence.`;

  return <div className={styles.demo}>
    <div className={styles.topline}><h3>{title}</h3></div>
    <div className={styles.choiceBar}><span>{c2 ? "Infrastructure" : implant ? "Implementation" : "Model"}</span><button aria-pressed={!custom} onClick={() => { setCustom(false); setChecked(false); }}>{c2 ? "Method C2" : implant ? "Your Jackal" : "Method-configured"}</button><button aria-pressed={custom} onClick={() => { setCustom(true); setChecked(false); }}>{c2 ? "Your C2" : implant ? "Third-party bridge" : "Your model"}</button></div>
    <div className={styles.testLayout}>
      <div className={styles.editor}><div className={styles.bar}>{c2 ? "connection.yaml" : implant ? "capabilities.yaml" : "agent.yaml"}</div><div className={styles.codeBody}><pre>{snippet}</pre></div>{!c2 && <div className={styles.editorFooter}><span>{implant ? "Advertise what your implant can do" : "Add your team's reusable expertise"}</span><button className={styles.subtle} aria-pressed={enabled} onClick={() => { setEnabled(!enabled); setChecked(false); }}>{enabled ? "− Remove" : "+ Add"} {implant ? "capability" : "skill"}</button></div>}</div>
      <div className={styles.results}><div className={styles.bar}>{c2 ? "Connection preview" : implant ? "Capability check" : "Agent workspace"}</div><div className={styles.resultBody}>

        {c2 ? <><div className={styles.route}><span>Method</span><b>⇄</b><span>{custom ? "Your C2 adapter" : "Method C2"}</span><b>⇄</b><span>Implant</span></div><p className={styles.explanation}>Connect compatible infrastructure so work reaches your execution environment and results return to the same mission context.</p><button className={styles.run} onClick={() => setChecked(true)}>Preview round trip</button><div aria-live="polite">{checked && <div className={styles.eventLog}><p>01 · Sample workflow handed to {custom ? "your adapter" : "Method C2"}</p><p>02 · Simulated implant returns a signal</p><p>03 · Result attached to the originating work</p><span className={styles.success}>✓ Context preserved across the connection</span></div>}</div></>
          : implant ? <><div className={styles.operationNode}><span>TOOL REQUIREMENT</span><strong>Read file metadata</strong><code>requires: file_metadata</code></div><p className={styles.explanation}>A Jackal advertises its capabilities. Method checks the match before assigning work. A compatible bridge can expose third-party capabilities through the same boundary.</p><button className={styles.run} onClick={() => setChecked(true)}>Check compatibility</button><div aria-live="polite">{checked && <div className={styles.eventLog}><span className={enabled ? styles.success : styles.error}>{enabled ? "✓ Capability matched. This work is compatible." : "Missing capability: file_metadata"}</span><p>{enabled ? "The preview can now assign this tool to the runtime." : "Add the capability to the manifest, then check again."}</p></div>}</div></>
          : <><div className={styles.operationNode}><span>AGENT / INVENTORY REVIEWER</span><strong>{custom ? "Your configured model" : "Method-configured model"}</strong><p>2 tools · {enabled ? "1 skill" : "No skills selected"}</p></div><p className={styles.explanation}>Choose a model, grant the right tools, and attach your skills. Your agent works with platform context under the same Rules of Engagement.</p><button className={styles.run} onClick={() => setChecked(true)}>Preview agent</button><div aria-live="polite">{checked && <div className={styles.eventLog}><p>01 · Read sample inventory</p><p>02 · {enabled ? "Apply your inventory-review skill" : "Review using the agent instructions"}</p><p>03 · Summarize gaps with supporting evidence</p><span className={styles.success}>✓ Example report ready for review</span></div>}</div></>}
      </div></div>
    </div><div className={styles.footnote}><span>Conceptual configuration · local simulation</span><a href={`https://docs.method.security/platform/architecture/${c2 || implant ? "jackal-c2" : "agent-orchestration"}`} target="_blank" rel="noreferrer">Explore the architecture ↗</a></div>
  </div>;
}
