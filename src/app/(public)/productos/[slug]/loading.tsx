import { WindowPanel } from "@/components/ui/window-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductoDetalleLoading() {
  return (
    <WindowPanel
      title="PRODUCTO"
      bodyClassName="grid gap-8 p-6 lg:grid-cols-2 lg:gap-12 lg:items-start"
    >
      <Skeleton className="aspect-square w-full" />

      <div className="flex flex-col gap-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-3/4" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </WindowPanel>
  );
}
