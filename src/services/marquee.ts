import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { MarqueeItem } from "@/types/catalog";

// Se lee en el layout público (todas las páginas) y cambia solo cuando un
// admin edita la barra — cachear evita pegarle a Neon en cada request.
// Invalidado con revalidateTag("marquee") en actions.ts.
export const listActiveMarqueeItems = unstable_cache(
  () =>
    prisma.marqueeItem.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    }),
  ["marquee-items-active"],
  { tags: ["marquee"] },
);

// Listado admin: sin cache (necesita ver cambios propios al instante) y sin
// filtrar por isActive (el admin gestiona también las inactivas).
export function listMarqueeItems() {
  return prisma.marqueeItem.findMany({ orderBy: { position: "asc" } });
}

export function getMarqueeItemById(id: string) {
  return prisma.marqueeItem.findUnique({ where: { id } });
}

type CreateMarqueeItemInput = Pick<MarqueeItem, "text"> & Partial<Pick<MarqueeItem, "isActive">>;

export async function createMarqueeItem(data: CreateMarqueeItemInput) {
  // Nueva frase al final del orden actual, no siempre en 0 (@default en el
  // schema es solo el valor si no se especifica nada).
  const last = await prisma.marqueeItem.findFirst({ orderBy: { position: "desc" } });
  const position = last ? last.position + 1 : 0;
  return prisma.marqueeItem.create({ data: { ...data, position } });
}

export function updateMarqueeItem(id: string, data: Partial<CreateMarqueeItemInput>) {
  return prisma.marqueeItem.update({ where: { id }, data });
}

export function deleteMarqueeItem(id: string) {
  return prisma.marqueeItem.delete({ where: { id } });
}

export function deleteMarqueeItems(ids: string[]) {
  return prisma.marqueeItem.deleteMany({ where: { id: { in: ids } } });
}

export function bulkUpdateMarqueeItemsActive(ids: string[], isActive: boolean) {
  return prisma.marqueeItem.updateMany({ where: { id: { in: ids } }, data: { isActive } });
}

/**
 * Persiste el orden final de las frases: `orderedIds[0]` queda en
 * `position` 0, etc. Mismo patrón que reorderProductImages en
 * services/products.ts.
 */
export function reorderMarqueeItems(orderedIds: string[]) {
  return prisma.$transaction(
    orderedIds.map((id, position) =>
      prisma.marqueeItem.update({ where: { id }, data: { position } }),
    ),
  );
}
