"use client";

import { useActionState } from "react";
import { WindowPanel } from "@/components/ui/window-panel";
import { createBrandAction, updateBrandAction } from "@/actions/brands/actions";
import { emptyFormState } from "@/types/form-state";
import type { Brand } from "@/types/catalog";
import { BrandFormFields } from "./brand-form-fields";

// Versión standalone (/administracion/marcas/nueva y /[id]/editar): acceso
// directo por URL, las actions redirigen a la lista al terminar. Ver
// BrandFormDialog para la versión que se abre como modal desde la lista.
export function BrandForm({ brand }: { brand?: Brand }) {
  const action = brand ? updateBrandAction.bind(null, brand.id) : createBrandAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <WindowPanel title={brand ? "EDITAR MARCA" : "NUEVA MARCA"} className="max-w-md">
      <div className="p-5">
        <BrandFormFields brand={brand} state={state} formAction={formAction} />
      </div>
    </WindowPanel>
  );
}
