import type { ReactNode } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, buildGeneralWhatsAppMessage } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site-config";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button";
import { AnnouncementPopup } from "@/components/announcement-popup";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { MobileNav } from "@/components/mobile-nav";
import { ProductsNavMenu } from "@/components/products-nav-menu";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { Wordmark } from "@/components/wordmark";
import { getActiveAnnouncement } from "@/services/announcements";
import { listCategories } from "@/services/categories";

// Encabezado de columna del footer: numeración estilo menú de juego
// ("01 Explorar") en color de acento, en línea con la estética retro.
function FooterHeading({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="flex items-baseline gap-2 font-mono text-xs font-semibold tracking-wide uppercase">
      <span className="text-accent">{index}</span>
      {children}
    </p>
  );
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const generalWhatsAppUrl = buildWhatsAppUrl(buildGeneralWhatsAppMessage());
  const generalEvent = { name: "whatsapp_click_general" as const };
  const [announcement, categories] = await Promise.all([
    getActiveAnnouncement(),
    listCategories({ isActive: true }),
  ]);

  return (
    // overflow-x-hidden: red de seguridad para las secciones full-bleed de
    // la Home (100vw puede superar el viewport visible por el ancho del
    // scrollbar) — evita que aparezca scroll horizontal.
    <div className="flex min-h-full flex-1 flex-col overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-border bg-[#0d0d0f]/95">
        <div className="relative mx-auto grid h-12 max-w-7xl grid-cols-3 items-center px-4 sm:px-6">
          <div className="flex items-center justify-self-start">
            <MobileNav categories={categories} />
            <nav className="hidden items-center gap-6 font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase sm:flex">
              <Link href="/" className="group transition-colors hover:text-accent">
                <span className="opacity-0 transition-opacity group-hover:opacity-100">&gt;</span>{" "}
                Inicio
              </Link>
              <ProductsNavMenu categories={categories} />
            </nav>
          </div>

          <div className="justify-self-center">
            <Wordmark name={siteConfig.companyName} />
          </div>

          <div className="justify-self-end">
            <WhatsAppButton
              url={generalWhatsAppUrl}
              label={
                <>
                  <MessageCircle className="size-4" />
                  <span className="hidden sm:inline">Consultar por WhatsApp</span>
                  <span className="sm:hidden">Consultar</span>
                </>
              }
              event={generalEvent}
              size="sm"
            />
          </div>
        </div>
      </header>

      <AnnouncementMarquee />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>

      <footer className="border-t border-border bg-[#0d0d0f]/60">
        {/* pb-20: deja lugar debajo del último renglón para que
            WhatsAppFloatButton (fixed, misma esquina) no lo tape al llegar
            al final de la página. */}
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6">
          {/* Grilla fija en vez de flex-wrap: la marca ocupa el doble y las
              tres columnas de links se reparten parejo el resto del ancho,
              así no queda un hueco vacío a la derecha en pantallas anchas. */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-x-12">
            <div className="col-span-2 max-w-xs space-y-3 lg:col-span-1">
              <Wordmark name={siteConfig.companyName} className="text-xl" />
              <p className="text-sm text-muted-foreground">
                Nintendo DS, 3DS y accesorios seleccionados. Importados desde Japón.
              </p>
            </div>

            <div className="space-y-3">
              <FooterHeading index="01">Explorar</FooterHeading>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="transition-colors hover:text-accent">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/productos" className="transition-colors hover:text-accent">
                    Productos
                  </Link>
                </li>
              </ul>
            </div>

            {categories.length > 0 && (
              <div className="space-y-3">
                <FooterHeading index="02">Categorías</FooterHeading>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/productos?categoria=${category.slug}`}
                        className="transition-colors hover:text-accent"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <FooterHeading index={categories.length > 0 ? "03" : "02"}>Contacto</FooterHeading>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href={generalWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 transition-colors hover:text-accent"
                  >
                    <MessageCircle className="size-3.5" />
                    WhatsApp
                  </a>
                </li>
                {siteConfig.instagramUrl && (
                  <li>
                    <a
                      href={siteConfig.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 transition-colors hover:text-accent"
                    >
                      <InstagramIcon className="size-3.5" />
                      Instagram
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} {siteConfig.companyName}. Todos los derechos reservados.
            </span>
            <a
              href="#"
              className="group self-start transition-colors hover:text-accent sm:self-auto"
            >
              Volver arriba{" "}
              <span className="inline-block transition-transform group-hover:-translate-y-0.5">
                ↑
              </span>
            </a>
          </div>
        </div>
      </footer>

      {announcement && (
        <AnnouncementPopup
          announcement={{
            id: announcement.id,
            title: announcement.title,
            description: announcement.description,
            buttonText: announcement.buttonText,
            url: announcement.url,
            // getAnnouncement() pasa por unstable_cache: el valor cacheado
            // se serializa, así que updatedAt puede llegar como string en
            // vez de Date. new Date(...) normaliza ambos casos.
            version: new Date(announcement.updatedAt).toISOString(),
          }}
        />
      )}

      <WhatsAppFloatButton url={generalWhatsAppUrl} />
    </div>
  );
}
