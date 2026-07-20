/**
 * Resolve the ABC ROM Mono family for use in a canvas 2D `font` string.
 *
 * Canvas `ctx.font` cannot parse CSS `var(...)`, so the next/font design token
 * (`--font-rom-mono`) must be resolved to its literal family name before it can
 * be used. Returns a generic monospace stack pre-hydration / on the server.
 *
 * Animated canvases redraw every frame, so even if the webfont isn't loaded the
 * instant this runs, later frames pick it up once `document.fonts` resolves it.
 */
export function getMonoFontFamily(): string {
  const fallback = "ui-monospace, 'SFMono-Regular', monospace";
  if (typeof window === "undefined") return fallback;
  const read = (el: Element | null) =>
    el ? getComputedStyle(el).getPropertyValue("--font-rom-mono").trim() : "";
  const resolved = read(document.documentElement) || read(document.body);
  return resolved ? `${resolved}, ${fallback}` : fallback;
}
