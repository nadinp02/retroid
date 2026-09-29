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
import { emptyFormState, type FormState, type ProductModalState } from "@/types/form-state";
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

// Variantes "modal": misma validación y mutación que las de arriba, pero sin
// redirect() — las usa ProductFormDialog. A diferencia de las otras
// entidades, crear un producto no cierra el modal: devuelve el id recién
// creado (productId) para que el modal revele ahí mismo el gestor de
// imágenes, igual que la versión standalone lo resuelve con un redirect a
// /[id]/editar.
export async function createProductModalAction(
  _prevState: ProductModalState,
  formData: FormData,
): Promise<ProductModalState> {
  await requireSession();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await getProductBySlug(parsed.data.slug);
  if (existing) {
    return { errors: { slug: ["Ya existe un producto con ese slug"] } };
  }

  const product = await createProduct(parsed.data);
  revalidatePath("/administracion/productos");
  return {
    errors: {},
    success: "created",
    productId: product.id,
    createdProduct: { ...product, price: product.price.toString() },
  };
}

export async function updateProductModalAction(
  id: string,
  _prevState: ProductModalState,
  formData: FormData,
): Promise<ProductModalState> {
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
  return { errors: {}, success: "updated" };
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
