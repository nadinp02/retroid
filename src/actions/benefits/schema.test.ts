import { describe, expect, it } from "vitest";
import { benefitSchema } from "./schema";

const valid = {
  icon: "truck",
  title: "Envíos a todo el país",
  text: "Recibí tu compra estés donde estés.",
  isActive: true,
};

describe("benefitSchema", () => {
  it("acepta un beneficio válido", () => {
    expect(benefitSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza un ícono fuera del registro", () => {
    expect(benefitSchema.safeParse({ ...valid, icon: "rocket" }).success).toBe(false);
  });

  it("rechaza título o texto vacíos", () => {
    expect(benefitSchema.safeParse({ ...valid, title: "   " }).success).toBe(false);
    expect(benefitSchema.safeParse({ ...valid, text: "" }).success).toBe(false);
  });

  it("recorta espacios al principio/final", () => {
    const result = benefitSchema.safeParse({ ...valid, title: "  Hola  " });
    expect(result.success && result.data.title).toBe("Hola");
  });

  it("respeta los máximos de 40 y 140 caracteres", () => {
    expect(benefitSchema.safeParse({ ...valid, title: "a".repeat(40) }).success).toBe(true);
    expect(benefitSchema.safeParse({ ...valid, title: "a".repeat(41) }).success).toBe(false);
    expect(benefitSchema.safeParse({ ...valid, text: "a".repeat(140) }).success).toBe(true);
    expect(benefitSchema.safeParse({ ...valid, text: "a".repeat(141) }).success).toBe(false);
  });
});
