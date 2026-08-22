"use server";

import { z } from "zod";
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
import type { FormState } from "@/types/form-state";
import { SLUG_REGEX, SLUG_ERROR_MESSAGE } from "@/utils/slug";

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  slug: z.string().trim().min(1, "El slug es obligatorio").regex(SLUG_REGEX, SLUG_ERROR_MESSAGE),
  description: z
    .string()
    .trim()
    .nullish()
    .transform((value) => (value ? value : undefined)),
  price: z.coerce.number({ message: "El precio es obligatorio" }).positive("El precio debe ser mayor a 0"),
  stock: z.coerce
    .number({ message: "El stock es obligatorio" })
    .int("El stock debe ser un número entero")
    .nonnegative("El stock no puede ser negativo"),
  isActive: z.boolean(),
  categoryId: z.string().trim().min(1, "La categoría es obligatoria"),
  brandId: z
    .string()
    .nullish()
    .transform((value) => (value && value.trim() !== "" && value !== "none" ? value : null)),
});

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    isActive: formData.get("isActive") === "on",
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"),
  });
}

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

export async function deleteProductAction(id: string) {
  await requireSession();
  await deleteProduct(id);
  revalidatePath("/administracion/productos");
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
