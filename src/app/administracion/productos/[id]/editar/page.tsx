import { notFound } from "next/navigation";
import { getProductById } from "@/services/products";
import { listCategories } from "@/services/categories";
import { listBrands } from "@/services/brands";
import { ProductForm } from "@/features/products/product-form";
import { ImageManager } from "@/features/products/product-images/image-manager";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    listCategories(),
    listBrands(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <SectionHeading>Editar producto</SectionHeading>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,36rem)_1fr] xl:items-start">
        <ProductForm product={product} categories={categories} brands={brands} />

        <div className="space-y-3">
          <h2 className="font-mono text-lg font-semibold tracking-tight uppercase">Imágenes</h2>
          <ImageManager productId={product.id} images={product.images} />
        </div>
      </div>
    </div>
  );
}
