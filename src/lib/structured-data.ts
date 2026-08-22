// Builders de datos estructurados (schema.org, formato JSON-LD). Server-only
// (usa siteConfig): arman objetos planos que las páginas serializan en un
// <script type="application/ld+json">. Mismo criterio que whatsapp.ts — la
// lógica de armado vive acá, no se duplica en los componentes.

import { siteConfig } from "@/lib/site-config";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.companyName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/banner.png`,
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

export function productJsonLd(product: ProductForJsonLd) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.name,
    image: product.images.map((image) => image.url),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
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

/**
 * Escapa "<" para que un valor de negocio (nombre/descripción de producto)
 * no pueda cerrar el <script> anticipadamente si llegara a contener
 * literalmente "</script>". Patrón recomendado por Next.js para JSON-LD.
 */
export function jsonLdScriptProps(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
