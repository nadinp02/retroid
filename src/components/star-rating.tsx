import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = { sm: "size-3.5", md: "size-4", lg: "size-6" } as const;

/**
 * Estrellas de solo lectura. Soporta valores fraccionarios (ej. promedios
 * como 4.3): cada estrella calcula su propio porcentaje de relleno (0, 100,
 * o algo intermedio) y lo recorta con un overlay del mismo tamaño exacto —
 * a diferencia de recortar la fila completa por ancho, esto no depende de
 * que los gaps entre estrellas encajen justo en el punto de corte.
 */
export function StarRating({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      role="img"
      aria-label={`${clamped.toFixed(1)} de 5 estrellas`}
      className={cn("inline-flex shrink-0 gap-0.5", className)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fillPercent = Math.max(0, Math.min(1, clamped - i)) * 100;
        return (
          <span key={i} className="relative inline-flex shrink-0" aria-hidden="true">
            <Star className={cn(sizeClass, "shrink-0 fill-current text-muted-foreground/30")} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
              <Star className={cn(sizeClass, "shrink-0 fill-current text-primary")} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
