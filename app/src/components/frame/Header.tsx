import Link from "next/link";
import Logo from "../brand/Logo";
import MobileMenuIndicator from "@/components/elements/MobileMenuIndicator";
import HeaderInteraction from "@/components/frame/HeaderInteraction";
import styles from "./Header.module.css";
import Card from "../elements/Card";

interface DropdownItem {
  label: string;
  href: string;
  target?: "_self" | "_blank";
  arrowIndicator?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  target?: "_self" | "_blank";
  btnStyle?: boolean;
  dropdown?: DropdownItem[];
}

interface HeaderProps {
  navItems: NavItem[];
}

export default function Header({ navItems }: HeaderProps) {
  return (
    <>
      <HeaderInteraction />
      <header
        id="header"
        className="header_wrap bg-theme-bg text-theme-text fixed top-[0] left-[0] right-[0] z-[9999]"
      >
        <div className="header_contain u-container max-w-[none] relative z-[99] drop-shadow-[0_4px_10px_rgba(0,0,0,0.05)] bg-theme-bg">
          <div className="flex flex-row justify-between py-xxs">
            <Link data-mobile-link href="/">
              <Logo className="w-small t:w-[3.978125em]" />
            </Link>
            <nav className="t:block hidden">
              <ul className="flex flex-row gap-xxs items-center text-menu">
                {navItems.map((navItem, index) => (
                  <li
                    key={index}
                    data-has-dropdown={navItem.dropdown ? "true" : undefined}
                  >
                    <Link
                      className={
                        navItem.btnStyle
                          ? `btn-main-wrap is-secondary blink-effect`
                          : `p-xxs rounded-main nav-cursor`
                      }
                      href={navItem.href}
                      target={navItem.target}
                    >
                      {navItem.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <button id="mobile-menu-toggle" className="block t:hidden">
              <MobileMenuIndicator className="w-[1.9375em]" />
            </button>
          </div>

          {navItems.map((navItem, index) =>
            navItem.dropdown ? (
              <div
                key={index}
                data-dropdown-index={index}
                className={`${styles.headerDropdown} t:block hidden bg-theme-bg-secondary mx-[calc(var(--site--margin)*-1)] px-[var(--site--margin)]`}
              >
                <ul className="flex py-xxs">
                  {navItem.dropdown.map((dropdownItem, dropdownIndex) => (
                    <li key={dropdownIndex} className="flex-1">
                      <Link
                        href={dropdownItem.href}
                        target={dropdownItem.target}
                        className="w-full text-center py-xxs rounded-main flex justify-center nav-cursor items-center group"
                      >
                        {dropdownItem.label}
                        {dropdownItem.arrowIndicator ? (
                          <svg
                            className="w-[0.75em] ml-xxs rotate-[45deg] group-hover:rotate-[0deg] transition-transform duration-[400ms] ease-[ease]"
                            width="100%"
                            height="100%"
                            viewBox="0 0 21 17"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M0.430332 7.57992L16.682 7.58375L11.2771 2.17879L12.78 0.675862L20.7046 8.60042L12.8243 16.4806L11.402 15.0583L16.8247 9.63556L0.430821 9.65201L0.430332 7.57992Z"
                              fill="currentColor"
                            />
                          </svg>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </div>

        {/* Mobile Overlay Menu */}
        <div
          id="mobile-overlay"
          data-theme="dark"
          className="fixed z-[98] top-[0] left-[0] right-[0] bg-theme-bg text-theme-text overflow-auto w-full h-[0] u-container max-w-[none] t:hidden transition-height duration-0"
        >
          <div className="flex flex-col py-main">
            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-xs text-menu">
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
                    >
                      {navItem.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Card
                    eyebrow="Join us"
                    title="Careers"
                    href="/"
                    noHeading={true}
                  />
                </li>
                <li>
                  <Card
                    eyebrow="Blog"
                    title="News, insights & updates"
                    href="/"
                    noHeading={true}
                  />
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
