// lucide-react no incluye íconos de marca (Instagram, etc.) — se removieron
// del paquete hace tiempo. Este SVG replica el estilo de trazo de lucide
// (viewBox 24, strokeWidth 2, round) para que se vea consistente al lado
// de los íconos de lucide en el footer.
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
