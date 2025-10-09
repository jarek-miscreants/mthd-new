import type { ProductHighlightProps } from "@/components/sections/ProductHighlight";
import ProductHighlight from "@/components/sections/ProductHighlight";
import ProductHighlightInteraction from "./ProductHighlightInteraction";

interface ProductHighlightSectionProps {
  items: ProductHighlightProps[];
}

export default function ProductHighlightSection({
  items,
}: ProductHighlightSectionProps) {
  return (
    <div data-theme="dark" className="ph_wrap bg-theme-bg text-theme-text">
      {items.map((item, index) => (
        <ProductHighlight key={index} {...item} />
      ))}
      <ProductHighlightInteraction />
    </div>
  );
}
