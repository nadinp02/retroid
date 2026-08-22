"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WindowPanel } from "@/components/ui/window-panel";
import type { Category, Brand } from "@/types/catalog";

const ALL_VALUE = "todas";

function hrefFor(params: { categoria?: string; marca?: string; q?: string }) {
  const usp = new URLSearchParams();
  if (params.categoria) usp.set("categoria", params.categoria);
  if (params.marca) usp.set("marca", params.marca);
  if (params.q) usp.set("q", params.q);
  const qs = usp.toString();
  return `/productos${qs ? `?${qs}` : ""}`;
}

export function ProductFilters({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  search,
}: {
  categories: Category[];
  brands: Brand[];
  selectedCategory?: string;
  selectedBrand?: string;
  search?: string;
}) {
  const router = useRouter();

  // Se pasan explícitamente como `items` porque <SelectValue> resuelve la
  // etiqueta contra esa lista (no contra los <SelectItem> hijos), y sin
  // esto el trigger muestra el value crudo (slug) en vez del nombre.
  const categoryItems = [
    { value: ALL_VALUE, label: "Todas las categorías" },
    ...categories.map((category) => ({ value: category.slug, label: category.name })),
  ];
  const brandItems = [
    { value: ALL_VALUE, label: "Todas las marcas" },
    ...brands.map((brand) => ({ value: brand.slug, label: brand.name })),
  ];

  return (
    <WindowPanel title="FILTROS" bodyClassName="space-y-2 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form method="get" action="/productos" className="relative sm:min-w-48 sm:flex-1">
          {selectedCategory && <input type="hidden" name="categoria" value={selectedCategory} />}
          {selectedBrand && <input type="hidden" name="marca" value={selectedBrand} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="q" className="sr-only">
            Buscar productos
          </label>
          <Input
            id="q"
            type="text"
            name="q"
            placeholder="Buscar productos..."
            defaultValue={search}
            className="pl-9"
          />
        </form>

        <div className="flex gap-2">
          {categories.length > 0 && (
            <Select
              items={categoryItems}
              value={selectedCategory ?? ALL_VALUE}
              onValueChange={(value) =>
                router.push(
                  hrefFor({
                    categoria: !value || value === ALL_VALUE ? undefined : value,
                    marca: selectedBrand,
                    q: search,
                  })
                )
              }
            >
              <SelectTrigger className="flex-1 sm:w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {brands.length > 0 && (
            <Select
              items={brandItems}
              value={selectedBrand ?? ALL_VALUE}
              onValueChange={(value) =>
                router.push(
                  hrefFor({
                    categoria: selectedCategory,
                    marca: !value || value === ALL_VALUE ? undefined : value,
                    q: search,
                  })
                )
              }
            >
              <SelectTrigger className="flex-1 sm:w-40">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todas las marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.slug}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </WindowPanel>
  );
}
