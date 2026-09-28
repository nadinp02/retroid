import { MarqueeItemForm } from "@/features/marquee/marquee-item-form";
import { SectionHeading } from "@/components/ui/section-heading";

export default function NuevaFraseMarqueePage() {
  return (
    <div className="space-y-4">
      <SectionHeading>Nueva frase</SectionHeading>
      <MarqueeItemForm />
    </div>
  );
}
