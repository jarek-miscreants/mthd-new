import VideoSwapper from "@/components/elements/VideoSwapper";
import HomeHeroInteraction from "./HomeHeroInteraction";

interface HomeHeroProps {
  title: string;
  videoSrc: string;
  videoSrcMobile: string;
}

const componentId = "home-hero";

export default function HomeHero({ title, videoSrc, videoSrcMobile }: HomeHeroProps) {
  return (
    <section className="max-w-[none] overflow-clip">
      <div className="relative w-full h-[65vh] t:h-[80vh]">
        {/* Video Layer */}
        <div className="relative w-full h-full">
          <VideoSwapper
            videoSrc={videoSrc}
            videoSrcMobile={videoSrcMobile}
            className="w-full h-full object-cover block"
          />
        </div>

        {/* Black overlay with opacity */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.30)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        {/* Text overlay */}
        <div
          className="p-2 t:p-[var(--site--gutter)]"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            zIndex: 20,
          }}
        >
          <h2
            data-theme="dark"
            data-hero-text={componentId}
            className="text-[2.2em] t:text-[4em] u-text-style-h2 text-theme-text"
            style={{
              WebkitTextStroke: "0.1px rgba(0, 0, 0, .5)",
            }}
          >
            {title}
          </h2>
        </div>
      </div>
      <HomeHeroInteraction componentId={componentId} title={title} />
    </section>
  );
}
