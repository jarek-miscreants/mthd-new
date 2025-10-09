import Eyebrow from "../elements/GEyebrow";
import Spacer from "@/components/util/Spacer";
import type { ReactNode } from "react";

interface LegalSectionProps {
  eyebrow?: string;
  title: string;
  body: ReactNode;
}

export default function LegalSection({
  eyebrow,
  title,
  body,
}: LegalSectionProps) {
  return (
    <section>
      <Spacer />
      <div className="u-container max-w-[none] flex flex-col gap-main t:grid t:grid-cols-12">
        <Eyebrow customClass="t:col-span-2">{eyebrow ?? "Legal"}</Eyebrow>

        <div className="t:col-start-7 t:col-end-[-1]">
          <h1 className="u-text-style-h3 mb-3">{title}</h1>
          <div>{body}</div>
        </div>
      </div>
      <Spacer />
    </section>
  );
}
