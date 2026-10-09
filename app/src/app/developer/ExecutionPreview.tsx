import type { CSSProperties } from "react";
import Logo from "@/components/brand/Logo";
import styles from "./ExecutionPreview.module.css";

const pairings = [
  ["Method C2", "Method access point"],
  ["Your C2", "Method access point"],
  ["Method C2", "Your access point"],
  ["Your C2", "Your access point"],
  ["Method C2", "Bridge to third-party access"],
  ["Your C2", "Bridge to third-party access"],
];

export default function ExecutionPreview() {
  return <div className={styles.preview}>
    <p className={styles.description}>Pair Method or your own C2 with the access points you choose.</p>
    <div className={styles.diagram} role="img" aria-label="Method connects through Method C2 or your C2 to Method access points, your access points, or a bridge to third-party access. These components can be paired in any combination.">
      <div className={styles.labels} aria-hidden="true"><span>Mission system</span><span>Command &amp; control</span><span>Access</span></div>
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.connection} />
        <div className={styles.method}><Logo title="Method" /><span>Method</span></div>
        <div className={styles.slots}><div /><div /></div>
        <div className={styles.reel}>
          {pairings.map(([c2, access], index) => <div key={`${c2}-${access}`} className={styles.pair} style={{ "--delay": `${-index * 4}s` } as CSSProperties}>
            <div>{c2}</div><div>{access}</div>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
}
