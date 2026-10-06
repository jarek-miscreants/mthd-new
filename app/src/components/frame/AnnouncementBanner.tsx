"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const HREF = "/blog/method-awarded-30m-stratfi-from-space-force";

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const bannerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!isHome) {
      setOpen(false);
      return;
    }

    const reveal = () => setOpen(true);

    if (document.readyState === "complete") {
      reveal();
      return;
    }

    window.addEventListener("load", reveal, { once: true });
    return () => window.removeEventListener("load", reveal);
  }, [isHome]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!isHome || !inner) return;

    const measure = () => setHeight(inner.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!isHome || !banner) {
      document.documentElement.style.removeProperty("--announcement-h");
      return;
    }

    const setVar = () => {
      document.documentElement.style.setProperty(
        "--announcement-h",
        `${banner.offsetHeight}px`
      );
    };

    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--announcement-h");
    };
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div
      ref={bannerRef}
      className="relative z-[99] overflow-hidden transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{ height: open ? height : 0 }}
    >
      <div
        ref={innerRef}
        data-theme="dark"
        className="text-light border-b border-light bg-dark"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.2)), url(/content/home/stratfi-banner.jpg)",
          backgroundPosition: "center, right top",
          backgroundSize: "cover, cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-[1800px] mx-auto px-[24px] min-[1200px]:px-[32px] flex flex-row items-center justify-between gap-xs py-[1.5em] text-left">
          <p className="text-menu t:text-main leading-[1.3] min-w-0 flex-1">
            Method Awarded $30M STRATFI with US Space Force – Bringing a Cyber
            Mission System to Space
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
    </div>
  );
}
