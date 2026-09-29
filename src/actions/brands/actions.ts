"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/auth";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  deleteBrands,
  bulkUpdateBrandsActive,
  getBrandBySlug,
} from "@/services/brands";
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

// Variantes "modal": misma validación y mutación que las de arriba, pero sin
// redirect() — las usa BrandFormDialog, que necesita quedarse en la misma
// página para cerrar el modal y refrescar la lista in-place en vez de
// navegar. Las de arriba se mantienen intactas para /nueva y /[id]/editar.
export async function createBrandModalAction(
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
  return { errors: {}, success: "created" };
}

export async function updateBrandModalAction(
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
  return { errors: {}, success: "updated" };
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

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function bulkDeleteBrandsAction(ids: string[]): Promise<ActionResult<null>> {
  await requireSession();
  if (ids.length === 0) return { ok: true, data: null };

  await deleteBrands(ids);
  revalidateTag("brands");
  return { ok: true, data: null };
}

export async function bulkUpdateBrandsActiveAction(
  ids: string[],
  isActive: boolean,
): Promise<ActionResult<null>> {
  await requireSession();
  if (ids.length === 0) return { ok: true, data: null };

  await bulkUpdateBrandsActive(ids, isActive);
  revalidateTag("brands");
  return { ok: true, data: null };
}
