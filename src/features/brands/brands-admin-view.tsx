"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowPanel } from "@/components/ui/window-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Brand } from "@/types/catalog";
import { BrandTable } from "./brand-table";
import { BrandFormDialog } from "./brand-form-dialog";

type DialogTarget = "new" | Brand | null;

export function BrandsAdminView({ brands }: { brands: Brand[] }) {
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionHeading>Marcas</SectionHeading>
          <p className="text-sm text-muted-foreground">
            {brands.length} marca{brands.length === 1 ? "" : "s"} en total
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setDialogTarget("new")}>
          <Plus className="size-4" />
          Nueva marca
        </Button>
      </div>

      <WindowPanel title="MARCAS" bodyClassName="p-4">
        <BrandTable brands={brands} onEdit={(brand) => setDialogTarget(brand)} />
      </WindowPanel>

      <BrandFormDialog
        key={dialogTarget === "new" ? "new" : (dialogTarget?.id ?? "closed")}
        open={dialogTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDialogTarget(null);
        }}
        brand={dialogTarget === "new" ? undefined : (dialogTarget ?? undefined)}
      />
    </div>
  );
}
