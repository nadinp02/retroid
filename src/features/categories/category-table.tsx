"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/field-error";
import { DeleteButton } from "@/components/delete-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  deleteCategoryAction,
  bulkDeleteCategoriesAction,
  bulkUpdateCategoriesActiveAction,
} from "@/actions/categories/actions";
import type { Category } from "@/types/catalog";

export function CategoryTable({
  categories,
  onEdit,
}: {
  categories: Category[];
  onEdit: (category: Category) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (categories.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no hay categorías.
      </p>
    );
  }

  const allSelected = selected.size > 0 && selected.size === categories.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(categories.map((category) => category.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setError(null);
  }

  function confirmBulkDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkDeleteCategoriesAction(ids);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearSelection();
    });
  }

  function handleBulkSetActive(isActive: boolean) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkUpdateCategoriesActiveAction(ids, isActive);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearSelection();
    });
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-2">
          <span className="font-mono text-xs font-medium tracking-wide uppercase">
            {selected.size} seleccionada{selected.size === 1 ? "" : "s"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={isPending}
              onClick={() => handleBulkSetActive(true)}
            >
              <Eye className="size-3.5" />
              Activar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={isPending}
              onClick={() => handleBulkSetActive(false)}
            >
              <EyeOff className="size-3.5" />
              Desactivar
            </Button>
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="destructive" className="gap-1.5" disabled={isPending}>
                  <Trash2 className="size-3.5" />
                  Eliminar
                </Button>
              }
              title="Eliminar categorías"
              description={`¿Eliminar ${selected.size} categoría${selected.size === 1 ? "" : "s"}? Esta acción no se puede deshacer.`}
              confirmLabel="Eliminar"
              onConfirm={confirmBulkDelete}
            />
            <Button size="sm" variant="ghost" disabled={isPending} onClick={clearSelection}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <FieldError message={error ?? undefined} />

      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Seleccionar todas"
                />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(category.id)}
                    onCheckedChange={() => toggleOne(category.id)}
                    aria-label={`Seleccionar ${category.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {category.slug}
                </TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? "success" : "secondary"}>
                    {category.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Editar ${category.name}`}
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <DeleteButton
                    action={deleteCategoryAction.bind(null, category.id)}
                    confirmMessage={`¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`}
                    iconOnly
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
