"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WindowPanel } from "@/components/ui/window-panel";
import { Button } from "@/components/ui/button";
import { PRODUCT_DETAIL_PATTERN } from "@/components/whatsapp-float-button";

const SHOW_AFTER_MS = 3000;

export type AnnouncementPopupData = {
  id: string;
  title: string;
  description: string | null;
  buttonText: string | null;
  url: string | null;
  // Clave de versión (updatedAt serializado): al cambiar, el popup vuelve
  // a aparecer aunque el usuario ya hubiera cerrado una versión anterior.
  version: string;
};

function dismissKey(announcement: AnnouncementPopupData) {
  return `retroid-announcement-dismissed-${announcement.id}-${announcement.version}`;
}

export function AnnouncementPopup({
  announcement,
}: {
  announcement: AnnouncementPopupData | null;
}) {
  const [visible, setVisible] = useState(false);
  const hasFloatButton = !PRODUCT_DETAIL_PATTERN.test(usePathname());

  useEffect(() => {
    if (!announcement) return;
    if (window.localStorage.getItem(dismissKey(announcement)) === "1") return;

    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [announcement]);

  if (!announcement || !visible) return null;

  function handleClose() {
    if (announcement) window.localStorage.setItem(dismissKey(announcement), "1");
    setVisible(false);
  }

  return (
    // Por defecto deja lugar debajo para el botón flotante de WhatsApp
    // (WhatsAppFloatButton, fixed en la misma esquina) sin que se pisen. En
    // el detalle de producto ese botón no se muestra, así que el cartel baja
    // a la esquina (misma distancia al borde que tendría el botón).
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 fixed right-4 z-50 w-[calc(100vw-2rem)] max-w-64 duration-300 sm:right-6 ${
        hasFloatButton ? "bottom-20 sm:bottom-24" : "bottom-4 sm:bottom-6"
      }`}
    >
      <WindowPanel
        title={announcement.title}
        bodyClassName="space-y-2 p-3"
        onClose={handleClose}
        closeLabel="Cerrar anuncio"
      >
        {announcement.description && (
          <p className="text-xs text-muted-foreground">{announcement.description}</p>
        )}
        {announcement.url && (
          <Button
            size="xs"
            className="w-full"
            render={
              <a href={announcement.url} target="_blank" rel="noopener noreferrer">
                {announcement.buttonText || "Ver más"}
              </a>
            }
          />
        )}
      </WindowPanel>
    </div>
  );
}
