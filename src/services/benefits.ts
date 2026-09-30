import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Benefit } from "@/types/catalog";

// Se lee en la Home y en cada detalle de producto, y cambia solo cuando un
// admin edita los beneficios — cachear evita pegarle a Neon en cada request.
// Invalidado con revalidateTag("benefits") en actions.ts.
export const listActiveBenefits = unstable_cache(
  () =>
    prisma.benefit.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    }),
  ["benefits-active"],
  { tags: ["benefits"] },
);

// Listado admin: sin cache (necesita ver cambios propios al instante) y sin
// filtrar por isActive (el admin gestiona también los inactivos).
export function listBenefits() {
  return prisma.benefit.findMany({ orderBy: { position: "asc" } });
}

type CreateBenefitInput = Pick<Benefit, "icon" | "title" | "text"> &
  Partial<Pick<Benefit, "isActive">>;

export async function createBenefit(data: CreateBenefitInput) {
  // Nuevo beneficio al final del orden actual — mismo criterio que
  // createMarqueeItem.
  const last = await prisma.benefit.findFirst({ orderBy: { position: "desc" } });
  const position = last ? last.position + 1 : 0;
  return prisma.benefit.create({ data: { ...data, position } });
}

export function updateBenefit(id: string, data: Partial<CreateBenefitInput>) {
  return prisma.benefit.update({ where: { id }, data });
}

export function deleteBenefit(id: string) {
  return prisma.benefit.delete({ where: { id } });
}

/**
 * Persiste el orden final: `orderedIds[0]` queda en `position` 0, etc.
 * Mismo patrón que reorderMarqueeItems.
 */
export function reorderBenefits(orderedIds: string[]) {
  return prisma.$transaction(
    orderedIds.map((id, position) => prisma.benefit.update({ where: { id }, data: { position } })),
  );
}
