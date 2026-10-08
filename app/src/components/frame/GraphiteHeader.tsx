"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import LogoAnimation from "@/components/brand/LogoAnimation/LogoAnimation";
import type {
  NavigationPrototypeData,
  NavigationPrototypeLink,
  NavigationPrototypeMenu,
} from "@/lib/navigation-prototype";
import styles from "./GraphiteHeader.module.css";

/** A brief left-to-right character reveal, as on the reference navigation. */
function RevealLabel({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const started = performance.now();
    let frame: number;
    let lastUpdate = 0;

    const update = (now: number) => {
      const progress = Math.min((now - started) / 440, 1);
      if (now - lastUpdate > 35 || progress === 1) {
        setDisplay(
          text
            .split("")
            .map((letter, index) =>
              index < text.length * progress || /\s/.test(letter)
                ? letter
                : letters[Math.floor(Math.random() * letters.length)],
            )
            .join(""),
        );
        lastUpdate = now;
      }
      if (progress < 1) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [text]);

  return (
    <>
      <span className={styles.srOnly}>{text}</span>
      <span aria-hidden="true">{display}</span>
    </>
  );
}

function NavLink({
  link,
  onNavigate,
  plain = false,
}: {
  link: NavigationPrototypeLink;
  onNavigate: () => void;
  plain?: boolean;
}) {
  return (
    <Link
      href={link.href}
      target={link.target}
      rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
      className={plain ? styles.detailLink : styles.panelLink}
      onClick={onNavigate}
    >
      {!plain && <span className={styles.linkPlus} aria-hidden="true">+</span>}
      <span>{link.label}</span>
    </Link>
  );
}

function MenuContent({
  menu,
  onNavigate,
}: {
  menu: NavigationPrototypeMenu;
  onNavigate: () => void;
}) {
  return (
    <div className={styles.menuContent}>
      <div className={styles.introduction}>
        <h2 className={styles.label}><RevealLabel text={menu.eyebrow} /></h2>
        <p className={styles.description}>{menu.description}</p>
        {menu.details && (
          <div className={styles.details}>
            {menu.details.map((group) => (
              <div key={group.label}>
                <h3 className={styles.label}><RevealLabel text={group.label} /></h3>
                <ul className={styles.detailLinks}>
                  {group.links.map((link) => (
                    <li key={`${link.label}-${link.href}`}>
                      <NavLink link={link} onNavigate={onNavigate} plain />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.groups}>
        {menu.groups.map((group) => (
          <div key={group.label}>
            <h3 className={styles.label}><RevealLabel text={group.label} /></h3>
            <ul className={styles.panelLinks}>
              {group.links.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <NavLink link={link} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GraphiteHeader({ data }: { data: NavigationPrototypeData }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByHover = useRef(false);
  const [hidden, setHidden] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const [revealKey, setRevealKey] = useState(0);
  const items = [...data.primary, data.company];
  const menus = items.filter((item): item is NavigationPrototypeMenu => !("href" in item));
  const isOpen = activeId !== null || mobileOpen;
  const displayedMenu = menus.find((menu) => menu.id === (activeId ?? lastId));
  const panelId = "graphite-navigation-panel";

  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimer.current !== null) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = null;
  }, []);

  const close = useCallback((restoreFocus = false) => {
    cancelHoverClose();
    openedByHover.current = false;
    setActiveId(null);
    setMobileOpen(false);
    if (restoreFocus) lastTrigger.current?.focus();
  }, [cancelHoverClose]);

  useEffect(() => cancelHoverClose, [cancelHoverClose]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const change = () => {
      setIsMobile(query.matches);
      close();
    };
    change();
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, [close]);

  useEffect(() => { close(); setHidden(false); }, [pathname, close]);

  useEffect(() => {
    let previous = window.scrollY;
    let accumulated = 0;
    const onScroll = () => {
      const current = Math.max(0, window.scrollY);
      const delta = current - previous;
      previous = current;
      if (current <= 8 || isOpen) {
        accumulated = 0;
        setHidden(false);
        return;
      }
      if (Math.sign(delta) !== Math.sign(accumulated)) accumulated = 0;
      accumulated += delta;
      if (Math.abs(accumulated) >= 8) {
        setHidden(accumulated > 0);
        accumulated = 0;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen, pathname]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setPanelHeight(content.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [activeId, mobileOpen, isMobile]);

  useEffect(() => {
    const header = headerRef.current;
    if (!isOpen || !header) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const previousHeaderPadding = header.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const backgroundElements = Array.from(document.querySelectorAll<HTMLElement>("main, footer"));
    const previousInert = backgroundElements.map((element) => element.inert);
    const lenisWasStopped = lenis?.isStopped;

    if (!lenisWasStopped) lenis?.stop();
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbarWidth}px`;
      header.style.paddingRight = `${scrollbarWidth}px`;
    }
    backgroundElements.forEach((element) => { element.inert = true; });

    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
      if (event.key === "Tab") {
        const focusable = Array.from(header.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"))
          .filter((element) => element.offsetParent !== null && !element.closest("[inert]"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      header.style.paddingRight = previousHeaderPadding;
      backgroundElements.forEach((element, index) => { element.inert = previousInert[index]; });
      if (!lenisWasStopped) lenis?.start();
      document.removeEventListener("keydown", keyboard);
    };
  }, [isOpen, close, lenis]);

  const select = (menu: NavigationPrototypeMenu, trigger: HTMLButtonElement, focusPanel = false, hover = false) => {
    cancelHoverClose();
    lastTrigger.current = isMobile ? mobileToggleRef.current : trigger;
    const nextId = activeId === menu.id && !focusPanel && !hover ? null : menu.id;
    openedByHover.current = hover;
    setActiveId(nextId);
    if (nextId && nextId !== activeId) {
      setLastId(nextId);
      setRevealKey((key) => key + 1);
    }
    if (isMobile) setMobileOpen(true);
    if (focusPanel || isMobile) {
      requestAnimationFrame(() => contentRef.current?.querySelector<HTMLElement>(isMobile ? "button" : "a[href]")?.focus());
    }
  };

  const trigger = (menu: NavigationPrototypeMenu) => (
    <button
      key={menu.id}
      id={`graphite-trigger-${menu.id}`}
      type="button"
      className={styles.trigger}
      aria-expanded={activeId === menu.id}
      aria-controls={panelId}
      onPointerEnter={(event) => {
        if (!isMobile && event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches && activeId !== menu.id) {
          select(menu, event.currentTarget, false, true);
        }
      }}
      onClick={(event) => {
        // A click following mouse entry keeps the newly revealed menu open.
        if (event.detail > 0 && openedByHover.current && activeId === menu.id) {
          openedByHover.current = false;
          cancelHoverClose();
          return;
        }
        select(menu, event.currentTarget);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          select(menu, event.currentTarget, true);
        }
      }}
    >
      {menu.label}
    </button>
  );

  const theme = { "--graphite-background": data.background } as CSSProperties;

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <div
        className={styles.backdrop}
        data-open={isOpen}
        aria-hidden="true"
        onClick={() => close(true)}
      />
      <header
        ref={headerRef}
        data-hidden={hidden && !isOpen}
        onFocusCapture={() => setHidden(false)}
        className={styles.header}
        style={theme}
        data-theme="dark"
        data-open={isOpen}
        onPointerEnter={cancelHoverClose}
        onPointerLeave={(event) => {
          if (isMobile || event.pointerType !== "mouse" || !isOpen) return;
          cancelHoverClose();
          hoverCloseTimer.current = setTimeout(() => {
            // Keep a submenu available while its links have keyboard focus.
            if (!contentRef.current?.contains(document.activeElement)) close();
          }, 200);
        }}
      >
        <div className={styles.bar}>
          <Link href="/" className={styles.logo} aria-label={data.homeLabel} onClick={() => close()}>
            <LogoAnimation />
          </Link>
          <nav className={styles.primary} aria-label="Primary">
            {data.primary.map((item) => "href" in item ? (
              <Link
                key={item.id}
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={styles.trigger}
                onClick={() => close()}
              >
                {item.label}
              </Link>
            ) : trigger(item))}
          </nav>
          <nav className={styles.utility} aria-label="Company">
            {trigger(data.company)}
          </nav>
          <button
            ref={mobileToggleRef}
            type="button"
            className={styles.mobileToggle}
            aria-label={isOpen ? data.mobile.closeLabel : data.mobile.openLabel}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => {
              lastTrigger.current = mobileToggleRef.current;
              if (isOpen) close();
              else setMobileOpen(true);
            }}
          >
            <span className={styles.hamburger} aria-hidden="true" />
          </button>
        </div>
        <div
          id={panelId}
          className={styles.panel}
          role="region"
          aria-label={isMobile ? "Navigation" : displayedMenu?.label}
          aria-hidden={!isOpen}
          inert={!isOpen}
          data-open={isOpen}
          data-lenis-prevent
          style={{ height: isOpen ? (isMobile ? "calc(100dvh - var(--graphite-bar-height))" : panelHeight) : 0 }}
        >
          <div ref={contentRef}>
            {isMobile && !activeId ? (
              <nav className={styles.mobileRoot} aria-label="Mobile navigation">
                <Link href="/" onClick={() => close()}>{data.mobile.homeLabel}</Link>
                {items.map((item) => "href" in item ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.target}
                    rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                    onClick={() => close()}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button key={item.id} type="button" data-mobile-menu={item.id} onClick={(event) => select(item, event.currentTarget)}>
                    {item.label}<span aria-hidden="true">+</span>
                  </button>
                ))}
              </nav>
            ) : displayedMenu ? (
              <div key={`${displayedMenu.id}-${revealKey}`} className={styles.reveal}>
                {isMobile && (
                  <button type="button" className={styles.back} onClick={() => {
                    const previousMenu = activeId;
                    setActiveId(null);
                    requestAnimationFrame(() => contentRef.current?.querySelector<HTMLButtonElement>(`[data-mobile-menu="${previousMenu}"]`)?.focus());
                  }}>
                    <span aria-hidden="true">←</span>{data.mobile.backLabel}
                  </button>
                )}
                <MenuContent menu={displayedMenu} onNavigate={() => close()} />
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
