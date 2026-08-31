import { SectionHeading } from "@/components/ui/section-heading";
import { ReviewsSummary } from "@/features/reviews/reviews-summary";
import { ReviewList } from "@/features/reviews/review-list";
import { ReviewForm } from "@/features/reviews/review-form";
import type { ReviewSummary, ReviewWithProduct } from "@/types/reviews";

export function ReviewsSection({
  title = "Reseñas",
  description,
  summary,
  reviews,
  productId,
  products,
  headingVariant = "mono",
}: {
  title?: string;
  description?: string;
  summary: ReviewSummary;
  reviews: ReviewWithProduct[];
  /** Página de producto: la reseña nueva queda atada a este producto. */
  productId?: string;
  /** Home: habilita el selector "¿sobre qué producto?" en el formulario. */
  products?: { id: string; name: string }[];
  headingVariant?: "mono" | "display";
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <SectionHeading as="h2" size="md" variant={headingVariant}>
          {title}
        </SectionHeading>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="border border-border bg-card p-5 sm:p-6">
        <ReviewsSummary summary={summary} />
      </div>

      <div className="space-y-8">
        <ReviewList reviews={reviews} />
        <ReviewForm productId={productId} products={products} />
      </div>
    </section>
  );
}
