"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Star,
  MousePointerClick,
  Upload,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FieldError } from "@/components/field-error";
import {
  createProductImageAction,
  deleteProductImageAction,
  getUploadSignatureAction,
  reorderProductImagesAction,
  setHoverProductImageAction,
  setPrimaryProductImageAction,
} from "@/actions/products/images";
import { MAX_IMAGE_BYTES, MAX_IMAGES_PER_PRODUCT } from "@/lib/image-upload-config";
import type { ProductImage } from "@/types/catalog";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadOne(productId: string, file: File) {
  const signed = await getUploadSignatureAction(productId);
  if (!signed.ok) {
    throw new Error(signed.error);
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
    throw new Error(uploaded?.error?.message ?? `Error al subir "${file.name}" a Cloudinary.`);
  }

  const created = await createProductImageAction(productId, {
    publicId: uploaded.public_id,
    url: uploaded.secure_url,
    alt: file.name,
  });
  if (!created.ok) {
    throw new Error(created.error);
  }
}

export function ImageManager({
  productId,
  images,
  onMutated,
}: {
  productId: string;
  images: ProductImage[];
  // Página standalone (sin esta prop): router.refresh() vuelve a ejecutar
  // el Server Component de la página, que ya trae `images` fresco. Dentro
  // de ProductFormDialog eso no alcanza (la lista de /administracion/productos
  // no trae imágenes, ver services/products.ts), así que el modal pasa su
  // propio refetch en vez del refresh de router.
  onMutated?: () => void;
}) {
  const router = useRouter();
  const notifyMutated = onMutated ?? (() => router.refresh());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si se borra/reordena y el índice actual queda fuera de rango, se ajusta
  // al último válido en vez de mostrar un slot vacío.
  useEffect(() => {
    if (currentIndex > images.length - 1) {
      setCurrentIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, currentIndex]);

  const current = images[currentIndex];

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError(null);

    const invalidFormat = files.find((file) => !ALLOWED_MIME_TYPES.includes(file.type));
    if (invalidFormat) {
      setError(`"${invalidFormat.name}": formato no permitido. Usá JPG, PNG o WEBP.`);
      return;
    }
    const tooLarge = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooLarge) {
      setError(`"${tooLarge.name}" supera el máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    if (images.length + files.length > MAX_IMAGES_PER_PRODUCT) {
      setError(
        `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto (ya hay ${images.length}, intentaste sumar ${files.length}).`,
      );
      return;
    }

    setUploadProgress({ done: 0, total: files.length });
    try {
      // Secuencial, no en paralelo: cada subida pide su propia firma
      // (getUploadSignatureAction vuelve a chequear el límite server-side)
      // y así el progreso "X de N" es preciso.
      for (const file of files) {
        await uploadOne(productId, file);
        setUploadProgress((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
      }
      notifyMutated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado subiendo las imágenes.");
    } finally {
      setUploadProgress(null);
    }
  }

  async function handleDelete(imageId: string, publicId: string) {
    setPending(true);
    setError(null);
    try {
      const result = await deleteProductImageAction(productId, imageId, publicId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      notifyMutated();
    } finally {
      setPending(false);
    }
  }

  async function handleMove(direction: -1 | 1) {
    const target = currentIndex + direction;
    if (target < 0 || target >= images.length) return;

    const orderedIds = images.map((image) => image.id);
    [orderedIds[currentIndex], orderedIds[target]] = [orderedIds[target], orderedIds[currentIndex]];

    setPending(true);
    setError(null);
    try {
      const result = await reorderProductImagesAction(productId, orderedIds);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCurrentIndex(target);
      notifyMutated();
    } finally {
      setPending(false);
    }
  }

  async function handleSetPrimary(imageId: string) {
    setPending(true);
    setError(null);
    try {
      const result = await setPrimaryProductImageAction(productId, imageId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCurrentIndex(0);
      notifyMutated();
    } finally {
      setPending(false);
    }
  }

  async function handleToggleHover(imageId: string) {
    setPending(true);
    setError(null);
    try {
      const result = await setHoverProductImageAction(productId, imageId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      notifyMutated();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          disabled={!!uploadProgress || images.length >= MAX_IMAGES_PER_PRODUCT}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-3.5" />
          {uploadProgress
            ? `Subiendo ${uploadProgress.done + 1} de ${uploadProgress.total}...`
            : "Subir imágenes"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {images.length} / {MAX_IMAGES_PER_PRODUCT}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFilesChange}
        />
      </div>

      <FieldError message={error ?? undefined} />

      {images.length === 0 ? (
        <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Todavía no hay imágenes. Subí al menos una para que el producto se vea en el catálogo.
          Podés seleccionar varias a la vez.
        </p>
      ) : (
        current && (
          <div className="mx-auto max-w-md space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              {brokenIds.has(current.id) ? (
                <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
                  <ImageOff className="size-8" />
                  <span className="text-center text-xs">No se pudo cargar</span>
                </div>
              ) : (
                <Image
                  key={current.id}
                  src={current.url}
                  alt={current.alt ?? ""}
                  fill
                  sizes="400px"
                  className="animate-in fade-in object-contain duration-150"
                  onError={() => setBrokenIds((prev) => new Set(prev).add(current.id))}
                />
              )}

              {currentIndex === 0 && <Badge className="absolute top-2 left-2">Principal</Badge>}
              {current.isHoverImage && (
                <Badge variant="accent" className="absolute top-2 right-2">
                  Hover
                </Badge>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Imagen anterior"
                    className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-[#0d0d0f]/80 text-foreground transition-colors hover:border-accent"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
                    aria-label="Imagen siguiente"
                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center border border-border bg-[#0d0d0f]/80 text-foreground transition-colors hover:border-accent"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}
            </div>

            <p className="text-center font-mono text-xs text-muted-foreground">
              Imagen {currentIndex + 1} de {images.length}
            </p>

            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pending || currentIndex === 0}
                onClick={() => handleMove(-1)}
                aria-label="Mover antes en el orden"
                title="Mover antes en el orden"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pending || currentIndex === images.length - 1}
                onClick={() => handleMove(1)}
                aria-label="Mover después en el orden"
                title="Mover después en el orden"
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pending || currentIndex === 0}
                onClick={() => handleSetPrimary(current.id)}
                aria-label="Marcar como principal"
                title="Marcar como principal"
              >
                <Star className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant={current.isHoverImage ? "accent" : "outline"}
                size="icon-sm"
                disabled={pending || currentIndex === 0}
                onClick={() => handleToggleHover(current.id)}
                aria-label={
                  current.isHoverImage
                    ? "Quitar como imagen de hover"
                    : "Marcar como imagen de hover (se muestra en la card al pasar el mouse)"
                }
                title={current.isHoverImage ? "Quitar como imagen de hover" : "Marcar como hover"}
              >
                <MousePointerClick className="size-3.5" />
              </Button>
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    disabled={pending}
                    aria-label="Eliminar imagen"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                }
                title="Eliminar imagen"
                description="¿Eliminar esta imagen? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                onConfirm={() => handleDelete(current.id, current.publicId)}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}
