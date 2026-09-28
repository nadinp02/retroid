import Link from "next/link";
import { Plus } from "lucide-react";
import { listMarqueeItems } from "@/services/marquee";
import { MarqueeItemTable } from "@/features/marquee/marquee-item-table";
import { Button } from "@/components/ui/button";
import { WindowPanel } from "@/components/ui/window-panel";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function MarqueePage() {
  const items = await listMarqueeItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <SectionHeading>Barra promocional</SectionHeading>
          <p className="text-sm text-muted-foreground">
            Frases que rotan en la barra debajo del header del sitio público.
          </p>
        </div>
        <Button
          className="gap-1.5"
          render={
            <Link href="/administracion/marquee/nuevo">
              <Plus className="size-4" />
              Nueva frase
            </Link>
          }
        />
      </div>
      <WindowPanel title="Barra promocional" bodyClassName="p-4">
        <MarqueeItemTable items={items} />
      </WindowPanel>
    </div>
  );
}
