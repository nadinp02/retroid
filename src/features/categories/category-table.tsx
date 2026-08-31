import Link from "next/link";
import { Pencil } from "lucide-react";
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
import { DeleteButton } from "@/components/delete-button";
import { deleteCategoryAction } from "@/actions/categories/actions";
import type { Category } from "@/types/catalog";

export function CategoryTable({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no hay categorías.
      </p>
    );
  }

  return (
    <div className="overflow-hidden border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Slug</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
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
                  render={
                    <Link href={`/administracion/categorias/${category.id}/editar`}>
                      <Pencil className="size-3.5" />
                    </Link>
                  }
                />
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
  );
}
