"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/auth";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategories,
  bulkUpdateCategoriesActive,
  getCategoryBySlug,
} from "@/services/categories";
import { emptyFormState, type FormState } from "@/types/form-state";
import { parseCategoryForm } from "./schema";

export async function createCategoryAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getCategoryBySlug(parsed.data.slug);
  if (existing) {
    return { errors: { slug: ["Ya existe una categoría con ese slug"] } };
  }

  await createCategory(parsed.data);
  revalidateTag("categories");
  redirect("/administracion/categorias");
}

export async function updateCategoryAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getCategoryBySlug(parsed.data.slug);
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Ya existe una categoría con ese slug"] } };
  }

  await updateCategory(id, parsed.data);
  revalidateTag("categories");
  redirect("/administracion/categorias");
}

// Variantes "modal": misma validación y mutación que las de arriba, pero
// sin redirect() — las usa CategoryFormDialog, que necesita quedarse en la
// misma página para cerrar el modal y refrescar la lista in-place en vez de
// navegar. Las de arriba se mantienen intactas para /nueva y /[id]/editar
// (acceso directo por URL, sin JS de por medio más que el propio form).
export async function createCategoryModalAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getCategoryBySlug(parsed.data.slug);
  if (existing) {
    return { errors: { slug: ["Ya existe una categoría con ese slug"] } };
  }

  await createCategory(parsed.data);
  revalidateTag("categories");
  return { errors: {}, success: "created" };
}

export async function updateCategoryModalAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getCategoryBySlug(parsed.data.slug);
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Ya existe una categoría con ese slug"] } };
  }

  await updateCategory(id, parsed.data);
  revalidateTag("categories");
  return { errors: {}, success: "updated" };
}

export async function deleteCategoryAction(
  id: string,
  _prevState: FormState,
  _formData: FormData,
): Promise<FormState> {
  await requireSession();

  try {
    await deleteCategory(id);
  } catch (error) {
    // P2003 = violación de FK: la categoría tiene productos asociados
    // (products.categoryId -> categories.id es ON DELETE RESTRICT).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        errors: { _form: ["No se puede eliminar: hay productos asociados a esta categoría."] },
      };
    }
    throw error;
  }

  revalidateTag("categories");
  return emptyFormState;
}

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function bulkDeleteCategoriesAction(ids: string[]): Promise<ActionResult<null>> {
  await requireSession();
  if (ids.length === 0) return { ok: true, data: null };

  try {
    await deleteCategories(ids);
  } catch (error) {
    // P2003 = alguna de las categorías seleccionadas tiene productos
    // asociados — deleteMany es atómico: si una sola fila viola la FK, no
    // se borra ninguna (mismo criterio que el delete individual).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        ok: false,
        error: "No se puede eliminar: una o más categorías tienen productos asociados.",
      };
    }
    throw error;
  }

  revalidateTag("categories");
  return { ok: true, data: null };
}

export async function bulkUpdateCategoriesActiveAction(
  ids: string[],
  isActive: boolean,
): Promise<ActionResult<null>> {
  await requireSession();
  if (ids.length === 0) return { ok: true, data: null };

  await bulkUpdateCategoriesActive(ids, isActive);
  revalidateTag("categories");
  return { ok: true, data: null };
}
