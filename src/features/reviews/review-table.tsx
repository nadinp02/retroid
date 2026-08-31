import Link from "next/link";
import { Check, X } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import {
  approveReviewAction,
  rejectReviewAction,
  replyToReviewAction,
  deleteReviewAction,
} from "@/actions/reviews/actions";
import type { ReviewStatus } from "@prisma/client";
import type { ReviewWithProduct } from "@/types/reviews";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_BADGE: Record<ReviewStatus, { label: string; variant: "secondary" | "success" | "destructive" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  APPROVED: { label: "Aprobada", variant: "success" },
  REJECTED: { label: "Rechazada", variant: "destructive" },
};

// Server Component: la única interactividad del cliente vive en las hojas
// (SubmitButton usa useFormStatus, DeleteButton pide confirmación) — no
// hace falta convertir toda la tabla en un Client Component.
export function ReviewTable({ reviews }: { reviews: ReviewWithProduct[] }) {
  if (reviews.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No hay reseñas para este filtro.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const status = STATUS_BADGE[review.status];
        return (
          <div key={review.id} className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="font-medium">{review.authorName}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                {review.product && (
                  <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                    Sobre{" "}
                    <Link
                      href={`/productos/${review.product.slug}`}
                      target="_blank"
                      className="hover:text-accent"
                    >
                      {review.product.name}
                    </Link>
                  </p>
                )}
                <time
                  dateTime={review.createdAt.toISOString()}
                  className="block font-mono text-xs text-muted-foreground"
                >
                  {dateFormatter.format(review.createdAt)}
                </time>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {review.status !== "APPROVED" && (
                  <form action={approveReviewAction.bind(null, review.id)}>
                    <SubmitButton size="sm" variant="outline" className="gap-1.5">
                      <Check className="size-3.5" />
                      Aprobar
                    </SubmitButton>
                  </form>
                )}
                {review.status !== "REJECTED" && (
                  <form action={rejectReviewAction.bind(null, review.id)}>
                    <SubmitButton size="sm" variant="outline" className="gap-1.5">
                      <X className="size-3.5" />
                      Rechazar
                    </SubmitButton>
                  </form>
                )}
                <DeleteButton
                  action={deleteReviewAction.bind(null, review.id)}
                  confirmMessage={`¿Eliminar la reseña de "${review.authorName}"?`}
                />
              </div>
            </div>

            {review.comment && (
              <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
            )}

            <form
              action={replyToReviewAction.bind(null, review.id)}
              className="mt-4 space-y-2 border-t border-border pt-4"
            >
              <Label htmlFor={`reply-${review.id}`}>Respuesta pública</Label>
              <Textarea
                id={`reply-${review.id}`}
                name="reply"
                defaultValue={review.adminReply ?? ""}
                placeholder="Responderle a esta reseña…"
                rows={2}
              />
              <SubmitButton size="sm">
                {review.adminReply ? "Actualizar respuesta" : "Responder"}
              </SubmitButton>
            </form>
          </div>
        );
      })}
    </div>
  );
}
