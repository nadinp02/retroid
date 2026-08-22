import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /administracion y /login: pedido explícito. /api también se bloquea
      // acá — son route handlers (Auth.js), no páginas, sin valor indexable.
      disallow: ["/administracion", "/login", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
