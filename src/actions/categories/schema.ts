import { z } from "zod";
import { SLUG_REGEX, SLUG_ERROR_MESSAGE } from "@/utils/slug";

// Separado de actions.ts porque un módulo "use server" solo puede exportar
// funciones async (regla de Next.js) — el schema no se podría exportar (ni
// testear) si viviera ahí.
export const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  slug: z.string().trim().min(1, "El slug es obligatorio").regex(SLUG_REGEX, SLUG_ERROR_MESSAGE),
  isActive: z.boolean(),
});

export function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    isActive: formData.get("isActive") === "on",
  });
}
