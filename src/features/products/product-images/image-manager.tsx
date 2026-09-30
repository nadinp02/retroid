"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageOff, ImagePlus, Loader2, MousePointerClick, Star, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
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

// Botón de ícono sobre la foto. Fondo oscuro sólido para que se lea encima
// de cualquier imagen; `title` como tooltip de escritorio y aria-label para
// lectores de pantalla.
function TileButton({
  label,
  active,
  className,
  onPointerDown,
  ...props
}: React.ComponentProps<"button"> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      {...props}
      // Después del spread y combinado con el que venga por props (ej. el
      // de AlertDialogTrigger): sin el stopPropagation, apretar un botón
      // arrancaría el arrastre de la foto.
      onPointerDown={(event) => {
        onPointerDown?.(event);
        event.stopPropagation();
      }}
      className={cn(
        "flex size-7 items-center justify-center border border-white/15 bg-black/80 text-white transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40",
        active && "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
        className,
      )}
    />
  );
}

function ImageTile({
  image,
  isCover,
  broken,
  pending,
  onBroken,
  onMakeCover,
  onToggleHover,
  onDelete,
}: {
  image: ProductImage;
  isCover: boolean;
  broken: boolean;
  pending: boolean;
  onBroken: () => void;
  onMakeCover: () => void;
  onToggleHover: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`Foto${isCover ? " de portada" : ""}. Arrastrá para cambiar el orden.`}
      className={cn(
        "group relative aspect-square cursor-grab touch-none overflow-hidden border bg-muted active:cursor-grabbing",
        isCover ? "border-primary" : "border-border",
        isDragging && "z-10 opacity-80 shadow-xl shadow-black/60",
      )}
    >
      {broken ? (
        <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <ImageOff className="size-6" />
          <span className="text-[11px]">No se pudo cargar</span>
        </div>
      ) : (
        <Image
          src={image.url}
          alt={image.alt ?? ""}
          fill
          sizes="(min-width: 768px) 160px, 33vw"
          draggable={false}
          className="pointer-events-none object-cover"
          onError={onBroken}
        />
      )}

      {/* Etiqueta de estado arriba a la izquierda: una sola, la más
          importante (una portada nunca es también la de hover). */}
      {(isCover || image.isHoverImage) && (
        <span
          className={cn(
            "absolute top-1.5 left-1.5 px-1.5 py-0.5 font-mono text-[10px] leading-none font-semibold tracking-wide uppercase",
            isCover ? "bg-primary text-primary-foreground" : "bg-white text-black",
          )}
        >
          {isCover ? "Portada" : "Hover"}
        </span>
      )}

      {/* Acciones siempre visibles (no solo al pasar el mouse): en tablet o
          celular no hay hover que las revele. */}
      <div className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1">
        {!isCover && (
          <>
            <TileButton label="Usar como portada" disabled={pending} onClick={onMakeCover}>
              <Star className="size-3.5" />
            </TileButton>
            <TileButton
              label={image.isHoverImage ? "Quitar de hover" : "Mostrar al pasar el mouse"}
              active={image.isHoverImage}
              disabled={pending}
              onClick={onToggleHover}
            >
              <MousePointerClick className="size-3.5" />
            </TileButton>
          </>
        )}
        <ConfirmDialog
          trigger={
            <TileButton
              label="Eliminar foto"
              disabled={pending}
              className="ml-auto hover:border-destructive hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </TileButton>
          }
          title="Eliminar foto"
          description="¿Eliminar esta foto? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
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
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  // Orden local para reflejar el arrastre al instante, sin esperar el viaje
  // al server — se resincroniza cuando llegan imágenes nuevas del padre.
  const [ordered, setOrdered] = useState(images);
  useEffect(() => {
    setOrdered(images);
  }, [images]);

  const sensors = useSensors(
    // distance: sin esto cualquier click sobre la foto arrancaría un drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const canUpload = !uploadProgress && ordered.length < MAX_IMAGES_PER_PRODUCT;

  async function uploadFiles(files: File[]) {
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
    if (ordered.length + files.length > MAX_IMAGES_PER_PRODUCT) {
      setError(
        `Máximo ${MAX_IMAGES_PER_PRODUCT} fotos por producto (ya hay ${ordered.length}, intentaste sumar ${files.length}).`,
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
      setError(err instanceof Error ? err.message : "Error inesperado subiendo las fotos.");
    } finally {
      setUploadProgress(null);
    }
  }

  // Soltar archivos desde el escritorio sobre el panel. Solo reacciona a
  // arrastres de archivos (dataTransfer.types incluye "Files"), no al
  // reordenamiento de fotos, que es de dnd-kit y no usa la API nativa.
  function handleDragOver(event: React.DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    if (canUpload) setIsDraggingFiles(true);
  }

  function handleDrop(event: React.DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    setIsDraggingFiles(false);
    if (!canUpload) return;
    void uploadFiles(Array.from(event.dataTransfer.files));
  }

  async function runAction(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setPending(true);
    setError(null);
    try {
      const result = await fn();
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      notifyMutated();
      return true;
    } finally {
      setPending(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((image) => image.id === active.id);
    const newIndex = ordered.findIndex((image) => image.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(reordered);
    const ok = await runAction(() =>
      reorderProductImagesAction(
        productId,
        reordered.map((image) => image.id),
      ),
    );
    if (!ok) setOrdered(images);
  }

  return (
    <div
      className="space-y-3"
      onDragOver={handleDragOver}
      onDragLeave={(event) => {
        // Solo al salir del panel entero, no al pasar entre hijos.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDraggingFiles(false);
        }
      }}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          void uploadFiles(files);
        }}
      />

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={ordered.map((image) => image.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2">
            {ordered.map((image, index) => (
              <ImageTile
                key={image.id}
                image={image}
                isCover={index === 0}
                broken={brokenIds.has(image.id)}
                pending={pending}
                onBroken={() => setBrokenIds((prev) => new Set(prev).add(image.id))}
                onMakeCover={() =>
                  runAction(() => setPrimaryProductImageAction(productId, image.id))
                }
                onToggleHover={() =>
                  runAction(() => setHoverProductImageAction(productId, image.id))
                }
                onDelete={() =>
                  runAction(() => deleteProductImageAction(productId, image.id, image.publicId))
                }
              />
            ))}

            {/* Casillero para agregar: siempre al final de la grilla, así
                subir fotos está donde el ojo ya está mirando. También recibe
                archivos arrastrados (resaltado mientras se arrastra). */}
            {ordered.length < MAX_IMAGES_PER_PRODUCT && (
              <button
                type="button"
                disabled={!canUpload}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1.5 border border-dashed p-2 text-center text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-wait",
                  isDraggingFiles ? "border-primary bg-primary/10 text-primary" : "border-border",
                  ordered.length === 0 && "col-span-3 aspect-auto py-10",
                )}
              >
                {uploadProgress ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-xs">
                      Subiendo {uploadProgress.done + 1} de {uploadProgress.total}
                    </span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-5" />
                    <span className="font-mono text-[11px] font-medium tracking-wide uppercase">
                      Agregar fotos
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <FieldError message={error ?? undefined} />

      {ordered.length > 0 && (
        <p className="text-right font-mono text-xs text-muted-foreground">
          {ordered.length}/{MAX_IMAGES_PER_PRODUCT}
        </p>
      )}
    </div>
  );
}
