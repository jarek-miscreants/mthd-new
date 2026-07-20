/**
 * Vertical rule used across the Reaper page: a single white fill that animates
 * in. It carries `data-vline` and starts collapsed (scaleY 0); <ReaperLineReveal>
 * grows it top→bottom as it scrolls into view. No background track — only the
 * white line is ever visible.
 *
 * `className` positions the rule (e.g. "relative w-px shrink-0 self-stretch")
 * and must establish a positioning context for the absolute fill.
 */
export default function VLine({ className }: { className: string }) {
  return (
    <div aria-hidden="true" className={className}>
      <span
        data-vline
        style={{ transform: "scaleY(0)" }}
        className="absolute left-[0px] top-[0px] h-full w-full origin-top bg-theme-text"
      />
    </div>
  );
}
