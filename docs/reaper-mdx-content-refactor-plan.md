# Plan: Move Reaper page long-form text into MDX frontmatter

> Status: **planned, not implemented.** Drafted in an earlier session; execute on request.
> Scope decided with the user — read "Scope" carefully before starting.

## Goal

Bring the bespoke Reaper product page (`/products/reaper`) back in line with the
rest of the site, where **all editorial / long-form text lives in MDX
frontmatter** and server components feed it down as props (the old `[slug]`
pattern). Today the bespoke sections hardcode copy in module-level consts /
inline JSX.

**Client deliverable framing (2026-06-24):** the point of the move is to give the
client **one document** that holds every editorial string on the page, in
**page order**, that they can read and edit like a manuscript. The
`reaperPage:` object below is written top→bottom in render order with a comment
banner per section so it reads as that mapped document. **Confirmed: format =
YAML in `app/content/products/reaper.mdx` frontmatter** (decision (a) below is
resolved — YAML, not a `.ts` file).

## Scope (agreed)

**IN scope — all long-form / HTML-rendered text → MDX:**
headings, eyebrows, body paragraphs, **tab titles + descriptions**, tab item
titles/descriptions, use-case titles/descriptions, BYOT items, frontier layer
titles/meta, CTA copy + button labels, hero tab labels, secondary-tab items
(agent types / rules / hosts), results report cards.

**OUT of scope — text rendered INSIDE the SVG animations stays in code:**
the only `<text>`/`<tspan>` nodes. Specifically:
- `ReaperToolkitContextViz` — honeycomb node labels
- `ReaperToolkitInfraViz` — 16 tool labels
- `ReaperAgentsViz` — agent **spec** label/value pairs (typewriter)
- `ReaperMissionViz` — terminal commands + UI text
- `ReaperScaleViz`, `ReaperRulesViz`, `ReaperModelViz` — pure SVG + aria-labels

Rule of thumb confirmed by grep: **HTML text → MDX; `<text>`/`<tspan>` in SVG → code.**

## Architecture facts (why the lift is ~1 day, medium)

- Old pattern (`app/src/app/products/[slug]/page.tsx`): one
  `getContent<ProductData>()` in a **server** page, props passed into **server**
  section components. Types in `app/src/lib/content-types.ts`.
- Bespoke wrapper sections are **server** components and already hold the
  section heading + body: `ReaperHero`, `ReaperIntro`, `ReaperHowItWorks`,
  `ReaperToolkit`, `ReaperBYOT`, `ReaperFrontier`, `ReaperCTA`.
- The tab/list copy lives in **client** components: `ReaperHowItWorksTabs`,
  `ReaperToolkitTabs`, `ReaperFrontierStages`, `ReaperUseCases` (whole section
  is client), `ReaperHeroTabs`, `ReaperSecondaryTabs`.
- `page.tsx` already calls `getContent<ProductData>("products/reaper")` for SEO
  only — extend that one fetch.

Because in-scope copy spans **client** components, the only non-trivial work is
prop-threading + two coupling gotchas (below). No animation-length risk for the
HTML text; that risk only applies to the excluded SVG strings.

## Three things that make it more than find-and-replace

1. **Prop-threading into ~5 client components** (2–3 levels in spots):
   - `ReaperHowItWorks` → `ReaperHowItWorksTabs` → `ReaperSecondaryTabs`
   - `ReaperToolkit` → `ReaperToolkitTabs`
   - `ReaperFrontier` → `ReaperFrontierStages`
   - `ReaperUseCases` (client section, pass from page)
   - `ReaperHero` → `ReaperHeroTabs`
   All serializable strings — fine across the server→client boundary, just wiring.

2. **By-index coupling — RESOLVED (2026-06-24): SVG vizzes are NOT wired to YAML.**
   The secondary-tab items (agent types, rules, hosts) feed the SVG vizzes
   **by index**:
   - rules → `ReaperRulesViz` lights rings by the open rule index
   - agent types → `ReaperAgentsViz` maps the selected agent to its (in-code,
     SVG) `AGENTS[]` specs by order
   - hosts → `ReaperScaleViz`
   **Decision: option (a).** The viz label/count arrays stay in code; do not pass
   YAML into the viz wrappers. The HTML tab text moves to YAML, but its order
   must match the in-code viz array order. **Add a comment in both the YAML block
   and each viz array noting "order must stay in sync."** Lowest-touch on the
   vizzes — they remain untouched code.

3. **`ReaperToolkitResultsViz` — RESOLVED (2026-06-24): excluded from YAML.**
   Its bodies are JSX (embed an inline `<code>` file path) and YAML can't hold
   JSX. Decision: **leave `ResultsViz` copy in code as the single documented
   exception.** No markdown pipeline, no field-splitting — the `<code>` content
   does not need to be in the YAML document.

## Proposed solution

### 1. Content file
Reuse `app/content/products/reaper.mdx`. Add a single namespaced object so the
new bespoke copy doesn't collide with the legacy `ProductData` keys still used
by the `[slug]` backup (`solutions`, `highlight`, `tagline`, …). Suggested
top-level key: `reaperPage:` (object below). Keep existing `seo` etc. untouched.

### 2. Type
Add `ReaperPageData` to `app/src/lib/content-types.ts` (sketch):

```ts
export interface ReaperPageData {
  hero?: { title?: string; tagline?: string; tabs?: string[] };           // tabs: Orchestrate/Operate/Observe
  intro?: { paragraph?: string };
  howItWorks?: {
    eyebrow?: string; heading?: string; body?: string;
    tabs?: Array<{
      n: string; title: string; desc: string;
      secondaryEyebrow: string; secondary: string[];                      // agent types | rules | hosts
    }>;
  };
  toolkit?: {
    heading?: string; body?: string;
    tabs?: Array<{ label: string; items: Array<{ title: string; desc: string }> }>;
  };
  useCases?: { header?: string; intro?: string; items?: Array<{ title: string; desc: string }> };
  byot?: {
    heading?: string; body?: string;
    items?: Array<{ title: string; desc: string; label: string; comingSoon?: boolean }>;
  };
  frontier?: {
    heading?: string; body?: string; bannerEyebrow?: string; bannerHeading?: string; buttonLabel?: string;
    layers?: Array<{ title: string; meta: string }>;
  };
  cta?: { eyebrow?: string; heading?: string; body?: string; buttons?: Array<{ label: string; href: string }> };
}
```
(Fold into `ProductData` as `reaperPage?: ReaperPageData` or fetch separately.)

### 3. Wiring
- `page.tsx`: `const data = await getContent<ProductData>("products/reaper")`,
  pass `data.reaperPage?.<section>` slices into each section.
- Refactor each in-scope component from consts/inline → props (defaults to the
  current strings so nothing breaks if a key is missing).

## Execution order (suggested)

1. Add `ReaperPageData` type + `reaperPage` key skeleton in `reaper.mdx`
   (copy the current hardcoded strings verbatim).
2. Server wrappers first (lowest risk): Hero, Intro, HowItWorks(heading/body),
   Toolkit(heading/body), BYOT, Frontier(heading/body/banner), CTA.
3. Client tab/list components: HowItWorksTabs (+SecondaryTabs), ToolkitTabs,
   FrontierStages, UseCases, HeroTabs — thread props.
4. Resolve the by-index coupling per decision (b recommended).
5. Resolve ResultsViz JSX per decision.
6. Verify in browser (every section unchanged visually) + `npm run build`
   (catches the `[slug]` route-conflict gotcha — see
   memory `netlify-deploy-repo`).

## Open decisions to confirm before/at implementation
- [x] **Content format/location: YAML `reaperPage:` object in `reaper.mdx`.** Confirmed 2026-06-24 (not a `.ts` file). Write it in page order with a per-section comment banner so it reads as the client's mapped document.
- [x] **Secondary-tab coupling: option (a).** Confirmed 2026-06-24 — viz arrays stay in code, YAML is NOT wired into vizzes; YAML order must match viz array order (comment both sides).
- [x] **ResultsViz JSX: left in code as the single exception.** Confirmed 2026-06-24 — the `<code>` body does not move to YAML.

## Effort
~1 day, medium risk. Bulk = prop-threading through client components + the two
coupling gotchas. No animation-length risk for the in-scope HTML text.

## Pointers
- Page: `app/src/app/products/reaper/page.tsx`
- Old pattern: `app/src/app/products/[slug]/page.tsx`
- Content lib: `app/src/lib/content.ts`, types `app/src/lib/content-types.ts`
- MDX: `app/content/products/reaper.mdx`
- Sections: `app/src/components/sections/reaper/`
