"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import {
  createMarqueeItemModalAction,
  updateMarqueeItemModalAction,
} from "@/actions/marquee/actions";
import { emptyFormState } from "@/types/form-state";
import type { MarqueeItem } from "@/types/catalog";
import { MarqueeItemFormFields } from "./marquee-item-form-fields";

export function MarqueeItemFormDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MarqueeItem;
}) {
  const router = useRouter();
  const action = item
    ? updateMarqueeItemModalAction.bind(null, item.id)
    : createMarqueeItemModalAction;
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
        <DialogTitle>{item ? "Editar frase" : "Nueva frase"}</DialogTitle>
        <div className="p-5">
          <MarqueeItemFormFields item={item} state={state} formAction={formAction} />
        </div>
      </DialogPopup>
    </Dialog>
  );
}
