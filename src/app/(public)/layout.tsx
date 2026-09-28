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
import { getActiveAnnouncement } from "@/services/announcements";
import { listCategories } from "@/services/categories";

function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={`font-mono text-base font-bold tracking-tight ${className ?? ""}`}>
      RETRO<span className="text-accent">ID</span>
    </Link>
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
            <Wordmark />
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
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-24">
            <div className="max-w-xs space-y-3">
              <Wordmark />
              <p className="text-sm text-muted-foreground">
                Nintendo DS, 3DS y accesorios seleccionados. Importados desde Japón.
              </p>
              {siteConfig.instagramUrl && (
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <InstagramIcon className="size-4" />
                </a>
              )}
            </div>

            <div className="space-y-3">
              <p className="font-mono text-xs font-semibold tracking-wide uppercase">Explorar</p>
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
          </div>

          <div className="mt-10 border-t border-border pt-6 font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.companyName}. Todos los derechos reservados.
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
