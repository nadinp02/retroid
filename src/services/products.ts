import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product, ProductImage } from "@/types/catalog";

type ProductFilters = {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
};

// Listado admin (ProductTable): no pinta imágenes, no las trae.
const PRODUCT_LIST_RELATIONS = {
  category: true,
  brand: true,
};

// Card pública (home, /productos): solo pinta la portada, trae 1 imagen en
// vez de la relación completa.
const PRODUCT_CARD_RELATIONS = {
  category: true,
  brand: true,
  images: { orderBy: { position: "asc" as const }, take: 1 },
};

// Detalle de producto y editor de imágenes en admin: necesitan la galería
// completa.
const PRODUCT_DETAIL_RELATIONS = {
  category: true,
  brand: true,
  images: { orderBy: { position: "asc" as const } },
};

export function listProducts(filters: ProductFilters = {}) {
  return prisma.product.findMany({
    where: filters,
    include: PRODUCT_LIST_RELATIONS,
    orderBy: { createdAt: "desc" },
  });
}

export function countProducts() {
  return prisma.product.count();
}

// Para sitemap.ts: solo lo necesario para armar <url>, nada de relaciones.
export function listActiveProductSlugs() {
  return prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

// Para el selector "¿sobre qué producto?" del formulario público de
// reseñas: solo lo necesario para poblar un <select>, nada de relaciones.
export function listProductOptions() {
  return prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

type PublicProductFilters = {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  isLimitedEdition?: boolean;
  page?: number;
  pageSize?: number;
};

/**
 * Listado para el catálogo público: solo productos activos, con paginación
 * y filtros por slug de categoría/marca + búsqueda por nombre.
 */
export async function listPublicProducts(filters: PublicProductFilters = {}) {
  const { categorySlug, brandSlug, search, isLimitedEdition, page = 1, pageSize = 12 } = filters;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(brandSlug && { brand: { slug: brandSlug } }),
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(isLimitedEdition && { isLimitedEdition: true }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_CARD_RELATIONS,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: PRODUCT_DETAIL_RELATIONS,
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: PRODUCT_DETAIL_RELATIONS,
  });
}

type CreateProductInput = Pick<Product, "name" | "slug" | "categoryId"> & {
  price: number | string;
} & Partial<
    Pick<Product, "description" | "stock" | "sku" | "isActive" | "isLimitedEdition" | "brandId">
  >;

export function createProduct(data: CreateProductInput) {
  return prisma.product.create({ data });
}

export function updateProduct(id: string, data: Partial<CreateProductInput>) {
  return prisma.product.update({ where: { id }, data });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export function deleteProducts(ids: string[]) {
  return prisma.product.deleteMany({ where: { id: { in: ids } } });
}

type BulkUpdateProductInput = Partial<Pick<Product, "categoryId" | "brandId" | "isActive">>;

export function bulkUpdateProducts(ids: string[], data: BulkUpdateProductInput) {
  return prisma.product.updateMany({ where: { id: { in: ids } }, data });
}

export function countProductImages(productId?: string) {
  return prisma.productImage.count({ where: productId ? { productId } : {} });
}

type AddProductImageInput = Pick<ProductImage, "publicId" | "url"> &
  Partial<Pick<ProductImage, "alt">>;

/**
 * Agrega una imagen al final del orden actual del producto (no depende del
 * @default(0) del schema, que colisionaría si dos imágenes no pasan
 * `position` explícito).
 */
export async function addProductImage(productId: string, data: AddProductImageInput) {
  const lastImage = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { position: "desc" },
  });
  const position = lastImage ? lastImage.position + 1 : 0;

  return prisma.productImage.create({ data: { ...data, productId, position } });
}

export function deleteProductImage(id: string) {
  return prisma.productImage.delete({ where: { id } });
}

/**
 * Persiste el orden final de las imágenes de un producto: `orderedIds[0]`
 * queda en `position` 0 (portada), etc. Se usa tanto para mover una imagen
 * como para marcarla como principal (llevándola al frente del arreglo).
 */
export function reorderProductImages(orderedIds: string[]) {
  return prisma.$transaction(
    orderedIds.map((id, position) =>
      prisma.productImage.update({ where: { id }, data: { position } }),
    ),
  );
}
