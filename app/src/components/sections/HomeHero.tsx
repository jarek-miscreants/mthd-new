import VideoSwapper from "@/components/elements/VideoSwapper";

interface HomeHeroProps {
  title: string;
  videoSrc: string;
  videoSrcMobile: string;
}

export default function HomeHero({
  title,
  videoSrc,
  videoSrcMobile,
}: HomeHeroProps) {
  return (
    <section className="max-w-[none] overflow-clip">
      <div className="w-full h-full relative">
        <h1 className="absolute z-[-1]">{title}</h1>
        <VideoSwapper
          videoSrc={videoSrc}
          videoSrcMobile={videoSrcMobile}
          className="w-full object-cover ml:aspect-[16/9] aspect-[3/4]"
        />
      </div>
    </section>
  );
}
