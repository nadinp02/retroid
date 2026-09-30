import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Nombre de la marca en el estilo del logo (bloque black, itálico, ancho
 * expandido). Provisorio hasta tener el logo en SVG: cuando exista, se
 * reemplaza el texto por la imagen acá y cambia en todo el sitio.
 *
 * Recibe `name` por prop en vez de leer siteConfig porque también lo usa
 * AdminSidebar (Client Component), y siteConfig es server-only.
 *
 * Reglas de color del logo: blanco sobre fondo oscuro (default), negro
 * sobre amarillo, amarillo sobre oscuro como acento. Nunca blanco sobre
 * amarillo.
 */
export function Wordmark({
  name,
  href = "/",
  className,
}: {
  name: string;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-display text-lg leading-none font-black tracking-tight text-white uppercase italic font-stretch-expanded",
        className,
      )}
    >
      {name}
    </Link>
  );
}
