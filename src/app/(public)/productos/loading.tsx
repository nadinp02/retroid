import { Skeleton } from "@/components/ui/skeleton";

// Mismas dimensiones/grid que ProductGrid + ProductCard, para que no haya
// salto de layout cuando terminan de cargar los datos reales.
export default function ProductosLoading() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col border border-border">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
