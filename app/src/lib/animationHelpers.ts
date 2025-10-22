export const splitAnimationDefaults = {
  yPercent: 100,
  opacity: 0,
  duration: 0.8,
  stagger: 0.1,
  ease: "power3.out",
};
export const lineAnimationDefaults = {
  "--height": "0%",
  duration: 1.2,
  ease: "power3.inOut",
};

export function scalePathDepth(basePath: string, multiplier: number): string {
  // Parse the path to extract key Y-coordinates
  const pathRegex =
    /M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)C([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)C([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)Z/;

  const match = basePath.match(pathRegex);
  if (!match) return basePath;

  const [
    ,
    m_x,
    m_y, // M point
    l1_x,
    l1_y, // First L
    l2_x,
    l2_y, // Second L (bottom-left, always 1)
    l3_x,
    l3_y, // Third L (bottom-right, always 1)
    l4_x,
    l4_y, // Fourth L (top-right, always ~0)
    l5_x,
    l5_y, // Fifth L (right side top)
    c1_x,
    c1_y,
    c2_x,
    c2_y,
    c3_x,
    c3_y, // First curve control points
    l6_x,
    l6_y, // Sixth L (middle curve point)
    c4_x,
    c4_y,
    c5_x,
    c5_y,
    c6_x,
    c6_y, // Second curve control points
  ] = match;

  // Scale the Y-coordinates that control depth
  const scale = (val: string) =>
    Math.min(parseFloat(val) * multiplier, 0.95).toFixed(4);

  const scaled_m_y = scale(m_y); // Main depth
  const scaled_l1_y = scale(l1_y); // Left edge (matches main depth)
  const scaled_c2_y = scale(c2_y); // First curve control point Y
  const scaled_c3_y = scale(c3_y); // Second curve control point Y
  const scaled_l6_y = scale(l6_y); // Middle curve point
  const scaled_c4_y = scale(c4_y); // Third curve control point Y
  const scaled_c5_y = scale(c5_y); // Fourth curve control point Y
  const scaled_c6_y = scale(c6_y); // Final point Y (matches main depth)

  return `M${m_x} ${scaled_m_y}L${l1_x} ${scaled_l1_y}L${l2_x} ${l2_y}L${l3_x} ${l3_y}L${l4_x} ${l4_y}L${l5_x} ${l5_y}C${c1_x} ${c1_y} ${c2_x} ${scaled_c2_y} ${c3_x} ${scaled_c3_y}L${l6_x} ${scaled_l6_y}C${c4_x} ${scaled_c4_y} ${c5_x} ${scaled_c5_y} ${c6_x} ${scaled_c6_y}Z`;
}

export const sectionClipperConfig = {
  initialPath:
    "M0.2947 0.1800L0 0.1800L0 1L1 1L1 0.0000002L0.4156 0.0000502C0.4035 0.0000515 0.3921 0.0100 0.3842 0.0280L0.3262 0.1520C0.3183 0.1700 0.3069 0.1800 0.2947 0.1800Z",
  targetPathMultiplier: 2.0,
  mobileTargetMultiplier: 1.5,
  ease: "expo.inOut",
  scrollTrigger: {
    start: "top 150%",
    end: "bottom top",
    scrub: 1.6,
    markers: false,
  },
};
