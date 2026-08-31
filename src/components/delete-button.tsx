"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
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
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage?: string;
  iconOnly?: boolean;
}) {
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
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" size="sm">Cancelar</Button>} />
          {/* Sin AlertDialogClose acá a propósito: el merge de props le
              inyectaría type="button" (ver AlertDialogClose/useButton) y
              pisaría el type="submit" de SubmitButton, dejando el form sin
              enviarse. El diálogo se cierra solo cuando la fila desaparece
              del listado tras el revalidatePath del delete. */}
          <form action={action}>
            <SubmitButton variant="destructive" size="sm">
              Eliminar
            </SubmitButton>
          </form>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
