"use client";

import { useState } from "react";
import styles from "./ToolsPreview.module.css";

export default function WorkflowPreview() {
  const [loaded, setLoaded] = useState(false);
  return <div className={styles.demo}>
    <div className={styles.topline}><h3>Build custom applications on the Method API.</h3></div>
    <div className={styles.testLayout}>
      <div className={styles.editor}>
        <div className={styles.bar}>mission-overview.ts <span>Application pseudocode</span></div>
        <div className={styles.codeBody}><pre>{`// Your application, backed by Method context.
// This adapter represents your API integration;
// names below are not Method SDK methods.
const objects = await apiAdapter.loadObjects();

const pages = objects.filter(
  object => object.type === "WebPage"
);

// Present the same context in your own UI.
renderOverview({
  title: "Web inventory",
  pages,
  total: pages.length,
});`}</pre></div>
      </div>
      <div className={styles.results}>
        <div className={styles.bar}>Your app / Web inventory</div>
        <div className={styles.resultBody}>
          <p>Use Method’s public API to build custom interfaces, connect existing applications, and fit mission context into your own workflows.</p>
          <button className={styles.run} onClick={() => setLoaded(!loaded)}>{loaded ? "Clear preview" : "Load example data"}</button>
          <div aria-live="polite">{loaded && <div className={styles.eventLog}><p>2 WebPage objects</p><p>example.com / Home</p><p>example.com / Documentation</p><span className={styles.success}>Method context, presented in your application.</span></div>}</div>
        </div>
      </div>
    </div>
    <div className={styles.footnote}><span>Notional application · sample data</span><a href="https://docs.method.security/" target="_blank" rel="noreferrer">Explore the docs ↗</a></div>
  </div>;
}
