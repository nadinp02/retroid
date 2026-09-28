"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { FieldError } from "@/components/field-error";
import { emptyFormState, type FormState } from "@/types/form-state";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export function DeleteButton({
  action,
  confirmMessage = "¿Seguro que querés eliminar este elemento? Esta acción no se puede deshacer.",
  iconOnly = false,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  confirmMessage?: string;
  iconOnly?: boolean;
}) {
  const [state, formAction] = useActionState(action, emptyFormState);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          iconOnly ? (
            <Button variant="destructive" size="icon-sm" aria-label="Eliminar">
              <Trash2 className="size-3.5" />
            </Button>
          ) : (
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Trash2 className="size-3.5" />
              Eliminar
            </Button>
          )
        }
      />
      <AlertDialogPopup>
        <AlertDialogTitle>Eliminar</AlertDialogTitle>
        <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
        <FieldError message={state.errors._form?.[0]} />
        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            }
          />
          {/* Sin AlertDialogClose acá a propósito: el merge de props le
              inyectaría type="button" (ver AlertDialogClose/useButton) y
              pisaría el type="submit" de SubmitButton, dejando el form sin
              enviarse. Si el delete tiene éxito, el diálogo se cierra solo
              porque la fila desaparece del listado tras el revalidate; si
              falla (ver FieldError arriba), el diálogo sigue abierto con el
              motivo del error. */}
          <form action={formAction}>
            <SubmitButton variant="destructive" size="sm">
              Eliminar
            </SubmitButton>
          </form>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
