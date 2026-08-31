"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/field-error";
import { useSlugField } from "@/hooks/use-slug-field";

/**
 * Par Nombre + Slug reutilizado por los formularios de producto/categoría/
 * marca: el slug se autogenera del nombre hasta que el usuario lo edite a
 * mano (ver useSlugField). Ambos <input> se registran por `name` como
 * cualquier campo no controlado, así que siguen funcionando con los
 * server actions existentes (leen FormData por nombre de campo).
 */
export function NameSlugFields({
  initialName,
  initialSlug,
  nameError,
  slugError,
}: {
  initialName?: string;
  initialSlug?: string;
  nameError?: string;
  slugError?: string;
}) {
  const { name, slug, slugTouched, handleNameChange, handleSlugChange, regenerateSlug } =
    useSlugField(initialName, initialSlug);

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          required
        />
        <FieldError message={nameError} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="slug">Slug</Label>
          {slugTouched && (
            <button
              type="button"
              onClick={regenerateSlug}
              className="font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase transition-colors hover:text-accent"
            >
              Generar desde el nombre
            </button>
          )}
        </div>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => handleSlugChange(event.target.value)}
          required
        />
        <FieldError message={slugError} />
      </div>
    </>
  );
}
