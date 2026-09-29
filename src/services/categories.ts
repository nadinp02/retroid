import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/types/catalog";

// Se lee en casi todas las páginas (home, catálogo, formularios admin) y
// cambia solo cuando un admin la edita — cachear evita pegarle a Neon en
// cada request. Invalidado con revalidateTag("categories") en actions.ts.
export const listCategories = unstable_cache(
  (filters: { isActive?: boolean } = {}) =>
    prisma.category.findMany({ where: filters, orderBy: { name: "asc" } }),
  ["categories-list"],
  { tags: ["categories"] },
);

export function countCategories() {
  return prisma.category.count();
}

export function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

type CreateCategoryInput = Pick<Category, "name" | "slug"> &
  Partial<Pick<Category, "imageUrl" | "isActive">>;

export function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({ data });
}

export function updateCategory(id: string, data: Partial<CreateCategoryInput>) {
  return prisma.category.update({ where: { id }, data });
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export function deleteCategories(ids: string[]) {
  return prisma.category.deleteMany({ where: { id: { in: ids } } });
}

export function bulkUpdateCategoriesActive(ids: string[], isActive: boolean) {
  return prisma.category.updateMany({ where: { id: { in: ids } }, data: { isActive } });
}
