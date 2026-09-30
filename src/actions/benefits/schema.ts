import { z } from "zod";
import { BENEFIT_ICON_KEYS } from "@/lib/benefit-icons";

// Separado de actions.ts porque un módulo "use server" solo puede exportar
// funciones async (regla de Next.js) — el schema no se podría exportar (ni
// testear) si viviera ahí.
export const benefitSchema = z.object({
  icon: z.enum(BENEFIT_ICON_KEYS, { error: "Elegí un ícono de la lista" }),
  title: z.string().trim().min(1, "El título es obligatorio").max(40, "Máximo 40 caracteres"),
  text: z.string().trim().min(1, "El texto es obligatorio").max(140, "Máximo 140 caracteres"),
  isActive: z.boolean(),
});

export function parseBenefitForm(formData: FormData) {
  return benefitSchema.safeParse({
    icon: formData.get("icon"),
    title: formData.get("title"),
    text: formData.get("text"),
    isActive: formData.get("isActive") === "on",
  });
}
