import { notFound } from "next/navigation";
import { getCategoryById } from "@/services/categories";
import { CategoryForm } from "@/features/categories/category-form";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <SectionHeading>Editar categoría</SectionHeading>
      <CategoryForm category={category} />
    </div>
  );
}
