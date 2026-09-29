"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowPanel } from "@/components/ui/window-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MarqueeItem } from "@/types/catalog";
import { MarqueeItemTable } from "./marquee-item-table";
import { MarqueeItemFormDialog } from "./marquee-item-form-dialog";

type DialogTarget = "new" | MarqueeItem | null;

export function MarqueeAdminView({ items }: { items: MarqueeItem[] }) {
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionHeading>Barra promocional</SectionHeading>
          <p className="text-sm text-muted-foreground">
            Frases que rotan en la barra debajo del header del sitio público.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setDialogTarget("new")}>
          <Plus className="size-4" />
          Nueva frase
        </Button>
      </div>

      <WindowPanel title="Barra promocional" bodyClassName="p-4">
        <MarqueeItemTable items={items} onEdit={(item) => setDialogTarget(item)} />
      </WindowPanel>

      <MarqueeItemFormDialog
        key={dialogTarget === "new" ? "new" : (dialogTarget?.id ?? "closed")}
        open={dialogTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDialogTarget(null);
        }}
        item={dialogTarget === "new" ? undefined : (dialogTarget ?? undefined)}
      />
    </div>
  );
}
