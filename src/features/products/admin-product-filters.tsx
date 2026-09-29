"use client";

import { useEffect, useRef, useState } from "react";
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
import type { Category, Brand } from "@/types/catalog";

const ALL_VALUE = "todos";
const SEARCH_DEBOUNCE_MS = 350;

function hrefFor(params: { categoria?: string; marca?: string; estado?: string; q?: string }) {
  const usp = new URLSearchParams();
  if (params.categoria) usp.set("categoria", params.categoria);
  if (params.marca) usp.set("marca", params.marca);
  if (params.estado) usp.set("estado", params.estado);
  if (params.q) usp.set("q", params.q);
  const qs = usp.toString();
  return `/administracion/productos${qs ? `?${qs}` : ""}`;
}

/**
 * Filtros del admin de productos, en vivo: cada cambio navega solo (los
 * selects al instante, la búsqueda con un debounce corto), sin botón
 * "Filtrar" — antes el buscador ni siquiera estaba conectado a los
 * resultados (era decorativo) y había que apretar un botón para el resto.
 */
export function AdminProductFilters({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedStatus,
  search,
}: {
  categories: Category[];
  brands: Brand[];
  selectedCategory?: string;
  selectedBrand?: string;
  selectedStatus?: string;
  search?: string;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search ?? "");
  const isFirstRender = useRef(true);

  // Debounce: navega recién SEARCH_DEBOUNCE_MS después de que la persona
  // deja de tipear, no en cada tecla — evita un round-trip al server por
  // carácter. Los selects no lo necesitan: onValueChange ya es "un cambio
  // discreto", no una tecla a la vez.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      router.push(
        hrefFor({
          categoria: selectedCategory,
          marca: selectedBrand,
          estado: selectedStatus,
          q: searchValue || undefined,
        }),
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const categoryItems = [
    { value: ALL_VALUE, label: "Todas" },
    ...categories.map((category) => ({ value: category.slug, label: category.name })),
  ];
  const brandItems = [
    { value: ALL_VALUE, label: "Todas" },
    ...brands.map((brand) => ({ value: brand.slug, label: brand.name })),
  ];
  const statusItems = [
    { value: ALL_VALUE, label: "Todos" },
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <label htmlFor="admin-product-search" className="sr-only">
          Buscar productos
        </label>
        <Input
          id="admin-product-search"
          type="text"
          placeholder="Buscar productos..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={categoryItems}
          value={selectedCategory ?? ALL_VALUE}
          onValueChange={(value) =>
            router.push(
              hrefFor({
                categoria: !value || value === ALL_VALUE ? undefined : value,
                marca: selectedBrand,
                estado: selectedStatus,
                q: searchValue || undefined,
              }),
            )
          }
        >
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todas</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={brandItems}
          value={selectedBrand ?? ALL_VALUE}
          onValueChange={(value) =>
            router.push(
              hrefFor({
                categoria: selectedCategory,
                marca: !value || value === ALL_VALUE ? undefined : value,
                estado: selectedStatus,
                q: searchValue || undefined,
              }),
            )
          }
        >
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.slug}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={statusItems}
          value={selectedStatus ?? ALL_VALUE}
          onValueChange={(value) =>
            router.push(
              hrefFor({
                categoria: selectedCategory,
                marca: selectedBrand,
                estado: !value || value === ALL_VALUE ? undefined : value,
                q: searchValue || undefined,
              }),
            )
          }
        >
          <SelectTrigger size="sm" className="w-32">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
