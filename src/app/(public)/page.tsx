import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import { getImageProps } from "next/image";
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
import { siteConfig } from "@/lib/site-config";

// Sin searchParams/params, Next.js pre-renderizaría esta página como
// estática en build time. Forzamos render dinámico para que siempre
// refleje el estado real de la base (productos/categorías administrados
// desde el backoffice), sin depender de revalidatePath en cada acción.
export const dynamic = "force-dynamic";

const HOME_TITLE = `${siteConfig.companyName} | Consolas Retro, Nintendo DS y 3DS Argentina`;
const HOME_DESCRIPTION =
  "Compra y venta de consolas retro, Nintendo DS, Nintendo 3DS, cartuchos, accesorios y estuches. Envíos a todo Argentina.";

export async function generateMetadata(): Promise<Metadata> {
  // openGraph/twitter no se heredan en profundidad del layout raíz: si esta
  // página define los suyos, tiene que repetir la imagen o la pierde.
  const ogImage = {
    url: "/banner.jpg",
    width: 1916,
    height: 821,
    alt: `${siteConfig.companyName} — consolas retro Nintendo DS y 3DS`,
  };

  return {
    // title.absolute: esta es la página más importante a rankear — usa el
    // mismo copy que el default del layout raíz, pero sin pasar por el
    // template "%s | <marca>" (si no, quedaría duplicado "... | RETAKE | RETAKE").
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

// Hero con art direction vía <picture>: <Image> solo admite una fuente, así
// que se usa getImageProps (misma optimización de Next) para armar el
// srcSet de cada versión. La mobile va como <img> por defecto y la desktop
// como <source> con media query.
const HERO_ALT = "Mano esquelética sosteniendo una Nintendo 3DS";
const {
  props: { srcSet: heroDesktopSrcSet },
} = getImageProps({
  src: "/banner.jpg",
  alt: HERO_ALT,
  fill: true,
  sizes: "100vw",
  priority: true,
});
const { props: heroImgProps } = getImageProps({
  src: "/banner-mobile.jpg",
  alt: HERO_ALT,
  fill: true,
  sizes: "100vw",
  priority: true,
});

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
        dangerouslySetInnerHTML={jsonLdScriptProps(organizationJsonLd())}
      />

      {/* Hero: una sola imagen de fondo (sin carousel), full-bleed. El
          -mt-10/-mt-14 cancela el padding-top de <main> para que quede
          pegado al announcement bar, tal como en la referencia. */}
      {/* Mobile: sin alto fijo — el hero mide lo que el texto + un margen
          parejo (py-20), así no queda aire muerto arriba y abajo. Desde sm
          vuelve al alto relativo a la pantalla. */}
      <section className="full-bleed relative -mt-10 overflow-hidden bg-black py-20 sm:-mt-14 sm:h-[82svh] sm:min-h-[620px] sm:py-0 lg:h-[88svh] lg:min-h-[680px] lg:max-h-[820px]">
        {/* Art direction: una ilustración horizontal para desktop y otra
            vertical para mobile (ver HERO_IMAGES), cada una compuesta con
            su propia zona libre para el texto. */}
        <picture>
          <source media="(min-width: 768px)" srcSet={heroDesktopSrcSet} />
          <img
            {...heroImgProps}
            alt={HERO_ALT}
            // Mobile: fondo puro detrás del texto centrado — anclada al 65%
            // vertical para que lo que asome sea la DS y no el negro vacío
            // de arriba. Desktop: cover anclado a la derecha (la
            // horizontal está compuesta a ~2.33:1, la proporción del hero en
            // un monitor común, así que tampoco recorta casi nada). Solo en
            // pantallas ultra anchas pasa a contain: ahí cover cortaría la
            // mano arriba, y el sobrante de la izquierda queda negro bajo la
            // sombra lateral.
            className="object-cover object-[50%_65%] md:object-right min-[2100px]:object-contain"
          />
        </picture>
        {/* Velo parejo sobre toda la ilustración (sin degradé lateral): la
            imagen es fondo, no protagonista — el texto y los CTAs mandan.
            El degradé inferior solo funde el borde con la franja de
            beneficios. */}
        {/* En mobile el texto queda encima de la DS: velo un poco más
            fuerte para que la ilustración sea solo clima. */}
        <div className="absolute inset-0 bg-black/70 md:bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent via-30% to-transparent" />

        {/* Centrado verticalmente en todos los tamaños: la ilustración es
            fondo, el texto va encima (en mobile, con los CTAs en una fila). */}
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center gap-4 px-4 sm:gap-5 sm:px-6">
          <p className="font-mono text-[10px] tracking-[0.12em] text-primary uppercase sm:text-xs sm:tracking-[0.2em]">
            Nintendo DS // 3DS // Importadas desde Japón
          </p>
          {/* Mayúscula + itálica + ancho semi-expandido: mismo lenguaje que
              el logo. */}
          <h1 className="max-w-3xl text-balance font-display text-4xl leading-[0.95] font-black tracking-tight text-white uppercase italic font-stretch-semi-expanded sm:text-5xl lg:text-6xl">
            Historias que siguen <GlitchText>en juego</GlitchText>.
          </h1>
          <p className="max-w-lg text-balance text-white/80 sm:text-lg lg:text-xl">
            Nintendo DS, 3DS, accesorios y ediciones difíciles de conseguir, seleccionadas una por
            una.
          </p>
          {/* h-11 en vez del size="lg" del sistema (h-9): son la acción
              principal de la página y tienen que pesar más que la etiqueta. */}
          <div className="flex gap-3 pt-1 sm:pt-2">
            <Button
              size="lg"
              className="h-11 flex-1 px-5 text-sm sm:flex-none"
              render={<Link href="/productos">Ver catálogo</Link>}
            />
            <WhatsAppButton
              url={whatsappUrl}
              label={
                <>
                  <MessageCircle className="size-4" />
                  <span className="sm:hidden">WhatsApp</span>
                  <span className="hidden sm:inline">Consultar por WhatsApp</span>
                </>
              }
              event={{ name: "whatsapp_click_general" }}
              variant="outline"
              size="lg"
              className="h-11 flex-1 border-white/30 bg-black/30 px-5 text-sm text-white backdrop-blur-sm hover:border-primary hover:bg-black/50 hover:text-white sm:flex-none"
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
