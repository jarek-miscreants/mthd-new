import type { ProductHighlightProps } from "@/components/sections/ProductHighlight";
import ProductHighlight from "@/components/sections/ProductHighlight";
import Eyebrow from "../elements/GEyebrow";
import Spacer from "../util/Spacer";

interface ProductHighlightSectionProps {
  items: ProductHighlightProps[];
}

export default function ProductHighlightSection({
  items,
}: ProductHighlightSectionProps) {
  return (
    <>
      <section
        data-theme="dark"
        className="bg-theme-bg text-theme-text overflow-clip sticky top-[0em]"
      >
        <div className="u-container">
          <Spacer size="main" />
          <div className="flex flex-col gap-xxs">
            <Eyebrow>METHOD PLATFORM</Eyebrow>
            <h2 className="u-text-style-h3">Our Products</h2>
            <Spacer size="small" />
          </div>
        </div>
      </section>
      {items.map((item, index) => (
        <ProductHighlight key={index} {...item} className="top-[0em]" />
      ))}
    </>
  );
}
