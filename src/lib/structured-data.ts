// Builders de datos estructurados (schema.org, formato JSON-LD). Server-only
// (usa siteConfig): arman objetos planos que las páginas serializan en un
// <script type="application/ld+json">. Mismo criterio que whatsapp.ts — la
// lógica de armado vive acá, no se duplica en los componentes.

import { siteConfig } from "@/lib/site-config";
import type { ReviewSummary } from "@/types/reviews";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.companyName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/banner.jpg`,
    ...(siteConfig.instagramUrl ? { sameAs: [siteConfig.instagramUrl] } : {}),
  };
}

type ProductForJsonLd = {
  name: string;
  slug: string;
  description: string | null;
  price: number | string | { toString(): string };
  stock: number;
  brand: { name: string } | null;
  images: { url: string; alt: string | null }[];
};

export function productJsonLd(product: ProductForJsonLd, reviewSummary?: ReviewSummary) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.name,
    image: product.images.map((image) => image.url),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
    // aggregateRating requiere al menos 1 reseña aprobada — de lo contrario
    // Google Rich Results rechaza el bloque completo.
    ...(reviewSummary && reviewSummary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewSummary.average.toFixed(1),
            reviewCount: reviewSummary.count,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/productos/${product.slug}`,
      priceCurrency: "ARS",
      price: Number(product.price.toString()).toFixed(2),
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      // El último item (página actual) no lleva `item` — así lo indica la
      // spec de schema.org para breadcrumbs sin URL propia.
      ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
    })),
  };
}

/**
 * Escapa "<" para que un valor de negocio (nombre/descripción de producto)
 * no pueda cerrar el <script> anticipadamente si llegara a contener
 * literalmente "</script>". Patrón recomendado por Next.js para JSON-LD.
 */
export function jsonLdScriptProps(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
