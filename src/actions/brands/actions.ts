"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/auth";
import { createBrand, updateBrand, deleteBrand, getBrandBySlug } from "@/services/brands";
import { emptyFormState, type FormState } from "@/types/form-state";
import { SLUG_REGEX, SLUG_ERROR_MESSAGE } from "@/utils/slug";

const brandSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  slug: z.string().trim().min(1, "El slug es obligatorio").regex(SLUG_REGEX, SLUG_ERROR_MESSAGE),
  isActive: z.boolean(),
});

function parseBrandForm(formData: FormData) {
  return brandSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createBrandAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseBrandForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getBrandBySlug(parsed.data.slug);
  if (existing) {
    return { errors: { slug: ["Ya existe una marca con ese slug"] } };
  }

  await createBrand(parsed.data);
  revalidateTag("brands");
  redirect("/administracion/marcas");
}

export async function updateBrandAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseBrandForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getBrandBySlug(parsed.data.slug);
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Ya existe una marca con ese slug"] } };
  }

  await updateBrand(id, parsed.data);
  revalidateTag("brands");
  redirect("/administracion/marcas");
}

export async function deleteBrandAction(
  id: string,
  _prevState: FormState,
  _formData: FormData,
): Promise<FormState> {
  await requireSession();
  // products.brandId es opcional (Product.brandId String?), así que la FK es
  // ON DELETE SET NULL: a diferencia de categorías, acá no hay excepción de
  // integridad referencial que capturar.
  await deleteBrand(id);
  revalidateTag("brands");
  return emptyFormState;
}
