import ArchitectureItem from "../elements/ArchitectureItem";
import Eyebrow from "../elements/GEyebrow";
import Spacer from "../util/Spacer";
import type { ArchitectureItemProps } from "../elements/ArchitectureItem";

interface ArchitectureProps {
  eyebrow?: string;
  title: string;
  items: ArchitectureItemProps[];
}

export default function Architecture({
  eyebrow,
  title,
  items,
}: ArchitectureProps) {
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer />

      <div className="u-container">
        <div className="flex flex-col gap-xxs">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="u-text-style-h3">{title}</h2>
        </div>

        <div className="flex flex-col gap-large mt-large max-w-[83em] mx-auto">
          {items.map((item, index) => (
            <ArchitectureItem key={index} {...item} />
          ))}
        </div>
      </div>
      <Spacer />
    </section>
  );
}
