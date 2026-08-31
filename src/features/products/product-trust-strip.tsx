import { BENEFITS } from "@/components/benefits-strip";

// Versión compacta de BENEFITS (mismo contenido que la franja de la Home,
// ver benefits-strip.tsx) para reforzar confianza debajo del CTA de
// WhatsApp en el detalle de producto — solo ícono + título, sin el texto
// descriptivo largo.
export function ProductTrustStrip() {
  return (
    <ul className="grid grid-cols-1 divide-y divide-border border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {BENEFITS.map(({ icon: Icon, title }) => (
        <li key={title} className="flex items-center gap-2.5 px-3 py-2.5">
          <Icon className="size-4 shrink-0 text-primary" />
          <span className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </span>
        </li>
      ))}
    </ul>
  );
}
