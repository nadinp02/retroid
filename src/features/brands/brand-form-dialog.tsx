"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { createBrandModalAction, updateBrandModalAction } from "@/actions/brands/actions";
import { emptyFormState } from "@/types/form-state";
import type { Brand } from "@/types/catalog";
import { BrandFormFields } from "./brand-form-fields";

export function BrandFormDialog({
  open,
  onOpenChange,
  brand,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand;
}) {
  const router = useRouter();
  const action = brand ? updateBrandModalAction.bind(null, brand.id) : createBrandModalAction;
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
        <DialogTitle>{brand ? "Editar marca" : "Nueva marca"}</DialogTitle>
        <div className="p-5">
          <BrandFormFields brand={brand} state={state} formAction={formAction} />
        </div>
      </DialogPopup>
    </Dialog>
  );
}
