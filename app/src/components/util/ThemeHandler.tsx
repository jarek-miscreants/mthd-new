"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DARK_THEME_PATHS = ["/products", "/developer"];

export default function ThemeHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const isDarkThemePage = DARK_THEME_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path),
    );

    if (isDarkThemePage) {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.setAttribute("data-theme", "");
    }

    return () => {
      document.body.setAttribute("data-theme", "");
    };
  }, [pathname]);

  return null;
}
