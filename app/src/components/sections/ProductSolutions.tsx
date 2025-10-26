import Eyebrow from "@/components/elements/GEyebrow";
import Spacer from "../util/Spacer";
import ProductSolutionItem, {
  ProductSolutionItemProps,
} from "@/components/elements/ProductSolutionItem";

interface ProductSolutionsProps {
  eyebrow: string;
  items: ProductSolutionItemProps[];
}

export default function ProductSolutions({
  eyebrow,
  items,
}: ProductSolutionsProps) {
  return (
    <section>
      <Spacer />
      <div className="u-container max-w-none flex flex-col gap-small">
        <Eyebrow>{eyebrow}</Eyebrow>
        <ul>
          {items.map((item, index) => (
            <ProductSolutionItem key={index} {...item} />
          ))}
        </ul>
      </div>
      <Spacer size="none" />
    </section>
  );
}
