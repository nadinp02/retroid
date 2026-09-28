-- Prisma ORM no soporta CHECK constraints de forma declarativa (ver
-- schema.prisma): hasta ahora el rango 1-5 de `rating` solo lo garantizaba
-- Zod en la capa de aplicación (src/actions/reviews/actions.ts). Esto lo
-- refuerza a nivel de base de datos para cualquier escritura, no solo la que
-- pasa por esa acción.
-- AddCheckConstraint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);