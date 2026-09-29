import { Prisma, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ReviewSummary } from "@/types/reviews";

const REVIEW_WITH_PRODUCT = {
  product: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ReviewInclude;

type AdminReviewFilters = {
  status?: ReviewStatus;
  page?: number;
  pageSize?: number;
};

/**
 * Listado admin: todas las reseñas (cualquier status), con el producto
 * asociado si lo tiene. Paginado para que la cola de moderación no crezca
 * sin límite en una sola pantalla.
 */
export async function listReviews(filters: AdminReviewFilters = {}) {
  const { status, page = 1, pageSize = 20 } = filters;
  const where: Prisma.ReviewWhereInput = status ? { status } : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: REVIEW_WITH_PRODUCT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function countReviewsByStatus(status: ReviewStatus) {
  return prisma.review.count({ where: { status } });
}

export function getReviewById(id: string) {
  return prisma.review.findUnique({ where: { id }, include: REVIEW_WITH_PRODUCT });
}

type PublicReviewFilters = {
  productId?: string;
  pageSize?: number;
};

/**
 * Listado público: solo reseñas aprobadas. Sin productId trae la mezcla
 * general (para la Home); con productId, solo las de ese producto (para
 * su página de detalle).
 */
export function listApprovedReviews(filters: PublicReviewFilters = {}) {
  const { productId, pageSize = 20 } = filters;

  return prisma.review.findMany({
    where: {
      status: ReviewStatus.APPROVED,
      ...(productId ? { productId } : {}),
    },
    include: REVIEW_WITH_PRODUCT,
    orderBy: { createdAt: "desc" },
    take: pageSize,
  });
}

/**
 * Promedio, total y desglose por estrella (1-5) de las reseñas aprobadas.
 * Sin productId, agrega todas las reseñas aprobadas de la tienda.
 */
export async function getReviewSummary(productId?: string): Promise<ReviewSummary> {
  const grouped = await prisma.review.groupBy({
    by: ["rating"],
    where: {
      status: ReviewStatus.APPROVED,
      ...(productId ? { productId } : {}),
    },
    _count: { rating: true },
  });

  const breakdown: ReviewSummary["breakdown"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0;
  let sum = 0;

  for (const group of grouped) {
    const rating = group.rating as 1 | 2 | 3 | 4 | 5;
    if (rating < 1 || rating > 5) continue;
    breakdown[rating] = group._count.rating;
    count += group._count.rating;
    sum += rating * group._count.rating;
  }

  return { average: count > 0 ? sum / count : 0, count, breakdown };
}

type CreateReviewInput = {
  authorName: string;
  rating: number;
  comment?: string | null;
  productId?: string | null;
};

export function createReview(data: CreateReviewInput) {
  return prisma.review.create({ data: { ...data, status: ReviewStatus.PENDING } });
}

export function updateReviewStatus(id: string, status: ReviewStatus) {
  return prisma.review.update({ where: { id }, data: { status }, include: REVIEW_WITH_PRODUCT });
}

export function replyToReview(id: string, reply: string) {
  return prisma.review.update({
    where: { id },
    data: { adminReply: reply, repliedAt: new Date() },
    include: REVIEW_WITH_PRODUCT,
  });
}

export function deleteReview(id: string) {
  return prisma.review.delete({ where: { id } });
}

export function deleteReviews(ids: string[]) {
  return prisma.review.deleteMany({ where: { id: { in: ids } } });
}

export function bulkUpdateReviewStatus(ids: string[], status: ReviewStatus) {
  return prisma.review.updateMany({ where: { id: { in: ids } }, data: { status } });
}

/**
 * Slugs de producto de estas reseñas (sin duplicados, sin las que no tienen
 * producto asociado) — para poder revalidar sus páginas públicas después de
 * una acción masiva, que a diferencia de la individual no devuelve las filas
 * afectadas (updateMany/deleteMany no traen de vuelta datos).
 */
export async function listAffectedProductSlugs(ids: string[]): Promise<string[]> {
  const reviews = await prisma.review.findMany({
    where: { id: { in: ids }, productId: { not: null } },
    select: { product: { select: { slug: true } } },
  });
  const slugs = reviews.map((review) => review.product?.slug).filter((slug) => slug !== undefined);
  return Array.from(new Set(slugs));
}
