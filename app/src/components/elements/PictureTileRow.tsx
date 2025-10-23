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
    /** Gap between tiles (default 1rem) */
    gap?: string;
}

/**
 * PictureTileRow: Responsive flex row that lays out PictureTiles.
 */
const PictureTileRow: React.FC<PictureTileRowProps> = ({ tiles }) => {
    const gridCols = tiles.length === 1 ? "grid-cols-1" : "grid-cols-2";

    return (
        <div className={`grid ${gridCols} t:flex t:flex-row t:flex-wrap t:justify-center t:items-start gap-xs t:gap-[var(--site--gutter)]`}>
            {tiles.map((tile, index) => (
                <div key={index} className="t:flex-1">
                    <PictureTile src={tile.src} alt={tile.alt} aspectRatio={tile.aspectRatio} cutAngle={tile.cutAngle} />
                </div>
            ))}
        </div>
    );
};

export default PictureTileRow;
