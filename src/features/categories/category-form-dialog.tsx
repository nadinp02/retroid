"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { createCategoryModalAction, updateCategoryModalAction } from "@/actions/categories/actions";
import { emptyFormState } from "@/types/form-state";
import type { Category } from "@/types/catalog";
import { CategoryFormFields } from "./category-form-fields";

/**
 * Versión modal de CategoryForm: se abre sin navegar (desde CategoryTable),
 * y al guardar con éxito se cierra sola y refresca la lista in-place — sin
 * el viaje completo a /nueva o /[id]/editar y volver. `open`/`category`
 * los controla el padre (CategoryTable): un solo Dialog para crear y
 * editar, category ausente = modo alta.
 */
export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}) {
  const router = useRouter();
  const action = category
    ? updateCategoryModalAction.bind(null, category.id)
    : createCategoryModalAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
      router.refresh();
    }
    // Solo debe dispararse cuando state.success cambia a un valor nuevo, no
    // en cada re-render por onOpenChange/router (identidades nuevas cada
    // vez que el padre re-renderiza).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogTitle>{category ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        <div className="p-5">
          <CategoryFormFields category={category} state={state} formAction={formAction} />
        </div>
      </DialogPopup>
    </Dialog>
  );
}
