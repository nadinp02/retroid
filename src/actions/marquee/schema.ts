import { z } from "zod";

// Separado de actions.ts porque un módulo "use server" solo puede exportar
// funciones async (regla de Next.js) — el schema no se podría exportar (ni
// testear) si viviera ahí.
export const marqueeItemSchema = z.object({
  text: z.string().trim().min(1, "El texto es obligatorio").max(120, "Máximo 120 caracteres"),
  isActive: z.boolean(),
});

export function parseMarqueeItemForm(formData: FormData) {
  return marqueeItemSchema.safeParse({
    text: formData.get("text"),
    isActive: formData.get("isActive") === "on",
  });
}
