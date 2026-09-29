"use client";

import { useActionState } from "react";
import { WindowPanel } from "@/components/ui/window-panel";
import { createMarqueeItemAction, updateMarqueeItemAction } from "@/actions/marquee/actions";
import { emptyFormState } from "@/types/form-state";
import type { MarqueeItem } from "@/types/catalog";
import { MarqueeItemFormFields } from "./marquee-item-form-fields";

// Versión standalone (/administracion/marquee/nuevo y /[id]/editar): acceso
// directo por URL, las actions redirigen a la lista al terminar. Ver
// MarqueeItemFormDialog para la versión que se abre como modal.
export function MarqueeItemForm({ item }: { item?: MarqueeItem }) {
  const action = item ? updateMarqueeItemAction.bind(null, item.id) : createMarqueeItemAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <WindowPanel title={item ? "EDITAR FRASE" : "NUEVA FRASE"} className="max-w-md">
      <div className="p-5">
        <MarqueeItemFormFields item={item} state={state} formAction={formAction} />
      </div>
    </WindowPanel>
  );
}
