import Link from "next/link";
import { ReviewStatus } from "@prisma/client";
import { listReviews } from "@/services/reviews";
import { ReviewTable } from "@/features/reviews/review-table";
import { Pagination } from "@/components/pagination";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: undefined, label: "Todas" },
  { value: ReviewStatus.PENDING, label: "Pendientes" },
  { value: ReviewStatus.APPROVED, label: "Aprobadas" },
  { value: ReviewStatus.REJECTED, label: "Rechazadas" },
] as const;

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type ResenasSearchParams = {
  estado?: string;
  page?: string;
};

function parseStatus(value: string | undefined): ReviewStatus | undefined {
  if (value && (Object.values(ReviewStatus) as string[]).includes(value)) {
    return value as ReviewStatus;
  }
  return undefined;
}

export default async function ResenasPage({
  searchParams,
}: {
  searchParams: Promise<ResenasSearchParams>;
}) {
  const { estado, page: pageParam } = await searchParams;
  const status = parseStatus(estado);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const { reviews, total, totalPages } = await listReviews({ status, page });

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (estado) params.set("estado", estado);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/administracion/resenas${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <SectionHeading>Reseñas</SectionHeading>
        <p className="text-sm text-muted-foreground">
          {total} reseña{total === 1 ? "" : "s"} {status ? `· ${status.toLowerCase()}` : "en total"}
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = filter.value === status;
          const href = filter.value
            ? `/administracion/resenas?estado=${filter.value}`
            : "/administracion/resenas";
          return (
            <Link
              key={filter.label}
              href={href}
              className={cn(
                "border px-3 py-1.5 font-mono text-xs font-medium tracking-wide uppercase transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-accent/60 hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <ReviewTable
        reviews={reviews.map((review) => ({
          ...review,
          formattedDate: dateFormatter.format(review.createdAt),
        }))}
      />
      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
