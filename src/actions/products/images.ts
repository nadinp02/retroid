"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import {
  ALLOWED_IMAGE_FORMATS,
  CLOUDINARY_FOLDER_PREFIX,
  MAX_IMAGES_PER_PRODUCT,
} from "@/lib/image-upload-config";
import {
  addProductImage,
  countProductImages,
  deleteProductImage,
  getProductById,
  reorderProductImages,
  setHoverProductImage,
} from "@/services/products";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

type UploadSignature = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  allowedFormats: string;
};

export async function getUploadSignatureAction(
  productId: string,
): Promise<ActionResult<UploadSignature>> {
  await requireSession();

  const count = await countProductImages(productId);
  if (count >= MAX_IMAGES_PER_PRODUCT) {
    return { ok: false, error: `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto.` };
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiSecret || !apiKey || !cloudName) {
    return { ok: false, error: "Cloudinary no está configurado en el servidor." };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${CLOUDINARY_FOLDER_PREFIX}/${productId}`;
  const allowedFormats = ALLOWED_IMAGE_FORMATS.join(",");

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, allowed_formats: allowedFormats },
    apiSecret,
  );

  return {
    ok: true,
    data: { timestamp, signature, apiKey, cloudName, folder, allowedFormats },
  };
}

export async function createProductImageAction(
  productId: string,
  data: { publicId: string; url: string; alt?: string },
): Promise<ActionResult<null>> {
  await requireSession();

  await addProductImage(productId, data);
  revalidatePath(`/administracion/productos/${productId}/editar`);
  revalidatePath("/productos");
  return { ok: true, data: null };
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string,
  publicId: string,
): Promise<ActionResult<null>> {
  await requireSession();

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("No se pudo borrar la imagen en Cloudinary:", error);
  }

  await deleteProductImage(imageId);
  revalidatePath(`/administracion/productos/${productId}/editar`);
  revalidatePath("/productos");
  return { ok: true, data: null };
}

export async function reorderProductImagesAction(
  productId: string,
  orderedIds: string[],
): Promise<ActionResult<null>> {
  await requireSession();

  await reorderProductImages(orderedIds);
  revalidatePath(`/administracion/productos/${productId}/editar`);
  revalidatePath("/productos");
  return { ok: true, data: null };
}

export async function setHoverProductImageAction(
  productId: string,
  imageId: string,
): Promise<ActionResult<null>> {
  await requireSession();

  await setHoverProductImage(productId, imageId);
  revalidatePath(`/administracion/productos/${productId}/editar`);
  revalidatePath("/productos");
  return { ok: true, data: null };
}

export async function setPrimaryProductImageAction(
  productId: string,
  imageId: string,
): Promise<ActionResult<null>> {
  await requireSession();

  const product = await getProductById(productId);
  if (!product) {
    return { ok: false, error: "Producto no encontrado." };
  }

  const orderedIds = [
    imageId,
    ...product.images.filter((image) => image.id !== imageId).map((image) => image.id),
  ];

  await reorderProductImages(orderedIds);
  revalidatePath(`/administracion/productos/${productId}/editar`);
  revalidatePath("/productos");
  return { ok: true, data: null };
}
