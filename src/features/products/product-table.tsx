"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteButton } from "@/components/delete-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  deleteProductAction,
  bulkDeleteProductsAction,
  bulkUpdateProductsAction,
} from "@/actions/products/actions";
import { formatPrice } from "@/utils/price";
import type { ProductListItem, Category, Brand } from "@/types/catalog";

const NO_CHANGE = "__no_change__";
const NO_BRAND = "__no_brand__";

// Client Components no pueden recibir el Decimal de Prisma como prop (no es
// serializable a través del límite server/client) — la página lo convierte
// a string antes de pasarlo.
export type ProductRow = Omit<ProductListItem, "price"> & { price: string };

export function ProductTable({
  products,
  categories,
  brands,
}: {
  products: ProductRow[];
  categories: Category[];
  brands: Brand[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState(NO_CHANGE);
  const [bulkBrandId, setBulkBrandId] = useState(NO_CHANGE);
  const [bulkStatus, setBulkStatus] = useState(NO_CHANGE);
  const [isPending, startTransition] = useTransition();

  if (products.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Todavía no hay productos.
      </p>
    );
  }

  const allSelected = selected.size > 0 && selected.size === products.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((product) => product.id)));
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
    setEditing(false);
    setBulkCategoryId(NO_CHANGE);
    setBulkBrandId(NO_CHANGE);
    setBulkStatus(NO_CHANGE);
  }

  function confirmBulkDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkDeleteProductsAction(ids);
      clearSelection();
    });
  }

  function handleBulkApply() {
    const data: { categoryId?: string; brandId?: string | null; isActive?: boolean } = {};
    if (bulkCategoryId !== NO_CHANGE) data.categoryId = bulkCategoryId;
    if (bulkBrandId !== NO_CHANGE) data.brandId = bulkBrandId === NO_BRAND ? null : bulkBrandId;
    if (bulkStatus !== NO_CHANGE) data.isActive = bulkStatus === "activo";

    if (Object.keys(data).length === 0) {
      setEditing(false);
      return;
    }

    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkUpdateProductsAction(ids, data);
      clearSelection();
    });
  }

  // Se pasan explícitamente como `items` porque <SelectValue> resuelve la
  // etiqueta contra esa lista (no contra los <SelectItem> hijos), y sin
  // esto el trigger muestra el value crudo (id/slug) en vez del nombre.
  const categorySelectItems = [
    { value: NO_CHANGE, label: "No cambiar categoría" },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];
  const brandSelectItems = [
    { value: NO_CHANGE, label: "No cambiar marca" },
    { value: NO_BRAND, label: "Sin marca" },
    ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
  ];
  const statusSelectItems = [
    { value: NO_CHANGE, label: "No cambiar estado" },
    { value: "activo", label: "Activar" },
    { value: "inactivo", label: "Desactivar" },
  ];

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-2">
          <span className="font-mono text-xs font-medium tracking-wide uppercase">
            {selected.size} seleccionado{selected.size === 1 ? "" : "s"}
          </span>

          {editing ? (
            <>
              <Select
                items={categorySelectItems}
                value={bulkCategoryId}
                onValueChange={(value) => setBulkCategoryId(value ?? NO_CHANGE)}
              >
                <SelectTrigger size="sm" className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CHANGE}>No cambiar categoría</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                items={brandSelectItems}
                value={bulkBrandId}
                onValueChange={(value) => setBulkBrandId(value ?? NO_CHANGE)}
              >
                <SelectTrigger size="sm" className="w-40">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CHANGE}>No cambiar marca</SelectItem>
                  <SelectItem value={NO_BRAND}>Sin marca</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                items={statusSelectItems}
                value={bulkStatus}
                onValueChange={(value) => setBulkStatus(value ?? NO_CHANGE)}
              >
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CHANGE}>No cambiar estado</SelectItem>
                  <SelectItem value="activo">Activar</SelectItem>
                  <SelectItem value="inactivo">Desactivar</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" disabled={isPending} onClick={handleBulkApply}>
                  Aplicar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={isPending}
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-3.5" />
                Editar
              </Button>
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="destructive" className="gap-1.5" disabled={isPending}>
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </Button>
                }
                title="Eliminar productos"
                description={`¿Eliminar ${selected.size} producto${selected.size === 1 ? "" : "s"}? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                onConfirm={confirmBulkDelete}
              />
              <Button size="sm" variant="ghost" disabled={isPending} onClick={clearSelection}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Seleccionar todos"
                />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="hidden lg:table-cell">Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Edición</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(product.id)}
                    onCheckedChange={() => toggleOne(product.id)}
                    aria-label={`Seleccionar ${product.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {product.category.name}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {product.brand?.name ?? "Sin marca"}
                </TableCell>
                <TableCell className="font-mono text-primary">
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {product.isLimitedEdition ? (
                    <Badge variant="accent">Limitada</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Editar ${product.name}`}
                    render={
                      <Link href={`/administracion/productos/${product.id}/editar`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    }
                  />
                  <DeleteButton
                    action={deleteProductAction.bind(null, product.id)}
                    confirmMessage={`¿Eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`}
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
