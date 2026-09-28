import { notFound } from "next/navigation";
import { getMarqueeItemById } from "@/services/marquee";
import { MarqueeItemForm } from "@/features/marquee/marquee-item-form";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function EditarFraseMarqueePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getMarqueeItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <SectionHeading>Editar frase</SectionHeading>
      <MarqueeItemForm item={item} />
    </div>
  );
}
