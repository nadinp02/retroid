"use client";

import { useActionState } from "react";
import { WindowPanel } from "@/components/ui/window-panel";
import { createProductAction, updateProductAction } from "@/actions/products/actions";
import { emptyFormState } from "@/types/form-state";
import type { Category, Brand } from "@/types/catalog";
import { ProductFormFields, type ProductWithStringPrice } from "./product-form-fields";

// Versión standalone (/administracion/productos/nuevo y /[id]/editar):
// acceso directo por URL, las actions redirigen a la lista al terminar. Ver
// ProductFormDialog para la versión que se abre como modal desde la lista.
export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: ProductWithStringPrice;
  categories: Category[];
  brands: Brand[];
}) {
  const action = product ? updateProductAction.bind(null, product.id) : createProductAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <WindowPanel title={product ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"} className="max-w-xl">
      <div className="p-5">
        <ProductFormFields
          product={product}
          categories={categories}
          brands={brands}
          isEditing={!!product}
          state={state}
          formAction={formAction}
        />
      </div>
    </WindowPanel>
  );
}
