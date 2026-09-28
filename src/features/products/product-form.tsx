"use client";

import { useActionState } from "react";
import { WindowPanel } from "@/components/ui/window-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { FieldError } from "@/components/field-error";
import { NameSlugFields } from "@/components/name-slug-fields";
import { createProductAction, updateProductAction } from "@/actions/products/actions";
import { emptyFormState } from "@/types/form-state";
import type { Category, Brand, Product } from "@/types/catalog";

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product;
  categories: Category[];
  brands: Brand[];
}) {
  const action = product ? updateProductAction.bind(null, product.id) : createProductAction;
  const [state, formAction] = useActionState(action, emptyFormState);

  // Se pasan explícitamente como `items` porque <SelectValue> resuelve la
  // etiqueta contra esa lista (no contra los <SelectItem> hijos, que viven
  // en un Portal), y sin esto el trigger muestra el value crudo (el cuid)
  // en vez del nombre — lo mismo que ya se resolvió en product-table.tsx.
  const categorySelectItems = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
  const brandSelectItems = [
    { value: "none", label: "Sin marca" },
    ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
  ];

  return (
    <WindowPanel title={product ? "EDITAR PRODUCTO" : "NUEVO PRODUCTO"} className="max-w-xl">
      <div className="p-5">
        <form action={formAction} className="space-y-5">
          <NameSlugFields
            initialName={product?.name}
            initialSlug={product?.slug}
            nameError={state.errors.name?.[0]}
            slugError={state.errors.slug?.[0]}
          />

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
            />
            <FieldError message={state.errors.description?.[0]} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.price.toString()}
                required
              />
              <FieldError message={state.errors.price?.[0]} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                step="1"
                min="0"
                defaultValue={product?.stock ?? 0}
                required
              />
              <FieldError message={state.errors.stock?.[0]} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Categoría</Label>
              <Select
                items={categorySelectItems}
                name="categoryId"
                defaultValue={product?.categoryId}
              >
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue placeholder="Elegir categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={state.errors.categoryId?.[0]} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandId">Marca</Label>
              <Select
                items={brandSelectItems}
                name="brandId"
                defaultValue={product?.brandId ?? "none"}
              >
                <SelectTrigger id="brandId" className="w-full">
                  <SelectValue placeholder="Sin marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin marca</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <Checkbox id="isActive" name="isActive" defaultChecked={product?.isActive ?? true} />
              <Label htmlFor="isActive">Activo</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isLimitedEdition"
                name="isLimitedEdition"
                defaultChecked={product?.isLimitedEdition ?? false}
              />
              <Label htmlFor="isLimitedEdition">Edición limitada</Label>
            </div>
          </div>

          <SubmitButton className="w-full sm:w-auto">
            {product ? "Guardar cambios" : "Crear producto"}
          </SubmitButton>
        </form>
      </div>
    </WindowPanel>
  );
}
