import { notFound } from "next/navigation";
import { getBrandById } from "@/services/brands";
import { BrandForm } from "@/features/brands/brand-form";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function EditarMarcaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <SectionHeading>Editar marca</SectionHeading>
      <BrandForm brand={brand} />
    </div>
  );
}
