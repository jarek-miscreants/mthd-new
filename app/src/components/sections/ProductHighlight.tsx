import Eyebrow from "../elements/GEyebrow";
import LinkIndicator from "@/components/elements/LinkIndicator";
import ScreenMockup from "../elements/ScreenMockup";
import Spacer from "../util/Spacer";
import Image from "next/image";

export interface ProductHighlightProps {
  eyebrow?: string;
  productSymbol: string;
  title: string;
  leadParagraph: string;
  link?: string;
  showcaseSrc: string;
}

export default function ProductHighlight({
  eyebrow,
  productSymbol,
  title,
  leadParagraph,
  showcaseSrc,
}: ProductHighlightProps) {
  return (
    <section className="ph_item bg-theme-bg text-theme-text overflow-clip relative">
      <div className="absolute top-[0] left-[0] right-[0] w-full h-[0.0625em] bg-theme-text z-[2]"></div>
      <Spacer size="small" calc="size/2" />
      <div className="product_icon"></div>
      <div className="u-container flex flex-col d:flex-row d:items-end gap-[3em] items-start">
        <div className="product_info_contain flex flex-col gap-[6em] w-[100%]">
          <Image
            src={productSymbol}
            alt=""
            width={67}
            height={57}
            className="w-small"
          />

          <div className="flex flex-col gap-xxs">
            <Eyebrow> {eyebrow} </Eyebrow>
            <h2 className="u-text-style-h2">{title}</h2>
          </div>
          <div className="flex flex-col gap-xs">
            <p className="max-w-[25ch] text-main">{leadParagraph}</p>

            <LinkIndicator className="w-[3em]" />
          </div>
        </div>

        <div className="product_visual_contain w-[100%] d:w-[100em] d:translate-x-[25%] d:translate-y-[20%] d:scale-[1.2]">
          <ScreenMockup>
            <video
              src={showcaseSrc}
              className="w-full h-full object-cover"
              autoPlay
              loop
              playsInline
              muted
            ></video>
          </ScreenMockup>
        </div>
      </div>
      <Spacer size="small" />
    </section>
  );
}
