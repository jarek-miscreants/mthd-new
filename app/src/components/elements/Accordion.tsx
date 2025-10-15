import Eyebrow from "./GEyebrow";
import LinkIndicator from "./LinkIndicator";
import AccordionInteraction from "./AccordionInteraction";
import LinkIndicatorInteraction from "./LinkIndicatorInteraction";
import styles from "./Accordion.module.css";

export interface AccordionProps {
  eyebrow: string;
  title: string;
  text: string;
  mediaSrc: string;
}

export default function Accordion({
  eyebrow,
  title,
  text,
  mediaSrc,
}: AccordionProps) {
  return (
    <li className={styles.item}>
      <LinkIndicatorInteraction triggerOnCheck={true}>
        <AccordionInteraction>
          <label className="relative flex flex-col t:grid gap-2 t:gap-4 t:grid-cols-12 py-4 px-2 hover:bg-theme-bg-secondary">
            <Eyebrow customClass="text-neutral">{eyebrow}</Eyebrow>
            <h3 className="u-text-style-h3 t:leading-[.68] col-span-10">
              {title}
            </h3>

            <LinkIndicator className="w-[1.3125em] justify-self-end" />
            <input
              type="checkbox"
              data-accordion-input
              className="w-full h-full block appearance-none absolute inset-[0] cursor-pointer"
            />
          </label>

          <div data-accordion-content className="h-[0] overflow-hidden">
            <div className="flex flex-col gap-4 t:grid t:grid-cols-12 py-small">
              <p className="t:col-start-2 t:col-span-3 self-end">{text}</p>
              <video
                src={mediaSrc}
                playsInline
                loop
                muted
                preload="none"
                className="w-full object-cover aspect-[16/9] t:col-start-7 t:col-span-6"
              ></video>
            </div>
          </div>
        </AccordionInteraction>
      </LinkIndicatorInteraction>
    </li>
  );
}
