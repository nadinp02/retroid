import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { FieldError } from "@/components/field-error";
import { BENEFIT_ICONS, BENEFIT_ICON_KEYS } from "@/lib/benefit-icons";
import type { FormState } from "@/types/form-state";
import type { Benefit } from "@/types/catalog";

// Los campos del form en sí, sin el marco visual — mismo patrón que
// marquee-item-form-fields.tsx.
export function BenefitFormFields({
  benefit,
  state,
  formAction,
}: {
  benefit?: Benefit;
  state: FormState;
  formAction: (formData: FormData) => void;
}) {
  const defaultIcon = benefit?.icon ?? BENEFIT_ICON_KEYS[0];

  return (
    <form action={formAction} className="space-y-5">
      {/* Grilla de radios nativos con el ícono como etiqueta: se ve qué se
          elige sin abrir un desplegable y funciona sin JS. */}
      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 font-mono text-xs leading-none font-medium tracking-wide text-muted-foreground uppercase">
          Ícono
        </legend>
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
          {BENEFIT_ICON_KEYS.map((key) => {
            const { label, icon: Icon } = BENEFIT_ICONS[key];
            return (
              <label
                key={key}
                title={label}
                className="flex aspect-square cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:border-accent/60 hover:text-foreground has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary has-focus-visible:ring-3 has-focus-visible:ring-accent/40"
              >
                <input
                  type="radio"
                  name="icon"
                  value={key}
                  defaultChecked={key === defaultIcon}
                  className="sr-only"
                  aria-label={label}
                />
                <Icon className="size-5" />
              </label>
            );
          })}
        </div>
        <FieldError message={state.errors.icon?.[0]} />
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={benefit?.title}
          maxLength={40}
          placeholder="Ej. Envíos a todo el país"
          required
        />
        <FieldError message={state.errors.title?.[0]} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="text">Descripción</Label>
        <Textarea
          id="text"
          name="text"
          rows={3}
          defaultValue={benefit?.text}
          maxLength={140}
          placeholder="Una o dos líneas que expliquen el beneficio."
          required
        />
        <p className="text-xs text-muted-foreground">
          En el detalle de producto se muestra solo el ícono y el título.
        </p>
        <FieldError message={state.errors.text?.[0]} />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="isActive" name="isActive" defaultChecked={benefit?.isActive ?? true} />
        <Label htmlFor="isActive">Activo</Label>
      </div>

      <SubmitButton className="w-full sm:w-auto">
        {benefit ? "Guardar cambios" : "Crear beneficio"}
      </SubmitButton>
    </form>
  );
}
