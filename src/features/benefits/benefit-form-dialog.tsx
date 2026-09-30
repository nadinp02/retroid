"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { createBenefitAction, updateBenefitAction } from "@/actions/benefits/actions";
import { emptyFormState } from "@/types/form-state";
import type { Benefit } from "@/types/catalog";
import { BenefitFormFields } from "./benefit-form-fields";

export function BenefitFormDialog({
  open,
  onOpenChange,
  benefit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit?: Benefit;
}) {
  const router = useRouter();
  const action = benefit ? updateBenefitAction.bind(null, benefit.id) : createBenefitAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogTitle>{benefit ? "Editar beneficio" : "Nuevo beneficio"}</DialogTitle>
        <div className="p-5">
          <BenefitFormFields benefit={benefit} state={state} formAction={formAction} />
        </div>
      </DialogPopup>
    </Dialog>
  );
}
