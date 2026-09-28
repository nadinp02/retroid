"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WindowPanel } from "@/components/ui/window-panel";
import { Button } from "@/components/ui/button";

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
    // bottom-24: deja lugar debajo para el botón flotante de WhatsApp
    // (WhatsAppFloatButton, fixed en la misma esquina) sin que se pisen.
    <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-3 bottom-24 z-50 w-[calc(100vw-1.5rem)] max-w-64 duration-300 sm:right-4 sm:bottom-28">
      <WindowPanel
        title={announcement.title}
        bodyClassName="space-y-2 p-3"
        actions={
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        }
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
