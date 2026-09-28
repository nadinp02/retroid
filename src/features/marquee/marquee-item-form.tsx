"use client";

import { useActionState } from "react";
import { WindowPanel } from "@/components/ui/window-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { FieldError } from "@/components/field-error";
import { createMarqueeItemAction, updateMarqueeItemAction } from "@/actions/marquee/actions";
import { emptyFormState } from "@/types/form-state";
import type { MarqueeItem } from "@/types/catalog";

export function MarqueeItemForm({ item }: { item?: MarqueeItem }) {
  const action = item ? updateMarqueeItemAction.bind(null, item.id) : createMarqueeItemAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <WindowPanel title={item ? "EDITAR FRASE" : "NUEVA FRASE"} className="max-w-md">
      <div className="p-5">
        <form action={formAction} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="text">Texto</Label>
            <Input id="text" name="text" defaultValue={item?.text} maxLength={120} required />
            <FieldError message={state.errors.text?.[0]} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="isActive" name="isActive" defaultChecked={item?.isActive ?? true} />
            <Label htmlFor="isActive">Activa</Label>
          </div>

          <SubmitButton className="w-full sm:w-auto">
            {item ? "Guardar cambios" : "Crear frase"}
          </SubmitButton>
        </form>
      </div>
    </WindowPanel>
  );
}
