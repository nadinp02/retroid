import type { ComponentType } from "react";
import Link from "next/link";
import { ImageIcon, Package, Star, Tag, Tags } from "lucide-react";
import { ReviewStatus } from "@prisma/client";
import { countProducts, countProductImages } from "@/services/products";
import { countCategories } from "@/services/categories";
import { countBrands } from "@/services/brands";
import { countReviewsByStatus } from "@/services/reviews";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function AdministracionPage() {
  const [products, categories, brands, images, pendingReviews] = await Promise.all([
    countProducts(),
    countCategories(),
    countBrands(),
    countProductImages(),
    countReviewsByStatus(ReviewStatus.PENDING),
  ]);

  const stats: {
    label: string;
    value: number;
    href: string;
    icon: ComponentType<{ className?: string }>;
  }[] = [
    { label: "Productos", value: products, href: "/administracion/productos", icon: Package },
    { label: "Categorías", value: categories, href: "/administracion/categorias", icon: Tags },
    { label: "Marcas", value: brands, href: "/administracion/marcas", icon: Tag },
    { label: "Imágenes", value: images, href: "/administracion/productos", icon: ImageIcon },
    {
      label: "Reseñas pendientes",
      value: pendingReviews,
      href: "/administracion/resenas?estado=PENDING",
      icon: Star,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <SectionHeading>Dashboard</SectionHeading>
        <p className="text-sm text-muted-foreground">Resumen general del catálogo.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="p-5 transition-colors hover:border-accent">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {label}
                </span>
                <Icon className="size-4 text-accent" />
              </div>
              <p className="mt-3 font-mono text-3xl font-semibold text-primary tabular-nums">
                {value}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
