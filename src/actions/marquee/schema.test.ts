import { describe, expect, it } from "vitest";
import { marqueeItemSchema } from "./schema";

describe("marqueeItemSchema", () => {
  it("acepta una frase válida", () => {
    const result = marqueeItemSchema.safeParse({ text: "Envíos a todo el país", isActive: true });
    expect(result.success).toBe(true);
  });

  it("rechaza texto vacío", () => {
    const result = marqueeItemSchema.safeParse({ text: "   ", isActive: true });
    expect(result.success).toBe(false);
  });

  it("recorta espacios al principio/final", () => {
    const result = marqueeItemSchema.safeParse({ text: "  Hola  ", isActive: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("Hola");
    }
  });

  it("rechaza texto de más de 120 caracteres", () => {
    const result = marqueeItemSchema.safeParse({ text: "a".repeat(121), isActive: true });
    expect(result.success).toBe(false);
  });

  it("acepta exactamente 120 caracteres", () => {
    const result = marqueeItemSchema.safeParse({ text: "a".repeat(120), isActive: true });
    expect(result.success).toBe(true);
  });
});
