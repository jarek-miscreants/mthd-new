import Eyebrow from "@/components/elements/GEyebrow";
import Spacer from "../util/Spacer";
import Accordion, { AccordionProps } from "@/components/elements/Accordion";

interface ProductSolutionsProps {
  eyebrow: string;
  items: AccordionProps[];
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
            <Accordion key={index} {...item} />
          ))}
        </ul>
      </div>
      <Spacer size="none" />
    </section>
  );
}
