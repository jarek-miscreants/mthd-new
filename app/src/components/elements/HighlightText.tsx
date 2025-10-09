import styles from "@/components/elements/HighlightText.module.css";
import Eyebrow from "@/components/elements/GEyebrow";

export interface HighlightTextProps {
  eyebrow: string;
  text: string;
}

export default function HighlightText({ eyebrow, text }: HighlightTextProps) {
  return (
    <div
      data-name="highlight-text-wrap"
      className={`${styles.wrap} flex flex-col gap-3 t:grid t:grid-cols-12`}
    >
      <Eyebrow customClass="t:col-start-3" data-name="highlight-text-eyebrow">
        {eyebrow}
      </Eyebrow>
      <p
        data-name="highlight-text"
        className={`${styles.text} relative u-text-style-h4 t:u-text-style-h3 t:col-start-5 t:col-end-[-2] whitespace-pre-line`}
      >
        {text}
      </p>
    </div>
  );
}
