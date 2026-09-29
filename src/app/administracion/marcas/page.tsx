import { listBrands } from "@/services/brands";
import { BrandsAdminView } from "@/features/brands/brands-admin-view";

export default async function MarcasPage() {
  const brands = await listBrands();

  return <BrandsAdminView brands={brands} />;
}
