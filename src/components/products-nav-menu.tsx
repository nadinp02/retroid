"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuPositioner,
  MenuPopup,
  MenuLinkItem,
} from "@/components/ui/menu";
import type { Category } from "@/types/catalog";

// Dropdown "Productos" del navbar de escritorio: se abre con click u hover
// y lista las categorías reales (administradas desde el backoffice) para
// no duplicar taxonomía hardcodeada acá.
export function ProductsNavMenu({
  categories,
}: {
  categories: Pick<Category, "id" | "name" | "slug">[];
}) {
  return (
    <Menu>
      <MenuTrigger
        openOnHover
        delay={100}
        className="group flex items-center gap-1 transition-colors hover:text-accent"
      >
        <span className="opacity-0 transition-opacity group-hover:opacity-100">&gt;</span>
        PRODUCTOS
        <ChevronDown className="size-3 transition-transform data-[popup-open]:rotate-180" />
      </MenuTrigger>
      <MenuPortal>
        <MenuPositioner>
          <MenuPopup>
            <MenuLinkItem render={<Link href="/productos">Ver todo</Link>} closeOnClick />
            {categories.length > 0 && <div className="my-1 h-px bg-border" aria-hidden="true" />}
            {categories.map((category) => (
              <MenuLinkItem
                key={category.id}
                render={<Link href={`/productos?categoria=${category.slug}`}>{category.name}</Link>}
                closeOnClick
              />
            ))}
          </MenuPopup>
        </MenuPositioner>
      </MenuPortal>
    </Menu>
  );
}
