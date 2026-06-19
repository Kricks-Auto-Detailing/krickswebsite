import type { MetadataRoute } from "next";
import { getPublicGalleryCategories } from "@/lib/gallery-store";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const galleryCategories = await getPublicGalleryCategories();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/mobile-car-detailing-decatur-in"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/services"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/booking"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/gallery"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
  ];

  return [
    ...staticRoutes,
    ...galleryCategories.map((category) => ({
      url: absoluteUrl(`/gallery/${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];
}
