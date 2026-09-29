"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WindowPanel } from "@/components/ui/window-panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Category, Brand } from "@/types/catalog";
import { ProductTable, type ProductRow } from "./product-table";
import { AdminProductFilters } from "./admin-product-filters";
import { ProductFormDialog } from "./product-form-dialog";

type DialogTarget = "new" | ProductRow | null;

export function ProductsAdminView({
  products,
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  selectedStatus,
  search,
}: {
  products: ProductRow[];
  categories: Category[];
  brands: Brand[];
  selectedCategory?: string;
  selectedBrand?: string;
  selectedStatus?: string;
  search?: string;
}) {
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionHeading>Productos</SectionHeading>
          <p className="text-sm text-muted-foreground">
            {products.length} producto{products.length === 1 ? "" : "s"} en total
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setDialogTarget("new")}>
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </div>

      <WindowPanel title="PRODUCTOS" bodyClassName="space-y-4 p-4">
        <AdminProductFilters
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          selectedBrand={selectedBrand}
          selectedStatus={selectedStatus}
          search={search}
        />

        <ProductTable
          products={products}
          categories={categories}
          brands={brands}
          onEdit={(product) => setDialogTarget(product)}
        />
      </WindowPanel>

      <ProductFormDialog
        key={dialogTarget === "new" ? "new" : (dialogTarget?.id ?? "closed")}
        open={dialogTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDialogTarget(null);
        }}
        product={dialogTarget === "new" ? undefined : (dialogTarget ?? undefined)}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
