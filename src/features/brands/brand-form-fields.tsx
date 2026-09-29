import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { NameSlugFields } from "@/components/name-slug-fields";
import type { FormState } from "@/types/form-state";
import type { Brand } from "@/types/catalog";

// Los campos del form en sí, sin el marco visual (WindowPanel en la página
// standalone, DialogPopup en el modal) — mismo patrón que
// category-form-fields.tsx.
export function BrandFormFields({
  brand,
  state,
  formAction,
}: {
  brand?: Brand;
  state: FormState;
  formAction: (formData: FormData) => void;
}) {
  return (
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
  );
}
