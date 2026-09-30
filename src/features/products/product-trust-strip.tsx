import { getBenefitIcon } from "@/lib/benefit-icons";
import { listActiveBenefits } from "@/services/benefits";

// Versión compacta de los beneficios (mismo contenido que la franja de la
// Home, ver benefits-strip.tsx) para reforzar confianza debajo del CTA de
// WhatsApp en el detalle de producto — solo ícono + título, sin el texto
// descriptivo largo. Como mucho 3: en esta columna angosta más de eso no
// entra en una fila.
export async function ProductTrustStrip() {
  const benefits = (await listActiveBenefits()).slice(0, 3);
  if (benefits.length === 0) return null;

  return (
    <ul
      className={`grid grid-cols-1 divide-y divide-border border border-border sm:divide-x sm:divide-y-0 ${
        benefits.length === 1 ? "" : benefits.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
      }`}
    >
      {benefits.map(({ id, icon, title }) => {
        const Icon = getBenefitIcon(icon);
        return (
          <li key={id} className="flex items-center gap-2.5 px-3 py-2.5">
            <Icon className="size-4 shrink-0 text-primary" />
            <span className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {title}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
