import Spacer from "@/components/util/Spacer";
import Eyebrow from "../elements/GEyebrow";
import PictureTileRow from "../elements/PictureTileRow";
import PictureTile from "../elements/PictureTile";
import HighlightItem from "../elements/HighlightItem";
import Link from "next/link";
import CareersButtonInteraction from "./CareersButtonInteraction";

interface TileConfig {
  src: string;
  alt: string;
  aspectRatio?: number | null;
  cutAngle?: number | null;
}

interface CareersProps {
  eyebrow?: string;
  text?: string;
  careersPageUrl?: string;
  section1Eyebrow?: string;
  section1Items?: Array<{
    title: string;
    description: string;
  }>;
  section2Eyebrow?: string;
  section2Items?: Array<{
    title: string;
    description: string;
  }>;
  mainImages?: TileConfig[];
  secondaryImages?: TileConfig[];
}

function FeatureCopy({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-xxs">
        <h3 className="u-text-style-h3 max-w-[20ch]">{title}</h3>
        <p className="text-main max-w-[36ch]">{description}</p>
      </div>
    </div>
  );
}

function FeatureImage({ tile }: { tile: TileConfig }) {
  const aspectRatio = tile.aspectRatio ?? 16 / 9;

  return (
    <div className="flex justify-center">
      <div
        className="w-[75%]"
        style={{ maxWidth: `calc(800px * ${aspectRatio})` }}
      >
        <PictureTile
          src={tile.src}
          alt={tile.alt}
          aspectRatio={tile.aspectRatio}
          cutAngle={tile.cutAngle}
        />
      </div>
    </div>
  );
}

export default function Careers({
  eyebrow,
  text,
  careersPageUrl,
  section1Eyebrow,
  section1Items,
  section2Eyebrow,
  section2Items,
  mainImages,
  secondaryImages,
}: CareersProps) {
  const missionItem = section1Items?.[0];
  const pairedItems = section1Items?.slice(1) ?? [];
  const photo4 = secondaryImages?.[0];
  const photo5 = secondaryImages?.[1];
  const bottomImages = secondaryImages?.slice(2, 5) ?? [];
  const footerImages = secondaryImages?.slice(5, 7) ?? [];
  const topImagesDesktop = mainImages ?? [];
  const topImagesMobile = topImagesDesktop.slice(0, 2);
  const overflowTopImage = topImagesDesktop[2];
  const bottomImagesMobile = overflowTopImage
    ? [overflowTopImage, ...bottomImages]
    : bottomImages;

  return (
    <section className="bg-theme-bg text-theme-text">
      <Spacer size="main" calc="size * 1.5" />

      {(eyebrow || text) && (
        <>
          <div className="u-container max-w-[none] flex flex-col gap-xxs">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {text && <h1 className="u-text-style-h3 max-w-[28ch]">{text}</h1>}
          </div>
          <Spacer size="small" calc="size * 1.5" />
        </>
      )}

      {topImagesDesktop.length > 0 && (
        <div className="u-container max-w-[none]">
          <div className="hidden t:block">
            <PictureTileRow
              tiles={topImagesDesktop}
              staggerOffsets={[3.25, 0.75, 4.5]}
            />
          </div>
          {topImagesMobile.length > 0 && (
            <div className="t:hidden">
              <PictureTileRow
                tiles={topImagesMobile}
                staggerOffsets={[0.5, 2]}
              />
            </div>
          )}
        </div>
      )}

      {(missionItem || pairedItems.length > 0) && (
        <>
          <Spacer size="main" />

          <div className="u-container max-w-[none] flex flex-col gap-main">
            {section1Eyebrow && (
              <div className="flex flex-col gap-xxs">
                <Eyebrow>{section1Eyebrow}</Eyebrow>
              </div>
            )}

            {missionItem && photo4 && (
              <div className="grid grid-cols-1 t:grid-cols-2 gap-small t:gap-[var(--site--gutter)] t:items-center">
                <FeatureCopy
                  title={missionItem.title}
                  description={missionItem.description}
                />
                <FeatureImage tile={photo4} />
              </div>
            )}

            {pairedItems.length > 0 && photo5 && (
              <div className="grid grid-cols-1 t:grid-cols-2 gap-small t:gap-[var(--site--gutter)] t:items-center">
                <div className="flex justify-center t:order-2">
                  <div className="flex flex-col gap-small">
                    {pairedItems.map((item, index) => (
                      <div key={index} className="flex flex-col gap-xxs">
                        <h3 className="u-text-style-h3 max-w-[20ch] whitespace-pre-line">{item.title}</h3>
                        <p className="text-main max-w-[36ch]">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="t:order-1">
                  <FeatureImage tile={photo5} />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {section2Items && section2Items.length > 0 && (
        <>
          <Spacer size="main" />

          <div className="u-container">
            {section2Eyebrow && (
              <div className="flex flex-col gap-xxs">
                <Eyebrow>{section2Eyebrow}</Eyebrow>
              </div>
            )}

            <div className="flex flex-col gap-small mt-small max-w-[83em] mx-auto">
              {section2Items.map((item, index) => (
                <HighlightItem
                  key={index}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <Spacer size="main" />
      {careersPageUrl && (
        <CareersButtonInteraction>
          <div className="u-container flex justify-center">
            <Link
              href={careersPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-main-wrap is-primary flex items-center gap-2 text-main group"
              data-careers-button
            >
              View Open Positions
              <svg
                className="w-[0.75em] ml-xxs rotate-[45deg] group-hover:rotate-[0deg] transition-transform duration-[400ms] ease-[ease]"
                width="100%"
                height="100%"
                viewBox="0 0 21 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.430332 7.57992L16.682 7.58375L11.2771 2.17879L12.78 0.675862L20.7046 8.60042L12.8243 16.4806L11.402 15.0583L16.8247 9.63556L0.430821 9.65201L0.430332 7.57992Z"
                  fill="currentColor"
                />
              </svg>
            </Link>
          </div>
        </CareersButtonInteraction>
      )}

      {(bottomImages.length > 0 ||
        bottomImagesMobile.length > 0 ||
        footerImages.length > 0) && (
        <>
          <Spacer size="main" />
          <div className="u-container max-w-[none] flex flex-col gap-[1.25em]">
            {bottomImages.length > 0 && (
              <div className="hidden t:block">
                <PictureTileRow
                  tiles={bottomImages}
                  gap="var(--site--gutter)"
                  staggerOffsets={[4, 0.75, 2.5]}
                />
              </div>
            )}
            {bottomImagesMobile.length > 0 && (
              <div className="t:hidden">
                <PictureTileRow
                  tiles={bottomImagesMobile}
                  staggerOffsets={[0.5, 2, 1.5, 0.75]}
                />
              </div>
            )}
            {footerImages.length > 0 && (
              <>
                <div className="hidden t:flex t:justify-center">
                  <div className="w-[66%]">
                    <PictureTileRow
                      tiles={footerImages}
                      gap="var(--site--gutter)"
                      staggerOffsets={[1.25, 2.75]}
                    />
                  </div>
                </div>
                <div className="t:hidden">
                  <PictureTileRow
                    tiles={footerImages}
                    staggerOffsets={[0.5, 2]}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}

      <Spacer size="main" />
    </section>
  );
}
