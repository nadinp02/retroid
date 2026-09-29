import { listCategories } from "@/services/categories";
import { CategoriesAdminView } from "@/features/categories/categories-admin-view";

export default async function CategoríasPage() {
  const categories = await listCategories();

  return <CategoriesAdminView categories={categories} />;
}
