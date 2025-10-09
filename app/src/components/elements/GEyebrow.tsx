import { useId } from "react";

export default function Eyebrow({
  children,
  customClass,
  ...props
}: {
  children: React.ReactNode;
  customClass?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const uniqueId = useId();

  return (
    <>
      <div
        data-eyebrow={uniqueId}
        {...props}
        className={`uppercase leading-[.8] font-secondary text-small tracking-[1.15] whitespace-nowrap ${customClass}`}
      >
        {children}
      </div>
    </>
  );
}
