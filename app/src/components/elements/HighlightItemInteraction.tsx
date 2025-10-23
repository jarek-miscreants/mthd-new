"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { lineAnimationDefaults, splitAnimationDefaults } from "@/lib/animationHelpers";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface HighlightItemInteractionProps {
    children: React.ReactNode;
}

export default function HighlightItemInteraction({ children }: HighlightItemInteractionProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const title = wrapper.querySelector<HTMLElement>("[data-highlight-title]");
        const description = wrapper.querySelector<HTMLElement>("[data-highlight-description]");

        if (!title || !description) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // desktop
            mm.add("(min-width: 768px)", () => {
                const splitTitle = new SplitText(title, {
                    type: "words,lines",
                    linesClass: "line",
                    mask: "lines",
                    reduceWhiteSpace: false,
                });
                const splitDescription = new SplitText(description, {
                    type: "words,lines",
                    linesClass: "line",
                    mask: "lines",
                    reduceWhiteSpace: false,
                });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: wrapper,
                        start: "top bottom",
                        toggleActions: "restart none none none",
                        markers: false,
                    },
                });
                tl.from(
                    splitTitle.lines,
                    {
                        ...splitAnimationDefaults,
                    },
                    "+0.25"
                );

                tl.from(title, { ...lineAnimationDefaults }, "<=0.2");

                tl.from(
                    splitDescription.lines,
                    {
                        ...splitAnimationDefaults,
                    },
                    "<=0.2"
                );

                tl.from(
                    description,
                    {
                        ...lineAnimationDefaults,
                    },
                    "<"
                );
            });
        }, wrapper);

        return () => ctx.revert();
    }, []);

    return <div ref={wrapperRef}>{children}</div>;
}
