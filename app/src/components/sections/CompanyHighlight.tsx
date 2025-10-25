import type { HighlightTextProps } from "@/components/elements/HighlightText";
import HighlightText from "@/components/elements/HighlightText";
import Spacer from "@/components/util/Spacer";
import CompanyHighlightInteraction from "@/components/sections/CompanyHighlightInteraction";
import BackdropVariation from "@/components/elements/BackdropVariation";

interface CompanyHighlightProps {
  highlightTexts: HighlightTextProps[];
}

export default function CompanyHighlight({
  highlightTexts,
}: CompanyHighlightProps) {
  return (
    <section>
      <BackdropVariation className="fixed z-[-2] opacity-25" variation="variation2" />
      <Spacer />
      <CompanyHighlightInteraction>
        <div className="u-container flex flex-col gap-large pt-[15vh]">
          {highlightTexts.map((highlightText, index) => (
            <HighlightText key={index} {...highlightText} />
          ))}
        </div>
      </CompanyHighlightInteraction>
      <Spacer />
    </section>
  );
}
