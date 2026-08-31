export type FormState = {
  errors: Partial<Record<string, string[]>>;
  // Opcional: mensaje de éxito para formularios que no redirigen al
  // terminar (ej. ReviewForm, embebido en una página pública en vez de
  // tener su propia ruta de admin).
  success?: string;
};

export const emptyFormState: FormState = { errors: {} };
