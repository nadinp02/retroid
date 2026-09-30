import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Clases compartidas por los 3 cuadraditos de la barra (incluido el botón
// de cerrar), para que midan siempre exactamente lo mismo.
const CHROME_SQUARE = "block size-2.5 shrink-0 border border-border";

/**
 * Envoltorio visual que simula una ventana de software (chrome estilo
 * Windows 95 / DedSec). Los "botones" de la barra son decorativos
 * (aria-hidden, sin onClick), salvo que se pase `onClose`: entonces el
 * último cuadradito (el amarillo) se convierte en el botón de cerrar real,
 * como el "X" de una ventana de verdad.
 */
export function WindowPanel({
  title,
  icon,
  actions,
  onClose,
  closeLabel = "Cerrar",
  className,
  bodyClassName,
  children,
}: {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("border border-border bg-card", className)}>
      <div className="flex h-8 items-center justify-between gap-2 border-b border-border bg-[#0d0d0f] px-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <div className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn(CHROME_SQUARE, "bg-secondary")} />
            <span aria-hidden="true" className={cn(CHROME_SQUARE, "bg-foreground")} />
            {onClose ? (
              // Exactamente el mismo cuadrado que los decorativos. La X va
              // posicionada en absoluto (no participa del layout, así no
              // puede alterar el tamaño) y el ::before amplía el área
              // clickeable sin agrandarlo a la vista (10px es muy chico
              // para un dedo).
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className={cn(
                  CHROME_SQUARE,
                  "relative bg-primary p-0 text-primary-foreground transition-colors before:absolute before:-inset-2 hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                )}
              >
                <X
                  className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
                  strokeWidth={4}
                />
              </button>
            ) : (
              <span aria-hidden="true" className={cn(CHROME_SQUARE, "bg-primary")} />
            )}
          </div>
        </div>
      </div>
      <div className={cn(bodyClassName)}>{children}</div>
    </div>
  );
}
