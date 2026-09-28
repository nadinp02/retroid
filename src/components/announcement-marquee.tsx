// Barra promocional debajo del navbar. Server Component: la animación es
// 100% CSS (.animate-marquee en globals.css), pero ahora necesita leer las
// frases de la base (configurables desde /administracion/marquee) en vez
// de un array hardcodeado.
import { listActiveMarqueeItems } from "@/services/marquee";

function MarqueeGroup({ items }: { items: { id: string; text: string }[] }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((item) => (
        <span key={item.id} className="flex items-center whitespace-nowrap px-4 sm:px-6">
          {item.text}
          <span className="ml-4 text-black/30 sm:ml-6">✦</span>
        </span>
      ))}
    </div>
  );
}

export async function AnnouncementMarquee() {
  const items = await listActiveMarqueeItems();

  // Sin frases activas: no tiene sentido mostrar una barra vacía animando.
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="relative flex h-8 items-center overflow-hidden border-b border-black/10 bg-primary text-primary-foreground sm:h-9"
      role="presentation"
    >
      <div className="flex w-max animate-marquee font-mono text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
        <MarqueeGroup items={items} />
        <MarqueeGroup items={items} />
      </div>
    </div>
  );
}
