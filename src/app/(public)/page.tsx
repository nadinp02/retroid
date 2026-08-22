import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { Cable, Briefcase, Gamepad2, Layers, MessageCircle, Package } from "lucide-react";
import { listPublicProducts } from "@/services/products";
import { listCategories } from "@/services/categories";
import { ProductGrid } from "@/features/products/product-grid";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { GlitchText } from "@/components/glitch-text";
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from "@/lib/whatsapp";
import { organizationJsonLd, jsonLdScriptProps } from "@/lib/structured-data";

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
    url: "/banner.png",
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
  const [{ products: featured }, categories] = await Promise.all([
    listPublicProducts({ pageSize: 4 }),
    listCategories({ isActive: true }),
  ]);

  const whatsappUrl = buildWhatsAppUrl(buildGeneralWhatsAppMessage());

  return (
    <div className="space-y-24 sm:space-y-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScriptProps(organizationJsonLd())}
      />
      {/* Hero: portada de software, no landing genérica */}
      <section className="grid items-center gap-10 py-8 sm:py-12 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col items-start gap-6 text-left">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
            Nintendo DS // 3DS // Importadas desde Japón
          </p>
          <h1 className="text-glitch max-w-xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Consolas <GlitchText>Retro.</GlitchText> Historias que siguen vivas.
          </h1>
          <p className="max-w-md text-balance text-muted-foreground">
            Nintendo DS, 3DS y más. Importadas desde Japón. Seleccionadas para vos.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
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
            />
          </div>
        </div>

        <div className="animate-float relative mx-auto aspect-[16/10] w-full max-w-lg lg:max-w-none">
          <Image
            src="/banner.png"
            alt="Mano esquelética sosteniendo una Nintendo 3DS"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-contain"
          />
        </div>
      </section>

      {categories.length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <SectionHeading as="h2" size="sm" glitch>
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
                  className="group flex flex-col items-start gap-4 border border-border bg-card p-6 transition-colors hover:border-accent"
                >
                  <div className="flex size-11 items-center justify-center border border-accent/40 bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
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
              <SectionHeading as="h2" size="sm" glitch>
                Destacados
              </SectionHeading>
              <p className="text-sm text-muted-foreground">Una selección de nuestro catálogo.</p>
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
    </div>
  );
}
