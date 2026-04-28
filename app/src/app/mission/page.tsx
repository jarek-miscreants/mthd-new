import type { Metadata } from "next";
import Link from "next/link";
import { getContent, getContentWithBody } from "@/lib/content";
import type { MissionPageData } from "@/lib/content-types";
import { mapSeoToMetadata } from "@/lib/mapSeoToMetadata";
import CardSection from "@/components/sections/CardSection";
import Eyebrow from "@/components/elements/GEyebrow";
import Spacer from "@/components/util/Spacer";
import blogPostStyles from "@/components/sections/BlogPost.module.css";

export async function generateMetadata(): Promise<Metadata> {
    const data = await getContent<MissionPageData>("pages/mission");

    return mapSeoToMetadata(data?.seo, {
        defaultOg: "",
        robots: { index: true, follow: true },
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/mission`,
    });
}

export default async function Mission() {
    const { frontmatter: data, contentHtml } = await getContentWithBody<MissionPageData>("pages/mission");

    const showSubscribe = Boolean(data.subscribeButtonLink && data.subscribeButtonText);

    return (
        <>
            <section className="bg-theme-bg text-theme-text">
                <Spacer size="main" />

                {data.eyebrow ? (
                    <>
                        <div className="u-container max-w-[none] flex flex-col gap-4 t:grid t:grid-cols-12">
                            <Eyebrow customClass="t:col-span-6">{data.eyebrow}</Eyebrow>
                            {data.description ? (
                                <h1 className="t:col-span-6 text-large hidden t:block">{data.description}</h1>
                            ) : null}
                        </div>
                        <Spacer size="main" />
                    </>
                ) : null}

                <div className={`${blogPostStyles.container} u-container mx-auto px-4`}>
                    {data.description && data.eyebrow ? (
                        <h1 className={`${blogPostStyles.title} t:hidden`}>{data.description}</h1>
                    ) : null}
                    {data.description && !data.eyebrow ? <h1 className={blogPostStyles.title}>{data.description}</h1> : null}
                    <div className={blogPostStyles.prose} dangerouslySetInnerHTML={{ __html: contentHtml }} />
                    {showSubscribe ? (
                        <div className="mt-large">
                            <Link
                                href={data.subscribeButtonLink!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-main-wrap is-primary inline-flex items-center gap-2 text-small group"
                            >
                                {data.subscribeButtonText}
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
                    ) : null}
                </div>
                <Spacer size="main" />
            </section>
            <CardSection cards={data?.cards || []} />
        </>
    );
}
