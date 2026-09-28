-- Reemplaza rate_limit_attempts (una fila por intento) por
-- rate_limit_buckets (una fila por key): permite incrementar/resetear el
-- contador con un único UPSERT atómico (ver checkRateLimit() en
-- src/lib/rate-limit.ts) en vez de leer-decidir-escribir en 3 queries
-- separadas, que tenía una condición de carrera real bajo concurrencia.
-- Tabla vacía al momento de este cambio (confirmado antes de aplicar).
-- DropTable
DROP TABLE "rate_limit_attempts";

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);
