import { animate } from "./primitives";

export function createEyebrowAnimation(element: Element) {
  return animate.scrambleText(element, 1, 1, 0.5, {
    trigger: element,
    start: "top 70%",
    toggleActions: "restart none none none",
  });
}
