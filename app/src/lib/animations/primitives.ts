// Needs phasing out. In use for eyebrowAnimation still.

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrambleTextPlugin, ScrollTrigger);

export const animate = {
  scrambleText: (
    element: Element,
    duration = 1,
    revealDelay = 1,
    speed = 0.5,
    scrollTriggerConfig?: ScrollTrigger.Vars,
  ) => {
    return gsap.to(element, {
      duration,
      scrambleText: {
        text: element.textContent,
        chars: "!?%$&_!?%$&",
        revealDelay,
        speed,
        tweenLength: false,
      },
      scrollTrigger: scrollTriggerConfig,
    });
  },

  /**
   * Fade in from opacity 0
   */
  fadeIn: (element: Element, duration = 1) => {
    return gsap.from(element, {
      opacity: 0,
      duration,
    });
  },

  /**
   * Set initial visibility
   */
  setVisible: (element: Element) => {
    return gsap.set(element, { autoAlpha: 1 });
  },

  /**
   * Animate CSS variable
   */
  animateCSSVar: (
    element: Element,
    varName: string,
    fromValue: string,
    duration = 0.9,
  ) => {
    return gsap.from(element, {
      [varName]: fromValue,
      duration,
    });
  },

  /**
   * SplitText line reveal with slide up
   */
  splitTextReveal: (element: HTMLElement, duration = 0.9, stagger = 0.1) => {
    const split = SplitText.create(element, {
      type: "words,lines",
      linesClass: "line",
      mask: "lines",
      reduceWhiteSpace: false,
    });

    const animation = gsap.from(split.lines, {
      duration,
      yPercent: 100,
      opacity: 0,
      stagger,
      ease: "expo.out",
    });

    return { animation, split };
  },
};
