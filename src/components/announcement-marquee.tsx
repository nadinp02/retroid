// Barra promocional debajo del navbar. Server Component puro: la animación
// es 100% CSS (.animate-marquee en globals.css), no requiere "use client".
// Para cambiar el texto en el futuro, solo hay que editar este array.
const MARQUEE_ITEMS = [
  "Envíos a toda Argentina",
  "Importados desde Japón",
  "Productos únicos",
  "Soporte después de la compra",
];

function MarqueeGroup() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {MARQUEE_ITEMS.map((item, index) => (
        <span key={index} className="flex items-center whitespace-nowrap px-4 sm:px-6">
          {item}
          <span className="ml-4 text-black/30 sm:ml-6">✦</span>
        </span>
      ))}
    </div>
  );
}

export function AnnouncementMarquee() {
  return (
    <div
      className="relative flex h-8 items-center overflow-hidden border-b border-black/10 bg-primary text-primary-foreground sm:h-9"
      role="presentation"
    >
      <div className="flex w-max animate-marquee font-mono text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  );
}
