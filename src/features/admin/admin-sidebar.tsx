"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Megaphone,
  Package,
  Star,
  Tag,
  Tags,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/administracion", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/administracion/productos", label: "Productos", icon: Package, exact: false },
  { href: "/administracion/categorias", label: "Categorías", icon: Tags, exact: false },
  { href: "/administracion/marcas", label: "Marcas", icon: Tag, exact: false },
  { href: "/administracion/resenas", label: "Reseñas", icon: Star, exact: false },
  { href: "/administracion/usuarios", label: "Usuarios", icon: Users, exact: false },
  { href: "/administracion/anuncio", label: "Anuncio", icon: Megaphone, exact: false },
  { href: "/administracion/marquee", label: "Barra promo", icon: ListOrdered, exact: false },
] as const;

export function AdminSidebar({
  userEmail,
  signOutAction,
}: {
  userEmail: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* Sidebar fija — desktop/tablet */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <Link
            href="/administracion"
            className="font-mono text-base font-bold tracking-tight text-sidebar-foreground"
          >
            RETRO<span className="text-primary">ID</span>
          </Link>
        </div>
        <div className="border-b border-sidebar-border px-4 py-2 font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase">
          Retroid Admin v1.0
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 border-l-2 px-3 py-2 font-mono text-xs font-medium tracking-wide uppercase transition-colors ${
                isActive(href, exact)
                  ? "border-primary bg-primary/10 text-sidebar-foreground"
                  : "border-transparent text-muted-foreground hover:border-accent/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-sidebar-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-accent"
          >
            <ArrowLeft className="size-3.5" />
            Volver al sitio
          </Link>
          <p className="truncate font-mono text-xs text-muted-foreground">{userEmail}</p>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm" className="w-full gap-2">
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Barra superior — mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-[#0d0d0f]/95 px-3 py-2 md:hidden">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[0.65rem] font-medium tracking-wide uppercase transition-colors ${
                isActive(href, exact)
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Volver al sitio"
            render={
              <Link href="/">
                <ArrowLeft className="size-4" />
              </Link>
            }
          />
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="icon-sm" aria-label="Cerrar sesión">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
