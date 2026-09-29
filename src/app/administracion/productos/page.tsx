import { listProducts } from "@/services/products";
import { listCategories } from "@/services/categories";
import { listBrands } from "@/services/brands";
import { ProductsAdminView } from "@/features/products/products-admin-view";

type AdminProductsSearchParams = {
  categoria?: string;
  marca?: string;
  estado?: string;
  q?: string;
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<AdminProductsSearchParams>;
}) {
  const { categoria, marca, estado, q } = await searchParams;

  const [categories, brands] = await Promise.all([listCategories(), listBrands()]);
  const categoryId = categoria ? categories.find((c) => c.slug === categoria)?.id : undefined;
  const brandId = marca ? brands.find((b) => b.slug === marca)?.id : undefined;
  const isActive = estado === "activo" ? true : estado === "inactivo" ? false : undefined;

  const products = await listProducts({ categoryId, brandId, isActive, search: q });

  return (
    <ProductsAdminView
      products={products.map((product) => ({ ...product, price: product.price.toString() }))}
      categories={categories}
      brands={brands}
      selectedCategory={categoria}
      selectedBrand={marca}
      selectedStatus={estado}
      search={q}
    />
  );
}
