"use client";

import { useActionState, useState } from "react";
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
const GENERAL_REVIEW_LABEL = "Reseña general de la tienda";
const COMMENT_MAX_LENGTH = 1000;

function OptionalHint() {
  return <span className="text-muted-foreground/60 normal-case">(opcional)</span>;
}

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
  // Controlados a propósito: React resetea los campos no controlados del
  // <form> después de cada action, así que si el servidor devuelve un error
  // (ej. rate limit) la persona no pierde lo que ya escribió. El comentario
  // además alimenta el contador de caracteres.
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");

  const showProductSelect = !productId && products && products.length > 0;
  // Sin `items`, Base UI muestra el value crudo en el trigger ("general" o
  // un id) en vez del texto de la opción elegida.
  const productItems = showProductSelect
    ? [
        { value: GENERAL_REVIEW_VALUE, label: GENERAL_REVIEW_LABEL },
        ...products.map((product) => ({ value: product.id, label: product.name })),
      ]
    : [];

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
    <form action={formAction} className="space-y-5 border border-border bg-card p-5 sm:p-6">
      <div className="space-y-1">
        <p className="font-mono text-xs font-semibold tracking-wide uppercase">Dejá tu reseña</p>
        <p className="text-sm text-muted-foreground">
          Se publica después de que la revisemos. Solo mostramos tu nombre.
        </p>
      </div>

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

      {productId && <input type="hidden" name="productId" value={productId} />}

      {/* Primero lo obligatorio (estrellas + nombre), después lo opcional:
          quien solo quiere calificar rápido puede enviar sin bajar la vista. */}
      <div className="space-y-1.5">
        <Label>Calificación</Label>
        <RatingInput name="rating" />
        <FieldError message={state.errors.rating?.[0]} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="authorName">Tu nombre</Label>
          <Input
            id="authorName"
            name="authorName"
            required
            maxLength={80}
            autoComplete="given-name"
            placeholder="Ej. Martina"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
          />
          <FieldError message={state.errors.authorName?.[0]} />
        </div>

        {showProductSelect && (
          <div className="space-y-1.5">
            <Label htmlFor="productId">
              ¿Sobre qué producto? <OptionalHint />
            </Label>
            <Select name="productId" defaultValue={GENERAL_REVIEW_VALUE} items={productItems}>
              <SelectTrigger id="productId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={state.errors.productId?.[0]} />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="comment">
            Comentario <OptionalHint />
          </Label>
          <span className="font-mono text-[11px] text-muted-foreground/60 tabular-nums">
            {comment.length}/{COMMENT_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="¿Cómo llegó el producto? ¿Qué tal la atención?"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <FieldError message={state.errors.comment?.[0]} />
      </div>

      <FieldError message={state.errors._form?.[0]} />
      <SubmitButton className="w-full sm:w-auto">Enviar reseña</SubmitButton>
    </form>
  );
}
