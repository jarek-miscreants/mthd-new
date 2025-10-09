import Eyebrow from "@/components/elements/GEyebrow";
import Spacer from "../util/Spacer";

interface ProductTaglineProps {
  eyebrow: string;
  text: string;
}

export default function ProductTagline({ eyebrow, text }: ProductTaglineProps) {
  return (
    <section>
      <Spacer />
      <div className="u-container max-w-none flex flex-col gap-3 t:grid t:grid-cols-12">
        <Eyebrow customClass="t:col-span-6">{eyebrow}</Eyebrow>
        <h2 className="u-text-style-h3 t:col-span-6">{text}</h2>
      </div>
      <Spacer />
    </section>
  );
}
