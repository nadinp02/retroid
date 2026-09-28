import { z } from "zod";
import { SLUG_REGEX, SLUG_ERROR_MESSAGE } from "@/utils/slug";

// Separado de actions.ts porque un módulo "use server" solo puede exportar
// funciones async (regla de Next.js) — el schema no se podría exportar (ni
// testear directo) si viviera ahí.
export const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  slug: z.string().trim().min(1, "El slug es obligatorio").regex(SLUG_REGEX, SLUG_ERROR_MESSAGE),
  description: z
    .string()
    .trim()
    .nullish()
    .transform((value) => (value ? value : undefined)),
  price: z.coerce
    .number({ message: "El precio es obligatorio" })
    .positive("El precio debe ser mayor a 0"),
  stock: z.coerce
    .number({ message: "El stock es obligatorio" })
    .int("El stock debe ser un número entero")
    .nonnegative("El stock no puede ser negativo"),
  isActive: z.boolean(),
  isLimitedEdition: z.boolean(),
  categoryId: z.string().trim().min(1, "La categoría es obligatoria"),
  brandId: z
    .string()
    .nullish()
    .transform((value) => (value && value.trim() !== "" && value !== "none" ? value : null)),
});

export function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    isActive: formData.get("isActive") === "on",
    isLimitedEdition: formData.get("isLimitedEdition") === "on",
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"),
  });
}
