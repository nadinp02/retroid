import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = { sm: "size-3.5", md: "size-4", lg: "size-6" } as const;

/**
 * Estrellas de solo lectura. Soporta valores fraccionarios (ej. promedios
 * como 4.3) recortando una segunda fila de estrellas llenas por porcentaje
 * sobre una fila base gris — no hace falta media-estrella como asset aparte.
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
  const percent = (clamped / 5) * 100;
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      role="img"
      aria-label={`${clamped.toFixed(1)} de 5 estrellas`}
      className={cn("relative inline-flex shrink-0", className)}
    >
      <div className="flex gap-0.5 text-muted-foreground/30" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn(sizeClass, "fill-current")} />
        ))}
      </div>
      <div
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-primary"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn(sizeClass, "fill-current")} />
        ))}
      </div>
    </div>
  );
}
