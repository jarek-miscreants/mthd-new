import VideoSwapper from "@/components/elements/VideoSwapper";
import HomeHeroInteraction from "./HomeHeroInteraction";
import styles from "./HomeHero.module.css";

interface HomeHeroProps {
  title: string;
  videoSrc: string;
  videoSrcMobile: string;
}

const componentId = "home-hero";

export default function HomeHero({ title, videoSrc, videoSrcMobile }: HomeHeroProps) {
  return <section className={styles.hero} data-theme="dark">
    <div className={styles.media}>
      <VideoSwapper videoSrc={videoSrc} videoSrcMobile={videoSrcMobile} className="w-full h-full object-cover block" />
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.content}>
        <h1 aria-label={title}><span aria-hidden="true" data-hero-text={componentId}>{Array.from(title).map((character, index) => <span key={index} data-hero-character>{character}</span>)}</span></h1>
      </div>
    </div>
    <HomeHeroInteraction componentId={componentId} title={title} />
  </section>;
}
