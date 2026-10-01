import LinkIndicator from "@/components/elements/LinkIndicator";
import ScreenMockup from "../elements/ScreenMockup";
import Spacer from "../util/Spacer";
import Image from "next/image";
import Link from "next/link";
import LinkIndicatorInteraction from "@/components/elements/LinkIndicatorInteraction";

export interface ProductHighlightProps {
  eyebrow?: string;
  subTitle?: string;
  productSymbol: string;
  title: string;
  href: string;
  leadParagraph: string;
  showcaseSrc: string;
  className?: string;
}

export default function ProductHighlight({
  eyebrow,
  subTitle,
  productSymbol,
  title,
  href,
  leadParagraph,
  showcaseSrc,
  className,
}: ProductHighlightProps) {
  return (
    <div className={className}>
      <Spacer size="large" calc="size/1.5" />
      <div className="u-container flex flex-col t:flex-row t:items-end gap-[3em] items-start">
        <LinkIndicatorInteraction triggerOnHover>
          <Link
            href={`/products/${href}`}
            className="product_info_contain flex flex-col t:gap-[6em] gap-[3em] w-[100%]"
          >
            <div className="flex flex-col gap-xxs">
              <div className="flex flex-row items-center gap-[1rem]">
                {productSymbol && (
                  <Image
                    src={productSymbol}
                    alt={eyebrow || ""}
                    width={67}
                    height={57}
                    className="w-[2em]"
                  />
                )}
                {eyebrow && <h5 className="u-text-style-h5">{eyebrow}</h5>}
              </div>
              <div className="flex flex-col gap-xxs">
                <h5 className="u-text-style-h5 text-neutral">{subTitle}</h5>
              </div>
            </div>

            <div className="flex flex-col gap-xxs">
              <h2 className="u-text-style-h2">{title}</h2>
            </div>
            <div className="flex flex-col gap-xs">
              <p className="max-w-[30ch] text-main">{leadParagraph}</p>
              <LinkIndicator className="w-[2.25em]" />
            </div>
          </Link>
        </LinkIndicatorInteraction>

        <div className="product_visual_contain w-[100%] t:w-[100em] t:translate-x-[25%]  t:scale-[1.2]">
          <ScreenMockup>
            {showcaseSrc && (
              <video
                src={showcaseSrc}
                className="w-full h-full object-contain"
                autoPlay
                loop
                playsInline
                muted
              ></video>
            )}
          </ScreenMockup>
        </div>
      </div>
      <Spacer size="large" />
    </div>
  );
}
