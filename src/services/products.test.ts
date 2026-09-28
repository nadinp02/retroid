import { describe, expect, it, vi } from "vitest";

const findMany = vi.fn().mockResolvedValue([]);
const findUnique = vi.fn().mockResolvedValue(null);
const count = vi.fn().mockResolvedValue(0);

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany, findUnique, count },
  },
}));

const { listPublicProducts, getProductBySlug } = await import("./products");

describe("listPublicProducts (catálogo público)", () => {
  it("trae como mucho 2 imágenes por producto (portada + hover), no la galería completa", async () => {
    await listPublicProducts({});

    const call = findMany.mock.calls[0][0];
    expect(call.include.images.take).toBe(2);
    expect(call.include.images.where).toEqual({
      OR: [{ position: 0 }, { isHoverImage: true }],
    });
  });

  it("solo trae productos activos aunque no se pase ningún filtro", async () => {
    await listPublicProducts({});

    const call = findMany.mock.calls[0][0];
    expect(call.where.isActive).toBe(true);
  });

  it("arma el filtro por slug de categoría cuando se pasa categorySlug", async () => {
    await listPublicProducts({ categorySlug: "consolas" });

    const call = findMany.mock.calls[0][0];
    expect(call.where.category).toEqual({ slug: "consolas" });
  });
});

describe("getProductBySlug (detalle de producto)", () => {
  it("trae la galería completa de imágenes, sin el recorte de la card", async () => {
    await getProductBySlug("nintendo-ds-lite");

    const call = findUnique.mock.calls[0][0];
    expect(call.include.images.where).toBeUndefined();
    expect(call.include.images.take).toBeUndefined();
  });
});
