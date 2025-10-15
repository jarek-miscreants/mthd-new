import Eyebrow from "@/components/elements/GEyebrow";
import DeployItem from "@/components/elements/DeployItem";
import type { DeployItemProps } from "@/components/elements/DeployItem";
import SectionBottomClipper from "../elements/SectionBottomClipper";
import SectionTopClipper from "../elements/SectionTopClipper";

interface DeploySectionProps {
  eyebrow?: string;
  title: string;
  leadParagraph: string;
  videoSrc: string;
  items: DeployItemProps[];
}

export default function DeploySection({
  eyebrow,
  title,
  leadParagraph,
  videoSrc,
  items,
}: DeploySectionProps) {
  return (
    <>
      <div
        data-theme="dark"
        className="text-theme-text bg-theme-bg translate-y-[1px]"
        style={{ clipPath: "url(#section-top-clip)" }}
      >
        <SectionTopClipper
          targetPathMultiplier={3.0}
          mobileTargetMultiplier={3.0}
        />
      </div>
      <section
        data-theme="dark"
        className="text-theme-text bg-theme-bg relative pb-small t:pb-[0em]"
      >
        <div className="u-container">
          <div className="flex flex-col gap-xxs">
            <Eyebrow>{eyebrow}</Eyebrow>
            <div className="flex flex-col t:flex-row gap-4">
              <h2 className="u-text-style-h3 flex-1">{title}</h2>
              <p className="text-large flex-1">{leadParagraph}</p>
            </div>
          </div>

          <video
            src={videoSrc}
            playsInline
            autoPlay
            loop
            muted
            preload="none"
            className="w-full object-cover aspect-[16/9] my-main"
          ></video>

          <ul className="deploy_cards_wrap flex flex-col gap-xxs d:gap-[2em] d:grid d:grid-cols-12">
            {items.map((item, index) => (
              <DeployItem key={index} {...item} />
            ))}
          </ul>
        </div>
      </section>
      <div
        data-theme="dark"
        className="text-theme-text bg-theme-bg translate-y-[-1px]"
        style={{ clipPath: "url(#section-bottom-clip)" }}
      >
        <SectionBottomClipper
          targetPathMultiplier={3.0}
          mobileTargetMultiplier={4.0}
        />
      </div>
    </>
  );
}
