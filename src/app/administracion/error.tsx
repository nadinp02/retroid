"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { WindowPanel } from "@/components/ui/window-panel";
import { Button } from "@/components/ui/button";

export default function AdministracionError({
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
          Ocurrió un error inesperado en el panel. Podés reintentar o volver al dashboard.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => reset()}>
          Reintentar
        </Button>
        <Button render={<Link href="/administracion">Ir al dashboard</Link>} />
      </div>
    </WindowPanel>
  );
}
