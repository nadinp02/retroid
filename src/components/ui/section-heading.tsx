import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

// "mono": estilo terminal/DedSec original (todo el sitio hoy).
// "display": bloque itálico estilo logo (font-display / Archivo) —
// reservado para títulos importantes de la Home, no cambia ningún uso
// existente porque el default sigue siendo "mono".
const FONT_VARIANTS = {
  mono: "font-mono uppercase",
  display: "font-display font-black italic uppercase font-stretch-semi-expanded",
} as const;

export function SectionHeading({
  children,
  as: Tag = "h1",
  size = "md",
  variant = "mono",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  size?: keyof typeof SIZES;
  variant?: keyof typeof FONT_VARIANTS;
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "flex items-center gap-3 font-bold tracking-tight",
        SIZES[size],
        FONT_VARIANTS[variant],
        className,
      )}
    >
      <span aria-hidden className="h-[0.8em] w-1 shrink-0 bg-primary" />
      <span>
        {children} <span className="font-mono text-accent"></span>
      </span>
    </Tag>
  );
}
