import { describe, expect, it } from "vitest";
import { reviewSchema } from "./schema";

const validInput = {
  authorName: "Juan Pérez",
  rating: "5",
  comment: "Excelente atención",
  productId: "prod_123",
};

describe("reviewSchema", () => {
  it("acepta una reseña válida", () => {
    const result = reviewSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(5);
    }
  });

  it("rechaza un nombre de una sola letra", () => {
    const result = reviewSchema.safeParse({ ...validInput, authorName: "J" });
    expect(result.success).toBe(false);
  });

  it("rechaza rating fuera de rango (0)", () => {
    const result = reviewSchema.safeParse({ ...validInput, rating: "0" });
    expect(result.success).toBe(false);
  });

  it("rechaza rating fuera de rango (6)", () => {
    const result = reviewSchema.safeParse({ ...validInput, rating: "6" });
    expect(result.success).toBe(false);
  });

  it("rechaza rating no entero", () => {
    const result = reviewSchema.safeParse({ ...validInput, rating: "3.5" });
    expect(result.success).toBe(false);
  });

  it("normaliza productId 'general' a null (reseña de la tienda, no de un producto)", () => {
    const result = reviewSchema.safeParse({ ...validInput, productId: "general" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.productId).toBeNull();
    }
  });

  it("permite comentario vacío (opcional)", () => {
    const result = reviewSchema.safeParse({ ...validInput, comment: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comment).toBeNull();
    }
  });

  it("rechaza comentario demasiado largo", () => {
    const result = reviewSchema.safeParse({ ...validInput, comment: "a".repeat(1001) });
    expect(result.success).toBe(false);
  });
});
