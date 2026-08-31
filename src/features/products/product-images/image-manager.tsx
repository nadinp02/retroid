"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageOff, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  createProductImageAction,
  deleteProductImageAction,
  getUploadSignatureAction,
  reorderProductImagesAction,
  setPrimaryProductImageAction,
} from "@/actions/products/images";
import { MAX_IMAGE_BYTES, MAX_IMAGES_PER_PRODUCT } from "@/lib/image-upload-config";
import type { ProductImage } from "@/types/catalog";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Formato no permitido. Usá JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`El archivo supera el máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    if (images.length >= MAX_IMAGES_PER_PRODUCT) {
      setError(`Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto.`);
      return;
    }

    setUploading(true);
    try {
      const signed = await getUploadSignatureAction(productId);
      if (!signed.ok) {
        setError(signed.error);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signed.data.apiKey);
      formData.append("timestamp", String(signed.data.timestamp));
      formData.append("signature", signed.data.signature);
      formData.append("folder", signed.data.folder);
      formData.append("allowed_formats", signed.data.allowedFormats);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.data.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      const uploaded = await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploaded?.error?.message ?? "Error al subir la imagen a Cloudinary.");
        return;
      }

      const created = await createProductImageAction(productId, {
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        alt: file.name,
      });
      if (!created.ok) {
        setError(created.error);
        return;
      }

      router.refresh();
    } catch {
      setError("Error inesperado subiendo la imagen.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: string, publicId: string) {
    setPendingId(imageId);
    setError(null);
    try {
      const result = await deleteProductImageAction(productId, imageId, publicId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const orderedIds = images.map((image) => image.id);
    [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];

    setPendingId(images[index].id);
    setError(null);
    try {
      const result = await reorderProductImagesAction(productId, orderedIds);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handleSetPrimary(imageId: string) {
    setPendingId(imageId);
    setError(null);
    try {
      const result = await setPrimaryProductImageAction(productId, imageId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={uploading || images.length >= MAX_IMAGES_PER_PRODUCT}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Subiendo..." : "Subir imagen"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {images.length} / {MAX_IMAGES_PER_PRODUCT}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {images.length === 0 ? (
        <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Todavía no hay imágenes. Subí al menos una para que el producto se vea en el catálogo.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {images.map((image, index) => (
            <div key={image.id} className="space-y-2 rounded-lg border border-border p-2">
              <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                {brokenIds.has(image.id) ? (
                  <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <ImageOff className="size-6" />
                    <span className="text-center text-xs">No se pudo cargar</span>
                  </div>
                ) : (
                  <Image
                    src={image.url}
                    alt={image.alt ?? ""}
                    fill
                    sizes="200px"
                    className="object-cover"
                    onError={() =>
                      setBrokenIds((prev) => new Set(prev).add(image.id))
                    }
                  />
                )}
                {index === 0 && (
                  <Badge className="absolute left-1 top-1">Principal</Badge>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={pendingId === image.id || index === 0}
                  onClick={() => handleMove(index, -1)}
                  aria-label="Mover antes"
                  title="Mover antes"
                >
                  <ArrowLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={pendingId === image.id || index === images.length - 1}
                  onClick={() => handleMove(index, 1)}
                  aria-label="Mover después"
                  title="Mover después"
                >
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={pendingId === image.id || index === 0}
                  onClick={() => handleSetPrimary(image.id)}
                  aria-label="Marcar como principal"
                  title="Marcar como principal"
                >
                  <Star className="size-3.5" />
                </Button>
              </div>
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={pendingId === image.id}
                  >
                    Eliminar
                  </Button>
                }
                title="Eliminar imagen"
                description="¿Eliminar esta imagen? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                onConfirm={() => handleDelete(image.id, image.publicId)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
