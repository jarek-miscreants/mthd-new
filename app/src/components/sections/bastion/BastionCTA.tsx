import Image from "next/image";
import Link from "next/link";
import type { BastionPageData } from "@/lib/content-types";

/**
 * Bastion product page — closing CTA section (Figma node 406:12159).
 *
 * Full-bleed dark section: the Bastion console screenshot sits behind the
 * content and fades into the page background top and bottom. Title + tagline
 * sit top-left; an onboarding line and the CTA buttons share the bottom row.
 * Mirrors ReaperCTA. Copy comes from bastionPage.cta in bastion.mdx.
 */

export default function BastionCTA({
  data,
}: {
  data?: BastionPageData["cta"];
}) {
  const buttons = data?.buttons ?? [];
  return (
    <section className="bg-theme-bg text-theme-text relative overflow-clip">
      {/* Background product UI */}
      <Image
        src="/products/bastion/cta-ui.webp"
        alt="Bastion console showing continuously validated targets and exploitable paths"
        fill
        sizes="100vw"
        className="object-cover"
      />

      {/* Fades into the page background top and bottom.
          NOTE: numeric `*-0` utilities are broken in this project (the @theme
          spacing reset makes them emit an invalid calc() that falls back to
          `auto`), so use arbitrary [0px]. */}
      <div className="pointer-events-none absolute left-[0px] right-[0px] top-[0px] h-[55%] bg-gradient-to-b from-theme-bg to-transparent" />
      <div className="pointer-events-none absolute left-[0px] right-[0px] bottom-[0px] h-[45%] bg-gradient-to-t from-theme-bg to-transparent" />

      {/* Content */}
      <div className="u-container relative flex min-h-[52em] max-w-none flex-col justify-between gap-main py-[5em]">
        <div className="flex flex-col gap-4">
          <h2 className="u-text-style-h1 leading-none">{data?.title}</h2>
          <p className="u-text-style-h2 max-w-[24ch]">{data?.tagline}</p>
        </div>

        <div className="flex flex-col gap-4 t:flex-row t:items-center t:justify-between">
          <p className="u-text-style-h3 max-w-[28ch]">{data?.onboarding}</p>
          <div className="flex shrink-0 gap-[1rem]">
            {buttons.map((b) => (
              <Link
                key={b.label}
                href={b.href}
                className="btn-main-wrap is-primary"
              >
                {b.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
