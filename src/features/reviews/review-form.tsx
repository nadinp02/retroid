"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { FieldError } from "@/components/field-error";
import { RatingInput } from "@/features/reviews/rating-input";
import { createReviewAction } from "@/actions/reviews/actions";
import { emptyFormState } from "@/types/form-state";

const GENERAL_REVIEW_VALUE = "general";

export function ReviewForm({
  productId,
  products,
}: {
  // Contexto fijo (página de producto): va como hidden input, sin selector.
  productId?: string;
  // Contexto general (Home): selector opcional de producto.
  products?: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(createReviewAction, emptyFormState);

  if (state.success) {
    return (
      // role="status" (aria-live="polite" implícito): reemplaza el
      // formulario entero al enviarse, un usuario de lector de pantalla
      // necesita que se le anuncie el resultado.
      <div
        role="status"
        className="flex items-start gap-3 border border-primary/40 bg-primary/10 p-5 text-sm"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 border border-border bg-card p-5 sm:p-6">
      <p className="font-mono text-xs font-semibold tracking-wide uppercase">Dejá tu reseña</p>

      {/* Honeypot anti-spam: invisible y fuera del tab-order para personas,
          los bots de formularios genéricos suelen completar cualquier
          campo de texto que encuentren. Si llega con valor, la action
          descarta el envío en silencio. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="space-y-1.5">
        <Label>Calificación</Label>
        <RatingInput name="rating" />
        <FieldError message={state.errors.rating?.[0]} />
      </div>

      {productId ? (
        <input type="hidden" name="productId" value={productId} />
      ) : products && products.length > 0 ? (
        <div className="space-y-1.5">
          <Label htmlFor="productId">¿Sobre qué producto? (opcional)</Label>
          <Select name="productId" defaultValue={GENERAL_REVIEW_VALUE}>
            <SelectTrigger id="productId" className="w-full">
              <SelectValue placeholder="Reseña general de la tienda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GENERAL_REVIEW_VALUE}>Reseña general de la tienda</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="authorName">Tu nombre</Label>
        <Input id="authorName" name="authorName" required maxLength={80} />
        <FieldError message={state.errors.authorName?.[0]} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comment">Comentario (opcional)</Label>
        <Textarea id="comment" name="comment" maxLength={1000} />
        <FieldError message={state.errors.comment?.[0]} />
      </div>

      <FieldError message={state.errors._form?.[0]} />
      <SubmitButton className="w-full sm:w-auto">Enviar reseña</SubmitButton>
    </form>
  );
}
