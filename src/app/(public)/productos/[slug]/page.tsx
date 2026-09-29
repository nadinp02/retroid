import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getProductBySlug } from "@/services/products";
import { listApprovedReviews, getReviewSummary } from "@/services/reviews";
import { buildWhatsAppUrl, buildProductWhatsAppMessage } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site-config";
import { productJsonLd, breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/structured-data";
import { getNonce } from "@/lib/nonce";
import { formatPrice } from "@/utils/price";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { WindowPanel } from "@/components/ui/window-panel";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGallery } from "@/features/products/product-gallery";
import { ProductTrustStrip } from "@/features/products/product-trust-strip";
import { ReviewsSection } from "@/features/reviews/reviews-section";

// cache(): dedupea el fetch entre generateMetadata y el componente de
// página, que corren por separado pero para el mismo request.
const getProduct = cache(async (slug: string) => {
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) {
    return null;
  }
  return product;
});

const DESCRIPTION_MAX_LENGTH = 155;
// A partir de cuántas unidades restantes el stock deja de mostrarse como
// "En stock" genérico y pasa a mostrar la cantidad exacta como urgencia.
const LOW_STOCK_THRESHOLD = 5;

function buildProductDescription(product: { name: string; description: string | null }) {
  if (product.description) {
    return product.description.length > DESCRIPTION_MAX_LENGTH
      ? `${product.description.slice(0, DESCRIPTION_MAX_LENGTH - 1).trimEnd()}…`
      : product.description;
  }
  return `Comprá ${product.name} en RETROID. Envíos a todo Argentina.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Producto no encontrado", robots: { index: false, follow: false } };
  }

  const description = buildProductDescription(product);
  const canonicalPath = `/productos/${product.slug}`;
  // openGraph/twitter no heredan del layout raíz si esta página define los
  // suyos — sin este fallback, un producto sin fotos quedaría sin imagen OG.
  const images =
    product.images.length > 0
      ? product.images.map((image) => ({ url: image.url, alt: image.alt ?? product.name }))
      : [{ url: "/banner.jpg", width: 1279, height: 929, alt: product.name }];

  return {
    title: product.name,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: product.name,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, nonce] = await Promise.all([getProduct(slug), getNonce()]);

  if (!product) {
    notFound();
  }

  const [reviewSummary, reviews] = await Promise.all([
    getReviewSummary(product.id),
    listApprovedReviews({ productId: product.id }),
  ]);

  const whatsappUrl = buildWhatsAppUrl(
    buildProductWhatsAppMessage({
      name: product.name,
      price: product.price,
      url: `${siteConfig.url}/productos/${product.slug}`,
    }),
  );

  // Mensaje de stock: en vez de exponer el número exacto siempre (que
  // regala inventario real a mayoristas/competencia), solo se muestra la
  // cantidad cuando es escasa — ahí sí suma como señal de urgencia legítima.
  const stockStatus =
    product.stock <= 0
      ? { dotClassName: "bg-muted-foreground", label: "Sin stock" }
      : product.stock <= LOW_STOCK_THRESHOLD
        ? {
            dotClassName: "bg-primary",
            label: product.stock === 1 ? "¡Última unidad!" : `¡Últimas ${product.stock} unidades!`,
          }
        : { dotClassName: "bg-success", label: "En stock" };

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: product.category.name, href: `/productos?categoria=${product.category.slug}` },
    { label: product.name },
  ];

  return (
    <>
      {/* suppressHydrationWarning: los navegadores no reflejan el valor real
          del atributo nonce por seguridad (para que no se pueda leer desde
          el DOM/devtools) — React ve "" al hidratar aunque el server sí
          mandó el nonce real, y por diseño lo marca como mismatch. El
          script ya corrió validado por el navegador contra la CSP antes de
          que React llegue a compararlo, así que no hay nada roto acá. */}
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={jsonLdScriptProps(productJsonLd(product, reviewSummary))}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={jsonLdScriptProps(breadcrumbJsonLd(breadcrumbItems))}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <WindowPanel
        title="RETROID"
        bodyClassName="grid gap-8 p-6 lg:grid-cols-2 lg:gap-12 lg:items-start"
      >
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-8">
          <div className="space-y-3">
            <p className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {product.category.name}
              {product.brand ? ` · ${product.brand.name}` : ""}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
            {product.isLimitedEdition && (
              <div>
                <Badge variant="accent">Edición limitada</Badge>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="font-mono text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <p className="flex items-center gap-2 font-mono text-xs font-medium tracking-wide uppercase">
              <span
                className={`size-2 rounded-full ${stockStatus.dotClassName}`}
                aria-hidden="true"
              />
              {stockStatus.label}
            </p>
          </div>

          <div className="space-y-4">
            <WhatsAppButton
              url={whatsappUrl}
              label={
                <>
                  <MessageCircle className="size-5" />
                  Comprar por WhatsApp
                </>
              }
              event={{
                name: "whatsapp_click_detail",
                productId: product.id,
                productSlug: product.slug,
              }}
              size="lg"
              className="w-full text-base"
            />

            <ProductTrustStrip />
          </div>

          {product.description && (
            <p className="text-pretty leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>
      </WindowPanel>

      <div className="mt-12 sm:mt-16">
        <ReviewsSection
          title="Reseñas de este producto"
          summary={reviewSummary}
          reviews={reviews}
          productId={product.id}
        />
      </div>
    </>
  );
}
