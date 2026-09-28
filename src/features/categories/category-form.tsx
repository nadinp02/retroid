"use client";

import { useActionState } from "react";
import { WindowPanel } from "@/components/ui/window-panel";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { NameSlugFields } from "@/components/name-slug-fields";
import { createCategoryAction, updateCategoryAction } from "@/actions/categories/actions";
import { emptyFormState } from "@/types/form-state";
import type { Category } from "@/types/catalog";

export function CategoryForm({ category }: { category?: Category }) {
  const action = category ? updateCategoryAction.bind(null, category.id) : createCategoryAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <WindowPanel title={category ? "EDITAR CATEGORIA" : "NUEVA CATEGORIA"} className="max-w-md">
      <div className="p-5">
        <form action={formAction} className="space-y-5">
          <NameSlugFields
            initialName={category?.name}
            initialSlug={category?.slug}
            nameError={state.errors.name?.[0]}
            slugError={state.errors.slug?.[0]}
          />

          <div className="flex items-center gap-2">
            <Checkbox id="isActive" name="isActive" defaultChecked={category?.isActive ?? true} />
            <Label htmlFor="isActive">Activa</Label>
          </div>

          <SubmitButton className="w-full sm:w-auto">
            {category ? "Guardar cambios" : "Crear categoría"}
          </SubmitButton>
        </form>
      </div>
    </WindowPanel>
  );
}
