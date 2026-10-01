import Eyebrow from "@/components/elements/GEyebrow";
import Spacer from "@/components/util/Spacer";
import MissionInteraction from "@/components/sections/MissionInteraction";
import styles from "@/components/sections/Mission.module.css";

interface MethodProps {
  eyebrow?: string;
  title: string;
  leadParagraph: string;
}

export default function Method({
  eyebrow,
  title,
  leadParagraph,
}: MethodProps) {
  return (
    <section>
      {/* <BackdropVariation className="absolute z-[-2]" variation="variation1" /> */}
      <Spacer />
      <MissionInteraction>
        <div
          data-mission-container
          className={`${styles.item_1} u-container grid grid-cols-4 t:grid-cols-12 gap-small gap-y-large`}
        >
          <div className="relative col-span-4 t:col-span-11 flex flex-col gap-xxs pl-[1.3125em]">
            <Eyebrow data-mission-eyebrow> {eyebrow} </Eyebrow>
            <h2 data-mission-title className="u-text-style-h2 font-primary">
              {title}
            </h2>
          </div>

          <p
            data-mission-paragraph
            className={`${styles.item_2} relative col-start-2 col-span-3 t:col-start-7 t:col-end-12 pb-main text-large whitespace-pre-line`}
          >
            {leadParagraph}
          </p>
        </div>
      </MissionInteraction>
      <Spacer />
    </section>
  );
}
