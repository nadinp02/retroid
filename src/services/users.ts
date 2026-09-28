import { prisma } from "@/lib/prisma";

// Select explícito: nunca traer `password` fuera de la capa de auth.
export function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
