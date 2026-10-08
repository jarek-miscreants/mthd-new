import Image from "next/image";
import Link from "next/link";
import LinkIndicator from "@/components/elements/LinkIndicator";
import type { BlogPostData, HomePrototypeData } from "@/lib/content-types";
import styles from "./HomeClosing.module.css";

export default function HomeClosing({ careers, news, post }: {
  careers: HomePrototypeData["careers"];
  news: HomePrototypeData["news"];
  post?: { slug: string; frontmatter: BlogPostData };
}) {
  return <>
    <section className={styles.careers} aria-labelledby="careers-heading" data-theme="light">
      <Link href={careers.href} className={styles.careerLink}>
        <div className={styles.careerCopy}>
          <span className={styles.label} data-eyebrow>{careers.label}</span>
          <div><h2 id="careers-heading">{careers.title}</h2><p>{careers.copy}</p></div>
          <span className={styles.action}>{careers.linkLabel}<LinkIndicator aria-hidden="true" /></span>
        </div>
        <div className={styles.careerImage}><Image src={careers.image} alt={careers.imageAlt} fill sizes="(max-width: 767px) 100vw, 50vw" /></div>
      </Link>
    </section>
    <section className={styles.news} aria-labelledby="news-heading" data-theme="light">
      <div className={styles.newsHeader}><h2 id="news-heading" className={styles.label} data-eyebrow>{news.title}</h2><Link className={styles.action} href={news.href}>{news.allLabel}<LinkIndicator aria-hidden="true" /></Link></div>
      {post && <Link className={styles.article} href={`/blog/${post.slug}`}>
        {post.frontmatter.featuredImageUrl && <div className={styles.articleImage}><Image src={post.frontmatter.featuredImageUrl} alt={post.frontmatter.featuredImageAlt || ""} fill sizes="(max-width: 767px) 100vw, 50vw" /></div>}
        <div className={styles.articleCopy}>
          <span className={styles.label}>{post.frontmatter.category} / <time dateTime={post.frontmatter.publishedAt}>{new Date(post.frontmatter.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}</time></span>
          <h3>{post.frontmatter.title}</h3>
          <p>{post.frontmatter.excerpt}</p>
          <span className={styles.action}>Read article<LinkIndicator aria-hidden="true" /></span>
        </div>
      </Link>}
    </section>
  </>;
}
