"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { gsap } from "gsap";

const HERO_MODE_CLASS = styles.heroMode;

export default function HeaderInteraction() {
  const lastScrollY = useRef(0);
  const isHoveringHeader = useRef(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const header = document.getElementById("header");
    const headerBar = document.getElementById("header-bar");
    const mobileOverlay = document.getElementById("mobile-overlay");
    const toggleButton = document.getElementById("mobile-menu-toggle");
    const mobileLinks = document.querySelectorAll("[data-mobile-link]");
    const menuOverlayItemLinks = document.querySelectorAll(
      "#mobile-overlay-item-list > li"
    );

    if (!header || !headerBar || !mobileOverlay || !toggleButton) return;

    let isOpen = false;

    const iconOpen = toggleButton.querySelector(
      ".menu-icon-open"
    ) as HTMLElement;
    const iconClosed = toggleButton.querySelector(
      ".menu-icon-closed"
    ) as HTMLElement;

    const toggleMenu = () => {
      isOpen = !isOpen;

      if (iconOpen && iconClosed) {
        if (isOpen) {
          iconOpen.style.display = "block";
          iconClosed.style.display = "none";
        } else {
          iconOpen.style.display = "none";
          iconClosed.style.display = "block";
        }
      }

      if (isOpen) {
        header.setAttribute("data-theme", "dark");
        header.setAttribute("data-lenis-prevent", "");
        headerBar.classList.add("pt-xs");
        document.body.style.overflow = "hidden";
        mobileOverlay.classList.remove("h-[0]");
        mobileOverlay.classList.add("h-screen");

        gsap.from(menuOverlayItemLinks, {
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        });
      } else {
        header.removeAttribute("data-theme");
        header.removeAttribute("data-lenis-prevent");
        headerBar.classList.remove("pt-xs");
        document.body.style.overflow = "";
        mobileOverlay.classList.add("h-[0]");
        mobileOverlay.classList.remove("h-screen");
      }
    };

    const closeMenu = () => {
      if (isOpen) {
        isOpen = false;

        if (iconOpen && iconClosed) {
          iconOpen.style.display = "none";
          iconClosed.style.display = "block";
        }

        header.removeAttribute("data-theme");
        headerBar.classList.remove("pt-xs");
        document.body.style.overflow = "";
        mobileOverlay.classList.remove("h-screen");
        mobileOverlay.classList.add("h-[0]");
      }
    };

    toggleButton.addEventListener("click", toggleMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    const headerContain = document.querySelector(".header_contain");
    const navItems = headerContain?.querySelectorAll("nav ul li");
    const dropdowns = document.querySelectorAll("[data-dropdown-index]");

    if (headerContain && navItems) {
      navItems.forEach((item, index) => {
        const hasDropdown = item.hasAttribute("data-has-dropdown");

        item.addEventListener("mouseenter", () => {
          dropdowns.forEach((dropdown) => {
            dropdown.classList.remove(styles.isOpen);
          });

          if (hasDropdown) {
            const targetDropdown = document.querySelector(
              `[data-dropdown-index="${index}"]`
            );
            if (targetDropdown) {
              targetDropdown.classList.add(styles.isOpen);
            }
          }
        });
      });

      headerContain.addEventListener("mouseleave", () => {
        dropdowns.forEach((dropdown) => {
          dropdown.classList.remove(styles.isOpen);
        });
      });

      dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("mouseenter", () => {
          dropdown.classList.add(styles.isOpen);
        });
      });
    }

    const handleScroll = () => {
      if (!header) return;

      const currentScrollY = window.scrollY;

      // Hero mode: only on homepage when at the very top and not hovering
      if (isHomePage && currentScrollY <= 100 && !isHoveringHeader.current) {
        header.classList.add(HERO_MODE_CLASS);
        header.setAttribute("data-theme", "dark");
        gsap.to(header, {
          yPercent: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      } else if (
        isHomePage &&
        currentScrollY <= 100 &&
        isHoveringHeader.current
      ) {
        // Hovering in hero zone: dark mode with background
        header.classList.remove(HERO_MODE_CLASS);
        header.setAttribute("data-theme", "dark");
        gsap.to(header, {
          yPercent: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        header.classList.remove(HERO_MODE_CLASS);
        if (!isOpen) {
          header.removeAttribute("data-theme");
        }

        // Normal scroll behavior
        if (currentScrollY <= 100) {
          gsap.to(header, {
            yPercent: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        } else if (
          currentScrollY > lastScrollY.current &&
          currentScrollY > 100
        ) {
          gsap.to(header, {
            yPercent: -100,
            duration: 0.3,
            ease: "power2.out",
          });
        } else if (currentScrollY < lastScrollY.current) {
          gsap.to(header, {
            yPercent: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    // Mouse hover handlers for hero mode
    const handleMouseEnter = () => {
      isHoveringHeader.current = true;
      handleScroll(); // Re-evaluate state
    };

    const handleMouseLeave = () => {
      isHoveringHeader.current = false;
      handleScroll(); // Re-evaluate state
    };

    header.addEventListener("mouseenter", handleMouseEnter);
    header.addEventListener("mouseleave", handleMouseLeave);

    // Initialize hero mode on mount if on homepage
    handleScroll();

    return () => {
      toggleButton.removeEventListener("click", toggleMenu);
      mobileLinks.forEach((link) => {
        link.removeEventListener("click", closeMenu);
      });
      window.removeEventListener("scroll", handleScroll);
      header.removeEventListener("mouseenter", handleMouseEnter);
      header.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isHomePage]);

  return null;
}
