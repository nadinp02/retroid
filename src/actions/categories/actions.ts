"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/auth";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
} from "@/services/categories";
import type { FormState } from "@/types/form-state";
import { SLUG_REGEX, SLUG_ERROR_MESSAGE } from "@/utils/slug";

const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  slug: z.string().trim().min(1, "El slug es obligatorio").regex(SLUG_REGEX, SLUG_ERROR_MESSAGE),
  isActive: z.boolean(),
});

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    isActive: formData.get("isActive") === "on",
  });
}

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

export async function deleteCategoryAction(id: string) {
  await requireSession();
  await deleteCategory(id);
  revalidateTag("categories");
}
