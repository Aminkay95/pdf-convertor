import type { MetadataRoute } from "next";
import { seoPages } from "@/content/seo/pages";
import { getSiteUrl } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  return [
    { url: baseUrl, lastModified: new Date("2026-06-28") },
    { url: `${baseUrl}/converter`, lastModified: new Date("2026-06-28") },
    ...seoPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date("2026-06-28")
    }))
  ];
}
