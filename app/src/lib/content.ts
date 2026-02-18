import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import readingTime from "reading-time";

const contentDir = path.join(process.cwd(), "content");

/**
 * Read an MDX file and return frontmatter only (no body compilation).
 * Used for singleton pages and data-only content.
 */
export async function getContent<T>(filePath: string): Promise<T> {
  const fullPath = path.join(contentDir, `${filePath}.mdx`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data } = matter(raw);
  return data as T;
}

/**
 * Read an MDX file, render body markdown to HTML, return frontmatter + HTML string.
 * Used for blog posts and legal pages.
 */
export async function getContentWithBody<T>(
  filePath: string,
): Promise<{ frontmatter: T; contentHtml: string }> {
  const fullPath = path.join(contentDir, `${filePath}.mdx`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);

  const result = await remark().use(remarkHtml).process(content);
  const contentHtml = result.toString();

  return { frontmatter: data as T, contentHtml };
}

/**
 * List all MDX files in a directory and return slug + frontmatter for each.
 */
export async function getCollection<T>(
  dir: string,
): Promise<Array<{ slug: string; frontmatter: T }>> {
  const fullDir = path.join(contentDir, dir);

  if (!fs.existsSync(fullDir)) {
    return [];
  }

  const files = fs
    .readdirSync(fullDir)
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(fullDir, file), "utf-8");
    const { data } = matter(raw);
    return {
      slug: file.replace(/\.mdx$/, ""),
      frontmatter: data as T,
    };
  });
}

/**
 * Return an array of slugs for all MDX files in a directory.
 * Used for generateStaticParams().
 */
export function getCollectionSlugs(dir: string): string[] {
  const fullDir = path.join(contentDir, dir);

  if (!fs.existsSync(fullDir)) {
    return [];
  }

  return fs
    .readdirSync(fullDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Calculate reading time for an MDX file's body content.
 */
export function getReadingTime(filePath: string): number {
  const fullPath = path.join(contentDir, `${filePath}.mdx`);
  const raw = fs.readFileSync(fullPath, "utf-8");
  const { content } = matter(raw);
  const stats = readingTime(content);
  return Math.max(1, Math.round(stats.minutes));
}
