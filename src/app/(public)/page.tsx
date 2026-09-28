import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { Cable, Briefcase, Gamepad2, Layers, MessageCircle, Package } from "lucide-react";
import { listPublicProducts, listProductOptions } from "@/services/products";
import { listCategories } from "@/services/categories";
import { listApprovedReviews, getReviewSummary } from "@/services/reviews";
import { ProductGrid } from "@/features/products/product-grid";
import { ReviewsSection } from "@/features/reviews/reviews-section";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { GlitchText } from "@/components/glitch-text";
import { BenefitsStrip } from "@/components/benefits-strip";
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from "@/lib/whatsapp";
import { organizationJsonLd, jsonLdScriptProps } from "@/lib/structured-data";
import { getNonce } from "@/lib/nonce";

// Sin searchParams/params, Next.js pre-renderizaría esta página como
// estática en build time. Forzamos render dinámico para que siempre
// refleje el estado real de la base (productos/categorías administrados
// desde el backoffice), sin depender de revalidatePath en cada acción.
export const dynamic = "force-dynamic";

const HOME_TITLE = "RETROID | Consolas Retro, Nintendo DS y 3DS Argentina";
const HOME_DESCRIPTION =
  "Compra y venta de consolas retro, Nintendo DS, Nintendo 3DS, cartuchos, accesorios y estuches. Envíos a todo Argentina.";

export async function generateMetadata(): Promise<Metadata> {
  // openGraph/twitter no se heredan en profundidad del layout raíz: si esta
  // página define los suyos, tiene que repetir la imagen o la pierde.
  const ogImage = {
    url: "/banner.jpg",
    width: 1279,
    height: 929,
    alt: "RETROID — consolas retro Nintendo DS y 3DS",
  };

  return {
    // title.absolute: esta es la página más importante a rankear — usa el
    // mismo copy que el default del layout raíz, pero sin pasar por el
    // template "%s | RETROID" (si no, quedaría duplicado "... | RETROID | RETROID").
    title: { absolute: HOME_TITLE },
    description: HOME_DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [ogImage.url],
    },
  };
}

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  consolas: Gamepad2,
  cartuchos: Layers,
  accesorios: Cable,
  estuches: Briefcase,
};

export default async function HomePage() {
  const [
    { products: featured },
    { products: limitedEditions },
    categories,
    reviewSummary,
    reviews,
    productOptions,
    nonce,
  ] = await Promise.all([
    listPublicProducts({ pageSize: 4 }),
    listPublicProducts({ pageSize: 4, isLimitedEdition: true }),
    listCategories({ isActive: true }),
    getReviewSummary(),
    listApprovedReviews({ pageSize: 6 }),
    listProductOptions(),
    getNonce(),
  ]);

  const whatsappUrl = buildWhatsAppUrl(buildGeneralWhatsAppMessage());

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={jsonLdScriptProps(organizationJsonLd())}
      />

      {/* Hero: una sola imagen de fondo (sin carousel), full-bleed. El
          -mt-10/-mt-14 cancela el padding-top de <main> para que quede
          pegado al announcement bar, tal como en la referencia. */}
      <section className="full-bleed relative -mt-10 h-[78svh] min-h-[540px] overflow-hidden sm:-mt-14 sm:h-[82svh] sm:min-h-[620px] lg:h-[88svh] lg:min-h-[680px] lg:max-h-[820px]">
        <Image
          src="/banner.jpg"
          alt="Mano esquelética sosteniendo una Nintendo 3DS"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Overlay oscuro/degradado: garantiza legibilidad del texto sin
            depender de en qué parte de la imagen recorte cada viewport. */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center gap-5 px-4 sm:px-6">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Nintendo DS // 3DS // Importadas desde Japón
          </p>
          <h1 className="max-w-2xl text-balance font-display text-4xl leading-[1.05] font-black text-white sm:text-6xl lg:text-7xl">
            Historias que siguen <GlitchText>en juego</GlitchText>.
          </h1>
          <p className="max-w-md text-balance text-base text-white/80 sm:text-lg">
            Nintendo DS, 3DS, accesorios y ediciones difíciles de conseguir, seleccionadas una por
            una.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button size="lg" render={<Link href="/productos">Ver catálogo</Link>} />
            <WhatsAppButton
              url={whatsappUrl}
              label={
                <>
                  <MessageCircle className="size-4" />
                  Consultar por WhatsApp
                </>
              }
              event={{ name: "whatsapp_click_general" }}
              variant="outline"
              size="lg"
              className="border-white/30 bg-black/30 text-white backdrop-blur-sm hover:border-primary hover:bg-black/50 hover:text-white"
            />
          </div>
        </div>
      </section>

      <BenefitsStrip />

      <div className="space-y-24 pt-16 sm:space-y-32 sm:pt-20">
        {categories.length > 0 && (
          <section className="space-y-6">
            <div className="space-y-1">
              <SectionHeading as="h2" size="md" variant="display">
                Categorías
              </SectionHeading>
              <p className="text-sm text-muted-foreground">
                Encontrá lo que buscás por tipo de producto.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.slug] ?? Package;
                return (
                  <Link
                    key={category.id}
                    href={`/productos?categoria=${category.slug}`}
                    className="group flex flex-col items-start gap-4 border border-border bg-card p-6 transition-colors hover:border-primary"
                  >
                    <div className="flex size-11 items-center justify-center border border-primary/40 bg-primary/10 text-primary transition-colors group-hover:border-primary/70 group-hover:bg-primary/20">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-sm font-medium tracking-wide uppercase">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <SectionHeading as="h2" size="md" variant="display">
                  Últimos ingresos
                </SectionHeading>
                <p className="text-sm text-muted-foreground">
                  Lo más nuevo que sumamos al catálogo.
                </p>
              </div>
              <Link
                href="/productos"
                className="hidden font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-accent sm:block"
              >
                Ver todo →
              </Link>
            </div>
            <ProductGrid products={featured} />
          </section>
        )}

        {limitedEditions.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <SectionHeading as="h2" size="md" variant="display">
                  Ediciones limitadas
                </SectionHeading>
                <p className="text-sm text-muted-foreground">
                  Piezas únicas, disponibles solo mientras dure el stock.
                </p>
              </div>
              <Link
                href="/productos"
                className="hidden font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-accent sm:block"
              >
                Ver todo →
              </Link>
            </div>
            <ProductGrid products={limitedEditions} />
          </section>
        )}

        <ReviewsSection
          title="Reseñas"
          description="Experiencias reales"
          headingVariant="display"
          summary={reviewSummary}
          reviews={reviews}
          products={productOptions}
        />
      </div>
    </>
  );
}
