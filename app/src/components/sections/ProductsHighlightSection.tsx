import type { ProductHighlightProps } from "@/components/sections/ProductHighlight";
import ProductHighlight from "@/components/sections/ProductHighlight";
import Eyebrow from "../elements/GEyebrow";
import Spacer from "../util/Spacer";
import SectionTopClipper from "../elements/SectionTopClipper";
import SectionBottomClipper from "../elements/SectionBottomClipper";

interface ProductHighlightSectionProps {
  items: ProductHighlightProps[];
}

export default function ProductHighlightSection({
  items,
}: ProductHighlightSectionProps) {
  return (
    <>
      <div
        data-theme="dark"
        className="text-theme-text bg-theme-bg translate-y-[1px]"
        style={{ clipPath: "url(#section-top-clip)" }}
      >
        <SectionTopClipper
          targetPathMultiplier={3.0}
          mobileTargetMultiplier={3.0}
        />
      </div>
      <section
        data-theme="dark"
        className="bg-theme-bg text-theme-text overflow-clip"
      >
        <div className="u-container">
          <Spacer size="small" />
          <div className="flex flex-col gap-xxs">
            <Eyebrow>METHOD PLATFORM</Eyebrow>
            <h2 className="u-text-style-h3">Our Products</h2>
            <Spacer size="small" />
          </div>
        </div>
        {items.map((item, index) => (
          <ProductHighlight key={index} {...item} />
        ))}
      </section>
      <div
        data-theme="dark"
        className="text-theme-text bg-theme-bg translate-y-[-1px]"
        style={{ clipPath: "url(#section-bottom-clip)" }}
      >
        <SectionBottomClipper
          targetPathMultiplier={3.0}
          mobileTargetMultiplier={4.0}
        />
      </div>
    </>
  );
}
