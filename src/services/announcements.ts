import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Fila fija: el cartel flotante es una configuración única, no una lista.
const ANNOUNCEMENT_ID = "singleton";

// Se lee en el layout público, es decir en CADA página pública. Cachear la
// fila cruda (no el resultado ya filtrado por fecha de getActiveAnnouncement)
// para que la ventana de vigencia se siga evaluando con la hora real en cada
// request — solo el acceso a Neon se evita. Invalidado con
// revalidateTag("announcement") en actions.ts.
export const getAnnouncement = unstable_cache(
  () => prisma.announcement.findUnique({ where: { id: ANNOUNCEMENT_ID } }),
  ["announcement-singleton"],
  { tags: ["announcement"] },
);

type AnnouncementInput = {
  isActive: boolean;
  startAt: Date | null;
  endAt: Date | null;
  title: string;
  description: string | null;
  buttonText: string | null;
  url: string | null;
};

export function upsertAnnouncement(data: AnnouncementInput) {
  return prisma.announcement.upsert({
    where: { id: ANNOUNCEMENT_ID },
    create: { id: ANNOUNCEMENT_ID, ...data },
    update: data,
  });
}

/**
 * Lo que ve el sitio público: null salvo que esté activo y la fecha actual
 * caiga dentro del rango configurado (endAt se trata como fin del día).
 */
export async function getActiveAnnouncement() {
  const announcement = await getAnnouncement();
  if (!announcement || !announcement.isActive) return null;

  // getAnnouncement() pasa por unstable_cache: el valor cacheado se
  // serializa, así que startAt/endAt pueden llegar como string en vez de
  // Date. new Date(...) normaliza ambos casos antes de comparar — sin esto,
  // "string > Date" da NaN en la comparación y siempre resuelve a false.
  const now = new Date();
  if (announcement.startAt && new Date(announcement.startAt) > now) return null;
  if (announcement.endAt) {
    const endOfDay = new Date(announcement.endAt);
    endOfDay.setHours(23, 59, 59, 999);
    if (endOfDay < now) return null;
  }

  return announcement;
}
