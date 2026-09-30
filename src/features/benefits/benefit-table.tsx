"use client";

import { useEffect, useState } from "react";
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
import { GripVertical, Pencil } from "lucide-react";
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
import { FieldError } from "@/components/field-error";
import { DeleteButton } from "@/components/delete-button";
import { deleteBenefitAction, reorderBenefitsAction } from "@/actions/benefits/actions";
import { getBenefitIcon } from "@/lib/benefit-icons";
import type { Benefit } from "@/types/catalog";

function SortableRow({
  benefit,
  onEdit,
}: {
  benefit: Benefit;
  onEdit: (benefit: Benefit) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: benefit.id,
  });
  const Icon = getBenefitIcon(benefit.icon);

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 bg-card" : undefined}
    >
      <TableCell>
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reordenar "${benefit.title}" (arrastrar)`}
          className="flex size-7 cursor-grab items-center justify-center text-muted-foreground touch-none hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium">{benefit.title}</p>
            <p className="text-xs whitespace-normal text-muted-foreground">{benefit.text}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={benefit.isActive ? "success" : "secondary"}>
          {benefit.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Editar "${benefit.title}"`}
            onClick={() => onEdit(benefit)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <DeleteButton
            action={deleteBenefitAction.bind(null, benefit.id)}
            confirmMessage={`¿Eliminar el beneficio "${benefit.title}"? Esta acción no se puede deshacer.`}
            iconOnly
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BenefitTable({
  benefits,
  onEdit,
}: {
  benefits: Benefit[];
  onEdit: (benefit: Benefit) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Estado local para reflejar el nuevo orden al soltar sin esperar al
  // server — mismo patrón que MarqueeItemTable.
  const [ordered, setOrdered] = useState(benefits);
  useEffect(() => {
    setOrdered(benefits);
  }, [benefits]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (ordered.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no hay beneficios. La franja no se muestra si no hay ninguno activo.
      </p>
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((benefit) => benefit.id === active.id);
    const newIndex = ordered.findIndex((benefit) => benefit.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(reordered);
    setError(null);

    const result = await reorderBenefitsAction(reordered.map((benefit) => benefit.id));
    if (!result.ok) {
      setError(result.error);
      setOrdered(benefits);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <FieldError message={error ?? undefined} />
      <div className="overflow-hidden border border-border">
        {/* DndContext envuelve la tabla entera, no solo tbody — ver el
            comentario equivalente en MarqueeItemTable. */}
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <span className="sr-only">Orden</span>
                </TableHead>
                <TableHead>Beneficio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <SortableContext
              items={ordered.map((benefit) => benefit.id)}
              strategy={verticalListSortingStrategy}
            >
              <TableBody>
                {ordered.map((benefit) => (
                  <SortableRow key={benefit.id} benefit={benefit} onEdit={onEdit} />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
