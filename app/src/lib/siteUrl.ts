/** Production fallback when NEXT_PUBLIC_SITE_URL is not set (e.g. CI/build). */
const SITE_URL_FALLBACK = "https://www.method.security";

/**
 * Base URL for the site. Use for sitemap, robots, and canonical URLs.
 * Never returns undefined so build/CI without env still emits valid URLs.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_FALLBACK;
}
