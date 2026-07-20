import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Shared side-line accordion helper (BastionChallengeTabs + Reaper UseCaseList).
 *
 * Measures the active row's box so a bright rule segment can track it as the
 * open tab changes. Rows must live in a `position: relative` container (their
 * offsetParent) so offsetTop/offsetHeight read in that container's space. A
 * ResizeObserver keeps the segment glued while a row's height animates
 * (accordion expand / collapse).
 *
 * Returns `setRowRef(i)` to attach to each row and `seg` ({top,height}) for the
 * bright segment's inline style.
 */
export function useActiveRowSegment(active: number, count: number) {
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  const activeRef = useRef(active);
  activeRef.current = active;
  const [seg, setSeg] = useState({ top: 0, height: 0 });

  const measure = () => {
    const el = rowRefs.current[activeRef.current];
    if (el) setSeg({ top: el.offsetTop, height: el.offsetHeight });
  };

  useLayoutEffect(measure, [active]);

  // Track row height changes during the accordion animation so the segment
  // stays aligned with the active row.
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    rowRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const setRowRef = (i: number) => (el: HTMLElement | null) => {
    rowRefs.current[i] = el;
  };

  return { setRowRef, seg };
}
