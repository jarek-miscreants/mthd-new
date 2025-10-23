import React from "react";
import Image from "next/image";

interface PictureTileProps {
  src: string;
  alt: string;
  /** Aspect ratio as width/height (e.g., 1.777 for 16:9) */
  aspectRatio?: number | null;
  /** Optional corner cut angle (default 45°) */
  cutAngle?: number | null;
  /** Optional additional className */
  className?: string;
}

/**
 * PictureTile: Displays an image with a bottom-right corner cut off at a given angle.
 * All corners including the cut edges have rounded corners.
 * Aspect ratio defaults to 16:9 (1.777) if not specified.
 */
const PictureTile: React.FC<PictureTileProps> = ({
  src,
  alt,
  aspectRatio,
  cutAngle,
  className = "",
}) => {
  const effectiveAspectRatio = aspectRatio ?? 16 / 9;
  const effectiveCutAngle = cutAngle ?? 45;

  // Generate unique ID for this clip path
  const clipId = React.useId();

  // Dimensions for the SVG viewBox
  const width = 1000;
  const height = 1000;

  // Corner radius in SVG units
  const radius = 16;

  // Calculate cut dimensions
  const cutSizePercent = 8; // percentage
  const cutWidth = (cutSizePercent / 100) * width;
  const cutHeight = cutWidth * Math.tan((effectiveCutAngle * Math.PI) / 180);

  // Calculate key points for the path with the cut
  const topLeft = { x: 0, y: 0 };
  const topRight = { x: width, y: 0 };
  const rightBeforeCut = { x: width, y: height - cutHeight };
  const bottomLeftOfCut = { x: width - cutWidth, y: height };
  const bottomLeft = { x: 0, y: height };

  // Create SVG path with rounded corners
  // Path moves clockwise starting from top-left, with arcs for rounded corners
  const pathD = `
    M ${topLeft.x + radius} ${topLeft.y}
    L ${topRight.x - radius} ${topRight.y}
    Q ${topRight.x} ${topRight.y} ${topRight.x} ${topRight.y + radius}
    L ${rightBeforeCut.x} ${rightBeforeCut.y - radius}
    Q ${rightBeforeCut.x} ${rightBeforeCut.y} ${rightBeforeCut.x - radius} ${rightBeforeCut.y + radius * 0.7}
    L ${bottomLeftOfCut.x + radius * 0.7} ${bottomLeftOfCut.y - radius}
    Q ${bottomLeftOfCut.x} ${bottomLeftOfCut.y} ${bottomLeftOfCut.x - radius} ${bottomLeftOfCut.y}
    L ${bottomLeft.x + radius} ${bottomLeft.y}
    Q ${bottomLeft.x} ${bottomLeft.y} ${bottomLeft.x} ${bottomLeft.y - radius}
    L ${topLeft.x} ${topLeft.y + radius}
    Q ${topLeft.x} ${topLeft.y} ${topLeft.x + radius} ${topLeft.y}
    Z
  `;

  return (
    <>
      {/* SVG definition for clip path */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={pathD} transform={`scale(${1 / width} ${1 / height})`} />
          </clipPath>
        </defs>
      </svg>

      {/* Image container with clip path applied */}
      <div
        className={`relative w-full overflow-hidden shadow-md ${className}`}
        style={{
          aspectRatio: `${effectiveAspectRatio}`,
          clipPath: `url(#${clipId})`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          draggable={false}
        />
      </div>
    </>
  );
};

export default PictureTile;
