"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Target, UserRound, Sparkles, Database, FileCheck2, Network, RadioTower, Code2, Cpu, Box, BrainCircuit, Zap, Server, type LucideIcon } from "lucide-react";
import styles from "./PlatformExplorer.module.css";

type Layer = { id: string; label: string; headline: string; description: string; method: string[]; customer: string[]; customerLabel: string };
export type PlatformExplorerData = { eyebrow: string; title: string; description: string; layers: Layer[] };
const icons: Record<string, LucideIcon[]> = {
  apps: [Target, UserRound], harness: [Sparkles], infrastructure: [Database, FileCheck2, Network, RadioTower, Code2], compute: [Cpu], models: [Network, Box, BrainCircuit], inference: [Zap, Server, BrainCircuit],
};

export default function PlatformExplorer({ data }: { data: PlatformExplorerData }) {
  const [selected, setSelected] = useState(2);
  const controls = useRef<(HTMLButtonElement | null)[]>([]);
  const selectByKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % data.layers.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + data.layers.length - 1) % data.layers.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = data.layers.length - 1;
    else return;
    event.preventDefault(); setSelected(next); controls.current[next]?.focus();
  };

  return <section className={styles.page} data-theme="dark">
    <header className={styles.intro}><h1>{data.title}</h1><p>{data.description}</p></header>
    <div className={styles.explorer}>
      <nav className={styles.tabs} aria-label="Platform layers">
        {data.layers.map((layer, index)=><button key={layer.id} ref={node=>{controls.current[index]=node;}} id={`tab-${layer.id}`} aria-expanded={selected===index} aria-controls={`drawer-${layer.id}`} onClick={()=>setSelected(index)} onKeyDown={event=>selectByKey(event,index)}><span className={styles.number}>0{index+1}</span><span>{layer.label}</span></button>)}
      </nav>
      <div className={styles.stack}>
        {data.layers.map((layer,index)=>{
          const active=selected===index;
          return <section key={layer.id} className={styles.row} data-active={active} aria-labelledby={`label-${layer.id}`}>
            <div className={styles.rowMain}>
              <button className={styles.rowLabel} onClick={()=>setSelected(index)} aria-expanded={active} aria-controls={`drawer-${layer.id}`}>
                <span className={styles.number}>0{index+1}</span><h2 id={`label-${layer.id}`}>{layer.label}</h2>
              </button>
              <div className={styles.components}>
                <div className={styles.methodArea}>
                  <div className={styles.methodGrid} data-count={layer.method.length}>
                    {layer.method.map((item,i)=>{
                      const Icon=icons[layer.id]?.[i] || Box;
                      return <div className={styles.module} key={item}><Icon size={25} strokeWidth={1.6} aria-hidden="true" /><div><p>{item}</p><span>Method</span></div></div>;
                    })}
                  </div>
                </div>
                <div id={`drawer-${layer.id}`} className={styles.drawerWrap} aria-hidden={!active} inert={!active}>
                  <div className={styles.drawer}>
                    <h3>Bring your own</h3>
                    {layer.customer.map(item=><div className={styles.customerModule} key={item}><Server size={23} strokeWidth={1.5} aria-hidden="true" /><div><p>{item}</p><span>Customer</span></div></div>)}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.detailWrap} aria-hidden={!active}>
              <div className={styles.detail}><h3>{layer.headline}</h3><p>{layer.description}</p></div>
            </div>
          </section>;
        })}
      </div>
    </div>
    <p className={styles.caption}>Select a layer. Explore what Method provides—and what you can bring.</p>
  </section>;
}
