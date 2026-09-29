import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { NameSlugFields } from "@/components/name-slug-fields";
import type { FormState } from "@/types/form-state";
import type { Category } from "@/types/catalog";

/**
 * Los campos del form en sí, sin el marco visual (WindowPanel en la página
 * standalone, DialogPopup en el modal) — así CategoryForm y
 * CategoryFormDialog comparten el mismo markup/validación sin duplicarlo,
 * cada uno decide su propia action (redirect-based vs modal) y su propio
 * envoltorio.
 */
export function CategoryFormFields({
  category,
  state,
  formAction,
}: {
  category?: Category;
  state: FormState;
  formAction: (formData: FormData) => void;
}) {
  return (
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
  );
}
