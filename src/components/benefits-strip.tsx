import { Headset, Sparkles, Truck } from "lucide-react";

export const BENEFITS = [
  {
    icon: Truck,
    title: "Envíos a todo el país",
    text: "Recibí tu compra estés donde estés.",
  },
  {
    icon: Sparkles,
    title: "Productos únicos",
    text: "Elegimos cada pieza por su estado, calidad y rareza.",
  },
  {
    icon: Headset,
    title: "Soporte real, no solo venta",
    text: "¿Dudas con juegos, configuración o instalación? Te acompañamos después de la compra.",
  },
] as const;

// Franja de beneficios debajo del hero. Server Component estático — sin
// cards tradicionales, solo separadores sutiles (borde) entre columnas.
export function BenefitsStrip() {
  return (
    <section className="full-bleed border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4 px-6 py-7 sm:px-8">
            <Icon className="mt-0.5 size-6 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="font-mono text-xs font-semibold tracking-wide uppercase">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
