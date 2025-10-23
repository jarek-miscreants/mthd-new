import Spacer from "@/components/util/Spacer";
import Eyebrow from "../elements/GEyebrow";
import PictureTileRow from "../elements/PictureTileRow";
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
    mainImage?: TileConfig;
    secondaryImages?: TileConfig[];
}

export default function Careers({
    eyebrow,
    text,
    careersPageUrl,
    section1Eyebrow,
    section1Items,
    section2Eyebrow,
    section2Items,
    mainImage,
    secondaryImages,
}: CareersProps) {
    return (
        <section className="bg-theme-bg text-theme-text">
            <Spacer size="main" />

            {eyebrow ? (
                <>
                    <div className="u-container max-w-[none] flex flex-col gap-4 t:grid t:grid-cols-12">
                        <Eyebrow customClass="t:col-span-6">{eyebrow}</Eyebrow>
                        <h1 className="t:col-span-6 text-large">{text}</h1>
                    </div>
                    <Spacer size="small" />
                </>
            ) : (
                <></>
            )}

            <div className="u-container max-w-[none] flex flex-col gap-xs t:gap-[var(--site--gutter)]">
                {mainImage && <PictureTileRow tiles={[mainImage]} />}
            </div>

            {section1Items && section1Items.length > 0 && (
                <>
                    <Spacer size="small" />

                    <div className="u-container">
                        {section1Eyebrow && (
                            <div className="flex flex-col gap-xxs">
                                <Eyebrow>{section1Eyebrow}</Eyebrow>
                            </div>
                        )}

                        <div className="flex flex-col gap-small mt-small max-w-[83em] mx-auto">
                            {section1Items.map((item, index) => (
                                <HighlightItem key={index} title={item.title} description={item.description} />
                            ))}
                        </div>
                    </div>
                    <Spacer size="small" />
                </>
            )}

            <Spacer size="small" />
            <div className="u-container max-w-[none]">
                {secondaryImages && secondaryImages.length > 0 && <PictureTileRow tiles={secondaryImages} />}
            </div>

            {section2Items && section2Items.length > 0 && (
                <>
                    <Spacer size="small" />

                    <div className="u-container">
                        {section2Eyebrow && (
                            <div className="flex flex-col gap-xxs">
                                <Eyebrow>{section2Eyebrow}</Eyebrow>
                            </div>
                        )}

                        <div className="flex flex-col gap-small mt-small max-w-[83em] mx-auto">
                            {section2Items.map((item, index) => (
                                <HighlightItem key={index} title={item.title} description={item.description} />
                            ))}
                        </div>
                    </div>
                    <Spacer size="small" />
                </>
            )}

            <Spacer size="large" />
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

            <Spacer size="main" />
        </section>
    );
}
