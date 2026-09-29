"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { createProductModalAction, updateProductModalAction } from "@/actions/products/actions";
import { getProductImagesAction } from "@/actions/products/images";
import { emptyProductModalState } from "@/types/form-state";
import type { Category, Brand, ProductImage } from "@/types/catalog";
import { ProductFormFields, type ProductWithStringPrice } from "./product-form-fields";
import { ImageManager } from "./product-images/image-manager";

/**
 * A diferencia de las demás modales de edición (categorías, marcas,
 * marquee), acá crear/editar no termina en solo guardar texto: el producto
 * necesita imágenes para aparecer bien en el catálogo, y la versión
 * standalone resuelve esto con un redirect a /[id]/editar después de crear.
 * Este modal replica ese mismo flujo en dos pasos sin navegar: al crear con
 * éxito, en vez de cerrarse, revela el gestor de imágenes ahí mismo
 * (createdId). Al editar un producto existente, "Guardar cambios" sigue
 * cerrando el modal — igual que hoy hace el redirect de la página
 * standalone al guardar texto.
 */
export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  brands,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductWithStringPrice;
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdProduct, setCreatedProduct] = useState<ProductWithStringPrice | null>(null);
  const editingId = product?.id ?? createdId;

  const action = editingId
    ? updateProductModalAction.bind(null, editingId)
    : createProductModalAction;
  const [state, formAction] = useActionState(action, emptyProductModalState);

  const [images, setImages] = useState<ProductImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  useEffect(() => {
    if (state.success === "created" && state.productId) {
      setCreatedId(state.productId);
      if (state.createdProduct) setCreatedProduct(state.createdProduct);
      return;
    }
    if (state.success) {
      onOpenChange(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  // Un producto existente (product prop) trae imágenes ya guardadas: se
  // piden al abrir. Uno recién creado en este mismo modal (createdId, sin
  // product) arranca sin imágenes con certeza — no hace falta pedirlas.
  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    setImagesLoading(true);
    getProductImagesAction(product.id).then((result) => {
      if (cancelled) return;
      setImagesLoading(false);
      if (result.ok) setImages(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  async function refetchImages() {
    if (!editingId) return;
    const result = await getProductImagesAction(editingId);
    if (result.ok) setImages(result.data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-3xl">
        <DialogTitle>{editingId ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        <div className="grid gap-6 p-5 md:grid-cols-2 md:items-start">
          <ProductFormFields
            // Fuerza un remount al pasar de "crear" a "editar recién creado":
            // sin esto los inputs no controlados (precio, stock, etc.) se
            // reinician a sus valores por defecto —React resetea el form
            // nativo al terminar la action— con datos que ya no coinciden
            // con lo que el server realmente guardó. Ver ProductModalState.
            key={editingId ?? "new"}
            product={product ?? createdProduct ?? undefined}
            categories={categories}
            brands={brands}
            isEditing={!!editingId}
            state={state}
            formAction={formAction}
          />

          {editingId ? (
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Imágenes
              </h3>
              {imagesLoading ? (
                <p className="text-sm text-muted-foreground">Cargando imágenes…</p>
              ) : (
                <ImageManager productId={editingId} images={images} onMutated={refetchImages} />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground md:mt-6">
              Vas a poder subir las imágenes después de crear el producto.
            </p>
          )}
        </div>
      </DialogPopup>
    </Dialog>
  );
}
