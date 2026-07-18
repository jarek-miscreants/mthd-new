import React from "react";
import PictureTile from "./PictureTile";

interface TileConfig {
  src: string;
  alt: string;
  aspectRatio?: number | null;
  cutAngle?: number | null;
}

interface PictureTileRowProps {
  tiles: TileConfig[];
  /** Desktop gap between tiles (CSS length). Defaults to 1.25em. */
  gap?: string;
  /** Vertical offsets in rem per tile for a collage feel */
  staggerOffsets?: number[];
}

/**
 * PictureTileRow: Responsive flex row that lays out PictureTiles.
 */
const PictureTileRow: React.FC<PictureTileRowProps> = ({
  tiles,
  gap = "1.25em",
  staggerOffsets,
}) => {
  const gridCols = tiles.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div
      className={`grid ${gridCols} t:flex t:flex-row t:flex-wrap t:justify-center t:items-start gap-xs t:gap-(--tile-row-gap)`}
      style={{ ["--tile-row-gap" as string]: gap }}
    >
      {tiles.map((tile, index) => (
        <div
          key={index}
          className="t:flex-1"
          style={
            staggerOffsets
              ? { marginTop: `${staggerOffsets[index % staggerOffsets.length]}rem` }
              : undefined
          }
        >
          <PictureTile
            src={tile.src}
            alt={tile.alt}
            aspectRatio={tile.aspectRatio}
            cutAngle={tile.cutAngle}
          />
        </div>
      ))}
    </div>
  );
};

export default PictureTileRow;
