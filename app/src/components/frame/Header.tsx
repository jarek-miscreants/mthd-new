import Link from "next/link";
import HeaderInteraction from "@/components/frame/HeaderInteraction";
import styles from "./Header.module.css";
import Card from "../elements/Card";
import MobileMenuIndicator from "@/components/elements/MobileMenuIndicator";
import LogoAnimation from "../brand/LogoAnimation/LogoAnimation";
import AnnouncementBanner from "@/components/frame/AnnouncementBanner";

interface NavItem {
  label: string;
  href: string;
  target?: "_self" | "_blank";
  btnStyle?: boolean;
}

interface MobileMenuCard {
  eyebrow: string;
  title: string;
  href: string;
  target?: "_self" | "_blank";
}

interface HeaderProps {
  navItems: NavItem[];
  mobileMenuCards: MobileMenuCard[];
}

export default function Header({ navItems, mobileMenuCards }: HeaderProps) {
  const primaryItems = navItems.filter((item) =>
    ["/platform", "/developer", "/missions"].includes(item.href)
  );
  const utilityItems = navItems.filter((item) => !primaryItems.includes(item));

  const renderLinks = (items: NavItem[]) => (
    <ul className={styles.navList}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            className={item.btnStyle ? `btn-main-wrap is-secondary ${styles.demoButton}` : styles.navLink}
            href={item.href}
            target={item.target}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <HeaderInteraction />
      <header
        id="header"
        data-theme="dark"
        className={`${styles.header} header_wrap bg-theme-bg text-theme-text fixed top-[0] left-[0] right-[0] z-[9999]`}
      >
        <AnnouncementBanner />
        <div className={`${styles.headerContain} header_contain relative z-[99] bg-theme-bg`}>
          <div id="header-bar" className={styles.headerBar}>
            <Link className={styles.logo} data-mobile-link href="/" aria-label="Method home">
              <LogoAnimation />
            </Link>
            <nav className={styles.primaryNav} aria-label="Primary">
              {renderLinks(primaryItems)}
            </nav>
            <nav className={styles.utilityNav} aria-label="Utility">
              {renderLinks(utilityItems)}
            </nav>
            <button
              id="mobile-menu-toggle"
              className={styles.mobileToggle}
              aria-label="Toggle navigation"
              aria-controls="mobile-overlay"
              aria-expanded="false"
            >
              <MobileMenuIndicator className="w-[31px] h-[21px]" />
            </button>
          </div>
        </div>

        {/* Mobile Overlay Menu */}
        <div
          id="mobile-overlay"
          data-theme="dark"
          className={`${styles.mobileOverlay} fixed z-[98] top-[0] left-[0] right-[0] bg-theme-bg text-theme-text overflow-auto w-full h-[0] u-container max-w-[none] transition-height duration-0`}
        >
          <div
            className="flex flex-col pb-main"
            style={{
              paddingTop:
                "calc(var(--announcement-h, 0px) + 80px + 24px)",
            }}
          >
            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto">
              <ul
                id="mobile-overlay-item-list"
                className="flex flex-col gap-xs text-menu"
              >
                {navItems.map((navItem, index) => (
                  <li key={index}>
                    <Link
                      data-mobile-link
                      className={
                        navItem.btnStyle
                          ? `btn-main-wrap is-primary block text-center p-[1.78125em] text-[1.125em]`
                          : `block p-[1.78125em] bg-theme-bg-secondary text-theme-text text-center rounded-main text-[1.125em]`
                      }
                      href={navItem.href}
                      target={navItem.target}
                    >
                      {navItem.label}
                    </Link>
                  </li>
                ))}
                {mobileMenuCards.map((card, index) => (
                  <li key={index}>
                    <Card
                      eyebrow={card.eyebrow}
                      title={card.title}
                      href={card.href}
                      target={card.target}
                      noHeading={true}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
