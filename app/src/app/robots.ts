import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
