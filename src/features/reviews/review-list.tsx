import Link from "next/link";
import { StarRating } from "@/components/star-rating";
import type { ReviewWithProduct } from "@/types/reviews";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

// El estado vacío ya lo cubre ReviewsSummary ("Todavía no hay reseñas...").
export function ReviewList({ reviews }: { reviews: ReviewWithProduct[] }) {
  if (reviews.length === 0) return null;

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <StarRating rating={review.rating} />
              <span className="font-medium">{review.authorName}</span>
            </div>
            <time
              dateTime={review.createdAt.toISOString()}
              className="font-mono text-xs text-muted-foreground"
            >
              {dateFormatter.format(review.createdAt)}
            </time>
          </div>

          {review.product && (
            <Link
              href={`/productos/${review.product.slug}`}
              className="mt-1 inline-block font-mono text-xs tracking-wide text-muted-foreground uppercase transition-colors hover:text-accent"
            >
              Sobre {review.product.name}
            </Link>
          )}

          {review.comment && <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>}

          {review.adminReply && (
            <div className="mt-4 border-l-2 border-primary bg-primary/5 p-3">
              <p className="font-mono text-xs font-semibold tracking-wide text-primary uppercase">
                Respuesta de RETROID
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{review.adminReply}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
