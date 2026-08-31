export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_ERROR_MESSAGE =
  "El slug solo puede tener minúsculas, números y guiones (ej: mi-producto)";

const DIACRITICS_REGEX = /\p{Diacritic}/gu;

// Deriva un slug candidato a partir de un nombre libre — usado por los
// formularios del admin para autocompletar el campo mientras el usuario no
// lo haya editado a mano. No garantiza unicidad (eso lo valida el server
// action contra la base).
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "") // quita acentos (á -> a + combining ´)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
