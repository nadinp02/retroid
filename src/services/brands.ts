import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Brand } from "@/types/catalog";

// Mismo criterio que listCategories: se lee en casi todas las páginas y
// cambia poco. Invalidado con revalidateTag("brands") en actions.ts.
export const listBrands = unstable_cache(
  (filters: { isActive?: boolean } = {}) =>
    prisma.brand.findMany({ where: filters, orderBy: { name: "asc" } }),
  ["brands-list"],
  { tags: ["brands"] },
);

export function countBrands() {
  return prisma.brand.count();
}

export function getBrandById(id: string) {
  return prisma.brand.findUnique({ where: { id } });
}

export function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}

type CreateBrandInput = Pick<Brand, "name" | "slug"> &
  Partial<Pick<Brand, "imageUrl" | "isActive">>;

export function createBrand(data: CreateBrandInput) {
  return prisma.brand.create({ data });
}

export function updateBrand(id: string, data: Partial<CreateBrandInput>) {
  return prisma.brand.update({ where: { id }, data });
}

export function deleteBrand(id: string) {
  return prisma.brand.delete({ where: { id } });
}
