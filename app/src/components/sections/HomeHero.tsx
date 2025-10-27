import VideoSwapper from "@/components/elements/VideoSwapper";
import HomeHeroInteraction from "./HomeHeroInteraction";

interface HomeHeroProps {
  videoSrc: string;
  videoSrcMobile: string;
}

const componentId = "home-hero";

export default function HomeHero({ videoSrc, videoSrcMobile }: HomeHeroProps) {
  return (
    <section className="max-w-[none] overflow-clip">
      <div className="relative w-full h-[80vh]">
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
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: "3rem",
            paddingRight: "2rem",
            zIndex: 20,
          }}
        >
          <h2
            data-theme="dark"
            data-hero-text={componentId}
            className="u-text-style-h2 t:text-[5em] text-theme-text"
            style={{
              WebkitTextStroke: "0.1px rgba(0, 0, 0, .5)",
            }}
          >
            Secure what matters.
          </h2>
        </div>
      </div>
      <HomeHeroInteraction componentId={componentId} />
    </section>
  );
}
