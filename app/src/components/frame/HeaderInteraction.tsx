"use client";

import { useEffect, useRef } from "react";
import styles from "./Header.module.css";
import { gsap } from "gsap";

export default function HeaderInteraction() {
  const lastScrollY = useRef(0);
  useEffect(() => {
    const header = document.getElementById("header");
    const mobileOverlay = document.getElementById("mobile-overlay");
    const toggleButton = document.getElementById("mobile-menu-toggle");
    const mobileLinks = document.querySelectorAll("[data-mobile-link]");

    if (!header || !mobileOverlay || !toggleButton) return;

    let isOpen = false;

    const toggleMenu = () => {
      isOpen = !isOpen;

      if (isOpen) {
        header.setAttribute("data-theme", "dark");
        header.setAttribute("data-lenis-prevent", "");
        document.body.style.overflow = "hidden";
        mobileOverlay.classList.remove("h-[0]");
        mobileOverlay.classList.add("h-screen");
      } else {
        header.removeAttribute("data-theme");
        header.removeAttribute("data-lenis-prevent");
        document.body.style.overflow = "";
        mobileOverlay.classList.remove("h-screen");
        mobileOverlay.classList.add("h-[0]");
      }
    };

    const closeMenu = () => {
      if (isOpen) {
        isOpen = false;
        header.removeAttribute("data-theme");
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
              `[data-dropdown-index="${index}"]`,
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

      if (currentScrollY <= 100) {
        gsap.to(header, {
          yPercent: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
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

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      toggleButton.removeEventListener("click", toggleMenu);
      mobileLinks.forEach((link) => {
        link.removeEventListener("click", closeMenu);
      });
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
