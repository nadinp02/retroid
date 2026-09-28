import type { Prisma } from "@prisma/client";

export type { Category, Brand, Product, ProductImage, MarqueeItem } from "@prisma/client";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { category: true; brand: true; images: true };
}>;

// Listado admin: no muestra imágenes (ver product-table.tsx), así que el
// service correspondiente no las incluye en la query.
export type ProductListItem = Prisma.ProductGetPayload<{
  include: { category: true; brand: true };
}>;
