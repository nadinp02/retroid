import { getBenefitIcon } from "@/lib/benefit-icons";
import { listActiveBenefits } from "@/services/benefits";

// Clases estáticas (Tailwind no detecta nombres armados en runtime): con 4
// o más beneficios pasa a 2 columnas en tablet y 4 en desktop para que los
// textos no queden apretados.
const GRID_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2 sm:divide-x sm:divide-y-0",
  3: "sm:grid-cols-3 sm:divide-x sm:divide-y-0",
};
const GRID_COLS_MANY = "sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0";

// Franja de beneficios debajo del hero. Server Component — lee los
// beneficios activos de la base (configurables desde
// /administracion/beneficios). Sin cards tradicionales, solo separadores
// sutiles (borde) entre columnas.
export async function BenefitsStrip() {
  const benefits = await listActiveBenefits();
  if (benefits.length === 0) return null;

  return (
    <section className="full-bleed border-b border-border bg-card">
      <div
        className={`mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border ${GRID_COLS[benefits.length] ?? GRID_COLS_MANY}`}
      >
        {benefits.map(({ id, icon, title, text }) => {
          const Icon = getBenefitIcon(icon);
          return (
            <div key={id} className="flex items-start gap-4 px-6 py-7 sm:px-8">
              <Icon className="mt-0.5 size-6 shrink-0 text-primary" />
              <div className="space-y-1">
                <p className="font-mono text-xs font-semibold tracking-wide uppercase">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
