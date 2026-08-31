import { Star } from "lucide-react";

const VALUES = [5, 4, 3, 2, 1] as const;

/**
 * Selector de estrellas sin JS: radios nativos + el truco CSS clásico de
 * "star rating" (ver .rating-input en globals.css). Funciona sin
 * hidratación y es accesible por teclado (cada radio es focuseable).
 * `required` en cada radio hace que el navegador exija elegir una opción
 * del grupo antes de enviar el formulario.
 */
export function RatingInput({ name, idPrefix = name }: { name: string; idPrefix?: string }) {
  return (
    <fieldset className="rating-input">
      <legend className="sr-only">Calificación de 1 a 5 estrellas</legend>
      {VALUES.flatMap((value) => [
        <input
          key={`input-${value}`}
          type="radio"
          name={name}
          id={`${idPrefix}-${value}`}
          value={value}
          required
        />,
        <label
          key={`label-${value}`}
          htmlFor={`${idPrefix}-${value}`}
          aria-label={`${value} estrella${value === 1 ? "" : "s"}`}
        >
          <Star className="size-7" aria-hidden="true" />
        </label>,
      ])}
    </fieldset>
  );
}
