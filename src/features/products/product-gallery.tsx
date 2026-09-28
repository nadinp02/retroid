"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/types/catalog";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const selected = images[selectedIndex];
  const hasMultiple = images.length > 1;

  function show(index: number) {
    setSelectedIndex((index + images.length) % images.length);
  }

  // Bloquea el scroll de fondo mientras el lightbox está abierto y permite
  // cerrarlo/navegar con teclado — el resto de la galería sigue siendo
  // simple (sin librería de carousel).
  useEffect(() => {
    if (!zoomed) return;

    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setZoomed(false);
      if (event.key === "ArrowRight") show(selectedIndex + 1);
      if (event.key === "ArrowLeft") show(selectedIndex - 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed, selectedIndex]);

  if (!selected) {
    return (
      <div className="flex aspect-square items-center justify-center border border-border bg-muted text-muted-foreground">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group/main relative aspect-square overflow-hidden border border-border bg-muted">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="Ampliar imagen"
          className="absolute inset-0 cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Image
            key={selected.id}
            src={selected.url}
            alt={selected.alt ?? productName}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
            className="animate-in fade-in object-contain p-4 duration-200 sm:p-6"
          />
        </button>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-3 bottom-3 flex size-8 items-center justify-center border border-border bg-[#0d0d0f]/80 text-muted-foreground opacity-0 transition-opacity group-hover/main:opacity-100"
        >
          <ZoomIn className="size-4" />
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => show(selectedIndex - 1)}
              aria-label="Imagen anterior"
              className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-[#0d0d0f]/80 text-foreground opacity-0 transition-opacity hover:border-accent group-hover/main:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => show(selectedIndex + 1)}
              aria-label="Imagen siguiente"
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-[#0d0d0f]/80 text-foreground opacity-0 transition-opacity hover:border-accent group-hover/main:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => show(index)}
              aria-label={`Ver imagen ${index + 1} de ${images.length}`}
              aria-current={index === selectedIndex}
              className={`relative aspect-square overflow-hidden border bg-muted outline-none transition-colors ${
                index === selectedIndex
                  ? "border-accent"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${productName} miniatura ${index + 1}`}
                fill
                sizes="120px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} — imagen ampliada`}
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/95 duration-150"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 flex size-9 items-center justify-center border border-border/60 text-white/80 transition-colors hover:border-accent hover:text-white"
          >
            <X className="size-5" />
          </button>

          <div className="relative h-[85vh] w-[92vw] sm:w-[85vw]">
            <Image
              key={selected.id}
              src={selected.url}
              alt={selected.alt ?? productName}
              fill
              sizes="100vw"
              className="animate-in fade-in object-contain duration-150"
              onClick={(event) => event.stopPropagation()}
            />
          </div>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  show(selectedIndex - 1);
                }}
                aria-label="Imagen anterior"
                className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center border border-border/60 text-white/80 transition-colors hover:border-accent hover:text-white sm:left-6"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  show(selectedIndex + 1);
                }}
                aria-label="Imagen siguiente"
                className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center border border-border/60 text-white/80 transition-colors hover:border-accent hover:text-white sm:right-6"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
