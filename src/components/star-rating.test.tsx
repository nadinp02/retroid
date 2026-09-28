import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StarRating } from "./star-rating";

describe("StarRating", () => {
  it("expone el rating como texto accesible (aria-label), no solo visual", () => {
    render(<StarRating rating={4.3} />);
    expect(screen.getByRole("img", { name: "4.3 de 5 estrellas" })).toBeInTheDocument();
  });

  it("recorta valores fuera de rango (rating > 5 se muestra como 5)", () => {
    render(<StarRating rating={7} />);
    expect(screen.getByRole("img", { name: "5.0 de 5 estrellas" })).toBeInTheDocument();
  });

  it("recorta valores negativos a 0", () => {
    render(<StarRating rating={-2} />);
    expect(screen.getByRole("img", { name: "0.0 de 5 estrellas" })).toBeInTheDocument();
  });

  it("siempre renderiza 5 estrellas decorativas, ocultas para lectores de pantalla", () => {
    const { container } = render(<StarRating rating={3} />);
    const wrapper = container.firstElementChild;
    // Cada estrella es un span propio con aria-hidden (el rating audible ya
    // lo da el aria-label del contenedor); los <Star> de lucide-react suman
    // su propio aria-hidden interno, así que se miran los hijos directos.
    expect(wrapper?.children).toHaveLength(5);
    for (const star of Array.from(wrapper?.children ?? [])) {
      expect(star).toHaveAttribute("aria-hidden", "true");
    }
  });
});
