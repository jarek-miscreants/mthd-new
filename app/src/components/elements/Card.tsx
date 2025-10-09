import Eyebrow from "./GEyebrow";
import LinkIndicator from "@/components/elements/LinkIndicator";
import LinkIndicatorInteraction from "@/components/elements/LinkIndicatorInteraction";

export interface CardProps {
  eyebrow: string;
  title: string;
  href: string;
  target?: "_self" | "_blank";
  noHeading?: boolean;
}

export default function Card({
  eyebrow,
  title,
  href,
  target,
  noHeading = false,
}: CardProps) {
  const TitleTag = noHeading ? "div" : "h2";
  return (
    <LinkIndicatorInteraction triggerOnHover={true}>
      <a
        href={href}
        target={target}
        className="bg-theme-bg-secondary text-theme-text hover:bg-theme-text hover:text-theme-bg-secondary p-2 rounded-main t:col-span-6  min-h-[11.75em] t:min-h-[18.75em] flex flex-col justify-between transition-colors duration-400 ease-out"
      >
        <div className="flex flex-col gap-xxs mb-3">
          <Eyebrow>{eyebrow}</Eyebrow>
          <TitleTag className="u-text-style-h4">{title}</TitleTag>
        </div>

        <LinkIndicator className="w-[3.0625em]" />
      </a>
    </LinkIndicatorInteraction>
  );
}
