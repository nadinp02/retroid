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
import { deleteBrandAction } from "@/actions/brands/actions";
import type { Brand } from "@/types/catalog";

export function BrandTable({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no hay marcas.
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
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {brand.slug}
              </TableCell>
              <TableCell>
                <Badge variant={brand.isActive ? "success" : "secondary"}>
                  {brand.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Editar ${brand.name}`}
                  render={
                    <Link href={`/administracion/marcas/${brand.id}/editar`}>
                      <Pencil className="size-3.5" />
                    </Link>
                  }
                />
                <DeleteButton
                  action={deleteBrandAction.bind(null, brand.id)}
                  confirmMessage={`¿Eliminar la marca "${brand.name}"? Esta acción no se puede deshacer.`}
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
