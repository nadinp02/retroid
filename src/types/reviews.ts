import type { Prisma } from "@prisma/client";

export type { Review, ReviewStatus } from "@prisma/client";

// Listado admin: necesita saber a qué producto pertenece cada reseña.
export type ReviewWithProduct = Prisma.ReviewGetPayload<{
  include: { product: { select: { id: true; name: true; slug: true } } };
}>;

export type ReviewSummary = {
  average: number;
  count: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};
