import LinkIndicator from "../elements/LinkIndicator";
import Image from "next/image";
import LinkIndicatorInteraction from "../elements/LinkIndicatorInteraction";
import BackdropVariation from "../elements/BackdropVariation";

export interface ProductsOverviewItemProps {
  productSymbol: string;
  name: string;
  nameAddition: string;
  leadParagraph: string;
  href: string;
  variation?: "variation1" | "variation2";
}

export default function ProductsOverviewItem({
  productSymbol,
  name,
  nameAddition,
  leadParagraph,
  href,
  variation = "variation1",
}: ProductsOverviewItemProps) {
  return (
    <LinkIndicatorInteraction triggerOnHover>
      <a
        href={href}
        className="bg-theme-bg-secondary text-theme-text p-xs t:p-small sticky top-main flex flex-col gap-small t:gap-main rounded-main"
      >
        <BackdropVariation
          variation={variation}
          className="absolute z-[-2] opacity-[50%]"
        />
        <Image
          src={productSymbol}
          alt=""
          width={67}
          height={57}
          className="t:w-main w-small"
        />

        <h2 className="u-text-style-h2 whitespace-pre-line">
          {name}
          <span className="block text-neutral">{nameAddition}</span>
        </h2>
        <div className="flex flex-col t:flex-row justify-between t:items-end gap-small">
          {leadParagraph && (
            <p className="max-w-[25ch] text-main">{leadParagraph}</p>
          )}

          <LinkIndicator className="w-small" />
        </div>
      </a>
    </LinkIndicatorInteraction>
  );
}
