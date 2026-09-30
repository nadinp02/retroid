import {
  BadgeCheck,
  Clock,
  CreditCard,
  Gamepad2,
  Gift,
  Headset,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Registro cerrado de íconos elegibles para un beneficio. En la base se
// guarda solo la clave (ej. "truck"): así el admin elige de una lista con
// vista previa y no hace falta importar todo lucide para resolver un nombre
// arbitrario.
export const BENEFIT_ICONS = {
  truck: { label: "Envío", icon: Truck },
  package: { label: "Paquete", icon: Package },
  sparkles: { label: "Destacado", icon: Sparkles },
  star: { label: "Estrella", icon: Star },
  headset: { label: "Soporte", icon: Headset },
  wrench: { label: "Reparación", icon: Wrench },
  "shield-check": { label: "Garantía", icon: ShieldCheck },
  "badge-check": { label: "Verificado", icon: BadgeCheck },
  "credit-card": { label: "Pagos", icon: CreditCard },
  gift: { label: "Regalo", icon: Gift },
  "gamepad-2": { label: "Gaming", icon: Gamepad2 },
  heart: { label: "Favorito", icon: Heart },
  clock: { label: "Rapidez", icon: Clock },
  zap: { label: "Rayo", icon: Zap },
  "map-pin": { label: "Ubicación", icon: MapPin },
} as const satisfies Record<string, { label: string; icon: LucideIcon }>;

export type BenefitIconKey = keyof typeof BENEFIT_ICONS;

export const BENEFIT_ICON_KEYS = Object.keys(BENEFIT_ICONS) as [
  BenefitIconKey,
  ...BenefitIconKey[],
];

// Tolerante a claves desconocidas (ej. un ícono que se quitó del registro
// después de guardarse): cae en uno genérico en vez de romper la página.
export function getBenefitIcon(key: string): LucideIcon {
  return key in BENEFIT_ICONS ? BENEFIT_ICONS[key as BenefitIconKey].icon : Sparkles;
}
