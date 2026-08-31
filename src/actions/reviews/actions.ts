"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ReviewStatus } from "@prisma/client";
import { requireSession } from "@/auth";
import {
  createReview,
  updateReviewStatus,
  replyToReview,
  deleteReview,
  getReviewById,
} from "@/services/reviews";
import { getProductById } from "@/services/products";
import type { FormState } from "@/types/form-state";

const reviewSchema = z.object({
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

/**
 * Revalida las páginas públicas donde puede impactar un cambio de estado o
 * respuesta en una reseña: la Home (feed general) y, si está ligada a un
 * producto, la página de ese producto.
 */
function revalidatePublicPages(productSlug?: string | null) {
  revalidatePath("/");
  if (productSlug) revalidatePath(`/productos/${productSlug}`);
}

/**
 * Alta pública, sin sesión: cualquier visitante puede dejar una reseña.
 * Nace en PENDING — no revalida nada público porque todavía no es visible
 * en el sitio hasta que un admin la apruebe.
 */
export async function createReviewAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Honeypot: campo oculto para bots (invisible y fuera del tab-order para
  // usuarios reales). Si viene con contenido, fingimos éxito sin guardar
  // nada — no le damos a un bot ninguna pista de que fue detectado.
  if (typeof formData.get("website") === "string" && formData.get("website") !== "") {
    return { errors: {}, success: "¡Gracias! Tu reseña fue enviada y va a publicarse luego de ser revisada." };
  }

  const parsed = reviewSchema.safeParse({
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.productId) {
    const product = await getProductById(parsed.data.productId);
    if (!product || !product.isActive) {
      return { errors: { productId: ["El producto elegido ya no está disponible"] } };
    }
  }

  await createReview(parsed.data);
  return {
    errors: {},
    success: "¡Gracias! Tu reseña fue enviada y va a publicarse luego de ser revisada.",
  };
}

export async function approveReviewAction(id: string) {
  await requireSession();
  const review = await updateReviewStatus(id, ReviewStatus.APPROVED);
  revalidatePath("/administracion/resenas");
  revalidatePublicPages(review.product?.slug);
}

export async function rejectReviewAction(id: string) {
  await requireSession();
  const review = await updateReviewStatus(id, ReviewStatus.REJECTED);
  revalidatePath("/administracion/resenas");
  revalidatePublicPages(review.product?.slug);
}

export async function replyToReviewAction(id: string, formData: FormData) {
  await requireSession();

  const reply = String(formData.get("reply") ?? "").trim();
  if (!reply) return;

  const review = await replyToReview(id, reply);
  revalidatePath("/administracion/resenas");
  revalidatePublicPages(review.product?.slug);
}

export async function deleteReviewAction(id: string) {
  await requireSession();
  const review = await getReviewById(id);
  await deleteReview(id);
  revalidatePath("/administracion/resenas");
  revalidatePublicPages(review?.product?.slug);
}
