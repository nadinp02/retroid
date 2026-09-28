"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

/**
 * Confirmación para acciones disparadas por onClick (no un <form action>
 * de server action) — bulk delete, borrar una imagen, etc. Para el caso de
 * un único form action, ver DeleteButton.
 */
export function ConfirmDialog({
  trigger,
  title = "Confirmar",
  description,
  confirmLabel = "Confirmar",
  onConfirm,
}: {
  trigger: ReactElement;
  title?: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogPopup>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            }
          />
          <AlertDialogClose
            render={
              <Button variant="destructive" size="sm" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
