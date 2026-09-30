"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowPanel } from "@/components/ui/window-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Benefit } from "@/types/catalog";
import { BenefitTable } from "./benefit-table";
import { BenefitFormDialog } from "./benefit-form-dialog";

type DialogTarget = "new" | Benefit | null;

export function BenefitsAdminView({ benefits }: { benefits: Benefit[] }) {
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionHeading>Beneficios</SectionHeading>
          <p className="text-sm text-muted-foreground">
            Franja debajo del hero de la Home y resumen en el detalle de producto. Se ven mejor
            entre 2 y 4 activos.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setDialogTarget("new")}>
          <Plus className="size-4" />
          Nuevo beneficio
        </Button>
      </div>

      <WindowPanel title="Beneficios" bodyClassName="p-4">
        <BenefitTable benefits={benefits} onEdit={(benefit) => setDialogTarget(benefit)} />
      </WindowPanel>

      <BenefitFormDialog
        key={dialogTarget === "new" ? "new" : (dialogTarget?.id ?? "closed")}
        open={dialogTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDialogTarget(null);
        }}
        benefit={dialogTarget === "new" ? undefined : (dialogTarget ?? undefined)}
      />
    </div>
  );
}
