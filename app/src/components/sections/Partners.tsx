import Eyebrow from "@/components/elements/GEyebrow";
import Spacer from "@/components/util/Spacer";
import Image from "next/image";

interface PartnersProps {
  eyebrow?: string;
  logos?: Array<{
    src: string;
    alt: string;
  }>;
}

export default function Partners({ eyebrow, logos = [] }: PartnersProps) {
  return (
    <section>
      <Spacer calc="size / 2" />
      <div className="u-container grid grid-cols-4 t:grid-cols-12 gap-small gap-y-small">
        <div className="relative col-span-4 t:col-span-12 flex flex-col gap-xxs">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>

        <div className="relative col-span-4 t:col-span-12 pb-main flex flex-wrap gap-x-small gap-y-xs t:gap-xlarge items-center justify-center t:justify-between">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="relative h-[70px] t:h-[120px] flex items-center justify-center"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                height={120}
                width={250}
                className="h-full w-auto object-contain opacity-85"
                style={{ height: "100%", width: "auto" }}
              />
            </div>
          ))}
        </div>
      </div>
      <Spacer />
    </section>
  );
}
