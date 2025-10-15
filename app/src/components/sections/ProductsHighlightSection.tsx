import type { ProductHighlightProps } from "@/components/sections/ProductHighlight";
import ProductHighlight from "@/components/sections/ProductHighlight";

interface ProductHighlightSectionProps {
  items: ProductHighlightProps[];
}

export default function ProductHighlightSection({
  items,
}: ProductHighlightSectionProps) {
  const topByIndex = (i: number) => {
    if (i === 0) return "top-[0em]";
    if (i === 1) return "top-[5.5em]";
    if (i === 2) return "top-[11em]";
    if (i === 3) return "top-[16.5em]";
    if (i === 4) return "top-[5.5em]";
    if (i === 5) return "top-[5.5em]";
  };

  return (
    <>
      {items.map((item, index) => (
        <ProductHighlight key={index} {...item} className={topByIndex(index)} />
      ))}
    </>
  );
}
