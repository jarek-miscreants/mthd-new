import Image from "next/image";
import VideoSwapper from "@/components/elements/VideoSwapper";

interface ProductHeroProps {
  productSymbol: string;
  name: string;
  nameAddition: string;
  videoSrc: string;
  videoSrcMobile: string;
}

export default function ProductHero({
  productSymbol,
  name,
  nameAddition,
  videoSrc,
  videoSrcMobile,
}: ProductHeroProps) {
  return (
    <section>
      <div className="sticky top-[0]">
        <VideoSwapper
          videoSrc={videoSrc}
          videoSrcMobile={videoSrcMobile}
          className="w-full object-cover ml:aspect-[16/9] aspect-[3/4]"
        />
        <div className="absolute inset-[0] bg-gradient-to-t from-dark to-transparent pointer-events-none translate-y-[1px]"></div>
      </div>

      <div className="u-container">
        <div className="flex flex-col t:flex-row gap-main items-start">
          <Image
            src={productSymbol}
            alt=""
            width={67}
            height={57}
            loading="eager"
            className="w-[4.125em] mt-xxs"
          />
          <h1 className="u-text-style-h1 whitespace-pre-line leading-[1]">
            {name}
            <span className="block text-neutral">{nameAddition}</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
