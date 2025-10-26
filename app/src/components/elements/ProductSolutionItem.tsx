import Eyebrow from "./GEyebrow";
import styles from "./Accordion.module.css";

export interface ProductSolutionItemProps {
  eyebrow: string;
  title: string;
  text: string;
  mediaSrc: string;
}

export default function ProductSolutionItem({
  eyebrow,
  title,
  text,
  mediaSrc,
}: ProductSolutionItemProps) {
  return (
    <li className={styles.item}>
      <div className="relative flex flex-col t:grid gap-2 t:gap-4 t:grid-cols-12 py-4 px-2">
        <Eyebrow customClass="text-neutral">{eyebrow}</Eyebrow>
        <h3 className="u-text-style-h3 t:leading-[.68] col-span-10">{title}</h3>
      </div>

      {/* <div className="flex flex-col gap-4 t:grid t:grid-cols-12 py-small">
        <p className="t:col-start-2 t:col-span-3 self-end">{text}</p>
        <video
          src={mediaSrc}
          playsInline
          loop
          muted
          autoPlay
          preload="auto"
          className="w-full object-cover aspect-[16/9] t:col-start-7 t:col-span-6"
        ></video>
      </div> */}
    </li>
  );
}
