"use client";

import { useActionState } from "react";
import { WindowPanel } from "@/components/ui/window-panel";
import { createCategoryAction, updateCategoryAction } from "@/actions/categories/actions";
import { emptyFormState } from "@/types/form-state";
import type { Category } from "@/types/catalog";
import { CategoryFormFields } from "./category-form-fields";

// Versión standalone (/administracion/categorias/nueva y /[id]/editar):
// acceso directo por URL, las actions redirigen a la lista al terminar. Ver
// CategoryFormDialog para la versión que se abre como modal desde la lista.
export function CategoryForm({ category }: { category?: Category }) {
  const action = category ? updateCategoryAction.bind(null, category.id) : createCategoryAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <WindowPanel title={category ? "EDITAR CATEGORIA" : "NUEVA CATEGORIA"} className="max-w-md">
      <div className="p-5">
        <CategoryFormFields category={category} state={state} formAction={formAction} />
      </div>
    </WindowPanel>
  );
}
