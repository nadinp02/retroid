"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Pencil } from "lucide-react";
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
import { deleteMarqueeItemAction, reorderMarqueeItemsAction } from "@/actions/marquee/actions";
import type { MarqueeItem } from "@/types/catalog";

export function MarqueeItemTable({ items }: { items: MarqueeItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no hay frases. La barra no se muestra si no hay ninguna activa.
      </p>
    );
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const orderedIds = items.map((item) => item.id);
    [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];

    setPendingId(items[index].id);
    setError(null);
    try {
      const result = await reorderMarqueeItemsAction(orderedIds);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <FieldError message={error ?? undefined} />
      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Orden</TableHead>
              <TableHead>Texto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={pendingId === item.id || index === 0}
                      onClick={() => handleMove(index, -1)}
                      aria-label={`Mover "${item.text}" antes`}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={pendingId === item.id || index === items.length - 1}
                      onClick={() => handleMove(index, 1)}
                      aria-label={`Mover "${item.text}" después`}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                  </div>
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
                    render={
                      <Link href={`/administracion/marquee/${item.id}/editar`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    }
                  />
                  <DeleteButton
                    action={deleteMarqueeItemAction.bind(null, item.id)}
                    confirmMessage={`¿Eliminar la frase "${item.text}"? Esta acción no se puede deshacer.`}
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
