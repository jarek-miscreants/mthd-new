"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import styles from "./ExplodedStack.module.css";

type Layer = { id: string; label: string; headline: string; description: string; method: string[]; customer: string[]; customerLabel: string };
export type PlatformExplorerData = { eyebrow: string; title: string; description: string; layers: Layer[] };

function lines(text: string, limit = 17) {
  const result: string[] = [];
  for (const word of text.split(" ")) {
    const last = result.length - 1;
    if (last < 0 || result[last].length + word.length + 1 > limit) result.push(word);
    else result[last] += ` ${word}`;
  }
  return result;
}

export default function PlatformExplorer({ data }: { data: PlatformExplorerData }) {
  const [selected, setSelected] = useState(3);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const layer = data.layers[selected];
  const selectByKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % data.layers.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + data.layers.length - 1) % data.layers.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = data.layers.length - 1;
    else return;
    event.preventDefault(); setSelected(next); tabs.current[next]?.focus();
  };

  return <section className={styles.page} data-theme="dark">
    <header className={styles.intro}>
      <p className={styles.eyebrow}>{data.eyebrow}</p>
      <h1>{data.title}</h1>
      <p className={styles.subtitle}>{data.description}</p>
    </header>
    <div className={styles.explorer}>
      <div className={styles.visual}>
        <div className={styles.visualHeader}><span>Architecture / 01</span><span>Select a layer to explore <span aria-hidden="true">↗</span></span></div>
        <svg className={styles.stack} viewBox="0 0 880 800" role="group" aria-label="Interactive platform stack">
          <defs>
            <linearGradient id="slab-top" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#414141" /><stop offset="1" stopColor="#242424" /></linearGradient>
            <linearGradient id="slab-selected" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4b4238" /><stop offset="1" stopColor="#302d29" /></linearGradient>
            <linearGradient id="slab-front" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#303030" /><stop offset="1" stopColor="#191919" /></linearGradient>
          </defs>
          <path d="M540 50 V760" className={styles.guide} />
          {data.layers.map((item, index) => {
            const y = 90 + index * 119;
            const active = selected === index;
            const tileWidth = 436 / item.method.length;
            return <g key={item.id} className={styles.layer} data-active={active} role="button" tabIndex={0} aria-label={`Explore ${item.label}`} aria-pressed={active} onClick={() => setSelected(index)} onKeyDown={event => { if(event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(index); } }}>
              <title>{`${item.label}: ${item.method.join(", ")}`}</title>
              <polygon className={styles.side} points={`286,${y} 357,${y+60} 357,${y+82} 286,${y+22}`} />
              <polygon className={styles.front} points={`357,${y+60} 827,${y+5} 827,${y+27} 357,${y+82}`} />
              <polygon className={styles.top} points={`286,${y} 756,${y-55} 827,${y+5} 357,${y+60}`} />
              <g transform={`matrix(1 -.117 1.183 1 302 ${y+8})`} aria-hidden="true">
                {item.method.map((text, i) => <g key={text} transform={`translate(${i*tileWidth} 0)`}>
                  <rect className={styles.tile} width={tileWidth-8} height="42" />
                  <text className={styles.mark} x="7" y="14">M</text>
                  <text className={styles.tileText} x="22" y={item.method.length>3 ? 10 : 16}>
                    {lines(text, item.method.length>3 ? 13 : 22).map((line, j) => <tspan key={j} x="22" dy={j ? 10 : 0}>{line}</tspan>)}
                  </text>
                </g>)}
              </g>
              <text className={styles.faceLabel} transform={`translate(375 ${y+75}) rotate(-6.7)`}>{item.label.toUpperCase()}</text>
              <text className={styles.faceNumber} transform={`translate(786 ${y+27}) rotate(-6.7)`}>0{index+1}</text>
            </g>;
          })}
          <g className={styles.customerPosition} style={{ transform: `translateY(${90 + selected * 119}px)` }}>
            <path className={styles.docking} d="M205 24 L275 5 M205 65 L330 49" />
            <g key={layer.id} className={styles.customerTray}>
              <polygon className={styles.customerFront} points="20,50 205,28 205,67 20,89" />
              <polygon className={styles.customerTop} points="0,12 185,-10 205,28 20,50" />
              <text className={styles.customerTitle} x="29" y="70" transform="rotate(-6.7 29 70)">{layer.customerLabel.toUpperCase()}</text>
              <g transform="translate(17 16) rotate(-6.7)">
                <text className={styles.customerText}>{lines(layer.customer.join(" / "), 24).map((line, i)=><tspan key={i} x="0" dy={i ? 12 : 0}>{line}</tspan>)}</text>
              </g>
              <circle cx="268" cy="6" r="3" fill="#ff9b50" />
            </g>
          </g>
        </svg>
        <div className={styles.legend}><span><i />Method platform</span><span><i />Customer-supplied components</span></div>
      </div>
      <aside className={styles.sidebar}>
        <div role="tablist" aria-label="Platform layers" aria-orientation="vertical" className={styles.tabs}>
          {data.layers.map((item, index)=><button key={item.id} ref={node=>{tabs.current[index]=node;}} role="tab" id={`tab-${item.id}`} aria-controls="platform-layer-panel" aria-selected={selected===index} tabIndex={selected===index ? 0 : -1} onClick={()=>setSelected(index)} onKeyDown={event=>selectByKey(event,index)}><span className={styles.tabNumber}>0{index+1}</span><span>{item.label}</span><span className={styles.tabArrow} aria-hidden="true">↗</span></button>)}
        </div>
        <div id="platform-layer-panel" role="tabpanel" aria-labelledby={`tab-${layer.id}`} tabIndex={0} className={styles.detail}>
          <div key={layer.id} className={styles.detailInner}>
            <p className={styles.activeLabel}>Layer 0{selected+1} / {layer.label}</p>
            <h2>{layer.headline}</h2>
            <p className={styles.description}>{layer.description}</p>
            <div className={styles.comparison}>
              <div><h3><span className={styles.methodMark}>M</span> Method</h3><ul>{layer.method.map(item=><li key={item}>{item}</li>)}</ul></div>
              <div><h3>Bring your own</h3><ul>{layer.customer.map(item=><li key={item}>{item}</li>)}</ul></div>
            </div>
          </div>
        </div>
      </aside>
    </div>
    <div className={styles.bottom}><span>Your context. Your tradecraft. Your advantage.</span><Link href="/contact">Explore your deployment <span aria-hidden="true">↗</span></Link></div>
  </section>;
}
