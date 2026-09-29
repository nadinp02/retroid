import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { FieldError } from "@/components/field-error";
import type { FormState } from "@/types/form-state";
import type { MarqueeItem } from "@/types/catalog";

// Los campos del form en sí, sin el marco visual — mismo patrón que
// category-form-fields.tsx.
export function MarqueeItemFormFields({
  item,
  state,
  formAction,
}: {
  item?: MarqueeItem;
  state: FormState;
  formAction: (formData: FormData) => void;
}) {
  return (
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
  );
}
