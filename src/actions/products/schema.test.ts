import { describe, expect, it } from "vitest";
import { productSchema } from "./schema";

const validInput = {
  name: "Nintendo DS Lite",
  slug: "nintendo-ds-lite",
  description: "En buen estado",
  price: "65000.00",
  stock: "4",
  isActive: true,
  isLimitedEdition: false,
  categoryId: "cat_123",
  brandId: "brand_123",
};

describe("productSchema", () => {
  it("acepta un producto válido y coerciona price/stock a número", () => {
    const result = productSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(65000);
      expect(result.data.stock).toBe(4);
    }
  });

  it("rechaza un nombre vacío", () => {
    const result = productSchema.safeParse({ ...validInput, name: "  " });
    expect(result.success).toBe(false);
  });

  it("rechaza un slug con mayúsculas o espacios", () => {
    const result = productSchema.safeParse({ ...validInput, slug: "Nintendo DS Lite" });
    expect(result.success).toBe(false);
  });

  it("rechaza precio menor o igual a 0", () => {
    const result = productSchema.safeParse({ ...validInput, price: "0" });
    expect(result.success).toBe(false);
  });

  it("rechaza stock negativo", () => {
    const result = productSchema.safeParse({ ...validInput, stock: "-1" });
    expect(result.success).toBe(false);
  });

  it("rechaza stock no entero", () => {
    const result = productSchema.safeParse({ ...validInput, stock: "1.5" });
    expect(result.success).toBe(false);
  });

  it("normaliza brandId 'none' a null (sin marca)", () => {
    const result = productSchema.safeParse({ ...validInput, brandId: "none" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.brandId).toBeNull();
    }
  });

  it("exige categoryId", () => {
    const result = productSchema.safeParse({ ...validInput, categoryId: "" });
    expect(result.success).toBe(false);
  });
});
