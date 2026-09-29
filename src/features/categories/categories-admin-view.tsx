"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowPanel } from "@/components/ui/window-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Category } from "@/types/catalog";
import { CategoryTable } from "./category-table";
import { CategoryFormDialog } from "./category-form-dialog";

type DialogTarget = "new" | Category | null;

/**
 * Dueño del estado del modal (crear/editar) — la página que lo usa queda
 * como Server Component puro (solo trae los datos), esto es lo único que
 * necesita ser Client Component. Prueba piloto del patrón "editar abre un
 * modal en vez de navegar" — si funciona bien se replica en el resto de
 * las secciones del admin.
 */
export function CategoriesAdminView({ categories }: { categories: Category[] }) {
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionHeading>Categorías</SectionHeading>
          <p className="text-sm text-muted-foreground">
            {categories.length} categoría{categories.length === 1 ? "" : "s"} en total
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setDialogTarget("new")}>
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </div>

      <WindowPanel title="Categorías" bodyClassName="p-4">
        <CategoryTable categories={categories} onEdit={(category) => setDialogTarget(category)} />
      </WindowPanel>

      <CategoryFormDialog
        key={dialogTarget === "new" ? "new" : (dialogTarget?.id ?? "closed")}
        open={dialogTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDialogTarget(null);
        }}
        category={dialogTarget === "new" ? undefined : (dialogTarget ?? undefined)}
      />
    </div>
  );
}
