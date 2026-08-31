"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import type { Category } from "@/types/catalog";

export function MobileNav({
  categories,
}: {
  categories: Pick<Category, "id" | "name" | "slug">[];
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="flex size-8 items-center justify-center text-foreground transition-colors hover:text-accent"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-12 z-40 flex flex-col border-b border-border bg-[#0d0d0f] px-4 py-3 font-mono text-sm font-medium tracking-wide text-muted-foreground uppercase">
          <Link
            href="/"
            onClick={close}
            className="border-b border-border/60 py-3 transition-colors hover:text-accent"
          >
            Inicio
          </Link>

          {/* <details> nativo: expande las categorías al tocar sin JS extra. */}
          <details className="group border-b border-border/60 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between transition-colors group-open:text-accent hover:text-accent [&::-webkit-details-marker]:hidden">
              Productos
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-2 flex flex-col gap-1 border-l border-border/60 pl-3 text-xs">
              <Link
                href="/productos"
                onClick={close}
                className="py-1.5 transition-colors hover:text-accent"
              >
                Ver todo
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/productos?categoria=${category.slug}`}
                  onClick={close}
                  className="py-1.5 transition-colors hover:text-accent"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </details>
        </nav>
      )}
    </div>
  );
}
