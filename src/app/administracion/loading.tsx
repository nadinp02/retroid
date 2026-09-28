import { Skeleton } from "@/components/ui/skeleton";

// Genérico para todo /administracion/*: las secciones son tablas simples y
// comparten esta forma aproximada (encabezado + panel con filas), así que no
// hace falta un skeleton distinto por sección para evitar el salto de layout.
export default function AdministracionLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-2 border border-border p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
