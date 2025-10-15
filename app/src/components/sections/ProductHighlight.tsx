import Eyebrow from "../elements/GEyebrow";
import LinkIndicator from "@/components/elements/LinkIndicator";
import ScreenMockup from "../elements/ScreenMockup";
import Spacer from "../util/Spacer";
import Image from "next/image";
import Link from "next/link";
import LinkIndicatorInteraction from "@/components/elements/LinkIndicatorInteraction";
import styles from "@/components/sections/ProductHighlight.module.css";

export interface ProductHighlightProps {
  eyebrow?: string;
  productSymbol: string;
  title: string;
  href: string;
  leadParagraph: string;
  showcaseSrc: string;
  className?: string;
}

export default function ProductHighlight({
  eyebrow,
  productSymbol,
  title,
  href,
  leadParagraph,
  showcaseSrc,
  className,
}: ProductHighlightProps) {
  return (
    <section
      data-theme="dark"
      className={`bg-theme-bg text-theme-text overflow-clip sticky border-t-[0.0625em] first:border-t-[0em] border-t-light ${className}`}
    >
      <Spacer size="small" calc="size/2" />
      <div className="u-container flex flex-col t:flex-row t:items-end gap-[3em] items-start">
        <LinkIndicatorInteraction triggerOnHover>
          <Link
            href={`/products/${href}`}
            className="product_info_contain flex flex-col t:gap-[6em] gap-[3em] w-[100%]"
          >
            {productSymbol && (
              <Image
                src={productSymbol}
                alt={eyebrow || ""}
                width={67}
                height={57}
                className="w-small"
              />
            )}

            <div className="flex flex-col gap-xxs">
              <Eyebrow> {eyebrow} </Eyebrow>
              <h2 className="u-text-style-h2">{title}</h2>
            </div>
            <div className="flex flex-col gap-xs">
              <p className="max-w-[25ch] text-main">{leadParagraph}</p>
              <LinkIndicator className="w-[2.25em]" />
            </div>
          </Link>
        </LinkIndicatorInteraction>

        <div className="product_visual_contain w-[100%] t:w-[100em] t:translate-x-[25%] t:translate-y-[20%] t:scale-[1.2]">
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
      <Spacer size="small" />
    </section>
  );
}
