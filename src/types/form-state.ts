import type { Product } from "@/types/catalog";

export type FormState = {
  errors: Partial<Record<string, string[]>>;
  // Opcional: mensaje de éxito para formularios que no redirigen al
  // terminar (ej. ReviewForm, embebido en una página pública en vez de
  // tener su propia ruta de admin).
  success?: string;
};

export const emptyFormState: FormState = { errors: {} };

// Variante para ProductFormDialog: al crear un producto necesita el id (y
// los datos guardados) recién creados para, sin cerrar el modal, mostrar
// ahí mismo el gestor de imágenes — el flujo de dos pasos "crear -> subir
// imágenes" que en la página standalone se resuelve navegando a
// /[id]/editar. Devolver los datos reales (no solo el id) evita que
// React reinicie los campos del form a sus valores por defecto (precio
// vacío, stock en 0) al terminar la acción sin desmontar el formulario:
// ProductFormDialog los usa para remontar los campos con los valores que
// realmente se guardaron.
export type ProductModalState = FormState & {
  productId?: string;
  createdProduct?: Omit<Product, "price"> & { price: string };
};

export const emptyProductModalState: ProductModalState = { errors: {} };
