import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { WindowPanel } from "@/components/ui/window-panel";
import { Button } from "@/components/ui/button";

// Sin este archivo, notFound() (ver productos/[slug]/page.tsx) cae al 404
// genérico de Next en vez de mantener la identidad visual del sitio.
export default function PublicNotFound() {
  return (
    <WindowPanel title="404" bodyClassName="flex flex-col items-center gap-4 p-12 text-center">
      <PackageSearch className="size-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold">No encontramos esta página</h1>
        <p className="text-sm text-muted-foreground">
          El producto o la sección que buscás no existe o ya no está disponible.
        </p>
      </div>
      <Button render={<Link href="/productos">Ver catálogo</Link>} />
    </WindowPanel>
  );
}
