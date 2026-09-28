import { describe, expect, it, vi, beforeEach } from "vitest";

const createReview = vi.fn();
const getProductById = vi.fn();

vi.mock("@/services/reviews", () => ({
  createReview,
  updateReviewStatus: vi.fn(),
  replyToReview: vi.fn(),
  deleteReview: vi.fn(),
  getReviewById: vi.fn(),
}));

vi.mock("@/services/products", () => ({ getProductById }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// headers() de next/headers necesita contexto de request real (Next lo da
// vía AsyncLocalStorage), inexistente en un test unitario.
vi.mock("next/headers", () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));

// El rate limiting en sí (checkRateLimit) ya tiene su propia suite en
// rate-limit.test.ts. Acá se mockea para que este archivo pruebe solo
// validación/reglas de negocio, sin depender del estado compartido (en
// memoria, entre tests) del limitador real.
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue(true),
  getClientIp: vi.fn().mockReturnValue("test-ip"),
}));

// createReviewAction no llama a requireSession (es una acción pública), pero
// el archivo sí la importa a nivel de módulo para otras acciones — sin este
// mock, cargar el módulo arrastra next-auth y falla fuera del bundler de
// Next (no resuelve "next/server" en un entorno Node/Vite plano).
vi.mock("@/auth", () => ({ requireSession: vi.fn() }));

const { createReviewAction } = await import("./actions");
const { emptyFormState } = await import("@/types/form-state");
const { checkRateLimit } = await import("@/lib/rate-limit");

function formDataWith(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe("createReviewAction", () => {
  beforeEach(() => {
    createReview.mockReset();
    getProductById.mockReset();
    vi.mocked(checkRateLimit).mockReturnValue(true);
  });

  it("rechaza el envío si se superó el límite de intentos", async () => {
    vi.mocked(checkRateLimit).mockReturnValue(false);
    const formData = formDataWith({ authorName: "Juan Pérez", rating: "5" });

    const result = await createReviewAction(emptyFormState, formData);

    expect(result.errors._form).toBeTruthy();
    expect(createReview).not.toHaveBeenCalled();
  });

  it("finge éxito sin guardar nada si el honeypot viene completo (bot)", async () => {
    const formData = formDataWith({
      authorName: "Bot",
      rating: "5",
      website: "http://spam.com",
    });

    const result = await createReviewAction(emptyFormState, formData);

    expect(result.success).toBeTruthy();
    expect(createReview).not.toHaveBeenCalled();
  });

  it("devuelve errores de validación si falta el nombre", async () => {
    const formData = formDataWith({ authorName: "", rating: "5" });

    const result = await createReviewAction(emptyFormState, formData);

    expect(result.errors.authorName).toBeTruthy();
    expect(createReview).not.toHaveBeenCalled();
  });

  it("rechaza la reseña si el producto elegido no existe o está inactivo", async () => {
    getProductById.mockResolvedValue({ isActive: false });
    const formData = formDataWith({
      authorName: "Juan Pérez",
      rating: "5",
      productId: "prod_inactive",
    });

    const result = await createReviewAction(emptyFormState, formData);

    expect(result.errors.productId).toBeTruthy();
    expect(createReview).not.toHaveBeenCalled();
  });

  it("guarda la reseña cuando los datos y el producto son válidos", async () => {
    getProductById.mockResolvedValue({ isActive: true });
    createReview.mockResolvedValue({ id: "rev_1" });
    const formData = formDataWith({
      authorName: "Juan Pérez",
      rating: "5",
      productId: "prod_ok",
    });

    const result = await createReviewAction(emptyFormState, formData);

    expect(createReview).toHaveBeenCalledTimes(1);
    expect(result.success).toBeTruthy();
  });
});
