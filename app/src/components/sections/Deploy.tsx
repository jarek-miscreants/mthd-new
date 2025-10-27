import Eyebrow from "@/components/elements/GEyebrow";
import DeployItem from "@/components/elements/DeployItem";
import type { DeployItemProps } from "@/components/elements/DeployItem";
import SectionBottomClipper from "../elements/SectionBottomClipper";
import SectionTopClipper from "../elements/SectionTopClipper";
import Spacer from "../util/Spacer";

interface DeploySectionProps {
  eyebrow?: string;
  title: string;
  leadParagraph: string;
  videoSrc: string;
  items: DeployItemProps[];
  deployCTATitle?: string;
  deployCTAButtonText?: string;
  deployCTALink?: string;
}

export default function DeploySection({
  eyebrow,
  title,
  leadParagraph,
  videoSrc,
  items,
  deployCTATitle,
  deployCTAButtonText,
  deployCTALink,
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
          <Spacer size="small" />
          <div className="flex flex-col gap-xxs">
            <Eyebrow>{eyebrow}</Eyebrow>
            <div className="flex flex-col t:flex-row gap-4">
              <h2 className="u-text-style-h3 flex-1">{title}</h2>
              {/* <p className="text-large flex-1">{leadParagraph}</p> */}
              <video
                src={videoSrc}
                playsInline
                autoPlay
                loop
                muted
                preload="none"
                className="t:w-[250px] t:mt-[-80px] object-cover aspect-[16/9] my-main"
              ></video>
            </div>
          </div>

          <ul className="deploy_cards_wrap flex flex-col gap-xxs d:gap-[2em] d:grid d:grid-cols-12">
            {items.map((item, index) => (
              <DeployItem key={index} {...item} />
            ))}
          </ul>

          <Spacer size="small" />

          <div className="bg-dark-secondary t:py-4 py-2 px-2 rounded-main d:col-span-4 flex t:flex-row flex-col gap-xs justify-between">
            <h3 className="u-text-style-h4 flex-2">
              {deployCTATitle || "Get started with a demo"}
            </h3>
            <a
              className="btn-main-wrap is-primary md:flex-1 px-2"
              href={deployCTALink || "mailto:"}
            >
              {deployCTAButtonText || "Request Demo"}
            </a>
          </div>
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
