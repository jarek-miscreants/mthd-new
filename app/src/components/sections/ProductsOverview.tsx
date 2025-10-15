import ProductsOverviewItem, {
  ProductsOverviewItemProps,
} from "./ProductsOverviewItem";

export interface ProductsOverviewProps {
  items: ProductsOverviewItemProps[];
}

export default function ProductsOverview({ items }: ProductsOverviewProps) {
  return (
    <section>
      <div className="u-container max-w-[none] flex flex-col gap-xs t:gap-small pt-main">
        {items.map((item, index) => (
          <ProductsOverviewItem
            key={index}
            {...item}
            variation={index % 2 === 0 ? "variation1" : "variation2"}
          />
        ))}
      </div>
    </section>
  );
}
