import type { Metadata } from "next";
import { getContent, getCollection } from "@/lib/content";
import type { HomePageData, HomePrototypeData, BlogPostData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import HomeHero from "@/components/sections/HomeHero";
import HomeMission from "@/components/sections/HomeMission";
import HomeFeatureRow from "@/components/sections/HomeFeatureRow";
import HomeClosing from "@/components/sections/HomeClosing";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getContent<HomePageData>("pages/home");

  return mapSeoToMetadata(data?.seo, {
    defaultOg: "",
    robots: { index: true, follow: true },
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}`,
  });
}

export default async function Home() {
  const [homeData, postEntries, prototypeData] = await Promise.all([
    getContent<HomePageData>("pages/home"),
    getCollection<BlogPostData>("blog"),
    getContent<HomePrototypeData>("pages/home-prototype"),
  ]);
  const latestPost = postEntries
    .filter(post => new Date(post.frontmatter.publishedAt).getTime() <= Date.now())
    .sort((a, b) => new Date(b.frontmatter.publishedAt).getTime() - new Date(a.frontmatter.publishedAt).getTime())[0];

  return (
    <>
      <HomeHero {...prototypeData.hero} videoSrc={homeData?.hero?.videoSrc || ""} videoSrcMobile={homeData?.hero?.videoSrcMobile || ""} />
      <HomeMission {...prototypeData.mission} />
      <HomeFeatureRow cards={prototypeData.featureCards} />
      <HomeFeatureRow cards={prototypeData.operationCards} columns={3} />
      <HomeClosing careers={prototypeData.careers} news={prototypeData.news} post={latestPost} />
    </>
  );
}
