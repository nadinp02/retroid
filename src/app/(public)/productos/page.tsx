import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listPublicProducts } from "@/services/products";
import { listCategories, getCategoryBySlug } from "@/services/categories";
import { listBrands, getBrandBySlug } from "@/services/brands";
import { ProductGrid } from "@/features/products/product-grid";
import { ProductFilters } from "@/features/products/product-filters";
import { Pagination } from "@/components/pagination";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site-config";

type ProductosSearchParams = {
  categoria?: string;
  marca?: string;
  q?: string;
  page?: string;
};

const DEFAULT_CATALOG_META = {
  title: "Catálogo de Consolas Retro, Nintendo DS y 3DS",
  description:
    "Catálogo completo de consolas retro, Nintendo DS, Nintendo 3DS, cartuchos, accesorios y estuches. Compra y venta en Argentina, Envíos a toda Argentina.",
};

// Copys curados para las categorías/marcas conocidas de la tienda (coinciden
// con los términos de búsqueda objetivo). Cualquier categoría/marca nueva
// que no esté acá cae al fallback genérico armado con el nombre real.
const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  consolas: {
    title: "Consolas Retro",
    description:
      "Consolas retro Nintendo DS y Nintendo 3DS en Argentina, reacondicionadas y testeadas. Envíos a toda Argentina.",
  },
  cartuchos: {
    title: "Cartuchos Nintendo DS",
    description:
      "Cartuchos originales y flashcarts (R4 DS) para Nintendo DS y 3DS. Envíos a todo Argentina.",
  },
  accesorios: {
    title: "Accesorios Nintendo",
    description:
      "Accesorios para Nintendo DS y 3DS: cargadores, stylus y más. Envíos a todo Argentina.",
  },
  estuches: {
    title: "Estuches Nintendo 3DS",
    description: "Estuches y fundas de viaje para Nintendo DS y 3DS. Envíos a todo Argentina.",
  },
};

const BRAND_SEO: Record<string, { title: string; description: string }> = {
  nintendo: {
    title: "Productos Nintendo",
    description:
      "Consolas, cartuchos y accesorios Nintendo DS y 3DS en Argentina. Envíos a toda Argentina.",
  },
};

async function resolveCategoryMeta(slug: string) {
  const known = CATEGORY_SEO[slug];
  if (known) return known;
  const category = await getCategoryBySlug(slug);
  const name = category?.name ?? slug;
  return {
    title: name,
    description: `${name} — catálogo ${siteConfig.companyName}. Envíos a todo Argentina.`,
  };
}

async function resolveBrandMeta(slug: string) {
  const known = BRAND_SEO[slug];
  if (known) return known;
  const brand = await getBrandBySlug(slug);
  const name = brand?.name ?? slug;
  return {
    title: name,
    description: `${name} — catálogo ${siteConfig.companyName}. Envíos a todo Argentina.`,
  };
}

// Colapsa la variante "canónica" de /productos: mantiene los filtros de
// taxonomía real (categoria/marca, indexables y con valor SEO propio) pero
// descarta búsqueda libre y paginación, que no deben generar URLs indexadas
// aparte (evita contenido duplicado).
function buildCanonicalPath(params: { categoria?: string; marca?: string }) {
  const usp = new URLSearchParams();
  if (params.categoria) usp.set("categoria", params.categoria);
  if (params.marca) usp.set("marca", params.marca);
  const qs = usp.toString();
  return `/productos${qs ? `?${qs}` : ""}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ProductosSearchParams>;
}): Promise<Metadata> {
  const { categoria, marca, q } = await searchParams;

  const meta = q
    ? {
        title: `Resultados para "${q}"`,
        description: `Resultados de búsqueda para "${q}" en el catálogo de ${siteConfig.companyName}: consolas retro, Nintendo DS y 3DS en Argentina.`,
      }
    : categoria
      ? await resolveCategoryMeta(categoria)
      : marca
        ? await resolveBrandMeta(marca)
        : DEFAULT_CATALOG_META;

  const canonicalPath = buildCanonicalPath({ categoria, marca });
  const ogImage = {
    url: "/banner.jpg",
    width: 1916,
    height: 821,
    alt: `${siteConfig.companyName} — catálogo de consolas retro`,
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: meta.title,
      description: meta.description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [ogImage.url],
    },
  };
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<ProductosSearchParams>;
}) {
  const { categoria, marca, q, page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const [{ products, totalPages }, categories, brands] = await Promise.all([
    listPublicProducts({ categorySlug: categoria, brandSlug: marca, search: q, page }),
    listCategories({ isActive: true }),
    listBrands({ isActive: true }),
  ]);

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (marca) params.set("marca", marca);
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/productos${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-3.5" />
          Volver
        </Link>
        <SectionHeading size="lg">Catálogo</SectionHeading>
        <p className="text-sm text-muted-foreground">
          {products.length > 0
            ? `${products.length} producto${products.length === 1 ? "" : "s"} en esta página`
            : "Sin resultados para estos filtros."}
        </p>
      </div>
      <ProductFilters
        categories={categories}
        brands={brands}
        selectedCategory={categoria}
        selectedBrand={marca}
        search={q}
      />
      <ProductGrid products={products} />
      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
