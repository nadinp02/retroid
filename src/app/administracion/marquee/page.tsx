import { listMarqueeItems } from "@/services/marquee";
import { MarqueeAdminView } from "@/features/marquee/marquee-admin-view";

export default async function MarqueePage() {
  const items = await listMarqueeItems();

  return <MarqueeAdminView items={items} />;
}
