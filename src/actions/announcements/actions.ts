"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/auth";
import { upsertAnnouncement } from "@/services/announcements";
import type { FormState } from "@/types/form-state";

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  return new Date(value);
}

function parseOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

const announcementSchema = z.object({
  isActive: z.boolean(),
  startAt: z.date().nullable(),
  endAt: z.date().nullable(),
  title: z.string().trim().min(1, "El título es obligatorio"),
  description: z.string().nullable(),
  buttonText: z.string().nullable(),
  url: z
    .string()
    .nullable()
    .refine((value) => value === null || /^https?:\/\//i.test(value), {
      message: "La URL debe empezar con http:// o https://",
    }),
});

export async function updateAnnouncementAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = announcementSchema.safeParse({
    isActive: formData.get("isActive") === "on",
    startAt: parseOptionalDate(formData.get("startAt")),
    endAt: parseOptionalDate(formData.get("endAt")),
    title: formData.get("title"),
    description: parseOptionalText(formData.get("description")),
    buttonText: parseOptionalText(formData.get("buttonText")),
    url: parseOptionalText(formData.get("url")),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await upsertAnnouncement(parsed.data);
  // getAnnouncement() está cacheada (unstable_cache, tag "announcement");
  // esto invalida esa entrada tanto para el popup público como para esta
  // misma página admin, que también la lee.
  revalidateTag("announcement");
  redirect("/administracion/anuncio");
}
