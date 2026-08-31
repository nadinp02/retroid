"use client";

import { useActionState } from "react";
import { WindowPanel } from "@/components/ui/window-panel";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { NameSlugFields } from "@/components/name-slug-fields";
import { createBrandAction, updateBrandAction } from "@/actions/brands/actions";
import { emptyFormState } from "@/types/form-state";
import type { Brand } from "@/types/catalog";

export function BrandForm({ brand }: { brand?: Brand }) {
  const action = brand ? updateBrandAction.bind(null, brand.id) : createBrandAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <WindowPanel title={brand ? "EDITAR MARCA" : "NUEVA MARCA"} className="max-w-md">
      <div className="p-5">
        <form action={formAction} className="space-y-5">
          <NameSlugFields
            initialName={brand?.name}
            initialSlug={brand?.slug}
            nameError={state.errors.name?.[0]}
            slugError={state.errors.slug?.[0]}
          />

          <div className="flex items-center gap-2">
            <Checkbox id="isActive" name="isActive" defaultChecked={brand?.isActive ?? true} />
            <Label htmlFor="isActive">Activa</Label>
          </div>

          <SubmitButton className="w-full sm:w-auto">
            {brand ? "Guardar cambios" : "Crear marca"}
          </SubmitButton>
        </form>
      </div>
    </WindowPanel>
  );
}
