import { useId } from "react";
import styles from "./Footer.module.css";
import Link from "next/link";
import Wordmark from "../brand/Wordmark";
import Spacer from "../util/Spacer";
import FooterInteraction from "./FooterInteraction";

interface CtaProps {
  label?: string;
  href: string;
  target?: string;
}

interface FooterNavLink {
  label: string;
  href: string;
  target?: "_self" | "_blank";
}

interface FooterNavGroup {
  groupLabel: string;
  links: FooterNavLink[];
}

interface FooterProps {
  name?: string;
  tagline?: string;
  ctas: CtaProps[];
  copyrightTag?: string;
  footerNavGroups?: FooterNavGroup[];
  productLinks?: FooterNavLink[];
  legalLinks?: FooterNavLink[];
}

export default function Footer({
  name,
  tagline,
  ctas,
  copyrightTag,
  footerNavGroups = [],
  productLinks = [],
  legalLinks = [],
}: FooterProps) {
  const uniqueId = useId();
  const getCurrentYear = (): number => new Date().getFullYear();
  return (
    <>
      <footer
        data-footer={uniqueId}
        className="footer_wrap bg-theme-bg-secondary text-theme-text"
      >
        <Spacer size="small" />
        <div className="footer_contain u-container flex flex-col gap-4 max-w-[none]">
          <div className=" flex flex-col t:flex-row justify-between gap-4">
            <div className="flex gap-4 flex-col">
              <div className="u-text-style-h4 flex flex-col">
                {name}
                <span className="text-neutral">{tagline}</span>
              </div>
              <ul className="flex flex-row gap-xs">
                {ctas.map((cta, index) => (
                  <li key={index}>
                    <Link
                      className="btn-main-wrap is-primary"
                      href={cta.href}
                      target={cta.target}
                    >
                      {cta.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <nav className="flex flex-col t:grid t:grid-cols-3 gap-4 mr-[6em] font-secondary uppercase tracking-[0.15em] text-small">
              {/* Menu groups */}
              {footerNavGroups.map((group, gIndex) => (
                <ul key={`cfg-${gIndex}`} className="flex flex-col gap-3xs">
                  <li className={styles.nav_group_label}>{group.groupLabel}</li>
                  {group.links?.map((link, lIndex) => (
                    <li key={lIndex}>
                      <Link
                        data-footer-link
                        className="text-neutral"
                        href={link.href}
                        target={link.target}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}

              {/* Products group */}
              {productLinks.length > 0 && (
                <ul className="flex flex-col gap-3xs">
                  <li className={styles.nav_group_label}>Products</li>
                  {productLinks.map((link, idx) => (
                    <li key={`prod-${idx}`}>
                      <Link
                        data-footer-link
                        className="text-neutral"
                        href={link.href}
                        target={link.target}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* Legal group */}
              {legalLinks.length > 0 && (
                <ul className="flex flex-col gap-3xs">
                  <li className={styles.nav_group_label}>Legal</li>
                  {legalLinks.map((link, idx) => (
                    <li key={`legal-${idx}`}>
                      <Link
                        data-footer-link
                        className="text-neutral"
                        href={link.href}
                        target={link.target}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </div>

          <div className="text-small uppercase font-secondary tracking-[0.15em]">{`©${getCurrentYear()} ${copyrightTag}`}</div>
        </div>
        <Wordmark className="text-theme-bg mt-4 t:mt-[16.5em] pb-small t:pb-[var(--site--margin)] px-[var(--site--margin)]" />
      </footer>
      <FooterInteraction componentId={uniqueId} />
    </>
  );
}
