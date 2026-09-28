"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/auth";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProducts,
  bulkUpdateProducts,
  getProductBySlug,
} from "@/services/products";
import { emptyFormState, type FormState } from "@/types/form-state";
import { parseProductForm } from "./schema";

export async function createProductAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getProductBySlug(parsed.data.slug);
  if (existing) {
    return { errors: { slug: ["Ya existe un producto con ese slug"] } };
  }

  await createProduct(parsed.data);
  revalidatePath("/administracion/productos");
  redirect("/administracion/productos");
}

export async function updateProductAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getProductBySlug(parsed.data.slug);
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Ya existe un producto con ese slug"] } };
  }

  await updateProduct(id, parsed.data);
  revalidatePath("/administracion/productos");
  redirect("/administracion/productos");
}

export async function deleteProductAction(
  id: string,
  _prevState: FormState,
  _formData: FormData,
): Promise<FormState> {
  await requireSession();
  await deleteProduct(id);
  revalidatePath("/administracion/productos");
  return emptyFormState;
}

export async function bulkDeleteProductsAction(ids: string[]) {
  await requireSession();
  if (ids.length === 0) return;
  await deleteProducts(ids);
  revalidatePath("/administracion/productos");
}

export async function bulkUpdateProductsAction(
  ids: string[],
  data: { categoryId?: string; brandId?: string | null; isActive?: boolean },
) {
  await requireSession();
  if (ids.length === 0 || Object.keys(data).length === 0) return;
  await bulkUpdateProducts(ids, data);
  revalidatePath("/administracion/productos");
}
