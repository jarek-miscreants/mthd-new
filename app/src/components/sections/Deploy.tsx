import Eyebrow from "@/components/elements/GEyebrow";
import Spacer from "@/components/util/Spacer";
import DeployItem from "@/components/elements/DeployItem";
import type { DeployItemProps } from "@/components/elements/DeployItem";
import styles from "@/components/sections/Deploy.module.css";
import SectionClipper from "../elements/SectionClipper";

interface DeploySectionProps {
  eyebrow?: string;
  title: string;
  leadParagraph: string;
  items: DeployItemProps[];
}

export default function DeploySection({
  eyebrow,
  title,
  leadParagraph,
  items,
}: DeploySectionProps) {
  return (
    <section
      data-theme="dark"
      className={`${styles.clip_container} clip-section text-theme-text bg-theme-bg relative`}
    >
      <Spacer size="large" calc="size*2" />
      <div className="u-container">
        <div className="flex flex-col gap-xxs">
          <Eyebrow>{eyebrow}</Eyebrow>
          <div className="flex flex-col t:flex-row gap-4">
            <h2 className="u-text-style-h3 flex-1">{title}</h2>
            <p className="text-large flex-1">{leadParagraph}</p>
          </div>
        </div>

        <div className="italic my-[35vh] text-center">svg animation</div>

        <ul className="deploy_cards_wrap flex flex-col gap-xxs d:gap-[2em] d:grid d:grid-cols-12">
          {items.map((item, index) => (
            <DeployItem key={index} {...item} />
          ))}
        </ul>
      </div>
      <Spacer size="large" calc="size*2" />

      <SectionClipper />
    </section>
  );
}
