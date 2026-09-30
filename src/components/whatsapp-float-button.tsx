"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { WhatsAppButton } from "@/components/whatsapp-button";

// El detalle de producto ya tiene su propio CTA de WhatsApp grande y
// prominente ("Comprar por WhatsApp") a metros del primer viewport —
// duplicarlo acá solo tapa precio/stock sin sumar nada. En el resto del
// sitio (home, catálogo) sí aporta como acceso persistente al alcance del
// pulgar en mobile.
// Exportado: AnnouncementPopup lo usa para saber si esta esquina queda libre
// y puede bajar hasta el borde.
export const PRODUCT_DETAIL_PATTERN = /^\/productos\/[^/]+$/;

export function WhatsAppFloatButton({ url }: { url: string }) {
  const pathname = usePathname();
  if (PRODUCT_DETAIL_PATTERN.test(pathname)) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      <WhatsAppButton
        url={url}
        event={{ name: "whatsapp_click_float" }}
        aria-label="Consultar por WhatsApp"
        label={
          <>
            <MessageCircle className="size-5 shrink-0" />
            {/* Etiqueta que solo aparece en hover de escritorio (max-w-0 ->
                max-w-56, con margen sobre el ancho real del texto en mono
                mayúscula para que no se corte): no agrega texto permanente que compita con el CTA
                del header, pero da contexto la primera vez que alguien
                repara en el botón. hidden por debajo de sm: en mobile no
                hay hover que la revele, así que ni se monta expandible. */}
            <span className="hidden max-w-0 overflow-hidden font-mono text-xs font-medium tracking-wide uppercase whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 group-hover:max-w-56 group-hover:opacity-100 sm:inline-block">
              Consultar por WhatsApp
            </span>
          </>
        }
        className="group flex h-12 items-center gap-0 rounded-full border-transparent bg-[#25D366] px-3.5 text-white shadow-lg shadow-black/30 transition-[gap,background-color] duration-200 hover:gap-2 hover:bg-[#20bd5a] focus-visible:gap-2 active:scale-95"
      />
    </div>
  );
}
