import { CSSProperties } from "react";

interface SpacerProps {
  size?: "none" | "small" | "main" | "large";
  calc?: string;
  className?: string;
}

export default function Spacer({
  size = "main",
  calc,
  className = "",
}: SpacerProps) {
  const sizeMap: Record<SpacerProps["size"] & string, string> = {
    none: "0em",
    small: "var(--space-small)",
    main: "var(--space-main)",
    large: "var(--space-large)",
  };

  const getHeight = () => {
    const baseSize = sizeMap[size!];

    if (calc) {
      return `calc(${calc.replace(/\bsize\b/g, baseSize)})`;
    }

    return baseSize;
  };

  const style: CSSProperties = {
    "--height": getHeight(),
    position: "relative",
    height: "var(--height)",
  } as CSSProperties;

  return <div className={className} style={style} />;
}
