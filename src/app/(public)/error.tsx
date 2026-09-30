"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { WindowPanel } from "@/components/ui/window-panel";
import { Button } from "@/components/ui/button";

// error.tsx debe ser Client Component (regla de Next.js): captura errores de
// render no manejados en este route group y evita que el visitante vea la
// pantalla de error genérica de Next.
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <WindowPanel title="ERROR" bodyClassName="flex flex-col items-center gap-4 p-12 text-center">
      <TriangleAlert className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <p className="text-sm text-muted-foreground">
          Tuvimos un problema para mostrar esta página. Podés intentar de nuevo.
        </p>
      </div>
      <Button onClick={() => reset()}>Reintentar</Button>
    </WindowPanel>
  );
}
