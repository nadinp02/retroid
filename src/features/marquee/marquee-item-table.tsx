"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
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
  deleteMarqueeItemAction,
  reorderMarqueeItemsAction,
  bulkDeleteMarqueeItemsAction,
  bulkUpdateMarqueeItemsActiveAction,
} from "@/actions/marquee/actions";
import type { MarqueeItem } from "@/types/catalog";

function SortableRow({
  item,
  selected,
  onToggle,
  onEdit,
}: {
  item: MarqueeItem;
  selected: boolean;
  onToggle: () => void;
  onEdit: (item: MarqueeItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 bg-card" : undefined}
    >
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Seleccionar "${item.text}"`}
        />
      </TableCell>
      <TableCell>
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reordenar "${item.text}" (arrastrar)`}
          className="flex size-7 cursor-grab items-center justify-center text-muted-foreground touch-none hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{item.text}</TableCell>
      <TableCell>
        <Badge variant={item.isActive ? "success" : "secondary"}>
          {item.isActive ? "Activa" : "Inactiva"}
        </Badge>
      </TableCell>
      <TableCell className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Editar "${item.text}"`}
          onClick={() => onEdit(item)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <DeleteButton
          action={deleteMarqueeItemAction.bind(null, item.id)}
          confirmMessage={`¿Eliminar la frase "${item.text}"? Esta acción no se puede deshacer.`}
          iconOnly
        />
      </TableCell>
    </TableRow>
  );
}

export function MarqueeItemTable({
  items,
  onEdit,
}: {
  items: MarqueeItem[];
  onEdit: (item: MarqueeItem) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  // Estado local para poder reflejar el nuevo orden al soltar sin esperar
  // el viaje al server — reorderMarqueeItemsAction + router.refresh()
  // corrigen/confirman detrás. Se resincroniza cuando cambian los items
  // desde el padre (ej. después de un borrado masivo).
  const [orderedItems, setOrderedItems] = useState(items);
  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (orderedItems.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no hay frases. La barra no se muestra si no hay ninguna activa.
      </p>
    );
  }

  const allSelected = selected.size > 0 && selected.size === orderedItems.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(orderedItems.map((item) => item.id)));
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
      const result = await bulkDeleteMarqueeItemsAction(ids);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearSelection();
      router.refresh();
    });
  }

  function handleBulkSetActive(isActive: boolean) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkUpdateMarqueeItemsActiveAction(ids, isActive);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearSelection();
      router.refresh();
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedItems, oldIndex, newIndex);
    setOrderedItems(reordered);
    setError(null);

    const result = await reorderMarqueeItemsAction(reordered.map((item) => item.id));
    if (!result.ok) {
      setError(result.error);
      setOrderedItems(items);
      return;
    }
    router.refresh();
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
              title="Eliminar frases"
              description={`¿Eliminar ${selected.size} frase${selected.size === 1 ? "" : "s"}? Esta acción no se puede deshacer.`}
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
        {/* DndContext envuelve la tabla entera (no solo tbody): internamente
            agrega elementos propios (foco, anuncios para lectores de
            pantalla) como hermanos de su children — colocarlo dentro de
            <table>, entre <thead> y <tbody>, insertaría ahí markup ajeno e
            inválido. SortableContext sí es seguro anidarlo directo (solo un
            Context.Provider, sin nodo propio). */}
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
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
                <TableHead className="w-10">
                  <span className="sr-only">Orden</span>
                </TableHead>
                <TableHead>Texto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={orderedItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {orderedItems.map((item) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    selected={selected.has(item.id)}
                    onToggle={() => toggleOne(item.id)}
                    onEdit={onEdit}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
