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
import type { ProductModalState } from "@/types/form-state";
import type { Category, Brand, Product } from "@/types/catalog";

// Client Component: no puede recibir el Decimal de Prisma como prop (no es
// serializable a través del límite server/client, ver el mismo comentario
// en product-table.tsx) — quien renderiza este form convierte a string
// antes de pasarlo.
export type ProductWithStringPrice = Omit<Product, "price"> & { price: string };

// Los campos del form en sí, sin el marco visual — mismo patrón que
// category-form-fields.tsx. isEditing decide el label del submit
// independientemente de si `product` viene con datos (ProductFormDialog lo
// usa para pasar de "crear" a "editar" sin remontar el form ni perder lo
// que el usuario ya escribió).
export function ProductFormFields({
  product,
  categories,
  brands,
  isEditing,
  state,
  formAction,
}: {
  product?: ProductWithStringPrice;
  categories: Category[];
  brands: Brand[];
  isEditing: boolean;
  state: ProductModalState;
  formAction: (formData: FormData) => void;
}) {
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
    <form action={formAction} className="space-y-5">
      <NameSlugFields
        initialName={product?.name}
        initialSlug={product?.slug}
        nameError={state.errors.name?.[0]}
        slugError={state.errors.slug?.[0]}
      />

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
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
            defaultValue={product?.price}
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
          <Select items={categorySelectItems} name="categoryId" defaultValue={product?.categoryId}>
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
          <Select items={brandSelectItems} name="brandId" defaultValue={product?.brandId ?? "none"}>
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
        {isEditing ? "Guardar cambios" : "Crear producto"}
      </SubmitButton>
    </form>
  );
}
