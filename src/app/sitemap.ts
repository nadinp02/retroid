import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { listActiveProductSlugs } from "@/services/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listActiveProductSlugs();

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/productos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...products.map((product) => ({
      url: `${siteConfig.url}/productos/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
