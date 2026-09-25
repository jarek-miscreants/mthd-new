"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const HREF = "/blog/method-awarded-30m-stratfi-from-space-force";

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const bannerRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const header = document.getElementById("header");
    const banner = bannerRef.current;
    if (!header) return;

    if (!isHome || !banner) {
      header.style.removeProperty("--announcement-h");
      return;
    }

    const setHeight = () => {
      header.style.setProperty("--announcement-h", `${banner.offsetHeight}px`);
    };

    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(banner);

    return () => {
      observer.disconnect();
      header.style.removeProperty("--announcement-h");
    };
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div
      ref={bannerRef}
      data-theme="light"
      className="relative z-[99] bg-light text-dark border-b border-neutral/30"
    >
      <div className="u-container max-w-[none] flex flex-row items-center justify-between t:justify-center gap-xxs t:gap-xs py-xxs text-left t:text-center">
        <p className="text-menu leading-[1.3] min-w-0 flex-1 t:flex-none">
          Bringing a Cyber Mission System to Space: Method Awarded $30M STRATFI
          with US Space Force
        </p>
        <Link
          href={HREF}
          data-mobile-link
          className="btn-main-wrap is-primary shrink-0 text-small"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}
