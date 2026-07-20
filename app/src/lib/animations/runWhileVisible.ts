/**
 * Run looping section animations only while the element is on screen.
 *
 * Ambient vizzes use infinitely-repeating GSAP timelines (and sometimes a
 * requestAnimationFrame / gsap.ticker render loop). Left unchecked they all run
 * at once for the whole page lifetime, even far off screen. This gates them on
 * an IntersectionObserver: timelines are paused/resumed and optional
 * start/stop callbacks fire so a RAF or ticker loop can be torn down too.
 *
 * Create the master timeline(s) with `paused: true` and hand them in. Return the
 * cleanup from inside a `gsap.context()` callback so it's disconnected on revert.
 */

interface Pausable {
  play: () => void;
  pause: () => void;
}

export function runWhileVisible(
  el: Element,
  opts: {
    /** Looping timelines to play in view / pause out of view. */
    timelines?: Pausable[];
    /** Called when the element scrolls into view (e.g. start a RAF loop). */
    onShow?: () => void;
    /** Called when it scrolls out (e.g. cancel the RAF loop). */
    onHide?: () => void;
    /** IntersectionObserver threshold. Default 0 (any pixel visible). */
    threshold?: number;
  } = {},
): () => void {
  let visible = false;

  const show = () => {
    if (visible) return;
    visible = true;
    opts.timelines?.forEach((t) => t.play());
    opts.onShow?.();
  };

  const hide = () => {
    if (!visible) return;
    visible = false;
    opts.timelines?.forEach((t) => t.pause());
    opts.onHide?.();
  };

  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? show() : hide()),
    { threshold: opts.threshold ?? 0 },
  );
  io.observe(el);

  return () => {
    io.disconnect();
    hide();
  };
}
