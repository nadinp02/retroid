import Link from "next/link";
import { Plus } from "lucide-react";
import { listCategories } from "@/services/categories";
import { CategoryTable } from "@/features/categories/category-table";
import { Button } from "@/components/ui/button";
import { WindowPanel } from "@/components/ui/window-panel";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function CategoríasPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionHeading>Categorías</SectionHeading>
          <p className="text-sm text-muted-foreground">
            {categories.length} categoría{categories.length === 1 ? "" : "s"} en total
          </p>
        </div>
        <Button
          className="gap-1.5"
          render={
            <Link href="/administracion/categorias/nueva">
              <Plus className="size-4" />
              Nueva categoría
            </Link>
          }
        />
      </div>
      <WindowPanel title="Categorías" bodyClassName="p-4">
        <CategoryTable categories={categories} />
      </WindowPanel>
    </div>
  );
}
