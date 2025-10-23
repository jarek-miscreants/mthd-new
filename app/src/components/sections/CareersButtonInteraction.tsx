"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CareersButtonInteractionProps {
    children: React.ReactNode;
}

export default function CareersButtonInteraction({ children }: CareersButtonInteractionProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const button = wrapper.querySelector<HTMLElement>("[data-careers-button]");
        if (!button) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper,
                    start: "top 80%",
                    toggleActions: "play none none none",
                    markers: false,
                },
            });

            gsap.set(button, { opacity: 0, y: 20 });

            tl.to(button, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
            });
        }, wrapper);

        return () => ctx.revert();
    }, []);

    return <div ref={wrapperRef}>{children}</div>;
}
