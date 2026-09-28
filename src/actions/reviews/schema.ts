import { z } from "zod";

// Separado de actions.ts porque un módulo "use server" solo puede exportar
// funciones async (regla de Next.js) — el schema no se podría exportar (ni
// testear directo) si viviera ahí.
export const reviewSchema = z.object({
  authorName: z.string().trim().min(2, "Contanos tu nombre (mínimo 2 caracteres)").max(80),
  rating: z.coerce
    .number({ message: "Elegí una calificación de 1 a 5 estrellas" })
    .int()
    .min(1, "Elegí una calificación de 1 a 5 estrellas")
    .max(5, "Elegí una calificación de 1 a 5 estrellas"),
  comment: z
    .string()
    .trim()
    .max(1000, "El comentario es demasiado largo")
    .nullish()
    .transform((value) => (value ? value : null)),
  productId: z
    .string()
    .nullish()
    .transform((value) => (value && value.trim() !== "" && value !== "general" ? value : null)),
});
