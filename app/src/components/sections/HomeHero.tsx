interface HomeHeroProps {
  title: string;
  videoSrc: string;
  videoSrcMobile: string;
}

export default function HomeHero({ title, videoSrc }: HomeHeroProps) {
  return (
    <section className="max-w-[none] overflow-clip">
      <div className="w-full h-full relative">
        <h1 className="absolute z-[-1]">{title}</h1>
        <video
          src={videoSrc}
          autoPlay
          playsInline
          loop
          muted
          preload="auto"
          className="w-full object-cover ml:aspect-[16/9] aspect-[3/4]"
        ></video>
      </div>
    </section>
  );
}
