import type { HighlightTextProps } from "@/components/elements/HighlightText";
import HighlightText from "@/components/elements/HighlightText";
import Spacer from "@/components/util/Spacer";
import CompanyHighlightInteraction from "@/components/sections/CompanyHighlightInteraction";

interface CompanyHighlightProps {
  highlightTexts: HighlightTextProps[];
}

export default function CompanyHighlight({
  highlightTexts,
}: CompanyHighlightProps) {
  return (
    <section>
      <Spacer />
      <CompanyHighlightInteraction>
        <div className="u-container flex flex-col gap-large pt-[30vh]">
          {highlightTexts.map((highlightText, index) => (
            <HighlightText key={index} {...highlightText} />
          ))}
        </div>
      </CompanyHighlightInteraction>
      <Spacer />
    </section>
  );
}
