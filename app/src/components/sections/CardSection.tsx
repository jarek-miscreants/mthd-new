import Card from "@/components/elements/Card";
import type { CardProps } from "@/components/elements/Card";
import Spacer from "@/components/util/Spacer";
import Eyebrow from "../elements/GEyebrow";

interface CardSectionProps {
  eyebrow?: string;
  text?: string;
  cards: CardProps[];
}

export default function CardSection({
  eyebrow,
  text,
  cards,
}: CardSectionProps) {
  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="main" />

      {eyebrow ? (
        <>
          <div className="u-container max-w-[none] flex flex-col gap-4 t:grid t:grid-cols-12">
            <Eyebrow customClass="t:col-span-6">{eyebrow}</Eyebrow>
            <h1 className="t:col-span-6 text-large">{text}</h1>
          </div>
          <Spacer size="main" />
        </>
      ) : (
        <></>
      )}

      <div className="u-container max-w-[none] flex flex-col gap-xs t:gap-[var(--site--gutter)] t:grid t:grid-cols-12">
        {cards.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>
      <Spacer size="small" />
    </section>
  );
}
