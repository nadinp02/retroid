"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X, Trash2 } from "lucide-react";
import { ReviewStatus } from "@prisma/client";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import { FieldError } from "@/components/field-error";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  approveReviewAction,
  rejectReviewAction,
  replyToReviewAction,
  deleteReviewAction,
  bulkUpdateReviewStatusAction,
  bulkDeleteReviewsAction,
} from "@/actions/reviews/actions";
import type { ReviewWithProduct } from "@/types/reviews";

const STATUS_BADGE: Record<
  ReviewStatus,
  { label: string; variant: "secondary" | "success" | "destructive" }
> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  APPROVED: { label: "Aprobada", variant: "success" },
  REJECTED: { label: "Rechazada", variant: "destructive" },
};

type ReviewRow = ReviewWithProduct & { formattedDate: string };

export function ReviewTable({ reviews }: { reviews: ReviewRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (reviews.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No hay reseñas para este filtro.
      </p>
    );
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setError(null);
  }

  function handleBulkStatus(status: ReviewStatus) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkUpdateReviewStatusAction(ids, status);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearSelection();
    });
  }

  function confirmBulkDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkDeleteReviewsAction(ids);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clearSelection();
    });
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-2">
          <span className="font-mono text-xs font-medium tracking-wide uppercase">
            {selected.size} seleccionada{selected.size === 1 ? "" : "s"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={isPending}
              onClick={() => handleBulkStatus(ReviewStatus.APPROVED)}
            >
              <Check className="size-3.5" />
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={isPending}
              onClick={() => handleBulkStatus(ReviewStatus.REJECTED)}
            >
              <X className="size-3.5" />
              Rechazar
            </Button>
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="destructive" className="gap-1.5" disabled={isPending}>
                  <Trash2 className="size-3.5" />
                  Eliminar
                </Button>
              }
              title="Eliminar reseñas"
              description={`¿Eliminar ${selected.size} reseña${selected.size === 1 ? "" : "s"}? Esta acción no se puede deshacer.`}
              confirmLabel="Eliminar"
              onConfirm={confirmBulkDelete}
            />
            <Button size="sm" variant="ghost" disabled={isPending} onClick={clearSelection}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <FieldError message={error ?? undefined} />

      {reviews.map((review) => {
        const status = STATUS_BADGE[review.status];
        return (
          <div key={review.id} className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selected.has(review.id)}
                  onCheckedChange={() => toggleOne(review.id)}
                  aria-label={`Seleccionar reseña de ${review.authorName}`}
                  className="mt-1"
                />
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
                  {/* dateTime con toISOString(): determinístico, sin
                      formato local — no depende de qué ICU tenga el
                      navegador vs el server, a diferencia del texto
                      visible (formattedDate), que por eso se calcula en el
                      server y llega ya listo (ver resenas/page.tsx) en vez
                      de recalcularse acá con Intl.DateTimeFormat: si el
                      ICU del browser difiere un carácter (ej. el espacio
                      antes de "p. m."), React lo marca como mismatch de
                      hidratación. */}
                  <time
                    dateTime={new Date(review.createdAt).toISOString()}
                    className="block font-mono text-xs text-muted-foreground"
                  >
                    {review.formattedDate}
                  </time>
                </div>
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
