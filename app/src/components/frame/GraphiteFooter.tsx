import Link from "next/link";
import LogoAnimation from "@/components/brand/LogoAnimation/LogoAnimation";
import styles from "./GraphiteFooter.module.css";

export interface FooterPrototypeData {
  groups: { label: string; links: { label: string; href?: string }[] }[];
}

export default function GraphiteFooter({ copyrightTag, data }: { copyrightTag?: string; data: FooterPrototypeData }) {
  return <footer className={styles.footer} data-theme="dark">
    <div className={styles.top}>
      <Link href="/" className={styles.brand} aria-label="Method home"><LogoAnimation /></Link>
      <nav className={styles.groups} aria-label="Footer">
        {data.groups.map(group => <div key={group.label}>
          <h2>{group.label}</h2>
          <ul>{group.links.map(link => <li key={link.label}>{link.href ? <Link href={link.href}>{link.label}</Link> : <span className={styles.pending}>{link.label}</span>}</li>)}</ul>
        </div>)}
      </nav>
    </div>
    <div className={styles.bottom}>© {new Date().getFullYear()} {copyrightTag}</div>
  </footer>;
}
