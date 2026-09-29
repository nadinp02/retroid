"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ReviewStatus } from "@prisma/client";
import { requireSession } from "@/auth";
import {
  createReview,
  updateReviewStatus,
  replyToReview,
  deleteReview,
  deleteReviews,
  bulkUpdateReviewStatus,
  getReviewById,
  listAffectedProductSlugs,
} from "@/services/reviews";
import { getProductById } from "@/services/products";
import { emptyFormState, type FormState } from "@/types/form-state";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { reviewSchema } from "./schema";

const REVIEW_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

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
  const ip = getClientIp(await headers());
  if (!(await checkRateLimit(`review:${ip}`, REVIEW_RATE_LIMIT))) {
    return { errors: { _form: ["Demasiados intentos. Probá de nuevo en un minuto."] } };
  }

  // Honeypot: campo oculto para bots (invisible y fuera del tab-order para
  // usuarios reales). Si viene con contenido, fingimos éxito sin guardar
  // nada — no le damos a un bot ninguna pista de que fue detectado.
  if (typeof formData.get("website") === "string" && formData.get("website") !== "") {
    return {
      errors: {},
      success: "¡Gracias! Tu reseña fue enviada y va a publicarse luego de ser revisada.",
    };
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

export async function deleteReviewAction(
  id: string,
  _prevState: FormState,
  _formData: FormData,
): Promise<FormState> {
  await requireSession();
  const review = await getReviewById(id);
  await deleteReview(id);
  revalidatePath("/administracion/resenas");
  revalidatePublicPages(review?.product?.slug);
  return emptyFormState;
}

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function bulkUpdateReviewStatusAction(
  ids: string[],
  status: ReviewStatus,
): Promise<ActionResult<null>> {
  await requireSession();
  if (ids.length === 0) return { ok: true, data: null };

  const slugs = await listAffectedProductSlugs(ids);
  await bulkUpdateReviewStatus(ids, status);
  revalidatePath("/administracion/resenas");
  revalidatePath("/");
  slugs.forEach((slug) => revalidatePath(`/productos/${slug}`));
  return { ok: true, data: null };
}

export async function bulkDeleteReviewsAction(ids: string[]): Promise<ActionResult<null>> {
  await requireSession();
  if (ids.length === 0) return { ok: true, data: null };

  const slugs = await listAffectedProductSlugs(ids);
  await deleteReviews(ids);
  revalidatePath("/administracion/resenas");
  revalidatePath("/");
  slugs.forEach((slug) => revalidatePath(`/productos/${slug}`));
  return { ok: true, data: null };
}
