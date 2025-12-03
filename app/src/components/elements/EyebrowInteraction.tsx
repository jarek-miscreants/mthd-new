"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { createEyebrowAnimation } from "@/lib/animations/eyebrowAnimation";

export default function GlobalEyebrowInteraction() {
    const pathname = usePathname();

    useEffect(() => {
        let ctx: gsap.Context | null = null;

        const timer = setTimeout(() => {
            const eyebrows = document.querySelectorAll(
                "[data-eyebrow]:not([data-highlight-eyebrow]):not([data-no-eyebrow-animation] [data-eyebrow])"
            );

            ctx = gsap.context(() => {
                eyebrows.forEach((eyebrow) => {
                    createEyebrowAnimation(eyebrow);
                });
            });
        }, 100);

        return () => {
            clearTimeout(timer);
            ctx?.revert();
        };
    }, [pathname]);

    return null;
}
